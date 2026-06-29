"use client";

import { useFeatureFlag } from "@/components/common/FeatureGate";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ResourcePriceLabelProps {
  pricingType: "Free" | "Paid";
  price?: number;
  currency?: string;
}

export function ResourcePriceLabel({ pricingType, price, currency }: ResourcePriceLabelProps) {
  const paymentsEnabled = useFeatureFlag("enable_payments");

  if (pricingType === "Free") {
    return <Badge variant="success">Free</Badge>;
  }

  if (!paymentsEnabled) {
    return <Badge variant="default">Paid</Badge>;
  }

  if (price == null) return <Badge variant="default">Paid</Badge>;

  return (
    <span className="font-semibold text-slate-700">
      {formatCurrency(price, currency)}
    </span>
  );
}
