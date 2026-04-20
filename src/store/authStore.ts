import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { config } from "@/config";
import { setAccessToken } from "@/lib/api";
import { authApi } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // stays true until sessionStorage hydration completes

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, accessToken } = await authApi.login({ email, password });
          setAccessToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { user, accessToken } = await authApi.register(data);
          setAccessToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (code) => {
        set({ isLoading: true });
        try {
          const { user, accessToken } = await authApi.googleCallback(code);
          setAccessToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          setAccessToken(null);
          get().clearAuth();
          window.location.href = "/";
        }
      },

      // Called once on app mount to restore session from httpOnly cookie
      hydrate: async () => {
        if (get().isAuthenticated) return; // already hydrated
        set({ isLoading: true });
        try {
          // Try to get a new access token using the refresh cookie
          const { default: axios } = await import("axios");
          const refreshRes = await axios.post(
            `${config.apiUrl}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );
          if (refreshRes.data?.data?.accessToken) {
            setAccessToken(refreshRes.data.data.accessToken);
            const user = await authApi.getMe();
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          setAccessToken(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (user) => set({ user }),

      clearAuth: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "eduportal-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after sessionStorage is read — safe to unblock route guards
        if (state) state.isLoading = false;
      },
    }
  )
);

// Role helpers
export const isAdmin = (user: User | null): boolean =>
  !!user &&
  ["SuperAdmin", "Admin", "ContentManager", "ExamManager", "Analyst"].includes(
    user.role
  );

export const isSuperAdmin = (user: User | null): boolean =>
  user?.role === "SuperAdmin";
