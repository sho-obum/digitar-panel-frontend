import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Email Templates",
  description: "Create and manage your email templates",
  keywords: ["email templates", "template management", "email design"],
});
