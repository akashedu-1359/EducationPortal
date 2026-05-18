"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function BrowseResourcesButton({ variant = "primary" }: { variant?: "primary" | "outline" }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  if (variant === "outline") {
    return (
      <Link
        href="/resources"
        className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        Browse Resources
      </Link>
    );
  }

  return (
    <Link
      href="/resources"
      className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary-500"
    >
      Browse Resources
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
