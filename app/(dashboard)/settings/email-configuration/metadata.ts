import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Email Settings",
  description: "Configure SMTP servers, sender addresses, and email delivery settings",
  keywords: [
    "email configuration",
    "SMTP settings",
    "mail config",
    "email management",
  ],
});
