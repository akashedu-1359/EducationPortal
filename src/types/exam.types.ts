export type ExamStatus = "Draft" | "Active" | "Completed";
export type AttemptStatus = "InProgress" | "Completed" | "TimedOut";

export interface Question {
  id: string;
  examId: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  sortOrder: number;
  explanation?: string;
}

export interface QuestionAdmin extends Question {
  correctOptionIndex: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  status: ExamStatus;
  passingPercentage: number;
  durationMinutes: number;
  maxAttempts: number;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  questionCount: number;
  createdAt: string;
}

export interface StartAttemptResponse {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  questions: Question[];
}

export interface AnswerSubmission {
  questionId: string;
  selectedOptionIndex: number | null;
}

export interface ExamSubmitRequest {
  attemptId: string;
  answers: AnswerSubmission[];
}

export interface ExamSubmitResponse {
  score: number;
  isPassed: boolean;
  passingPercentage: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface QuestionResultDto {
  questionId: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation?: string;
}

export interface AttemptResultDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  isPassed: boolean;
  passingPercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  completedAt?: string;
  certificateId?: string;
  questionResults: QuestionResultDto[];
}

export interface UserExamDetailDto {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingPercentage: number;
  maxAttempts: number;
  status: ExamStatus;
  questionCount: number;
  userAttemptCount: number;
  createdAt: string;
}

export interface UserAttemptDto {
  id: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  completedAt?: string;
  status: AttemptStatus;
  score?: number;
  isPassed?: boolean;
}

// Admin attempt type with nested exam info (used by admin pages)
export interface ExamAttempt {
  id: string;
  examId: string;
  exam: Exam;
  userId: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  score?: number;
  isPassed?: boolean;
}

// Alias kept for backward compatibility
export type ExamDelivery = StartAttemptResponse;

export interface CreateExamRequest {
  title: string;
  description: string;
  passingPercentage: number;
  durationMinutes: number;
  maxAttempts: number;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
}

export interface CreateQuestionRequest {
  examId: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOptionIndex: number;
  explanation?: string;
  sortOrder?: number;
}
