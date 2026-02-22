import { create } from "zustand";
import type { ExamDelivery, AnswerSubmission } from "@/types";

interface ExamState {
  // Active attempt
  delivery: ExamDelivery | null;
  answers: Record<string, string[]>; // questionId → selectedOptionIds
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  isSubmitting: boolean;
  isExpired: boolean;

  // Actions
  startExam: (delivery: ExamDelivery) => void;
  selectOption: (questionId: string, optionId: string, multiSelect: boolean) => void;
  setCurrentQuestion: (index: number) => void;
  tickTimer: () => void;
  markExpired: () => void;
  setSubmitting: (v: boolean) => void;
  clearExam: () => void;

  // Derived
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

  startExam: (delivery) =>
    set({
      delivery,
      answers: {},
      currentQuestionIndex: 0,
      timeRemainingSeconds: delivery.timeRemainingSeconds,
      isSubmitting: false,
      isExpired: false,
    }),

  selectOption: (questionId, optionId, multiSelect) =>
    set((state) => {
      const current = state.answers[questionId] || [];
      let next: string[];

      if (multiSelect) {
        next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        next = [optionId]; // single choice — replace
      }

      return { answers: { ...state.answers, [questionId]: next } };
    }),

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
    Object.entries(get().answers).map(([questionId, selectedOptionIds]) => ({
      questionId,
      selectedOptionIds,
    })),

  isAnswered: (questionId: string) =>
    (get().answers[questionId]?.length || 0) > 0,

  answeredCount: () =>
    Object.values(get().answers).filter((ids) => ids.length > 0).length,
}));
