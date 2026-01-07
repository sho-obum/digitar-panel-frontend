import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getRealIp } from "@/lib/getRealIp";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 401 });
    }

    const userId = session.user.id;

    const [rows]: any = await pool.query(
      ` SELECT 
 pc.id           AS category_id, 
 pc.name         AS category_name, 
 pc.slug         AS category_slug, 
 pc.sort_order   AS category_order,

 p.id            AS page_id,
 p.name          AS page_name,
 p.path          AS page_path,
 p.sort_order    AS page_order

 FROM role_permissions r
 JOIN users u
 ON u.role_id = r.role_id
 AND u.status = 'active'
 JOIN pages p
 ON p.id = r.page_id
 AND p.status = 'active' 
 LEFT JOIN page_categories pc
 ON pc.id = p.category_id
 AND pc.status = 'active'
 WHERE u.id = UUID_TO_BIN(?)
 AND r.allowed = 1 ORDER BY category_order, page_order
      `,
      [userId]
    );

    const sidebarMap = new Map<string, any>();

    for (const row of rows) {
      const categoryKey = row.category_id
        ? row.category_id.toString("hex")
        : "root";

      if (!sidebarMap.has(categoryKey)) {
        sidebarMap.set(categoryKey, {
          title: row.category_name || "General",
          url: "#",
          items: [],
        });
      }

      sidebarMap.get(categoryKey).items.push({
        title: row.page_name,
        url: row.page_path,
      });
    }

    const sidebar = Array.from(sidebarMap.values()).filter(
      (group) => group.items.length > 0
    );

    return NextResponse.json(sidebar);
  } catch (error) {
    console.error("NAVIGATION_API_ERROR", error);
    return NextResponse.json([], { status: 500 });
  }
}
