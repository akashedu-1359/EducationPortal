"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useHydrateAuth } from "@/hooks/useAuth";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  useHydrateAuth();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              if (
                error &&
                typeof error === "object" &&
                "response" in error &&
                (error as { response?: { status?: number } }).response?.status !== undefined
              ) {
                const status = (error as { response: { status: number } }).response.status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>{children}</AuthHydrator>
    </QueryClientProvider>
  );
}
