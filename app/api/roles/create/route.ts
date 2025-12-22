import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user_id = session?.user?.id;
  const team_id = session?.user?.team_id;
  const role = session?.user?.role;
  const userIp = getRealIp(req);
  
  if (!user_id || role != 'main-admin') {
    log.warn("GET /api/roles/create: Unauthorized", {
      ip: userIp,
      time: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 }
    );
  }
  const [rows] = await pool.query(
      `SELECT id, name , slug as 'unique-key' FROM roles WHERE team_id = UUID_TO_BIN(?) AND user_id = UUID_TO_BIN(?)`,
      [team_id, user_id]
    );
  return NextResponse.json(
      { data:rows },
      { status: 200 }
    );
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user_id = session?.user?.id;
  const role = session?.user?.role;
  const team_id = session?.user?.team_id;
  const userIp = getRealIp(req);

  if (!user_id || role != 'main-admin') {
    log.warn("POST /api/roles/create: Unauthorized", {
      ip: userIp,
      time: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { name, slug, description } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    if(slug == 'main-admin' || name == 'main-admin'){
        return NextResponse.json(
        { error: "Use another name" },
        { status: 400 }
      );
    }

    const [duplicate] = await pool.query(
      `SELECT id FROM roles 
       WHERE team_id = UUID_TO_BIN(?) AND slug = ?`,
      [team_id, slug]
    );

    if ((duplicate as any[]).length) {
      return NextResponse.json(
        { error: "Role already exists for this team" },
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO roles ( name, slug, description, user_id, team_id) 
       VALUES (?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
      [ name, slug, description || null, user_id, team_id]
    );

    return NextResponse.json(
      { message: "Role created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create role API error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error?.message },
      { status: 500 }
    );
  }
}
