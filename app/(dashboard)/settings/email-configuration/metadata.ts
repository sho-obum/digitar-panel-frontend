import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Email Configuration",
  description: "Manage your SMTP email configurations and sender settings",
  keywords: [
    "email configuration",
    "SMTP settings",
    "mail config",
    "email management",
  ],
});
