"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { paymentsApi } from "@/lib/payments";
import { useFeatureFlag } from "@/components/common/FeatureGate";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FullPageSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "success" | "warning" | "default" | "info"> = {
  Completed: "success",
  Pending: "warning",
  Failed: "default",
  Refunded: "info",
};

export default function DashboardTransactionsPage() {
  const router = useRouter();
  const paymentsEnabled = useFeatureFlag("enable_payments");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["my-transactions"],
    queryFn: paymentsApi.getMyTransactions,
    enabled: paymentsEnabled === true,
  });

  useEffect(() => {
    if (paymentsEnabled === false) {
      router.replace("/dashboard");
    }
  }, [paymentsEnabled, router]);

  if (paymentsEnabled === null) return <FullPageSpinner />;
  if (!paymentsEnabled) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">Your payment history and receipts.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : !transactions?.length ? (
            <TableEmpty
              colSpan={5}
              message="No transactions yet."
              icon={<CreditCard className="h-10 w-10" />}
            />
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium text-slate-900">
                  {tx.resourceTitle}
                </TableCell>
                <TableCell className="text-slate-700">
                  {formatCurrency(tx.amount, tx.currency)}
                </TableCell>
                <TableCell className="text-slate-600">{tx.provider}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[tx.status] ?? "default"} dot>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(tx.completedAt ?? tx.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
