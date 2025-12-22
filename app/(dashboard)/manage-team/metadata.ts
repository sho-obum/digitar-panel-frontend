import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Team & Users",
  description: "Manage your team members, invite users, and assign roles",
  keywords: ["team management", "users", "members", "admin"],
});
