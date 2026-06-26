"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, ChevronLeft, ChevronRight, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useExamStore } from "@/store/examStore";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/ui/spinner";
import { ExamTimer } from "@/components/exam";
import { cn } from "@/lib/utils";

export default function ExamAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const {
    delivery,
    answers,
    currentQuestionIndex,
    timeRemainingSeconds,
    isSubmitting,
    isExpired,
    startExam,
    selectOption,
    setCurrentQuestion,
    tickTimer,
    setSubmitting,
    clearExam,
    getAnswers,
    isAnswered,
    answeredCount,
  } = useExamStore();

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    examsApi.getDetail(slug).then((detail) => {
      examsApi.startAttempt(detail.id).then(startExam).catch((err) => {
        toast.error(getApiErrorMessage(err));
        router.push(`/exams/${slug}`);
      });
    });
    return () => clearExam();
  }, [slug]);

  useEffect(() => {
    if (!delivery) return;
    timerRef.current = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(timerRef.current);
  }, [!!delivery]);

  const submitExam = useCallback(async (auto = false) => {
    if (!delivery || isSubmitting || autoSubmitRef.current) return;
    if (auto) autoSubmitRef.current = true;

    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      await examsApi.submitExam({
        attemptId: delivery.attemptId,
        answers: getAnswers(),
      });
      toast.success(auto ? "Time's up! Exam submitted." : "Exam submitted!");
      router.push(`/exams/results/${delivery.attemptId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setSubmitting(false);
    }
  }, [delivery, isSubmitting, getAnswers]);

  useEffect(() => {
    if (isExpired && !autoSubmitRef.current) {
      submitExam(true);
    }
  }, [isExpired]);

  if (!delivery) return <FullPageSpinner />;

  const { questions } = delivery;
  const currentQ = questions[currentQuestionIndex];
  const selectedIndex = answers[currentQ.id];
  const timeWarning = timeRemainingSeconds <= 300;

  const options = [
    { index: 0, text: currentQ.option1 },
    { index: 1, text: currentQ.option2 },
    { index: 2, text: currentQ.option3 },
    { index: 3, text: currentQ.option4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={cn(
        "sticky top-0 z-30 flex items-center justify-between border-b px-6 py-3",
        timeWarning ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
      )}>
        <div>
          <p className="font-semibold text-slate-900">Exam</p>
          <p className="text-xs text-slate-500">
            {answeredCount()} of {questions.length} answered
          </p>
        </div>

        <div className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-lg font-mono font-bold",
          timeWarning
            ? "bg-red-100 text-red-700"
            : "bg-primary-50 text-primary-700"
        )}>
          <ExamTimer timeRemainingSeconds={timeRemainingSeconds} isExpired={isExpired} />
        </div>

        <Button
          variant="primary"
          leftIcon={<Send className="h-4 w-4" />}
          isLoading={isSubmitting}
          onClick={() => submitExam(false)}
        >
          Submit Exam
        </Button>
      </div>

      <div className="container-pad py-8">
        <div className="flex gap-6">
          <div className="hidden w-52 shrink-0 lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Questions
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(i)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                    i === currentQuestionIndex
                      ? "bg-primary-600 text-white"
                      : isAnswered(q.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-primary-300"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary-600" />
                Current
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-100 border border-green-300" />
                Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-white border border-slate-200" />
                Unanswered
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400">Single choice</span>
              </div>

              <p className="mt-3 text-lg font-semibold text-slate-900 leading-snug">
                {currentQ.questionText}
              </p>

              <div className="mt-5 space-y-3">
                {options.map((option) => {
                  const selected = selectedIndex === option.index;
                  return (
                    <button
                      key={option.index}
                      type="button"
                      onClick={() => selectOption(currentQ.id, option.index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-sm transition-all",
                        selected
                          ? "border-primary-500 bg-primary-50 text-primary-900"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        selected ? "border-primary-500 bg-primary-500" : "border-slate-300"
                      )}>
                        {selected && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                      </div>
                      {option.text}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestion(currentQuestionIndex - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestion(currentQuestionIndex + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
