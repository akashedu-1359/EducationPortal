"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { resourcesApi } from "@/lib/resources";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDuration } from "@/lib/utils";

export default function DashboardMyContentPage() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: resourcesApi.getMyEnrollments,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">My Content</h1>
        <p className="page-subtitle">All resources you&apos;ve enrolled in or purchased.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <Skeleton className="mb-3 h-36 w-full rounded-lg" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !enrollments?.length ? (
        <div className="flex flex-col items-center py-20 text-center">
          <BookOpen className="mb-3 h-14 w-14 text-slate-200" />
          <p className="font-medium text-slate-700">No content yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Enroll in free resources or purchase paid content to get started.
          </p>
          <Link
            href="/resources"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
          >
            Browse Resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/resources/${e.resource.slug}/view`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="relative h-40 overflow-hidden rounded-t-xl bg-slate-100">
                {e.resource.thumbnailUrl ? (
                  <Image
                    src={e.resource.thumbnailUrl}
                    alt={e.resource.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="line-clamp-2 font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                  {e.resource.title}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Badge variant="default">{e.resource.type}</Badge>
                  {e.resource.durationMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(e.resource.durationMinutes)}
                    </span>
                  )}
                </div>
                <p className="mt-auto pt-3 text-xs text-slate-400">
                  Enrolled {formatDate(e.enrolledAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
