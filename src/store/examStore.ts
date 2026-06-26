import { create } from "zustand";
import type { StartAttemptResponse, AnswerSubmission } from "@/types";

interface ExamState {
  delivery: StartAttemptResponse | null;
  answers: Record<string, number | null>; // questionId → selectedOptionIndex
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  isSubmitting: boolean;
  isExpired: boolean;

  startExam: (delivery: StartAttemptResponse) => void;
  selectOption: (questionId: string, optionIndex: number) => void;
  setCurrentQuestion: (index: number) => void;
  tickTimer: () => void;
  markExpired: () => void;
  setSubmitting: (v: boolean) => void;
  clearExam: () => void;

  getAnswers: () => AnswerSubmission[];
  isAnswered: (questionId: string) => boolean;
  answeredCount: () => number;
}

export const useExamStore = create<ExamState>((set, get) => ({
  delivery: null,
  answers: {},
  currentQuestionIndex: 0,
  timeRemainingSeconds: 0,
  isSubmitting: false,
  isExpired: false,

  startExam: (delivery) => {
    const now = new Date().getTime();
    const expires = new Date(delivery.expiresAt).getTime();
    const remaining = Math.max(0, Math.floor((expires - now) / 1000));
    set({
      delivery,
      answers: {},
      currentQuestionIndex: 0,
      timeRemainingSeconds: remaining,
      isSubmitting: false,
      isExpired: false,
    });
  },

  selectOption: (questionId, optionIndex) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: optionIndex },
    })),

  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

  tickTimer: () =>
    set((state) => {
      const remaining = state.timeRemainingSeconds - 1;
      if (remaining <= 0) return { timeRemainingSeconds: 0, isExpired: true };
      return { timeRemainingSeconds: remaining };
    }),

  markExpired: () => set({ isExpired: true }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  clearExam: () =>
    set({
      delivery: null,
      answers: {},
      currentQuestionIndex: 0,
      timeRemainingSeconds: 0,
      isSubmitting: false,
      isExpired: false,
    }),

  getAnswers: (): AnswerSubmission[] =>
    Object.entries(get().answers).map(([questionId, selectedOptionIndex]) => ({
      questionId,
      selectedOptionIndex,
    })),

  isAnswered: (questionId: string) => get().answers[questionId] != null,

  answeredCount: () =>
    Object.values(get().answers).filter((v) => v != null).length,
}));
