"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Archive,
  Globe,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { resourcesApi } from "@/lib/resources";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/dropdown";
import { ConfirmModal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import type { Resource, ResourceType } from "@/types";

const TYPE_BADGE: Record<ResourceType, { label: string; variant: "primary" | "success" | "info" }> = {
  Video: { label: "Video", variant: "primary" },
  PDF: { label: "PDF", variant: "success" },
  Blog: { label: "Blog", variant: "info" },
};

const STATUS_BADGE = {
  Draft: { label: "Draft", variant: "default" as const },
  Published: { label: "Published", variant: "success" as const },
  Archived: { label: "Archived", variant: "warning" as const },
};

export default function AdminResourcesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<Resource | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "resources", page, search, typeFilter],
    queryFn: () =>
      resourcesApi.adminList({
        pageNumber: page,
        pageSize: 15,
        search: search || undefined,
        type: (typeFilter as ResourceType) || undefined,
      }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => resourcesApi.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast.success("Resource published");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => resourcesApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast.success("Resource archived");
      setArchiveTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Resources</h1>
          <p className="page-subtitle">
            Manage all video, PDF, and blog content.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/admin/resources/new")}
        >
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <Input
            placeholder="Search resources…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-40">
          <Select
            options={[
              { value: "Video", label: "Video" },
              { value: "PDF", label: "PDF" },
              { value: "Blog", label: "Blog" },
            ]}
            placeholder="All types"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pricing</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={7} />
            ))
          ) : !data?.items?.length ? (
            <TableEmpty
              colSpan={7}
              message="No resources found."
              icon={<BookOpen className="h-10 w-10" />}
            />
          ) : (
            data.items.map((r) => {
              const typeBadge = TYPE_BADGE[r.type];
              const statusBadge = STATUS_BADGE[r.status];
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {r.thumbnailUrl && (
                        <img
                          src={r.thumbnailUrl}
                          alt=""
                          className="h-9 w-14 rounded object-cover"
                        />
                      )}
                      <p className="max-w-[220px] truncate font-medium text-slate-900">
                        {r.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {r.category?.name || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge.variant} dot>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.pricingType === "Free" ? (
                      <Badge variant="success">Free</Badge>
                    ) : (
                      <span className="text-sm font-medium text-slate-700">
                        ₹{r.price}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          router.push(`/admin/resources/${r.id}/edit`)
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {r.status === "Draft" && (
                        <button
                          onClick={() => publishMutation.mutate(r.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Publish"
                        >
                          <Globe className="h-4 w-4" />
                        </button>
                      )}
                      {r.status === "Published" && (
                        <button
                          onClick={() => setArchiveTarget(r)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Archive confirm */}
      <ConfirmModal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
        title="Archive Resource"
        description={`Archive "${archiveTarget?.title}"? It will no longer be visible to users but can be un-archived later.`}
        confirmLabel="Archive"
        isDangerous
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}
