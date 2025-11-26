import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Campaigns",
  description: "Manage your affiliate marketing campaigns",
  keywords: ["campaigns", "create campaign", "manage campaigns", "affiliate"],
});
