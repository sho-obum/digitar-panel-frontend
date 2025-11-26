import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Analytics Dashboard",
  description: "Real-time campaign performance analytics and insights from AppFlyer",
  keywords: ["appsflyer", "analytics", "campaign performance", "dashboard"],
});
