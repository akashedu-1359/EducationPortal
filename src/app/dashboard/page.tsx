"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Award, GraduationCap, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { resourcesApi } from "@/lib/resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: resourcesApi.getMyEnrollments,
  });

  const recentEnrollments = enrollments?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
        <p className="page-subtitle">Here&apos;s a summary of your learning journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? "—" : enrollments?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Enrolled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <GraduationCap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">—</p>
              <p className="text-sm text-slate-500">Exams taken</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">—</p>
              <p className="text-sm text-slate-500">Certificates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent enrollments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Continue Learning</CardTitle>
          <Link href="/dashboard/my-content" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-14 w-20 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="mb-1.5 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentEnrollments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">You haven&apos;t enrolled in any resources yet.</p>
              <Link href="/resources" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline">
                Browse resources →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/resources/${enrollment.resource.slug}`}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {enrollment.resource.thumbnailUrl ? (
                      <Image src={enrollment.resource.thumbnailUrl} alt={enrollment.resource.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-900">{enrollment.resource.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="default" className="text-xs">{enrollment.resource.type}</Badge>
                      <span className="text-xs text-slate-400">
                        Enrolled {formatDate(enrollment.enrolledAt)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
