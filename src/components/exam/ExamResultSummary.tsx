import { CheckCircle, XCircle, Award, Target } from "lucide-react";

export interface ExamResultSummaryProps {
  score: number;
  isPassed: boolean;
  passingPercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  examTitle: string;
}

export function ExamResultSummary({
  score,
  isPassed,
  passingPercentage,
  totalQuestions,
  correctAnswers,
  examTitle,
}: ExamResultSummaryProps) {
  const scoreColor = isPassed ? "text-green-600" : "text-red-600";
  const scoreBg = isPassed ? "bg-green-50" : "bg-red-50";

  return (
    <div>
      <div
        className={`rounded-2xl border p-8 text-center ${
          isPassed ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50"
        }`}
      >
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isPassed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isPassed ? (
            <CheckCircle className="h-9 w-9 text-green-600" />
          ) : (
            <XCircle className="h-9 w-9 text-red-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {isPassed ? "Congratulations! You passed." : "Better luck next time."}
        </h1>
        <p className="mt-1 text-slate-500">{examTitle}</p>

        <div
          className={`mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 ${scoreBg}`}
        >
          <span className={`text-4xl font-bold ${scoreColor}`}>{score}%</span>
        </div>

        <div className="mt-2 text-sm text-slate-500">
          Passing score: {passingPercentage}%
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
          <Target className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
          <p className="text-xl font-bold text-slate-900">
            {correctAnswers} / {totalQuestions}
          </p>
          <p className="text-xs text-slate-500">Correct Answers</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
          <Award className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
          <p className="text-xl font-bold text-slate-900">
            {isPassed ? "Passed" : "Failed"}
          </p>
          <p className="text-xs text-slate-500">Result</p>
        </div>
      </div>
    </div>
  );
}
