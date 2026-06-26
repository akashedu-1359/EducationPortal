"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, Globe, Pencil, Trash2,
  ListChecks, Clock, Target, EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";
import type { Exam, CreateExamRequest } from "@/types";

const STATUS_BADGE = {
  Draft: { label: "Draft", variant: "default" as const },
  Active: { label: "Active", variant: "success" as const },
  Completed: { label: "Completed", variant: "warning" as const },
};

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  passingPercentage: z.coerce.number().min(1).max(100),
  durationMinutes: z.coerce.number().min(1),
  maxAttempts: z.coerce.number().min(1).max(10),
  scheduledStartAt: z.string().optional(),
  scheduledEndAt: z.string().optional(),
});
type ExamFormData = z.infer<typeof examSchema>;

function ExamFormModal({
  exam,
  onClose,
}: {
  exam: Exam | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: exam?.title ?? "",
      description: exam?.description ?? "",
      passingPercentage: exam?.passingPercentage ?? 60,
      durationMinutes: exam?.durationMinutes ?? 30,
      maxAttempts: exam?.maxAttempts ?? 3,
      scheduledStartAt: exam?.scheduledStartAt
        ? new Date(exam.scheduledStartAt).toISOString().slice(0, 16)
        : "",
      scheduledEndAt: exam?.scheduledEndAt
        ? new Date(exam.scheduledEndAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ExamFormData) => {
      const payload: Partial<CreateExamRequest> = {
        title: data.title,
        description: data.description,
        passingPercentage: data.passingPercentage,
        durationMinutes: data.durationMinutes,
        maxAttempts: data.maxAttempts,
        scheduledStartAt: data.scheduledStartAt || undefined,
        scheduledEndAt: data.scheduledEndAt || undefined,
      };
      return exam
        ? examsApi.update(exam.id, payload)
        : examsApi.create({ ...payload, questions: [] } as CreateExamRequest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success(exam ? "Exam updated" : "Exam created");
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={exam ? "Edit Exam" : "Create Exam"}
      size="lg"
    >
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
          <Input {...register("title")} placeholder="Exam title" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
          <Textarea {...register("description")} placeholder="Describe this exam…" rows={3} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Passing %</label>
            <Input type="number" {...register("passingPercentage")} min={1} max={100} />
            {errors.passingPercentage && <p className="mt-1 text-xs text-red-600">{errors.passingPercentage.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Duration (min)</label>
            <Input type="number" {...register("durationMinutes")} min={1} />
            {errors.durationMinutes && <p className="mt-1 text-xs text-red-600">{errors.durationMinutes.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Max Attempts</label>
            <Input type="number" {...register("maxAttempts")} min={1} max={10} />
            {errors.maxAttempts && <p className="mt-1 text-xs text-red-600">{errors.maxAttempts.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Scheduled Start</label>
            <Input type="datetime-local" {...register("scheduledStartAt")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Scheduled End</label>
            <Input type="datetime-local" {...register("scheduledEndAt")} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {exam ? "Save Changes" : "Create Exam"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminExamsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formTarget, setFormTarget] = useState<Exam | null | "new">(null);
  const [publishTarget, setPublishTarget] = useState<Exam | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<Exam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "exams", page, search],
    queryFn: () =>
      examsApi.adminList({ pageNumber: page, pageSize: 15, search: search || undefined }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => examsApi.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam published");
      setPublishTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => examsApi.unpublish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam unpublished");
      setUnpublishTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">Create and manage all exams and assessments.</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setFormTarget("new")}
        >
          New Exam
        </Button>
      </div>

      <div className="mb-4 w-72">
        <Input
          placeholder="Search exams…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Pass %</TableHead>
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
              message="No exams found."
              icon={<ListChecks className="h-10 w-10" />}
            />
          ) : (
            data.items.map((exam) => {
              const status = STATUS_BADGE[exam.status] ?? STATUS_BADGE.Draft;
              return (
                <TableRow key={exam.id}>
                  <TableCell>
                    <Link
                      href={`/admin/exams/${exam.id}`}
                      className="max-w-[200px] truncate font-medium text-primary-700 hover:underline"
                    >
                      {exam.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <ListChecks className="h-3.5 w-3.5" />
                      {exam.questionCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      {exam.durationMinutes}m
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Target className="h-3.5 w-3.5" />
                      {exam.passingPercentage}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {formatDate(exam.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setFormTarget(exam)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {exam.status === "Draft" && (
                        <button
                          onClick={() => setPublishTarget(exam)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Publish"
                        >
                          <Globe className="h-4 w-4" />
                        </button>
                      )}
                      {exam.status === "Active" && (
                        <button
                          onClick={() => setUnpublishTarget(exam)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Unpublish"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(exam)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}

      {formTarget !== null && (
        <ExamFormModal
          exam={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={() => publishTarget && publishMutation.mutate(publishTarget.id)}
        title="Publish Exam"
        description={`Publish "${publishTarget?.title}"? Students will be able to take this exam.`}
        confirmLabel="Publish"
        isLoading={publishMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!unpublishTarget}
        onClose={() => setUnpublishTarget(null)}
        onConfirm={() => unpublishTarget && unpublishMutation.mutate(unpublishTarget.id)}
        title="Unpublish Exam"
        description={`Unpublish "${unpublishTarget?.title}"? It will no longer be accessible to students.`}
        confirmLabel="Unpublish"
        isDangerous
        isLoading={unpublishMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Exam"
        description={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
