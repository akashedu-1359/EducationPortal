"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CreditCard, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { resourcesApi } from "@/lib/resources";
import { paymentsApi } from "@/lib/payments";
import { getApiErrorMessage } from "@/lib/api";
import { config } from "@/config";
import { Button } from "@/components/ui/button";
import { FullBookLoader } from "@/components/ui/book-loader";
import { useRequireAuth } from "@/hooks/useAuth";

interface Props {
  params: { resourceId: string };
}

export default function CheckoutPage({ params }: Props) {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  const [selectedProvider, setSelectedProvider] = useState<"Stripe" | "Razorpay">(
    config.stripePublishableKey ? "Stripe" : "Razorpay"
  );
  const [processing, setProcessing] = useState(false);

  // Fetch resource info for display
  const { } = useQuery({
    queryKey: ["resource-checkout", params.resourceId],
    queryFn: () => resourcesApi.adminList({ pageNumber: 1, pageSize: 1 }).then(() =>
      // Using public API would be better; this is a placeholder
      Promise.resolve(null)
    ),
  });

  const createOrderMutation = useMutation({
    mutationFn: () => paymentsApi.createOrder(params.resourceId, selectedProvider),
    onSuccess: async (order) => {
      if (order.provider === "Razorpay") {
        await handleRazorpay(order);
      } else {
        await handleStripe(order);
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
      setProcessing(false);
    },
  });

  const handleStripe = async (order: Awaited<ReturnType<typeof paymentsApi.createOrder>>) => {
    try {
      // Dynamically import Stripe.js to keep it out of the main bundle
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(config.stripePublishableKey);
      if (!stripe || !order.clientSecret) throw new Error("Stripe not available");

      const { error } = await stripe.confirmPayment({
        elements: undefined as never, // Using redirect flow
        clientSecret: order.clientSecret,
        confirmParams: {
          return_url: `${config.appUrl}/checkout/success?orderId=${order.orderId}&provider=Stripe`,
        },
        redirect: "always",
      });

      if (error) throw new Error(error.message);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setProcessing(false);
    }
  };

  const handleRazorpay = async (order: Awaited<ReturnType<typeof paymentsApi.createOrder>>) => {
    try {
      const Razorpay = (window as Window & { Razorpay?: new (opts: unknown) => { open: () => void } }).Razorpay;
      if (!Razorpay) {
        // Load Razorpay script dynamically
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.head.appendChild(script);
        });
      }

      const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
        key: order.keyId || config.razorpayKeyId,
        amount: order.amount * 100, // paise
        currency: order.currency,
        order_id: order.razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentsApi.verifyPayment({
              orderId: order.orderId,
              provider: "Razorpay",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            router.push(`/checkout/success?orderId=${order.orderId}&provider=Razorpay`);
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setProcessing(false);
    }
  };

  const handlePay = () => {
    setProcessing(true);
    createOrderMutation.mutate();
  };

  if (authLoading) return <FullBookLoader />;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-pad max-w-lg">
        <Link href={`/resources`} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <CreditCard className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Complete your purchase</h1>
              <p className="text-sm text-slate-500">Secure payment powered by industry leaders</p>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-slate-700">Payment method</p>
            <div className="grid grid-cols-2 gap-3">
              {config.stripePublishableKey && (
                <button
                  type="button"
                  onClick={() => setSelectedProvider("Stripe")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors ${
                    selectedProvider === "Stripe"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Stripe
                </button>
              )}
              {config.razorpayKeyId && (
                <button
                  type="button"
                  onClick={() => setSelectedProvider("Razorpay")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors ${
                    selectedProvider === "Razorpay"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Razorpay
                </button>
              )}
            </div>
          </div>

          {/* Security badges */}
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
            <Shield className="h-4 w-4 shrink-0 text-green-600" />
            <p className="text-xs text-green-700">
              Your payment is encrypted and secure. We never store your card details.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handlePay}
            isLoading={processing || createOrderMutation.isPending}
          >
            Pay Now
          </Button>

          <p className="mt-4 text-center text-xs text-slate-400">
            By completing this purchase you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
