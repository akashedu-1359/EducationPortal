import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "../Navbar";
import { useAuthStore } from "@/store/authStore";

vi.mock("@/store/authStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/store/authStore")>();
  return {
    ...actual,
    useAuthStore: vi.fn(),
  };
});

vi.mock("@/lib/cms", () => ({
  cmsPublicApi: {
    getFeatureFlags: vi.fn().mockResolvedValue({ enable_exams: true, show_blog_section: true }),
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockLogout = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function mockUseAuthStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useAuthStore).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: mockLogout,
    login: vi.fn(),
    register: vi.fn(),
    loginWithGoogle: vi.fn(),
    hydrate: vi.fn(),
    updateUser: vi.fn(),
    clearAuth: vi.fn(),
    setLoading: vi.fn(),
    ...overrides,
  } as never);
}

describe("Navbar", () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  describe("when logged out", () => {
    beforeEach(() => {
      mockUseAuthStore({ isAuthenticated: false, user: null });
    });

    it("renders the logo", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.getByText("EduPortal")).toBeInTheDocument();
    });

    it("shows Sign In and Get Started buttons", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("does not show navigation links", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.queryByText("Courses")).not.toBeInTheDocument();
      expect(screen.queryByText("Exams")).not.toBeInTheDocument();
    });

    it("links Sign In to /auth/login", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      const signInLinks = screen.getAllByText("Sign In");
      const desktopLink = signInLinks[0].closest("a");
      expect(desktopLink).toHaveAttribute("href", "/auth/login");
    });

    it("links Get Started to /auth/register", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      const getStartedLinks = screen.getAllByText("Get Started");
      const desktopLink = getStartedLinks[0].closest("a");
      expect(desktopLink).toHaveAttribute("href", "/auth/register");
    });
  });

  describe("when logged in", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      role: "User" as const,
      isActive: true,
      emailVerified: true,
      createdAt: "2024-01-01",
    };

    beforeEach(() => {
      mockUseAuthStore({ isAuthenticated: true, user: mockUser });
    });

    it("shows navigation links", async () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.getByText("Courses")).toBeInTheDocument();
      expect(screen.getByText("PDFs")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
    });

    it("shows user first name", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("shows user initials", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("does not show Sign In / Get Started buttons", () => {
      render(<Navbar />, { wrapper: createWrapper() });
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Get Started")).not.toBeInTheDocument();
    });
  });

  describe("mobile menu toggle", () => {
    it("toggles mobile menu on hamburger click", async () => {
      const user = userEvent.setup();
      mockUseAuthStore({ isAuthenticated: false, user: null });
      render(<Navbar />, { wrapper: createWrapper() });

      const toggleBtn = screen.getByLabelText("Toggle menu");
      await user.click(toggleBtn);

      const signInButtons = screen.getAllByText("Sign In");
      expect(signInButtons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
