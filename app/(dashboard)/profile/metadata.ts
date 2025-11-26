import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Profile",
  description: "View and edit your user profile",
  keywords: ["profile", "account", "user profile", "settings"],
});
