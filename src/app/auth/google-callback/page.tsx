"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const ran = useRef(false); // prevent double-fire in StrictMode

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      toast.error("Google sign-in was cancelled or failed. Please try again.");
      router.push("/auth/login");
      return;
    }

    loginWithGoogle(code)
      .then(() => {
        toast.success("Signed in with Google!");
        router.push("/dashboard");
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err));
        router.push("/auth/login");
      });
  }, [searchParams, loginWithGoogle, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500">Completing Google sign-in…</p>
    </div>
  );
}
