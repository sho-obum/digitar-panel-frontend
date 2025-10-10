import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "../components/sidebar";
import Header from "../components/header";

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}