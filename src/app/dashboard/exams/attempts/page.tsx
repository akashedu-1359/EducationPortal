"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { useFeatureFlag } from "@/components/common/FeatureGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { AttemptStatus } from "@/types";

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<AttemptStatus, { label: string; variant: "info" | "success" | "warning" }> = {
  InProgress: { label: "In Progress", variant: "info" },
  Completed: { label: "Completed", variant: "success" },
  TimedOut: { label: "Timed Out", variant: "warning" },
};

export default function MyExamAttemptsPage() {
  const [page, setPage] = useState(1);
  const examsEnabled = useFeatureFlag("enable_exams");

  const { data, isLoading } = useQuery({
    queryKey: ["my-attempts-all", page],
    queryFn: () => examsApi.getMyAttempts({ pageNumber: page, pageSize: PAGE_SIZE }),
    enabled: examsEnabled !== false,
  });

  const attempts = data?.items ?? [];

  if (examsEnabled === false) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Exams are currently disabled. Contact an administrator if you believe this is an error.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Exam Attempts</h1>
          <p className="page-subtitle">Track your exam attempts and results</p>
        </div>
        <Link href="/dashboard/exams">
          <Button variant="outline" size="sm">Browse available exams</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Title</TableHead>
            <TableHead>Score (%)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : attempts.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={<GraduationCap className="h-10 w-10" />}
              message="You haven't taken any exams yet. Browse exams to get started."
            />
          ) : (
            attempts.map((attempt) => {
              const cfg = STATUS_BADGE[attempt.status];
              return (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium text-slate-900">
                    <Link
                      href={`/exams/${attempt.examId}`}
                      className="hover:text-primary-600 hover:underline"
                    >
                      {attempt.examTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {attempt.score != null ? `${attempt.score}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} dot>
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(attempt.startedAt)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {attempt.completedAt ? formatDate(attempt.completedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    {attempt.status === "Completed" || attempt.status === "TimedOut" ? (
                      <Link
                        href={`/exams/results/${attempt.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View Result
                      </Link>
                    ) : (
                      <Link
                        href={`/exams/${attempt.examId}/attempt`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Continue
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
