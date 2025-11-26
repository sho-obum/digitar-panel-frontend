import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Access Control",
  description: "Manage user roles, permissions, and access levels",
  keywords: ["role management", "access control", "permissions", "admin"],
});
