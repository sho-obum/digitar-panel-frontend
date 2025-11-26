import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const user_id = session?.user?.id;
  const userIp = getRealIp(req);

  log.info("DELETE /api/mail-config/delete: Requesting", {
    user_id,
    ip: userIp,
    time: new Date().toISOString(),
  });

  if (!user_id) {
    log.warn("DELETE /api/mail-config/delete: Unauthorized", {
      ip: userIp,
      time: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, msg: "Missing configuration ID" },
        { status: 400 }
      );
    }

    // Check config belongs to user
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

    // Delete the config
    await pool.query(
      `DELETE FROM mail_configs WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    log.info("DELETE /api/mail-config/delete: Config deleted successfully", {
      user_id,
      config_id: id,
      ip: userIp,
      time: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      msg: "Configuration deleted successfully",
      deleted_id: id,
    });
  } catch (err: any) {
    log.error("DELETE /api/mail-config/delete: Error deleting config", {
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
