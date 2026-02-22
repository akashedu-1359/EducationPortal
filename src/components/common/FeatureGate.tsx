"use client";

import { useQuery } from "@tanstack/react-query";
import { cmsPublicApi } from "@/lib/cms";

interface FeatureGateProps {
  /** The feature flag key to check */
  flag: string;
  /** Rendered when flag is enabled */
  children: React.ReactNode;
  /** Optional fallback rendered when flag is disabled */
  fallback?: React.ReactNode;
}

/**
 * Client-side feature flag gate.
 * Reads flags from the CMS API (cached by React Query).
 *
 * Usage:
 *   <FeatureGate flag="show_blog_section">
 *     <BlogSection />
 *   </FeatureGate>
 */
export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const { data: flags, isLoading } = useQuery({
    queryKey: ["cms", "feature-flags"],
    queryFn: cmsPublicApi.getFeatureFlags,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  if (isLoading) return null; // don't flash content while loading

  const enabled = flags?.[flag] === true;
  return enabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook version for conditional logic inside components.
 */
export function useFeatureFlag(flag: string): boolean | null {
  const { data: flags, isLoading } = useQuery({
    queryKey: ["cms", "feature-flags"],
    queryFn: cmsPublicApi.getFeatureFlags,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;
  return flags?.[flag] === true;
}
