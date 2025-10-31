"use server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ Next.js 14+ App Router style route
const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;