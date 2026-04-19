"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFeatureFlagsPage() {
  const qc = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ["admin", "cms", "feature-flags"],
    queryFn: cmsAdminApi.getFeatureFlags,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean }) =>
      cmsAdminApi.updateFeatureFlag(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cms", "feature-flags"] }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Feature Flags</h1>
        <p className="page-subtitle">
          Toggle features on or off without code deployments.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
          {flags.map((flag, i) => (
            <div
              key={flag.id}
              className={`flex items-center justify-between px-5 py-4 ${i < flags.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-slate-800">{flag.key}</p>
                  <Badge variant={flag.value ? "success" : "default"} dot>
                    {flag.value ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {flag.description && (
                  <p className="mt-0.5 text-sm text-slate-500">{flag.description}</p>
                )}
                <p className="mt-0.5 text-xs text-slate-400">
                  Updated {formatRelativeTime(flag.updatedAt)}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={flag.value}
                aria-label={`Toggle ${flag.key}`}
                disabled={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate({ key: flag.key, value: !flag.value })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-wait ${
                  flag.value ? "bg-primary-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    flag.value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
