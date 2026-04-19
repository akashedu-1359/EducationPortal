import { api, unwrap } from "./api";

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  provider: "Stripe" | "Razorpay";
  clientSecret?: string;    // Stripe
  razorpayOrderId?: string; // Razorpay
  keyId?: string;           // Razorpay publishable key
}

export interface PaymentVerifyRequest {
  orderId: string;
  provider: "Stripe" | "Razorpay";
  paymentIntentId?: string;   // Stripe
  razorpayPaymentId?: string; // Razorpay
  razorpaySignature?: string; // Razorpay
}

export interface Transaction {
  id: string;
  resourceId: string;
  resourceTitle: string;
  amount: number;
  currency: string;
  provider: "Stripe" | "Razorpay";
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  createdAt: string;
  completedAt?: string;
}

export const paymentsApi = {
  createOrder: async (resourceId: string, provider: "Stripe" | "Razorpay"): Promise<PaymentOrder> => {
    const res = await api.post("/payments/create-order", { resourceId, provider });
    return unwrap(res);
  },

  verifyPayment: async (data: PaymentVerifyRequest): Promise<{ enrolled: boolean }> => {
    const res = await api.post("/payments/verify", data);
    return unwrap(res);
  },

  getMyTransactions: async (): Promise<Transaction[]> => {
    const res = await api.get("/me/transactions");
    return unwrap(res);
  },
};
