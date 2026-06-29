"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { formatDate, formatExamScore } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { ExamAttempt, AttemptStatus } from "@/types";

const STATUS_BADGE: Record<AttemptStatus, { variant: "primary" | "success" | "warning" | "default"; label: string }> = {
  InProgress: { variant: "primary", label: "In Progress" },
  Completed: { variant: "success", label: "Completed" },
  TimedOut: { variant: "warning", label: "Timed Out" },
};

interface AttemptDetailModalProps {
  attempt: ExamAttempt;
  onClose: () => void;
}

export function AttemptDetailModal({ attempt, onClose }: AttemptDetailModalProps) {
  const hasScore = attempt.status === "Completed" && attempt.score != null;
  const passed = attempt.isPassed === true;
  const failed = attempt.isPassed === false;

  return (
    <Modal isOpen onClose={onClose} title="Attempt Detail" size="lg">
      <div className="space-y-5">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{attempt.exam.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">Started {formatDate(attempt.startedAt)}</p>
        </div>

        {attempt.status === "TimedOut" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-800">Timed out</p>
            <p className="mt-1 text-sm text-amber-700">
              The exam window ended before the student submitted. No score was recorded.
            </p>
          </div>
        )}

        {hasScore && (
          <div
            className={`flex items-center gap-4 rounded-xl border p-4 ${
              passed
                ? "border-green-200 bg-green-50"
                : failed
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <p
              className={`shrink-0 text-3xl font-bold tabular-nums leading-none ${
                passed ? "text-green-600" : failed ? "text-red-600" : "text-slate-700"
              }`}
            >
              {formatExamScore(attempt.score!)}%
            </p>
            <div className="min-w-0">
              <p
                className={`flex items-center gap-1.5 font-semibold ${
                  passed ? "text-green-700" : failed ? "text-red-700" : "text-slate-900"
                }`}
              >
                {passed ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                ) : failed ? (
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                ) : null}
                {passed ? "Passed" : failed ? "Failed" : "Scored"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Pass threshold: {attempt.exam.passingPercentage}%
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Started</p>
            <p className="mt-0.5 text-slate-900">{formatDate(attempt.startedAt)}</p>
          </div>
          {attempt.completedAt && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed</p>
              <p className="mt-0.5 text-slate-900">{formatDate(attempt.completedAt)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Attempt status</p>
            <Badge variant={STATUS_BADGE[attempt.status].variant} dot className="mt-0.5">
              {STATUS_BADGE[attempt.status].label}
            </Badge>
          </div>
          {hasScore && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Result</p>
              <Badge
                variant={passed ? "success" : failed ? "danger" : "default"}
                dot
                className="mt-0.5"
              >
                {passed ? "Passed" : failed ? "Failed" : "—"}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
