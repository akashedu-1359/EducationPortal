"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, HelpCircle, CheckCircle, XCircle, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";
import { BulkUploadQuestionsModal } from "@/components/admin/BulkUploadQuestionsModal";
import type { QuestionAdmin, CreateQuestionRequest } from "@/types";

const questionSchema = z.object({
  examId: z.string().min(1, "Select an exam"),
  questionText: z.string().min(5, "Question text is required"),
  option1: z.string().min(1, "Option 1 is required"),
  option2: z.string().min(1, "Option 2 is required"),
  option3: z.string().min(1, "Option 3 is required"),
  option4: z.string().min(1, "Option 4 is required"),
  correctOptionIndex: z.coerce.number().min(0).max(3),
  sortOrder: z.coerce.number().min(0),
});
type QuestionFormData = z.infer<typeof questionSchema>;

function QuestionFormModal({
  question,
  defaultExamId,
  exams,
  onClose,
}: {
  question: QuestionAdmin | null;
  defaultExamId: string;
  exams: { id: string; title: string }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      examId: question?.examId ?? defaultExamId,
      questionText: question?.questionText ?? "",
      option1: question?.option1 ?? "",
      option2: question?.option2 ?? "",
      option3: question?.option3 ?? "",
      option4: question?.option4 ?? "",
      correctOptionIndex: question?.correctOptionIndex ?? 0,
      sortOrder: question?.sortOrder ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateQuestionRequest) =>
      question
        ? examsApi.updateQuestion(question.id, data)
        : examsApi.addQuestion(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      toast.success(question ? "Question updated" : "Question created");
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={question ? "Edit Question" : "Add Question"}
      size="xl"
    >
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data as CreateQuestionRequest))}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Exam *</label>
            <select
              {...register("examId")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select exam…</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            {errors.examId && <p className="mt-1 text-xs text-red-600">{errors.examId.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sort Order</label>
            <Input type="number" {...register("sortOrder")} min={0} />
            {errors.sortOrder && <p className="mt-1 text-xs text-red-600">{errors.sortOrder.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Question *</label>
          <Textarea {...register("questionText")} placeholder="Enter the question…" rows={3} />
          {errors.questionText && <p className="mt-1 text-xs text-red-600">{errors.questionText.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Options *</label>
          {([1, 2, 3, 4] as const).map((num) => {
            const fieldName = `option${num}` as const;
            return (
              <div key={num}>
                <label className="mb-1 block text-xs text-slate-500">Option {num}</label>
                <Input
                  {...register(fieldName)}
                  placeholder={`Option ${num}`}
                />
                {errors[fieldName] && (
                  <p className="mt-1 text-xs text-red-600">{errors[fieldName]?.message}</p>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Correct Option *</label>
          <select
            {...register("correctOptionIndex")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
            <option value={2}>Option 3</option>
            <option value={3}>Option 4</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {question ? "Save Changes" : "Add Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminQuestionsPage() {
  const searchParams = useSearchParams();
  const defaultExamId = searchParams.get("examId") ?? "";
  const qc = useQueryClient();
  const [examFilter, setExamFilter] = useState(defaultExamId);
  const [formTarget, setFormTarget] = useState<QuestionAdmin | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionAdmin | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const { data: examsData } = useQuery({
    queryKey: ["admin", "exams", "all"],
    queryFn: () => examsApi.adminList({ pageNumber: 1, pageSize: 100 }),
  });

  const exams = examsData?.items ?? [];

  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin", "questions", examFilter],
    queryFn: () =>
      examFilter
        ? examsApi.getQuestions(examFilter)
        : Promise.resolve([] as QuestionAdmin[]),
    enabled: !!examFilter,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examsApi.deleteQuestion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      toast.success("Question deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const selectedExam = exams.find((e) => e.id === examFilter);
  const canManageQuestions = !!examFilter && selectedExam?.status !== "Active";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Question Bank</h1>
          <p className="page-subtitle">Manage questions for each exam.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => setShowBulkUpload(true)}
            disabled={!canManageQuestions}
          >
            Bulk Upload
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setFormTarget("new")}
            disabled={!canManageQuestions}
          >
            Add Question
          </Button>
        </div>
      </div>

      <div className="mb-6 w-80">
        <label className="mb-1 block text-sm font-medium text-slate-700">Select Exam</label>
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">— Select an exam to view questions —</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {!examFilter ? (
        <div className="flex flex-col items-center py-20 text-center">
          <HelpCircle className="mb-3 h-14 w-14 text-slate-200" />
          <p className="font-medium text-slate-700">Select an exam above</p>
          <p className="mt-1 text-sm text-slate-400">
            Questions are organized per exam.
          </p>
        </div>
      ) : (
        <>
          {selectedExam && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-3">
                <HelpCircle className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-primary-900">{selectedExam.title}</p>
                  <p className="text-xs text-primary-600">
                    {questions?.length ?? 0} questions · {selectedExam.durationMinutes}m · Pass: {selectedExam.passingPercentage}%
                  </p>
                </div>
              </div>
              {selectedExam.status === "Active" && (
                <p className="text-sm text-amber-700">
                  Questions cannot be added while this exam is active. Unpublish it first to use bulk upload or add questions.
                </p>
              )}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Option 1</TableHead>
                <TableHead>Option 2</TableHead>
                <TableHead>Option 3</TableHead>
                <TableHead>Option 4</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={8} />
                ))
              ) : !questions?.length ? (
                <TableEmpty
                  colSpan={8}
                  message="No questions yet. Add the first one."
                  icon={<HelpCircle className="h-10 w-10" />}
                />
              ) : (
                questions.map((q, idx) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-sm text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate text-sm text-slate-900">{q.questionText}</p>
                    </TableCell>
                    {([0, 1, 2, 3] as const).map((optIdx) => {
                      const optionText = q[`option${optIdx + 1}` as keyof typeof q] as string;
                      const isCorrect = q.correctOptionIndex === optIdx;
                      return (
                        <TableCell key={optIdx}>
                          <span
                            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                              isCorrect
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span className="max-w-[80px] truncate">{optionText}</span>
                          </span>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-sm text-slate-500">{q.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setFormTarget(q)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(q)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      )}

      {formTarget !== null && (
        <QuestionFormModal
          question={formTarget === "new" ? null : formTarget}
          defaultExamId={examFilter}
          exams={exams.map((e) => ({ id: e.id, title: e.title }))}
          onClose={() => setFormTarget(null)}
        />
      )}

      {showBulkUpload && examFilter && (
        <BulkUploadQuestionsModal
          examId={examFilter}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Question"
        description="Delete this question? This cannot be undone."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
