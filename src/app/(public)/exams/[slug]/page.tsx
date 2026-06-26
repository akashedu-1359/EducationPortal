"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  FileText,
  Target,
  RotateCcw,
  PlayCircle,
  LogIn,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatDate } from "@/lib/utils";
import type { AttemptStatus } from "@/types";

const STATUS_CONFIG: Record<AttemptStatus, { label: string; variant: "info" | "success" | "warning" }> = {
  InProgress: { label: "In Progress", variant: "info" },
  Completed: { label: "Completed", variant: "success" },
  TimedOut: { label: "Timed Out", variant: "warning" },
};

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const [isStarting, setIsStarting] = useState(false);

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["exam-detail", examId],
    queryFn: () => examsApi.getDetail(examId),
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["my-attempts", examId],
    queryFn: () => examsApi.getMyAttempts({ examId }),
    enabled: isAuthenticated,
  });

  const userAttempts = attempts?.items ?? [];
  const attemptCount = exam?.userAttemptCount ?? userAttempts.length;
  const maxReached = exam ? attemptCount >= exam.maxAttempts : false;

  const handleStartExam = async () => {
    if (!exam) return;
    setIsStarting(true);
    try {
      await examsApi.startAttempt(exam.id);
      router.push(`/exams/${exam.id}/attempt`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setIsStarting(false);
    }
  };

  if (examLoading) {
    return (
      <div className="py-10">
        <div className="container-pad max-w-3xl">
          <Skeleton className="mb-3 h-8 w-2/3" />
          <Skeleton className="mb-6 h-5 w-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-lg font-medium text-slate-900">Exam not found</p>
        <Link href="/exams" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
          Browse exams &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-pad max-w-3xl">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="page-title">{exam.title}</h1>
          <p className="page-subtitle mt-2">{exam.description}</p>
        </div>

        {/* Info cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <Clock className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-lg font-bold text-slate-900">
              {formatDuration(exam.durationMinutes)}
            </p>
            <p className="text-xs text-slate-500">Duration</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <FileText className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-lg font-bold text-slate-900">{exam.questionCount}</p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <Target className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-lg font-bold text-slate-900">{exam.passingPercentage}%</p>
            <p className="text-xs text-slate-500">Passing Score</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <RotateCcw className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-lg font-bold text-slate-900">
              {exam.maxAttempts - attemptCount} / {exam.maxAttempts}
            </p>
            <p className="text-xs text-slate-500">Attempts Left</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mb-8">
          {!isAuthenticated ? (
            <Link href={`/auth/login?next=/exams/${examId}`}>
              <Button variant="primary" size="lg" leftIcon={<LogIn className="h-5 w-5" />}>
                Login to Take This Exam
              </Button>
            </Link>
          ) : maxReached ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="font-medium text-amber-800">
                Maximum attempts reached
              </p>
              <p className="mt-1 text-sm text-amber-600">
                You have used all {exam.maxAttempts} allowed attempts for this exam.
              </p>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<PlayCircle className="h-5 w-5" />}
              isLoading={isStarting}
              onClick={handleStartExam}
            >
              Start Exam
            </Button>
          )}
        </div>

        {/* Past attempts */}
        {isAuthenticated && (
          <div>
            <h2 className="section-title mb-4">Your Attempts</h2>
            {attemptsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : userAttempts.length === 0 ? (
              <p className="text-sm text-slate-500">
                You haven&apos;t attempted this exam yet.
              </p>
            ) : (
              <div className="space-y-3">
                {userAttempts.map((attempt) => {
                  const cfg = STATUS_CONFIG[attempt.status];
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card"
                    >
                      <div className="flex items-center gap-4">
                        {attempt.isPassed === true ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : attempt.isPassed === false ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                            {attempt.score != null && (
                              <span className="text-sm font-semibold text-slate-900">
                                {attempt.score}%
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatDate(attempt.startedAt)}
                          </p>
                        </div>
                      </div>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
