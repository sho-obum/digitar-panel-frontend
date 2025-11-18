import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { UAParser } from "ua-parser-js";
//ua parser for raw user data to clean data easilyy 
interface LoginHistoryRow {
  id: number;
  email: string;
  status: string;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}


/* HELPER: Parse User Agent */

function parseUserAgent(userAgent: string | null): { device: string; browser: string } {
  if (!userAgent) return { device: "Unknown Device", browser: "Unknown Browser" };

  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const device = result.device.model || result.os.name || "Unknown Device";
    const browser = result.browser.name
      ? `${result.browser.name} ${result.browser.version || ""}`.trim()
      : "Unknown Browser";

    return { device, browser };
  } catch (error) {
    return { device: "Unknown Device", browser: "Unknown Browser" };
  }
}


/* GET Fetch from Database */

export async function GET(request: Request) {
  try {
    //  Step 1: user is authenticated ?
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    //  Step 2: Query db
    const [rows] = await pool.query(
      `SELECT id, email, status, ip_address, user_agent, created_at 
       FROM login_logs 
       WHERE email = ? AND status IN ('success', 'failed')
       ORDER BY created_at DESC 
       LIMIT 50`,
      [session.user.email]
    );

    // Step 3: Transform database rows -> match frontend interface
    const loginHistory = (rows as LoginHistoryRow[]).map((row) => {
      // Handle localhost IP
      let displayIp = row.ip_address || "Unknown";
      if (displayIp === "::1" || displayIp === "127.0.0.1") {
        displayIp = "Localhost";
      }

      return {
        id: String(row.id),
        timestamp: new Date(row.created_at).toISOString(),
        ipAddress: displayIp,
        device: parseUserAgent(row.user_agent).device,
        browser: parseUserAgent(row.user_agent).browser,
        status: (row.status === "success" ? "success" : "failed") as "success" | "failed",
        location: "Unknown", //Rahul :: how to add location?
      };
    });

    return NextResponse.json(loginHistory, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { error: "Failed to fetch login history", details: (error as Error).message },
      { status: 500 }
    );
  }
}
