import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "../components/sidebar";
import Header from "../components/header";
import { LoadingProvider } from "@/app/providers/loading-provider";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Dashboard",
  description: "Manage your affiliate campaigns, emails, and marketing automation",
  keywords: ["dashboard", "campaigns", "affiliate marketing", "analytics"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { title: "Dashboard", href: "/", isActive: false },
    { title: "Overview", href: "#", isActive: true },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <LoadingProvider>
          <div className="relative flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </LoadingProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}