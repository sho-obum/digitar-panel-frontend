import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getRealIp } from "@/lib/getRealIp";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;
    const user_role = session?.user?.role;
    const userIp = getRealIp(request);
    const team_id = session?.user?.team_id;

    if (!user_id || !user_role || !userIp || !team_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [members]: any = await pool.query(
      `select BIN_TO_UUID(u.id) as id, u.fullname as full_name, u.email, u.status, r.name as role, u.role_id as role_id, u.created_at as joined_date, t.name as team_name from users u JOIN roles r ON u.role_id = r.id JOIN teams t ON u.team_id = t.id WHERE u.team_id = UUID_TO_BIN(?) AND u.is_delete = '0' AND t.status = 'active'`,
      [team_id]
    );

    return NextResponse.json(
      {
        success: true,
        data: members,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TEAM_MEMBERS_API_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team members",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userIp = getRealIp(request);
    const team_id = session?.user?.team_id;

    if (!userIp || !team_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }
    console.log("id", id);
    console.log("status", status);

    const [result]: any = await pool.query(
      `UPDATE users SET status = ? WHERE id = UUID_TO_BIN(?)`,
      [status, id]
    );
    console.log("result", result);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const [rows]: any = await pool.query(
      `SELECT BIN_TO_UUID(id) AS id, status FROM users WHERE id = UUID_TO_BIN(?)`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team members" + error,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;
    const user_role = session?.user?.role;
    const userIp = getRealIp(request);
    const team_id = session?.user?.team_id;

    if (!user_id || !user_role || !userIp || !team_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, email, role_id, id } = body;

    if (!full_name || !email || !role_id || !id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      `
      UPDATE users
      SET
        fullname = ?,
        email = ?,
        role_id = ?,
        updated_at = NOW()
      WHERE id = UUID_TO_BIN(?)
        AND deleted_at IS NULL
      `,
      [full_name, email, role_id, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const [rows]: any = await pool.query(
      `
      SELECT
        BIN_TO_UUID(id) AS id,
        fullname AS full_name,
        email,
        role_id
      FROM users
      WHERE id = UUID_TO_BIN(?)
      LIMIT 1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team members",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;
    const user_role = session?.user?.role;
    const userIp = getRealIp(request);
    const team_id = session?.user?.team_id;

    if (!user_id || !user_role || !userIp || !team_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      `
      UPDATE users
      SET
        deleted_at = NOW(),
        is_delete = '1'
      WHERE id = UUID_TO_BIN(?)
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
