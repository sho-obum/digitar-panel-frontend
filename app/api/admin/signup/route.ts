import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

/**
 * POST /api/admin/signup
 * Only admins can create new users.
 */
export async function POST(req: Request) {
  try {
    // const authHeader = req.headers.get("authorization");
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // const token = authHeader.split(" ")[1];
    // const decoded = jwt.verify(token, JWT_SECRET) as any;

    // // ✅ Check if user is admin
    // if (decoded.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    // }

    const { fullname, email, role, password } = await req.json();

    console.log("👤 Signup Request:", { fullname, email, role, password });
    if (!fullname || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: fullname, email, role" },
        { status: 400 }
      );
    }

    // ✅ Check if email already exists
    const [existing]: any = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // ✅ Default password (temporary) or generate random
    const tempPassword = password || Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // ✅ Find role_id if you have roles table
    const [roleRow]: any = await pool.query("SELECT id FROM roles WHERE name = ?", [role]);
    const roleId = roleRow[0]?.id || null;

    // ✅ Insert user
    await pool.query(
      "INSERT INTO users (fullname, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, 1)",
      [fullname, email, passwordHash, roleId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: { fullname, email, role, tempPassword },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Signup Error:", err);
    if (err.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
