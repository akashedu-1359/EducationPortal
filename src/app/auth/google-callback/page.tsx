"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/api";
import { BookLoader } from "@/components/ui/book-loader";

function GoogleCallbackContent() {
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

  return <BookLoader />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackContent />
    </Suspense>
  );
}
