import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../login/page";

const mockPush = vi.fn();
const mockLogin = vi.fn();
let mockIsLoading = false;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/auth/login",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: Object.assign(
    (selector?: (state: Record<string, unknown>) => unknown) => {
      const state = {
        login: mockLogin,
        isLoading: mockIsLoading,
        user: null,
        isAuthenticated: false,
      };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({
        user: { id: "1", role: "User", fullName: "Test" },
        isAuthenticated: true,
      }),
    }
  ),
  isAdmin: (user: { role: string } | null) =>
    !!user && ["SuperAdmin", "Admin", "ContentManager", "ExamManager", "Analyst"].includes(user.role),
}));

vi.mock("@/lib/api", () => ({
  getApiErrorMessage: (err: Error) => err.message || "An error occurred",
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function getForm() {
  return document.querySelector("form")!;
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockLogin.mockReset();
    mockIsLoading = false;
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue learning")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "not-an-email");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("calls login on valid form submission", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "mypassword");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "mypassword");
    });
  });

  it("displays error message on login failure", async () => {
    const toast = (await import("react-hot-toast")).default;
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrongpassword");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("has link to registration page", () => {
    render(<LoginPage />);
    const link = screen.getByText("Create one free");
    expect(link.closest("a")).toHaveAttribute("href", "/auth/register");
  });

  it("has link to forgot password", () => {
    render(<LoginPage />);
    const link = screen.getByText("Forgot password?");
    expect(link.closest("a")).toHaveAttribute("href", "/auth/forgot-password");
  });

  it("has Google sign-in button", () => {
    render(<LoginPage />);
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByLabelText(/show password/i);
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
