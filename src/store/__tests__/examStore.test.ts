import { describe, it, expect, beforeEach } from "vitest";
import { useExamStore } from "../examStore";
import type { StartAttemptResponse } from "@/types";

const futureDate = new Date(Date.now() + 1800 * 1000).toISOString();

const mockDelivery: StartAttemptResponse = {
  attemptId: "attempt-1",
  startedAt: new Date().toISOString(),
  expiresAt: futureDate,
  questions: [
    {
      id: "q1",
      examId: "exam-1",
      questionText: "What is 1+1?",
      option1: "1",
      option2: "2",
      option3: "3",
      option4: "4",
      sortOrder: 1,
    },
    {
      id: "q2",
      examId: "exam-1",
      questionText: "Select the prime number",
      option1: "2",
      option2: "4",
      option3: "6",
      option4: "8",
      sortOrder: 2,
    },
    {
      id: "q3",
      examId: "exam-1",
      questionText: "Is Earth round?",
      option1: "True",
      option2: "False",
      option3: "Maybe",
      option4: "Unknown",
      sortOrder: 3,
    },
  ],
};

describe("examStore", () => {
  beforeEach(() => {
    useExamStore.getState().clearExam();
  });

  describe("startExam", () => {
    it("initializes exam state from delivery", () => {
      useExamStore.getState().startExam(mockDelivery);

      const state = useExamStore.getState();
      expect(state.delivery).toEqual(mockDelivery);
      expect(state.answers).toEqual({});
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.timeRemainingSeconds).toBeGreaterThan(0);
      expect(state.isSubmitting).toBe(false);
      expect(state.isExpired).toBe(false);
    });
  });

  describe("selectOption", () => {
    beforeEach(() => {
      useExamStore.getState().startExam(mockDelivery);
    });

    it("selects an option by index", () => {
      useExamStore.getState().selectOption("q1", 1);
      expect(useExamStore.getState().answers["q1"]).toBe(1);
    });

    it("replaces previous selection", () => {
      useExamStore.getState().selectOption("q1", 0);
      useExamStore.getState().selectOption("q1", 1);
      expect(useExamStore.getState().answers["q1"]).toBe(1);
    });
  });

  describe("setCurrentQuestion", () => {
    it("updates current question index", () => {
      useExamStore.getState().startExam(mockDelivery);
      useExamStore.getState().setCurrentQuestion(2);
      expect(useExamStore.getState().currentQuestionIndex).toBe(2);
    });
  });

  describe("tickTimer", () => {
    it("decrements time by 1 second", () => {
      useExamStore.getState().startExam(mockDelivery);
      const before = useExamStore.getState().timeRemainingSeconds;
      useExamStore.getState().tickTimer();
      expect(useExamStore.getState().timeRemainingSeconds).toBe(before - 1);
    });

    it("marks expired when timer reaches zero", () => {
      useExamStore.setState({ timeRemainingSeconds: 1, isExpired: false });
      useExamStore.getState().tickTimer();

      const state = useExamStore.getState();
      expect(state.timeRemainingSeconds).toBe(0);
      expect(state.isExpired).toBe(true);
    });
  });

  describe("markExpired", () => {
    it("sets isExpired to true", () => {
      useExamStore.getState().markExpired();
      expect(useExamStore.getState().isExpired).toBe(true);
    });
  });

  describe("setSubmitting", () => {
    it("toggles submitting state", () => {
      useExamStore.getState().setSubmitting(true);
      expect(useExamStore.getState().isSubmitting).toBe(true);

      useExamStore.getState().setSubmitting(false);
      expect(useExamStore.getState().isSubmitting).toBe(false);
    });
  });

  describe("clearExam", () => {
    it("resets all exam state", () => {
      useExamStore.getState().startExam(mockDelivery);
      useExamStore.getState().selectOption("q1", 1);
      useExamStore.getState().clearExam();

      const state = useExamStore.getState();
      expect(state.delivery).toBeNull();
      expect(state.answers).toEqual({});
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.timeRemainingSeconds).toBe(0);
    });
  });

  describe("getAnswers", () => {
    it("converts answers map to AnswerSubmission array", () => {
      useExamStore.getState().startExam(mockDelivery);
      useExamStore.getState().selectOption("q1", 1);
      useExamStore.getState().selectOption("q2", 0);

      const answers = useExamStore.getState().getAnswers();
      expect(answers).toEqual(
        expect.arrayContaining([
          { questionId: "q1", selectedOptionIndex: 1 },
          { questionId: "q2", selectedOptionIndex: 0 },
        ])
      );
      expect(answers).toHaveLength(2);
    });
  });

  describe("isAnswered", () => {
    it("returns true for answered questions", () => {
      useExamStore.getState().startExam(mockDelivery);
      useExamStore.getState().selectOption("q1", 1);

      expect(useExamStore.getState().isAnswered("q1")).toBe(true);
      expect(useExamStore.getState().isAnswered("q2")).toBe(false);
    });
  });

  describe("answeredCount", () => {
    it("returns number of answered questions", () => {
      useExamStore.getState().startExam(mockDelivery);
      expect(useExamStore.getState().answeredCount()).toBe(0);

      useExamStore.getState().selectOption("q1", 1);
      useExamStore.getState().selectOption("q3", 0);
      expect(useExamStore.getState().answeredCount()).toBe(2);
    });
  });
});
