"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAdmin } from "@/store/authStore";

export function AdminRedirect() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isAdmin(user)) {
      router.replace("/admin");
    }
  }, [isAuthenticated, user, router]);

  return null;
}
