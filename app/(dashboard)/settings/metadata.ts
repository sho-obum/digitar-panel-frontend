import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Settings",
  description: "Manage your account settings and preferences",
  keywords: ["settings", "preferences", "account", "configuration"],
});
