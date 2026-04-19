"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { TrendingUp, Users, BarChart2 } from "lucide-react";
import { analyticsApi } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import to avoid SSR issues with recharts
const RevenueChart = dynamic(() => import("@/components/admin/charts/RevenueChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
});

const EnrollmentChart = dynamic(() => import("@/components/admin/charts/EnrollmentChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
});

const PERIOD_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["admin", "analytics", "revenue", days],
    queryFn: () => analyticsApi.getRevenueChart(days),
  });

  const { data: enrollments, isLoading: enrLoading } = useQuery({
    queryKey: ["admin", "analytics", "enrollments", days],
    queryFn: () => analyticsApi.getEnrollmentChart(days),
  });

  const totalRevenue = revenue?.reduce((sum, d) => sum + d.amount, 0) ?? 0;
  const totalEnrollments = enrollments?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const avgRevPerDay = revenue?.length ? totalRevenue / revenue.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Revenue and enrollment trends over time.</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                days === opt.value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="Total Revenue"
          value={revLoading ? null : formatCurrency(totalRevenue)}
          sub={`avg ${formatCurrency(avgRevPerDay)} / day`}
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
        />
        <SummaryCard
          label="Total Enrollments"
          value={enrLoading ? null : totalEnrollments}
          sub={`over ${days} days`}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          label="Revenue / Enrollment"
          value={
            revLoading || enrLoading
              ? null
              : totalEnrollments > 0
              ? formatCurrency(totalRevenue / totalEnrollments)
              : "—"
          }
          sub="average order value"
          icon={BarChart2}
          color="bg-violet-100 text-violet-600"
        />
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Revenue (₹)</h2>
        {revLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : (
          <RevenueChart data={revenue ?? []} />
        )}
      </div>

      {/* Enrollment chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Enrollments</h2>
        {enrLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : (
          <EnrollmentChart data={enrollments ?? []} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number | null;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      {value === null ? (
        <Skeleton className="mt-3 h-7 w-28" />
      ) : (
        <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      )}
      <p className="mt-0.5 text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
    </div>
  );
}
