import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import Providers from "./providers/session-providers";

export const metadata: Metadata = {
  title: "SaaS Frontend",
  description: "Affiliate marketing automation dashboard",
};

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
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
