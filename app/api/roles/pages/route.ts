import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { log } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { getRealIp } from "@/lib/getRealIp";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user_id = session?.user?.id;
        const role = session?.user?.role;
        const userIp = getRealIp(req);

        if (!user_id || role !== "main-admin") {
            log.warn("GET /api/roles/pages: Unauthorized", {
                ip: userIp,
                time: new Date().toISOString(),
            });

            return NextResponse.json(
                { success: false, msg: "Unauthorized" },
                { status: 401 }
            );
        }

        // ===========================
        // 1. Fetch Categories
        // ===========================
        const [categories] = await pool.query(
            `
            SELECT 
                BIN_TO_UUID(id) AS id, 
                name, 
                slug, 
                BIN_TO_UUID(parent_id) AS parent_id 
            FROM page_categories WHERE status='active'
            ORDER BY name ASC
            `
        );

        // ===========================
        // 2. Fetch Pages
        // ===========================
        const [pages] = await pool.query(
            `
            SELECT 
                BIN_TO_UUID(id) AS id,
                name AS label,
                key_name AS \`key\`,
                path,
                BIN_TO_UUID(category_id) AS category_id
            FROM pages WHERE status='active'
            ORDER BY sort_order ASC, name ASC
            `
        );

        // ===========================
        // 3. Build Maps
        // ===========================
        const catMap: Record<string, any> = {};
        const childrenMap: Record<string, string[]> = {};

        (categories as any[]).forEach((c) => {
            const parentKey = c.parent_id ?? "null"; // ensure string key
            catMap[c.id] = {
                category: c.name,
                category_id:c.id,
                items: [],
            };

            if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
            childrenMap[parentKey].push(c.id);
        });

        // ===========================
        // 4. Assign pages to categories
        // ===========================
        (pages as any[]).forEach((p) => {
            if (!catMap[p.category_id]) return;

            catMap[p.category_id].items.push({
                key: p.id,
                label: p.label,
                path: p.path,
            });
        });

        // ===========================
        // 5. Recursive Tree Builder
        // ===========================
        const buildTree = (parentId: string | null) => {
            const key = parentId ?? "null";
            const current = childrenMap[key] || [];

            return current.map((catId: string) => {
                const node = catMap[catId];

                const children = buildTree(catId);
                if (children.length > 0) {
                    node.items.push(...children);
                }

                return node;
            });
        };

        // Root categories = parent_id NULL
        const data = buildTree(null);

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("Error generating pages tree:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
