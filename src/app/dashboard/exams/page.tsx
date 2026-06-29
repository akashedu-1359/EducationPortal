"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen, History } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { useFeatureFlag } from "@/components/common/FeatureGate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamCard } from "@/components/exam";

const PAGE_SIZE = 12;

export default function DashboardExamsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const examsEnabled = useFeatureFlag("enable_exams");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exams", page],
    queryFn: () => examsApi.list({ pageNumber: page, pageSize: PAGE_SIZE }),
    enabled: examsEnabled !== false,
  });

  const filteredExams = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  if (examsEnabled === false) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Exams are currently disabled. Contact an administrator if you believe this is an error.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">Browse published exams and start an attempt</p>
        </div>
        <Link href="/dashboard/exams/attempts">
          <Button variant="outline" size="sm" leftIcon={<History className="h-4 w-4" />}>
            My Attempts
          </Button>
        </Link>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search exams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <Skeleton className="mb-3 h-5 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-4 h-4 w-2/3" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-900">Could not load exams</p>
          <p className="mt-1 text-sm text-slate-500">Please try again later.</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-900">No exams found</p>
          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try adjusting your search terms"
              : "Check back later for new exams"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>

          {data && data.totalPages > 1 && !search && (
            <Pagination
              currentPage={data.pageNumber}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
