import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getRealIp } from "@/lib/getRealIp";
import bcrypt from "bcrypt";
import { inviteMemberEmail } from "@/lib/inviteMemberEmail";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { full_name, email, role_id } = await req.json();

    if (!full_name || !email || !role_id) {
      return NextResponse.json(
        { error: "full_name, email and role_id are required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;
    const userIp = getRealIp(req);
    const team_id = session?.user?.team_id;

    if (!user_id || !userIp || !team_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [isPresent] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );

    if (isPresent.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const password =
      email.split("@")[0] + "@" + Math.random().toString(36).slice(-3);

    const hashedPassword = await bcrypt.hash(password, 10);

    const [roles] = await pool.query<RowDataPacket[]>(
      `SELECT name FROM roles WHERE id = ?`,
      [role_id]
    );

    const inviteMemberEmailResult = await inviteMemberEmail(
      email,
      full_name,
      roles[0]?.name,
      process.env.NEXT_PUBLIC_BASE_URL + "/verify",
      password
    );

    const [result]: any = await pool.query(
      `INSERT INTO users (fullname, email, role_id, password_hash, team_id, created_at, updated_at) VALUES (?, ?, ?, ?, UUID_TO_BIN(?), NOW(), NOW())`,
      [full_name, email, role_id, hashedPassword, team_id]
    );

    const [result2] = await pool.query<RowDataPacket[]>(
      `SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ?`,
      [email]
    );
    return NextResponse.json({
      success: true,
      data: {
        id: result2[0].id,
        email,
        full_name,
        role_id,
        team_id,
        joined_date: new Date(),
        updated_at: new Date(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", detail: error?.message },
      { status: 500 }
    );
  }
}
