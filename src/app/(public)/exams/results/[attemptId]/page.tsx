"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award, RotateCcw, AlertCircle } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { useRequireAuth } from "@/hooks/useAuth";
import { FullPageSpinner } from "@/components/ui/spinner";
import { ExamResultSummary, QuestionRenderer } from "@/components/exam";

export default function ExamResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth(
    `/auth/login?next=/exams/results/${attemptId}`
  );

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ["exam-result", attemptId],
    queryFn: () => examsApi.getResult(attemptId),
    enabled: isAuthenticated && Boolean(attemptId),
    retry: false,
  });

  if (authLoading || !isAuthenticated || isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !result) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-lg font-medium text-slate-900">Could not load exam results</p>
        <p className="mt-1 text-sm text-slate-500">
          The result may not be available yet, or you may not have access.
        </p>
        <Link
          href="/dashboard/exams/attempts"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View my attempts
        </Link>
      </div>
    );
  }

  const passed = result.isPassed;

  return (
    <div className="py-10">
      <div className="container-pad max-w-2xl">
        <ExamResultSummary
          score={result.score}
          isPassed={passed}
          passingPercentage={result.passingPercentage}
          totalQuestions={result.totalQuestions}
          correctAnswers={result.correctAnswers}
          examTitle={result.examTitle}
        />

        {passed && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Congratulations!</p>
                <p className="text-sm text-green-600">You have passed this exam</p>
              </div>
            </div>
            <Link
              href="/dashboard/exams/attempts"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              My Attempts
            </Link>
          </div>
        )}

        {result.questionResults.length > 0 && (
          <div className="mt-6">
            <h2 className="section-title mb-4">Answer Review</h2>
            <div className="space-y-3">
              {result.questionResults.map((qr, i) => (
                <QuestionRenderer
                  key={qr.questionId}
                  question={qr}
                  selectedOptionIndex={qr.selectedOptionIndex}
                  correctOptionIndex={qr.correctOptionIndex}
                  questionNumber={i + 1}
                  disabled
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard/exams"
            className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="mr-2 inline h-4 w-4" />
            Browse Exams
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 rounded-xl bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
