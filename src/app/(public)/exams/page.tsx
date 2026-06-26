"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen } from "lucide-react";
import { examsApi } from "@/lib/exams";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamCard } from "@/components/exam";

const PAGE_SIZE = 12;

export default function ExamsListingPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["exams", page],
    queryFn: () => examsApi.list({ pageNumber: page, pageSize: PAGE_SIZE }),
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

  return (
    <div className="py-10">
      <div className="container-pad">
        <div className="mb-8">
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">
            Test your knowledge and earn certificates
          </p>
        </div>

        <div className="mb-6 max-w-md">
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
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
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
                className="mt-8"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
