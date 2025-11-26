import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Role Access Management",
  description: "Manage user roles and access control",
  keywords: ["role management", "access control", "permissions", "admin"],
});
