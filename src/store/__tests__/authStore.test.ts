import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore, isAdmin, isSuperAdmin } from "../authStore";
import type { User } from "@/types";

vi.mock("@/lib/api", () => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    googleCallback: vi.fn(),
  },
}));

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  role: "User",
  isActive: true,
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe("initial state", () => {
    it("starts with null user and unauthenticated", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("login", () => {
    it("sets user and isAuthenticated on successful login", async () => {
      const { authApi } = await import("@/lib/auth");
      vi.mocked(authApi.login).mockResolvedValueOnce({
        user: mockUser,
        accessToken: "token-123",
        expiresIn: 3600,
      });

      await useAuthStore.getState().login("test@example.com", "password");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("resets isLoading on failed login", async () => {
      const { authApi } = await import("@/lib/auth");
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error("Invalid credentials"));

      await expect(
        useAuthStore.getState().login("bad@example.com", "wrong")
      ).rejects.toThrow("Invalid credentials");

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("register", () => {
    it("sets user on successful registration", async () => {
      const { authApi } = await import("@/lib/auth");
      vi.mocked(authApi.register).mockResolvedValueOnce({
        user: mockUser,
        accessToken: "token-456",
        expiresIn: 3600,
      });

      await useAuthStore.getState().register({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Password1",
        confirmPassword: "Password1",
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("clearAuth", () => {
    it("clears all auth state", () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("updateUser", () => {
    it("updates the user object", () => {
      useAuthStore.getState().updateUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe("setLoading", () => {
    it("toggles isLoading", () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});

describe("role helpers", () => {
  it("isAdmin returns true for admin roles", () => {
    const adminRoles = ["SuperAdmin", "Admin", "ContentManager", "ExamManager", "Analyst"] as const;
    for (const role of adminRoles) {
      expect(isAdmin({ ...mockUser, role })).toBe(true);
    }
  });

  it("isAdmin returns false for User role", () => {
    expect(isAdmin({ ...mockUser, role: "User" })).toBe(false);
  });

  it("isAdmin returns false for null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("isSuperAdmin returns true only for SuperAdmin", () => {
    expect(isSuperAdmin({ ...mockUser, role: "SuperAdmin" })).toBe(true);
    expect(isSuperAdmin({ ...mockUser, role: "Admin" })).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });
});
