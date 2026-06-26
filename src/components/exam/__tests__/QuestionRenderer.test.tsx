import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionRenderer } from "../QuestionRenderer";

const mockQuestion = {
  questionText: "What is TypeScript?",
  option1: "A superset of JavaScript",
  option2: "A database language",
  option3: "A CSS framework",
  option4: "An operating system",
};

describe("QuestionRenderer", () => {
  it("renders question text", () => {
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={null}
        questionNumber={1}
      />
    );
    expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
  });

  it("renders all 4 options", () => {
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={null}
        questionNumber={1}
      />
    );
    expect(screen.getByText("A superset of JavaScript")).toBeInTheDocument();
    expect(screen.getByText("A database language")).toBeInTheDocument();
    expect(screen.getByText("A CSS framework")).toBeInTheDocument();
    expect(screen.getByText("An operating system")).toBeInTheDocument();
  });

  it("renders question number", () => {
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={null}
        questionNumber={5}
      />
    );
    expect(screen.getByText("Question 5")).toBeInTheDocument();
  });

  it("highlights selected option", () => {
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={0}
        questionNumber={1}
      />
    );
    const option = screen.getByLabelText(/Option 1/);
    expect(option).toHaveAttribute("aria-pressed", "true");
  });

  it("shows correct/incorrect highlighting in review mode", () => {
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={1}
        correctOptionIndex={0}
        questionNumber={1}
      />
    );
    const correctOption = screen.getByLabelText(/Option 1/);
    expect(correctOption.className).toContain("green");

    const wrongOption = screen.getByLabelText(/Option 2/);
    expect(wrongOption.className).toContain("red");
  });

  it("calls onSelect when option is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={null}
        onSelect={onSelect}
        questionNumber={1}
      />
    );

    await user.click(screen.getByText("A CSS framework"));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("does not call onSelect when disabled", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={null}
        onSelect={onSelect}
        questionNumber={1}
        disabled
      />
    );

    await user.click(screen.getByText("A CSS framework"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("options are non-interactive in review mode", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuestionRenderer
        question={mockQuestion}
        selectedOptionIndex={0}
        correctOptionIndex={0}
        onSelect={onSelect}
        questionNumber={1}
      />
    );

    await user.click(screen.getByText("A database language"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
