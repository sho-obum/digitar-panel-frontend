import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";

interface AddConfigBody {
  config_name: string;
  provider?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  from_email: string;
}

export async function POST(req: Request) {
 const session = await getServerSession(authOptions);
 const user_id = session?.user?.id;
 const userIp = getRealIp(req);

 log.info("POST /api/mail-config/add: Requesting", { user_id, ip: userIp, time: new Date().toISOString() });
 
 if (!user_id) {
    console.warn("❌ [POST /api/mail-config/add] Unauthorized - No user_id");
    log.warn("POST /api/mail-config/add: Unauthorized access attempt", { ip: userIp, time: new Date().toISOString() });
   return NextResponse.json(
     { success: false, msg: "Unauthorized" },
     { status: 401 }
   );
 }

  try {
    const body = (await req.json()) as AddConfigBody;

    const {
      config_name,
      provider = "smtp",
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      from_email,
    } = body;

    // Required fields validation
    if (!user_id || !config_name || !from_email) {
      log.error("❌ [POST /api/mail-config/add] Missing required fields:", {
        user_id: !!user_id,
        config_name: !!config_name,
        from_email: !!from_email,
      });
      return NextResponse.json(
        { success: false, msg: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const [rows]: any = await pool.query(
      `SELECT id FROM mail_configs 
       WHERE user_id = ? AND (config_name = ? OR from_email = ?) LIMIT 1`,
      [user_id, config_name, from_email]
    );

    if (rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          exists: true,
          msg: "Configuration with this name or email already exists",
        },
        { status: 409 }
      );
    }
    
    const [result]: any = await pool.query(
      `INSERT INTO mail_configs 
        (user_id, config_name, provider, smtp_host, smtp_port, smtp_user, smtp_pass, from_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        config_name,
        provider,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        from_email,
      ]
    );

    return NextResponse.json({
      success: true,
      msg: "Config added successfully",
      inserted_id: result.insertId,
      payload: body,
    });
  } catch (err: any) {
    
    log.error("POST /api/mail-config/add: Error adding config", { 
      error: err.message, 
      user_id, 
      ip: userIp, 
      time: new Date().toISOString(),
      stack: err.stack,
    });
    
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}