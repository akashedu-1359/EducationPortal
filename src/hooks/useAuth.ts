"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAdmin } from "@/store/authStore";
import type { UserRole } from "@/types";

export function useAuth() {
  const store = useAuthStore();
  return {
    ...store,
    isAdmin: isAdmin(store.user),
    isSuperAdmin: store.user?.role === "SuperAdmin",
  };
}

/** Redirects unauthenticated users to login. Use at top of protected pages. */
export function useRequireAuth(redirectTo = "/auth/login") {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/** Redirects non-admin users to dashboard. Use at top of admin pages. */
export function useRequireAdmin() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (!isAdmin(user)) {
        router.push("/dashboard");
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return { user, isAdmin: isAdmin(user), isLoading };
}

/** Checks if user has one of the given roles. */
export function useHasRole(...roles: UserRole[]): boolean {
  const { user } = useAuthStore();
  if (!user) return false;
  return roles.includes(user.role);
}

/** Hydrates auth state from httpOnly refresh cookie on app start. */
export function useHydrateAuth() {
  const { hydrate, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      hydrate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
