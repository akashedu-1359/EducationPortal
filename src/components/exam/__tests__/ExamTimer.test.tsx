import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamTimer } from "../ExamTimer";

describe("ExamTimer", () => {
  it("shows formatted time in MM:SS", () => {
    render(<ExamTimer timeRemainingSeconds={754} isExpired={false} />);
    expect(screen.getByText("12:34")).toBeInTheDocument();
  });

  it("shows 00:00 when expired", () => {
    render(<ExamTimer timeRemainingSeconds={0} isExpired={true} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("applies default styling for time > 5 minutes", () => {
    const { container } = render(
      <ExamTimer timeRemainingSeconds={600} isExpired={false} />
    );
    const timer = container.firstElementChild as HTMLElement;
    expect(timer.className).toContain("bg-primary-50");
    expect(timer.className).not.toContain("bg-amber");
    expect(timer.className).not.toContain("bg-red");
  });

  it("applies warning styling when < 5 minutes and > 1 minute", () => {
    const { container } = render(
      <ExamTimer timeRemainingSeconds={180} isExpired={false} />
    );
    const timer = container.firstElementChild as HTMLElement;
    expect(timer.className).toContain("bg-amber-100");
  });

  it("applies danger styling when < 1 minute", () => {
    const { container } = render(
      <ExamTimer timeRemainingSeconds={45} isExpired={false} />
    );
    const timer = container.firstElementChild as HTMLElement;
    expect(timer.className).toContain("bg-red-100");
  });

  it("applies danger styling when expired", () => {
    const { container } = render(
      <ExamTimer timeRemainingSeconds={0} isExpired={true} />
    );
    const timer = container.firstElementChild as HTMLElement;
    expect(timer.className).toContain("bg-red-100");
  });

  it("has timer role for accessibility", () => {
    render(<ExamTimer timeRemainingSeconds={300} isExpired={false} />);
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });
});
