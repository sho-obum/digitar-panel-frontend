import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "My Profile",
  description: "View and update your personal profile information",
  keywords: ["profile", "account", "user profile", "settings"],
});
