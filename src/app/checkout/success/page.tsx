"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { paymentsApi } from "@/lib/payments";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const ran = useRef(false);

  // For Stripe redirect flow — verify payment after redirect
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const orderId = searchParams.get("orderId");
    const provider = searchParams.get("provider") as "Stripe" | "Razorpay" | null;
    const paymentIntentId = searchParams.get("payment_intent");

    if (orderId && provider === "Stripe" && paymentIntentId) {
      paymentsApi
        .verifyPayment({ orderId, provider: "Stripe", paymentIntentId })
        .then(() => toast.success("Payment confirmed!"))
        .catch(() => toast.error("Payment verification issue. Please contact support."));
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-card max-w-sm w-full">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Successful!</h1>
        <p className="mt-2 text-slate-500">
          You now have full access to your purchased content.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard/my-content"
            className="block w-full rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Go to My Content
          </Link>
          <Link
            href="/resources"
            className="block w-full rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Browse More Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
