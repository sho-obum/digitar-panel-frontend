import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRealIp } from "@/lib/getRealIp";
import { log } from "@/lib/logger";

export async function GET(req : Request) {
    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;
    const team_id = session?.user?.team_id;
    const role = session?.user?.role;
    const userIp = getRealIp(req);

    if (!user_id || role != 'main-admin') {
        log.warn("POST /api/roles/permissions: Unauthorized " + team_id, {
            ip: userIp,
            time: new Date().toISOString(),
        });
        return NextResponse.json(
            { success: false, msg: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const [rows]: any = await pool.query(`SELECT rp.role_id, BIN_TO_UUID(rp.page_id) AS page_key, rp.allowed FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.user_id = UUID_TO_BIN(?) AND r.team_id = UUID_TO_BIN(?)`,[user_id, team_id]);
        return NextResponse.json({ data: rows });
    } catch (error) {
        return NextResponse.json({ error: "Failed to load permissions" }, { status: 500 });
    }
}
