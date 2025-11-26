import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Login",
  description: "Sign in to your Digitar Panel account to access your affiliate marketing dashboard",
  keywords: ["login", "signin", "authentication", "digitar panel"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
      <div className="w-[80vw] h-[75vh] rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}