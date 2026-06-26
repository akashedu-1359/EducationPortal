import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, RotateCcw } from "lucide-react";
import { config } from "@/config";
import type { AttemptResultDto } from "@/types";
import { ExamResultSummary, QuestionRenderer } from "@/components/exam";

interface Props {
  params: { attemptId: string };
}

async function getResult(attemptId: string): Promise<AttemptResultDto | null> {
  try {
    const res = await fetch(`${config.apiUrl}/api/user/exams/attempts/${attemptId}/result`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as AttemptResultDto;
  } catch {
    return null;
  }
}

export default async function ExamResultPage({ params }: Props) {
  const result = await getResult(params.attemptId);
  if (!result) notFound();

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
              href="/dashboard/exams"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              My Exams
            </Link>
          </div>
        )}

        {result.questionResults && result.questionResults.length > 0 && (
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
