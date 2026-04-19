export type QuestionType = "SingleChoice" | "MultipleChoice" | "TrueFalse";
export type ExamStatus = "Draft" | "Published" | "Archived";
export type AttemptStatus = "InProgress" | "Submitted" | "Graded" | "Expired";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface QuestionOption {
  id: string;
  text: string;
  order: number;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  options: QuestionOption[];
  explanation?: string; // only shown after attempt
  order: number;
}

// Question with correct answers exposed (admin only)
export interface QuestionAdmin extends Question {
  correctOptionIds: string[];
}

export interface Exam {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  status: ExamStatus;
  resourceId?: string; // linked resource, if any
  passingScore: number; // percentage (0-100)
  totalMarks: number;
  durationMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultImmediately: boolean;
  issueCertificate: boolean;
  questionCount: number;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  exam: Exam;
  userId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  expiresAt: string;
  score?: number;
  percentage?: number;
  passed?: boolean;
  timeTakenSeconds?: number;
  attemptNumber: number;
}

// Delivered to student during active exam (no correct answers)
export interface ExamDelivery {
  attemptId: string;
  exam: Exam;
  questions: Question[];
  expiresAt: string;
  timeRemainingSeconds: number;
}

export interface AnswerSubmission {
  questionId: string;
  selectedOptionIds: string[];
}

export interface ExamSubmitRequest {
  attemptId: string;
  answers: AnswerSubmission[];
}

export interface ExamResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  timeTakenSeconds: number;
  submittedAt: string;
  certificateId?: string;
  questionResults?: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: string;
}

export interface CreateExamRequest {
  title: string;
  description: string;
  resourceId?: string;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResultImmediately?: boolean;
  issueCertificate?: boolean;
}

export interface CreateQuestionRequest {
  examId: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
}
