import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Account Settings",
  description: "Configure your account preferences, security, and integrations",
  keywords: ["settings", "preferences", "account", "configuration"],
});
