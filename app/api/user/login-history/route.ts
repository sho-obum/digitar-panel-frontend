import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

//
const mockLoginHistory = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    ipAddress: "192.168.1.100",
    device: "Windows Desktop",
    browser: "Chrome 120.0",
    status: "success" as const,
    location: "New York, USA",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    ipAddress: "203.0.113.45",
    device: "iPhone 15",
    browser: "Safari",
    status: "success" as const,
    location: "New York, USA",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    ipAddress: "198.51.100.78",
    device: "MacBook Pro",
    browser: "Firefox 121.0",
    status: "success" as const,
    location: "Los Angeles, USA",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
    ipAddress: "192.168.1.105",
    device: "Android Phone",
    browser: "Chrome Mobile",
    status: "failed" as const,
    location: "New York, USA",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    ipAddress: "192.168.1.100",
    device: "Windows Desktop",
    browser: "Edge 120.0",
    status: "success" as const,
    location: "New York, USA",
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    ipAddress: "203.0.113.50",
    device: "iPad Air",
    browser: "Safari",
    status: "success" as const,
    location: "Chicago, USA",
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    ipAddress: "198.51.100.80",
    device: "Windows Desktop",
    browser: "Chrome 119.0",
    status: "failed" as const,
    location: "New York, USA",
  },
  {
    id: "8",
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    ipAddress: "192.168.1.100",
    device: "Windows Desktop",
    browser: "Chrome 119.0",
    status: "success" as const,
    location: "New York, USA",
  },
];

/* -------------------------------------------- */
/* GET ENDPOINT */
/* -------------------------------------------- */
export async function GET(request: Request) {
  try {
    // In production, you would:
    // 1. Verify the user is authenticated
    // 2. Fetch from your database
    // 3. Apply pagination and filtering

    return NextResponse.json(mockLoginHistory, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { error: "Failed to fetch login history" },
      { status: 500 }
    );
  }
}
