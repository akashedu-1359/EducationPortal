"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading: !mounted || isLoading };
}

/** Redirects non-admin users to dashboard. Use at top of admin pages. */
export function useRequireAdmin() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (!isAdmin(user)) {
        router.push("/dashboard");
      }
    }
  }, [mounted, user, isAuthenticated, isLoading, router]);

  return { user, isAdmin: isAdmin(user), isLoading: !mounted || isLoading };
}

/** Checks if user has one of the given roles. */
export function useHasRole(...roles: UserRole[]): boolean {
  const { user } = useAuthStore();
  if (!user) return false;
  return roles.includes(user.role);
}

/** Hydrates auth state from refresh cookie on app start. Runs once. */
export function useHydrateAuth() {
  const { hydrate, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      hydrate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
