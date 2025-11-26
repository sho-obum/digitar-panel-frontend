import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "AppFlyer Dashboard",
  description: "View campaign performance analytics from AppFlyer",
  keywords: ["appsflyer", "analytics", "campaign performance", "dashboard"],
});
