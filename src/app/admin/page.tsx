"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, CreditCard, Award, TrendingUp, Activity } from "lucide-react";
import { analyticsApi } from "@/lib/analytics";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ACTIVITY_BADGE: Record<string, { label: string; variant: "primary" | "success" | "info" | "warning" }> = {
  enrollment: { label: "Enrolled", variant: "primary" },
  purchase: { label: "Purchased", variant: "success" },
  exam_passed: { label: "Passed Exam", variant: "info" },
  user_registered: { label: "Registered", variant: "warning" },
};

export default function AdminDashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "summary"],
    queryFn: analyticsApi.getDashboardSummary,
    refetchInterval: 60_000, // auto-refresh every 60s
  });

  const kpiCards = [
    {
      label: "Total Users",
      value: summary?.totalUsers,
      sub: `${summary?.activeUsers || 0} active`,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Resources",
      value: summary?.publishedResources,
      sub: `${summary?.totalResources || 0} total`,
      icon: BookOpen,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: "Revenue (Month)",
      value: summary ? formatCurrency(summary.revenueThisMonth) : null,
      sub: `${formatCurrency(summary?.totalRevenue || 0)} all time`,
      icon: CreditCard,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Certificates",
      value: summary?.totalCertificates,
      sub: `from ${summary?.totalExams || 0} exams`,
      icon: Award,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Platform-wide activity overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-24" />
            ) : (
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {kpi.value ?? "—"}
              </p>
            )}
            <p className="mt-1 text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <Activity className="h-5 w-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
        </div>

        <div className="divide-y divide-slate-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1.5 h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : !summary?.recentActivity?.length ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">
              No activity yet.
            </p>
          ) : (
            summary.recentActivity.map((item) => {
              const badge = ACTIVITY_BADGE[item.type] || { label: item.type, variant: "default" as const };
              return (
                <div key={item.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {item.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-slate-700">{item.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
