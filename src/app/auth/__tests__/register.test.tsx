import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../register/page";

const mockPush = vi.fn();
const mockRegister = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/auth/register",
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
        register: mockRegister,
        isLoading: false,
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
    !!user && ["SuperAdmin", "Admin"].includes(user.role),
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

async function fillRegistrationForm(user: ReturnType<typeof userEvent.setup>, overrides: Record<string, string> = {}) {
  const defaults = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Password1",
    confirmPassword: "Password1",
  };
  const data = { ...defaults, ...overrides };

  await user.type(screen.getByPlaceholderText("John"), data.firstName);
  await user.type(screen.getByPlaceholderText("Doe"), data.lastName);
  await user.type(screen.getByPlaceholderText("you@example.com"), data.email);
  await user.type(screen.getByPlaceholderText("Min. 8 characters"), data.password);
  await user.type(screen.getByPlaceholderText("Repeat your password"), data.confirmPassword);
}

describe("RegisterPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockRegister.mockReset();
  });

  it("renders the registration form", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repeat your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows validation error for empty first name", async () => {
    render(<RegisterPage />);

    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "not-valid");
    await user.type(screen.getByPlaceholderText("Min. 8 characters"), "Password1");
    await user.type(screen.getByPlaceholderText("Repeat your password"), "Password1");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for weak password", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText("Min. 8 characters"), "weak");
    await user.type(screen.getByPlaceholderText("Repeat your password"), "weak");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText("Min. 8 characters"), "Password1");
    await user.type(screen.getByPlaceholderText("Repeat your password"), "Password2");
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("calls register on valid form submission", async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillRegistrationForm(user);
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password1",
        confirmPassword: "Password1",
      });
    });
  });

  it("displays error toast on registration failure", async () => {
    const toast = (await import("react-hot-toast")).default;
    mockRegister.mockRejectedValueOnce(new Error("Email already exists"));
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillRegistrationForm(user);
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already exists");
    });
  });

  it("has link to login page", () => {
    render(<RegisterPage />);
    const link = screen.getByText("Sign in");
    expect(link.closest("a")).toHaveAttribute("href", "/auth/login");
  });

  it("has links to Terms and Privacy Policy", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Terms of Service").closest("a")).toHaveAttribute("href", "/terms");
    expect(screen.getByText("Privacy Policy").closest("a")).toHaveAttribute("href", "/privacy");
  });
});
