import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";
import type { RowDataPacket } from "mysql2";


export async function GET(request : NextRequest){
    const userIp = getRealIp(request);
    

    return NextResponse.json({userIp:userIp});
}