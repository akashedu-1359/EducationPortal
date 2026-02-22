"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import { resourcesApi } from "@/lib/resources";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/dropdown";
import type { ResourceType, PricingType } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Clock, Users } from "lucide-react";

function ResourcesPageContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState<ResourceType | "">(
    (searchParams.get("type") as ResourceType) || ""
  );
  const [pricingType, setPricingType] = useState<PricingType | "">(
    (searchParams.get("pricing") as PricingType) || ""
  );
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "");

  const { data, isLoading } = useQuery({
    queryKey: ["resources", page, search, type, pricingType, categoryId],
    queryFn: () =>
      resourcesApi.list({
        pageNumber: page,
        pageSize: 12,
        search: search || undefined,
        type: (type as ResourceType) || undefined,
        pricingType: (pricingType as PricingType) || undefined,
        categoryId: categoryId || undefined,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: resourcesApi.getCategories,
  });

  const TYPE_COLORS: Record<ResourceType, string> = {
    Video: "primary",
    PDF: "success",
    Blog: "info",
  };

  return (
    <div className="py-10">
      <div className="container-pad">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="page-title">Browse Resources</h1>
          <p className="page-subtitle">
            {data?.totalCount
              ? `${data.totalCount} resources available`
              : "Explore our full content library"}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="w-64">
            <Input
              placeholder="Search resources…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            options={[
              { value: "Video", label: "Video" },
              { value: "PDF", label: "PDF" },
              { value: "Blog", label: "Blog" },
            ]}
            placeholder="All types"
            value={type}
            onChange={(e) => { setType(e.target.value as ResourceType | ""); setPage(1); }}
            className="w-36"
          />
          <Select
            options={[
              { value: "Free", label: "Free" },
              { value: "Paid", label: "Paid" },
            ]}
            placeholder="All pricing"
            value={pricingType}
            onChange={(e) => { setPricingType(e.target.value as PricingType | ""); setPage(1); }}
            className="w-36"
          />
          {categories && categories.length > 0 && (
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="All categories"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="w-44"
            />
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !data?.items?.length ? (
          <div className="flex flex-col items-center py-20 text-center">
            <BookOpen className="mb-3 h-12 w-12 text-slate-200" />
            <p className="font-medium text-slate-700">No resources found</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((resource) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden rounded-t-2xl bg-slate-100">
                  {resource.thumbnailUrl ? (
                    <Image
                      src={resource.thumbnailUrl}
                      alt={resource.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <Badge variant={TYPE_COLORS[resource.type] as "primary" | "success" | "info"}>
                      {resource.type}
                    </Badge>
                    {resource.pricingType === "Free" && (
                      <Badge variant="success">Free</Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="line-clamp-2 font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">
                    {resource.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      {resource.durationMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(resource.durationMinutes)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {resource.enrollmentCount}
                      </span>
                    </div>
                    {resource.pricingType === "Paid" && resource.price && (
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(resource.price, resource.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense>
      <ResourcesPageContent />
    </Suspense>
  );
}
