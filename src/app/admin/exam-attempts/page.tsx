"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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
  Submitted: { variant: "warning", label: "Submitted" },
  Graded: { variant: "success", label: "Graded" },
  Expired: { variant: "default", label: "Expired" },
};

function AttemptDetailModal({
  attempt,
  onClose,
}: {
  attempt: ExamAttempt;
  onClose: () => void;
}) {
  const passed = attempt.passed;
  const percentage = attempt.percentage ?? 0;

  return (
    <Modal isOpen onClose={onClose} title="Attempt Detail" size="lg">
      <div className="space-y-5">
        {/* Exam info */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{attempt.exam.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Attempt #{attempt.attemptNumber} · Started {formatDate(attempt.startedAt)}
          </p>
        </div>

        {/* Score */}
        {attempt.status === "Graded" && (
          <div className="flex items-center gap-4">
            <div
              className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 font-bold ${
                passed
                  ? "border-green-400 text-green-600"
                  : "border-red-400 text-red-600"
              }`}
            >
              <span className="text-2xl">{percentage}%</span>
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                {passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {passed ? "Passed" : "Failed"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Score: {attempt.score} · Pass threshold: {attempt.exam.passingScore}%
              </p>
              {attempt.timeTakenSeconds && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Started</p>
            <p className="mt-0.5 text-slate-900">{formatDate(attempt.startedAt)}</p>
          </div>
          {attempt.submittedAt && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted</p>
              <p className="mt-0.5 text-slate-900">{formatDate(attempt.submittedAt)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Expires / Expired</p>
            <p className="mt-0.5 text-slate-900">{formatDate(attempt.expiresAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
            <Badge variant={STATUS_BADGE[attempt.status].variant} dot className="mt-0.5">
              {STATUS_BADGE[attempt.status].label}
            </Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
}

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

      {/* Filters */}
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
            { value: "Submitted", label: "Submitted" },
            { value: "Graded", label: "Graded" },
            { value: "Expired", label: "Expired" },
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
            <TableHead>Attempt #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Started</TableHead>
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
                  <TableCell className="text-sm text-slate-500">
                    #{attempt.attemptNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {attempt.percentage != null ? `${attempt.percentage}%` : "—"}
                  </TableCell>
                  <TableCell>
                    {attempt.status === "Graded" ? (
                      attempt.passed ? (
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
