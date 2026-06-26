import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExamCard } from "../ExamCard";
import type { Exam } from "@/types";

const mockExam: Exam = {
  id: "exam-1",
  title: "JavaScript Fundamentals",
  description: "Test your knowledge of core JavaScript concepts including closures, prototypes, and async patterns.",
  status: "Active",
  passingPercentage: 70,
  durationMinutes: 30,
  maxAttempts: 3,
  questionCount: 10,
  createdAt: "2024-03-01T00:00:00Z",
};

describe("ExamCard", () => {
  it("renders exam title", () => {
    render(<ExamCard exam={mockExam} />);
    expect(screen.getByText("JavaScript Fundamentals")).toBeInTheDocument();
  });

  it("renders truncated description", () => {
    render(<ExamCard exam={mockExam} />);
    expect(screen.getByText(/Test your knowledge/)).toBeInTheDocument();
  });

  it("renders duration badge", () => {
    render(<ExamCard exam={mockExam} />);
    expect(screen.getByText("30m")).toBeInTheDocument();
  });

  it("renders question count badge", () => {
    render(<ExamCard exam={mockExam} />);
    expect(screen.getByText("10 Qs")).toBeInTheDocument();
  });

  it("renders passing percentage badge", () => {
    render(<ExamCard exam={mockExam} />);
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("shows View Details link by default", () => {
    render(<ExamCard exam={mockExam} />);
    expect(screen.getByText(/View Details/)).toBeInTheDocument();
  });

  it("shows Start Exam button when showActions is true and onStart provided", () => {
    const onStart = vi.fn();
    render(<ExamCard exam={mockExam} showActions onStart={onStart} />);
    expect(screen.getByRole("button", { name: /Start Exam/i })).toBeInTheDocument();
    expect(screen.queryByText(/View Details/)).not.toBeInTheDocument();
  });

  it("calls onStart when start button is clicked", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<ExamCard exam={mockExam} showActions onStart={onStart} />);

    await user.click(screen.getByRole("button", { name: /Start Exam/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
