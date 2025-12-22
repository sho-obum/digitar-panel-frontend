import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";

interface UpdateConfigBody {
  id: number;
  config_name?: string;
  provider?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  from_email?: string;
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const user_id = session?.user?.id;
  const userIp = getRealIp(req);

  log.info("PUT /api/mail-config/update: Requesting", {
    user_id,
    ip: userIp,
    time: new Date().toISOString(),
  });

  if (!user_id) {
    log.warn("PUT /api/mail-config/update: Unauthorized", {
      ip: userIp,
      time: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as UpdateConfigBody;
    const {
      id,
      config_name,
      provider,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      from_email,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, msg: "Missing configuration ID" },
        { status: 400 }
      );
    }

    // 1. Check config belongs to user
    const [existing]: any = await pool.query(
      `SELECT * FROM mail_configs WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, user_id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, msg: "Configuration not found" },
        { status: 404 }
      );
    }

    // 2. Check duplicates (same name or email)
    if (config_name || from_email) {
      const [dupes]: any = await pool.query(
        `SELECT id FROM mail_configs 
         WHERE user_id = ? 
         AND id != ?
         AND (config_name = ? OR from_email = ?)
         LIMIT 1`,
        [
          user_id,
          id,
          config_name || existing[0].config_name,
          from_email || existing[0].from_email,
        ]
      );

      if (dupes.length > 0) {
        return NextResponse.json(
          {
            success: false,
            exists: true,
            msg: "Another configuration with this name or email already exists",
          },
          { status: 409 }
        );
      }
    }

    // 3. Build SQL update dynamic query
    const fields: string[] = [];
    const values: any[] = [];

    if (config_name) {
      fields.push("config_name = ?");
      values.push(config_name);
    }
    if (provider) {
      fields.push("provider = ?");
      values.push(provider);
    }
    if (smtp_host) {
      fields.push("smtp_host = ?");
      values.push(smtp_host);
    }
    if (smtp_port) {
      fields.push("smtp_port = ?");
      values.push(smtp_port);
    }
    if (smtp_user) {
      fields.push("smtp_user = ?");
      values.push(smtp_user);
    }
    if (smtp_pass) {
      fields.push("smtp_pass = ?");
      values.push(smtp_pass);
    }
    if (from_email) {
      fields.push("from_email = ?");
      values.push(from_email);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, msg: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id, user_id);

    const sql = `
      UPDATE mail_configs 
      SET ${fields.join(", ")} 
      WHERE id = ? AND user_id = ?
    `;

    await pool.query(sql, values);

    return NextResponse.json({
      success: true,
      msg: "Configuration updated successfully",
      updated_id: id,
      payload: body,
    });
  } catch (err: any) {
    log.error("PUT /api/mail-config/update: Error updating config", {
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
