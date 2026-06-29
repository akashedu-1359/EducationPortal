"use client";

import Link from "next/link";
import { Clock, Lock, PlayCircle, FileText, BookOpen } from "lucide-react";
import { useFeatureFlag } from "@/components/common/FeatureGate";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { ResourceDetail } from "@/types";

interface ResourceAccessCardProps {
  resource: ResourceDetail;
}

export function ResourceAccessCard({ resource }: ResourceAccessCardProps) {
  const paymentsEnabled = useFeatureFlag("enable_payments");

  const typeIcon =
    resource.type === "Video" ? (
      <PlayCircle className="h-5 w-5" />
    ) : resource.type === "PDF" ? (
      <FileText className="h-5 w-5" />
    ) : (
      <BookOpen className="h-5 w-5" />
    );

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          {typeIcon}
        </div>

        {resource.pricingType === "Paid" && !resource.isEnrolled ? (
          paymentsEnabled === false ? (
            <>
              <p className="mt-4 text-sm font-medium text-slate-700">Paid resource</p>
              <p className="mt-2 text-sm text-slate-500">
                Online purchases are temporarily unavailable. Please check back later.
              </p>
            </>
          ) : paymentsEnabled === true ? (
            <>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {formatCurrency(resource.price!, resource.currency)}
              </p>
              <Link
                href={`/checkout/${resource.id}`}
                className="mt-4 block w-full rounded-xl bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Purchase Access
              </Link>
            </>
          ) : null
        ) : resource.isEnrolled || resource.pricingType === "Free" ? (
          <>
            <p className="mt-4 text-sm font-medium text-green-600">
              ✓ {resource.isEnrolled ? "You're enrolled" : "Free access"}
            </p>
            <Link
              href={`/resources/${resource.slug}/view`}
              className="mt-4 block w-full rounded-xl bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              {resource.type === "Video"
                ? "Watch Now"
                : resource.type === "PDF"
                  ? "View PDF"
                  : "Read Article"}
            </Link>
          </>
        ) : (
          <>
            <div className="mt-4 flex justify-center">
              <Lock className="h-8 w-8 text-slate-300" />
            </div>
            <Link
              href="/auth/login"
              className="mt-4 block w-full rounded-xl bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Sign In to Access
            </Link>
          </>
        )}

        <div className="mt-5 space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {typeIcon}
            <span>{resource.type} content</span>
          </div>
          {resource.durationMinutes && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(resource.durationMinutes)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
