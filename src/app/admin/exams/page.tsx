"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, Globe, Archive, FileText, Pencil,
  ListChecks, Clock, Target,
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
  Published: { label: "Published", variant: "success" as const },
  Archived: { label: "Archived", variant: "warning" as const },
};

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  passingScore: z.coerce.number().min(1).max(100),
  durationMinutes: z.coerce.number().min(1),
  maxAttempts: z.coerce.number().min(1).max(10),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showResultImmediately: z.boolean().optional(),
  issueCertificate: z.boolean().optional(),
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
      passingScore: exam?.passingScore ?? 60,
      durationMinutes: exam?.durationMinutes ?? 30,
      maxAttempts: exam?.maxAttempts ?? 3,
      shuffleQuestions: exam?.shuffleQuestions ?? true,
      shuffleOptions: exam?.shuffleOptions ?? true,
      showResultImmediately: exam?.showResultImmediately ?? true,
      issueCertificate: exam?.issueCertificate ?? false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateExamRequest) =>
      exam ? examsApi.update(exam.id, data) : examsApi.create(data),
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
        onSubmit={handleSubmit((data) => mutation.mutate(data as CreateExamRequest))}
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Passing Score (%)</label>
            <Input type="number" {...register("passingScore")} min={1} max={100} />
            {errors.passingScore && <p className="mt-1 text-xs text-red-600">{errors.passingScore.message}</p>}
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
          {(
            [
              { name: "shuffleQuestions", label: "Shuffle Questions" },
              { name: "shuffleOptions", label: "Shuffle Options" },
              { name: "showResultImmediately", label: "Show Result Immediately" },
              { name: "issueCertificate", label: "Issue Certificate on Pass" },
            ] as const
          ).map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register(name)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
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
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formTarget, setFormTarget] = useState<Exam | null | "new">(null);
  const [publishTarget, setPublishTarget] = useState<Exam | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Exam | null>(null);

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

  const archiveMutation = useMutation({
    mutationFn: (id: string) => examsApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam archived");
      setArchiveTarget(null);
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

      {/* Search */}
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
            <TableHead>Pass Score</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={8} />
            ))
          ) : !data?.items?.length ? (
            <TableEmpty
              colSpan={8}
              message="No exams found."
              icon={<FileText className="h-10 w-10" />}
            />
          ) : (
            data.items.map((exam) => {
              const status = STATUS_BADGE[exam.status];
              return (
                <TableRow key={exam.id}>
                  <TableCell>
                    <p className="max-w-[200px] truncate font-medium text-slate-900">
                      {exam.title}
                    </p>
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
                      {exam.passingScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {exam.attemptCount}
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
                      <button
                        onClick={() => router.push(`/admin/questions?examId=${exam.id}`)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Manage Questions"
                      >
                        <ListChecks className="h-4 w-4" />
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
                      {exam.status === "Published" && (
                        <button
                          onClick={() => setArchiveTarget(exam)}
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

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Create / Edit modal */}
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
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
        title="Archive Exam"
        description={`Archive "${archiveTarget?.title}"? It will no longer be accessible to students.`}
        confirmLabel="Archive"
        isDangerous
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}
