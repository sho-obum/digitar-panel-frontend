import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Dashboard",
  description: "Overview of your campaigns, analytics, and marketing performance",
  keywords: ["dashboard", "campaigns", "affiliate marketing", "analytics"],
});
