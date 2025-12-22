import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRealIp } from "@/lib/getRealIp";
import { log } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user_id = session?.user?.id;
        const team_id = session?.user?.team_id;
        const role = session?.user?.role;
        const userIp = getRealIp(req);
        
        if (!user_id || role != 'main-admin') {
            log.warn("POST /api/roles/update-permission: Unauthorized "+team_id, {
                ip: userIp,
                time: new Date().toISOString(),
            });
            return NextResponse.json(
                { success: false, msg: "Unauthorized" },
                { status: 401 }
            );
        }
        const { allow, page_key, role_id } = await req.json();
        console.log([role_id, page_key, allow ? 1 : 0, user_id]);
        if(!page_key || !role_id){
            return NextResponse.json(
                { success: false, msg: "Refresh the page." },
                { status: 401 }
            );
        }
        const [result]: any = await pool.query(
            `INSERT INTO role_permissions (role_id, page_id, allowed, updated_by) VALUES (?, UUID_TO_BIN(?), ?, UUID_TO_BIN(?)) ON DUPLICATE KEY UPDATE allowed = VALUES(allowed), updated_by = VALUES(updated_by)`,
            [role_id, page_key, allow ? 1 : 0, user_id]
        );
        if(result.affectedRows === 0){
            return NextResponse.json({ success: false, msg : "" });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { success: false, msg: "Internal error: "+err },
            { status: 500 }
        );
    }
}
