import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimer } from "@/lib/utils";

export interface ExamTimerProps {
  timeRemainingSeconds: number;
  isExpired: boolean;
}

export function ExamTimer({ timeRemainingSeconds, isExpired }: ExamTimerProps) {
  const isWarning = timeRemainingSeconds <= 300 && timeRemainingSeconds > 60;
  const isDanger = timeRemainingSeconds <= 60 || isExpired;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2 text-lg font-mono font-bold",
        isDanger
          ? "bg-red-100 text-red-700"
          : isWarning
          ? "bg-amber-100 text-amber-700"
          : "bg-primary-50 text-primary-700"
      )}
      role="timer"
      aria-label={`Time remaining: ${formatTimer(timeRemainingSeconds)}`}
    >
      <Clock className="h-5 w-5" />
      <span>{formatTimer(timeRemainingSeconds)}</span>
      {(isDanger || isWarning) && (
        <AlertTriangle className="h-4 w-4 animate-pulse" />
      )}
    </div>
  );
}
