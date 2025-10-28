"use client";

import { useState, useEffect, ReactNode, useTransition, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";

function LoadingProviderContent({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Show loader with minimum delay to prevent flashing
    const minDelayTimer = setTimeout(() => {
      setIsLoading(true);
    }, 100); // Small delay to prevent flash on fast loads

    return () => clearTimeout(minDelayTimer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Hide loader when isPending becomes false (actual page transition complete)
    if (!isPending && isLoading) {
      setIsLoading(false);
    }
  }, [isPending, isLoading]);

  // Also set a maximum timeout to hide loader even if page hangs
  useEffect(() => {
    if (!isLoading) return;

    const maxWaitTimer = setTimeout(() => {
      console.warn("Page load took longer than 10 seconds, hiding loader anyway");
      setIsLoading(false);
    }, 10000); // 10 second max timeout

    return () => clearTimeout(maxWaitTimer);
  }, [isLoading]);

  return (
    <>
      {/* Global Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
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
