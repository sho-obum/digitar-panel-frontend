import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Campaign Manager",
  description: "Create, manage, and monitor your affiliate marketing campaigns",
  keywords: ["campaigns", "create campaign", "manage campaigns", "affiliate"],
});
