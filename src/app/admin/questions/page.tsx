"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";
import type { QuestionAdmin, CreateQuestionRequest } from "@/types";

const DIFF_BADGE = {
  Easy: "success" as const,
  Medium: "warning" as const,
  Hard: "danger" as never,
};

const TYPE_BADGE = {
  SingleChoice: "primary" as const,
  MultipleChoice: "info" as const,
  TrueFalse: "default" as const,
};

const questionSchema = z.object({
  examId: z.string().min(1, "Select an exam"),
  text: z.string().min(5, "Question text is required"),
  type: z.enum(["SingleChoice", "MultipleChoice", "TrueFalse"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  marks: z.coerce.number().min(1),
  explanation: z.string().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 options required"),
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

  const defaultOptions = question?.options.map((o) => ({
    text: o.text,
    isCorrect: question.correctOptionIds.includes(o.id),
  })) ?? [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      examId: question?.examId ?? defaultExamId,
      text: question?.text ?? "",
      type: question?.type ?? "SingleChoice",
      difficulty: question?.difficulty ?? "Medium",
      marks: question?.marks ?? 1,
      explanation: question?.explanation ?? "",
      options: defaultOptions,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const qtype = watch("type");

  const mutation = useMutation({
    mutationFn: (data: CreateQuestionRequest) =>
      question
        ? examsApi.updateQuestion(question.id, data)
        : examsApi.createQuestion(data),
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
        {/* Exam + Type + Difficulty + Marks */}
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Type *</label>
            <select
              {...register("type")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="SingleChoice">Single Choice</option>
              <option value="MultipleChoice">Multiple Choice</option>
              <option value="TrueFalse">True / False</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Difficulty</label>
            <select
              {...register("difficulty")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Marks</label>
            <Input type="number" {...register("marks")} min={1} />
            {errors.marks && <p className="mt-1 text-xs text-red-600">{errors.marks.message}</p>}
          </div>
        </div>

        {/* Question text */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Question *</label>
          <Textarea {...register("text")} placeholder="Enter the question…" rows={3} />
          {errors.text && <p className="mt-1 text-xs text-red-600">{errors.text.message}</p>}
        </div>

        {/* Options */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Options * {qtype === "SingleChoice" ? "(select one correct)" : qtype === "MultipleChoice" ? "(select all correct)" : ""}
            </label>
            {qtype !== "TrueFalse" && fields.length < 6 && (
              <button
                type="button"
                onClick={() => append({ text: "", isCorrect: false })}
                className="text-xs text-primary-600 hover:underline"
              >
                + Add option
              </button>
            )}
          </div>
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type={qtype === "MultipleChoice" ? "checkbox" : "radio"}
                  {...register(`options.${idx}.isCorrect`)}
                  name={qtype === "SingleChoice" || qtype === "TrueFalse" ? "correct_radio" : `options.${idx}.isCorrect`}
                  className="h-4 w-4 shrink-0 text-primary-600"
                />
                <Input
                  {...register(`options.${idx}.text`)}
                  placeholder={
                    qtype === "TrueFalse"
                      ? idx === 0
                        ? "True"
                        : "False"
                      : `Option ${idx + 1}`
                  }
                  readOnly={qtype === "TrueFalse"}
                  className="flex-1"
                />
                {qtype !== "TrueFalse" && fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="mt-1 text-xs text-red-600">
              {typeof errors.options.message === "string"
                ? errors.options.message
                : "Check option fields"}
            </p>
          )}
        </div>

        {/* Explanation */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Explanation <span className="text-slate-400">(shown after attempt)</span>
          </label>
          <Textarea {...register("explanation")} placeholder="Explain the correct answer…" rows={2} />
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

  // Load all published/draft exams for the filter dropdown
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Question Bank</h1>
          <p className="page-subtitle">Manage questions for each exam.</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setFormTarget("new")}
          disabled={!examFilter}
        >
          Add Question
        </Button>
      </div>

      {/* Exam filter */}
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
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-3">
              <HelpCircle className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-primary-900">{selectedExam.title}</p>
                <p className="text-xs text-primary-600">
                  {questions?.length ?? 0} questions · {selectedExam.durationMinutes}m · Pass: {selectedExam.passingScore}%
                </p>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={7} />
                ))
              ) : !questions?.length ? (
                <TableEmpty
                  colSpan={7}
                  message="No questions yet. Add the first one."
                  icon={<HelpCircle className="h-10 w-10" />}
                />
              ) : (
                questions.map((q, idx) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-sm text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate text-sm text-slate-900">{q.text}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={TYPE_BADGE[q.type]}>
                        {q.type === "SingleChoice"
                          ? "Single"
                          : q.type === "MultipleChoice"
                          ? "Multi"
                          : "T/F"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={DIFF_BADGE[q.difficulty]}>{q.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{q.marks}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {q.options.map((o) => {
                          const isCorrect = q.correctOptionIds.includes(o.id);
                          return (
                            <span
                              key={o.id}
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
                              {o.text}
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>
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
