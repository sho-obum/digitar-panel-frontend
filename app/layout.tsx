import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./components/sidebar";
import Header from "./components/header";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Frontend",
  description: "Affiliate marketing automation dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
  const breadcrumbs = [
    { title: "Dashboard", href: "/", isActive: false },
    { title: "Overview", href: "#", isActive: true },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Header breadcrumbs={breadcrumbs} />
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
