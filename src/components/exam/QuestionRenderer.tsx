import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuestionRendererProps {
  question: {
    questionText: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  selectedOptionIndex: number | null;
  correctOptionIndex?: number;
  onSelect?: (index: number) => void;
  questionNumber: number;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  selectedOptionIndex,
  correctOptionIndex,
  onSelect,
  questionNumber,
  disabled = false,
}: QuestionRendererProps) {
  const options = [
    { index: 0, text: question.option1 },
    { index: 1, text: question.option2 },
    { index: 2, text: question.option3 },
    { index: 3, text: question.option4 },
  ];

  const isReviewMode = correctOptionIndex !== undefined;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Question {questionNumber}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900 leading-snug">
        {question.questionText}
      </p>

      <div className="mt-4 space-y-2">
        {options.map((option) => {
          const isSelected = selectedOptionIndex === option.index;
          const isCorrect = correctOptionIndex === option.index;
          const isWrong = isSelected && isReviewMode && !isCorrect;

          let optionClasses: string;
          if (isReviewMode) {
            if (isCorrect) {
              optionClasses = "border-green-300 bg-green-50 text-green-800";
            } else if (isWrong) {
              optionClasses = "border-red-300 bg-red-50 text-red-800 line-through";
            } else {
              optionClasses = "border-slate-200 text-slate-500";
            }
          } else if (isSelected) {
            optionClasses = "border-primary-500 bg-primary-50 text-primary-900";
          } else {
            optionClasses = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
          }

          const interactive = !disabled && !isReviewMode && !!onSelect;

          return (
            <button
              key={option.index}
              type="button"
              disabled={disabled || isReviewMode}
              onClick={() => interactive && onSelect?.(option.index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition-all",
                optionClasses,
                interactive && "cursor-pointer",
                (disabled || isReviewMode) && "cursor-default"
              )}
              aria-pressed={isSelected}
              aria-label={`Option ${option.index + 1}: ${option.text}`}
            >
              {isReviewMode && isCorrect && (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              )}
              {isReviewMode && isWrong && (
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}
              {!isReviewMode && (
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected ? "border-primary-500 bg-primary-500" : "border-slate-300"
                  )}
                >
                  {isSelected && (
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
              )}
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
