import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user_id = session?.user?.id;
  const userIp = getRealIp(req);

  log.info("GET /api/mail-config/list: Request", {
    user_id,
    ip: userIp,
    time: new Date().toISOString(),
  });

  if (!user_id) {
    log.warn("GET /api/mail-config/list: Unauthorized", {
      ip: userIp,
      time: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT 
        id,
        config_name,
        provider,
        smtp_host,
        smtp_port,
        smtp_user,
        from_email,
        created_at,
        updated_at
      FROM mail_configs
      WHERE user_id = ?
      ORDER BY id DESC`,
      [user_id]
    );

    return NextResponse.json({
      success: true,
      count: rows.length,
      configs: rows,
    });
  } catch (err: any) {
    log.error("GET /api/mail-config/list: Error", {
      error: err.message,
      user_id,
      ip: userIp,
      time: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}


// const res = await fetch("/api/mail-config/list");
// const json = await res.json();
// console.log(json.configs);
