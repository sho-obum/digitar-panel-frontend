"use client";

import { useState, useEffect, ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "@/components/loader";

function LoadingProviderContent({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loader immediately when pathname changes
    setIsLoading(true);

    // Hide loader after content has had time to render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Global Loader - Within Main Layout Only */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader className="text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading...
            </p>
          </div>
        </div>
      )}

      {children}
    </>
  );
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LoadingProviderContent>{children}</LoadingProviderContent>
    </Suspense>
  );
}
