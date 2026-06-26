"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { Badge } from "@/components/ui/badge";
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

export default function MyExamsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["my-attempts-all", page],
    queryFn: () => examsApi.getMyAttempts({ pageNumber: page, pageSize: PAGE_SIZE }),
  });

  const attempts = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Exams</h1>
        <p className="page-subtitle">Track your exam attempts and results</p>
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
