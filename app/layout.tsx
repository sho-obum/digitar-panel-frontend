import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import Providers from "./providers/session-providers";
import { Toaster } from "@/components/ui/sonner";
import { defaultMetadata } from "@/lib/metadata";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
