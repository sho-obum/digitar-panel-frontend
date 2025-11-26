import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Team Management",
  description: "Manage your team members and their permissions",
  keywords: ["team management", "users", "members", "admin"],
});
