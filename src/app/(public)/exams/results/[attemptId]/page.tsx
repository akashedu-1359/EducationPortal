import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Award, RotateCcw, Clock, Target } from "lucide-react";
import { config } from "@/config";
import { formatTimer } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ExamResult } from "@/types";

interface Props {
  params: { attemptId: string };
}

async function getResult(attemptId: string): Promise<ExamResult | null> {
  try {
    const res = await fetch(`${config.apiUrl}/api/exam-attempts/${attemptId}/result`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ExamResult;
  } catch {
    return null;
  }
}

export default async function ExamResultPage({ params }: Props) {
  const result = await getResult(params.attemptId);
  if (!result) notFound();

  const passed = result.passed;
  const scoreColor = passed ? "text-green-600" : "text-red-600";
  const scoreBg = passed ? "bg-green-50" : "bg-red-50";

  return (
    <div className="py-10">
      <div className="container-pad max-w-2xl">
        {/* Result card */}
        <div className={`rounded-2xl border p-8 text-center ${passed ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50"}`}>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-green-100" : "bg-red-100"}`}>
            {passed ? (
              <CheckCircle className="h-9 w-9 text-green-600" />
            ) : (
              <XCircle className="h-9 w-9 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {passed ? "Congratulations! You passed." : "Better luck next time."}
          </h1>
          <p className="mt-1 text-slate-500">{result.examTitle}</p>

          <div className={`mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 ${scoreBg}`}>
            <span className={`text-4xl font-bold ${scoreColor}`}>{result.percentage}%</span>
          </div>

          <div className="mt-2 text-sm text-slate-500">
            Passing score: {result.passingScore}%
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <Target className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-xl font-bold text-slate-900">
              {result.score} / {result.totalMarks}
            </p>
            <p className="text-xs text-slate-500">Score</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <Clock className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-xl font-bold text-slate-900">
              {formatTimer(result.timeTakenSeconds)}
            </p>
            <p className="text-xs text-slate-500">Time taken</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
            <Award className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
            <p className="text-xl font-bold text-slate-900">
              {passed ? "Passed" : "Failed"}
            </p>
            <p className="text-xs text-slate-500">Result</p>
          </div>
        </div>

        {/* Certificate */}
        {passed && result.certificateId && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Certificate Earned!</p>
                <p className="text-sm text-green-600">Download your certificate of completion</p>
              </div>
            </div>
            <Link
              href={`/dashboard/certificates/${result.certificateId}`}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Download
            </Link>
          </div>
        )}

        {/* Per-question breakdown */}
        {result.questionResults && result.questionResults.length > 0 && (
          <div className="mt-6">
            <h2 className="section-title mb-4">Answer Review</h2>
            <div className="space-y-3">
              {result.questionResults.map((qr, i) => (
                <div
                  key={qr.questionId}
                  className={`rounded-xl border p-4 ${qr.isCorrect ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">
                      {i + 1}. {qr.questionText}
                    </p>
                    <Badge variant={qr.isCorrect ? "success" : "danger"}>
                      {qr.isCorrect ? `+${qr.marksAwarded}` : "0"}
                    </Badge>
                  </div>
                  {qr.explanation && (
                    <p className="mt-2 text-xs text-slate-500 italic">{qr.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <Link
            href="/exams"
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
