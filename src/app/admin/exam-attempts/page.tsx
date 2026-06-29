"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AttemptDetailModal } from "@/components/admin/AttemptDetailModal";
import { Select } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";
import type { ExamAttempt, AttemptStatus } from "@/types";

const STATUS_BADGE: Record<AttemptStatus, { variant: "primary" | "success" | "warning" | "default"; label: string }> = {
  InProgress: { variant: "primary", label: "In Progress" },
  Completed: { variant: "success", label: "Completed" },
  TimedOut: { variant: "warning", label: "Timed Out" },
};

export default function AdminExamAttemptsPage() {
  const [page, setPage] = useState(1);
  const [examFilter, setExamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewAttempt, setViewAttempt] = useState<ExamAttempt | null>(null);

  const { data: examsData } = useQuery({
    queryKey: ["admin", "exams", "all"],
    queryFn: () => examsApi.adminList({ pageNumber: 1, pageSize: 100 }),
  });
  const exams = examsData?.items ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "exam-attempts", page, examFilter, statusFilter],
    queryFn: () =>
      examsApi.getAttempts({
        pageNumber: page,
        pageSize: 20,
        examId: examFilter || undefined,
      }),
  });

  const filtered = statusFilter && data?.items
    ? { ...data, items: data.items.filter((a) => a.status === statusFilter) }
    : data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Exam Attempts</h1>
        <p className="page-subtitle">Review all student exam attempts across all exams.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <select
            value={examFilter}
            onChange={(e) => { setExamFilter(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
        <Select
          options={[
            { value: "InProgress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
            { value: "TimedOut", label: "Timed Out" },
          ]}
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Exam</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead className="text-right">Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={8} />
            ))
          ) : !filtered?.items?.length ? (
            <TableEmpty colSpan={8} message="No attempts found." />
          ) : (
            filtered.items.map((attempt) => {
              const status = STATUS_BADGE[attempt.status];
              return (
                <TableRow key={attempt.id}>
                  <TableCell className="text-sm text-slate-700">
                    User #{attempt.userId.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[160px] truncate text-sm font-medium text-slate-900">
                      {attempt.exam.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {attempt.score != null ? `${attempt.score}%` : "—"}
                  </TableCell>
                  <TableCell>
                    {attempt.status === "TimedOut" ? (
                      <span className="text-xs font-medium text-amber-600">Timed Out</span>
                    ) : attempt.status === "Completed" && attempt.isPassed != null ? (
                      attempt.isPassed ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                          <XCircle className="h-3.5 w-3.5" /> Fail
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {formatRelativeTime(attempt.startedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {attempt.completedAt ? formatRelativeTime(attempt.completedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setViewAttempt(attempt)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="View detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}

      {viewAttempt && (
        <AttemptDetailModal attempt={viewAttempt} onClose={() => setViewAttempt(null)} />
      )}
    </div>
  );
}
