import Link from "next/link";
import { Clock, FileText, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, truncate } from "@/lib/utils";
import type { Exam } from "@/types";

export interface ExamCardProps {
  exam: Exam;
  showActions?: boolean;
  onStart?: () => void;
}

export function ExamCard({ exam, showActions = false, onStart }: ExamCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-900 leading-snug">
        {exam.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate-500 leading-relaxed line-clamp-2">
        {truncate(exam.description, 120)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="default">
          <Clock className="mr-1 h-3 w-3" />
          {formatDuration(exam.durationMinutes)}
        </Badge>
        <Badge variant="default">
          <FileText className="mr-1 h-3 w-3" />
          {exam.questionCount} Qs
        </Badge>
        <Badge variant="default">
          <Target className="mr-1 h-3 w-3" />
          {exam.passingPercentage}%
        </Badge>
      </div>

      {showActions && onStart ? (
        <Button
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={onStart}
        >
          Start Exam
        </Button>
      ) : (
        <Link
          href={`/exams/${exam.id}`}
          className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View Details &rarr;
        </Link>
      )}
    </div>
  );
}
