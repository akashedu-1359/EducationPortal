"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Pencil, Globe, EyeOff, Plus, Trash2,
  CheckCircle, XCircle, Clock, Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { FullPageSpinner } from "@/components/ui/spinner";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";
import type {
  Exam, QuestionAdmin, CreateQuestionRequest,
  ExamAttempt, CreateExamRequest, AttemptStatus,
} from "@/types";

const STATUS_BADGE = {
  Draft: { label: "Draft", variant: "default" as const },
  Active: { label: "Active", variant: "success" as const },
  Completed: { label: "Completed", variant: "warning" as const },
};

const ATTEMPT_STATUS_BADGE: Record<AttemptStatus, { variant: "primary" | "success" | "warning"; label: string }> = {
  InProgress: { variant: "primary", label: "In Progress" },
  Completed: { variant: "success", label: "Completed" },
  TimedOut: { variant: "warning", label: "Timed Out" },
};

type TabKey = "info" | "questions" | "attempts";

// ── Edit Exam Modal ──────────────────────────────────────────────────────────

const examSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  passingPercentage: z.coerce.number().min(1).max(100),
  durationMinutes: z.coerce.number().min(1),
  maxAttempts: z.coerce.number().min(1).max(10),
  scheduledStartAt: z.string().optional(),
  scheduledEndAt: z.string().optional(),
});
type ExamFormData = z.infer<typeof examSchema>;

function EditExamModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: exam.title,
      description: exam.description,
      passingPercentage: exam.passingPercentage,
      durationMinutes: exam.durationMinutes,
      maxAttempts: exam.maxAttempts,
      scheduledStartAt: exam.scheduledStartAt
        ? new Date(exam.scheduledStartAt).toISOString().slice(0, 16)
        : "",
      scheduledEndAt: exam.scheduledEndAt
        ? new Date(exam.scheduledEndAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ExamFormData) => {
      const payload: Partial<CreateExamRequest> = {
        ...data,
        scheduledStartAt: data.scheduledStartAt || undefined,
        scheduledEndAt: data.scheduledEndAt || undefined,
      };
      return examsApi.update(exam.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam", exam.id] });
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam updated");
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal isOpen onClose={onClose} title="Edit Exam" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
          <Input {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
          <Textarea {...register("description")} rows={3} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Passing %</label>
            <Input type="number" {...register("passingPercentage")} min={1} max={100} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Duration (min)</label>
            <Input type="number" {...register("durationMinutes")} min={1} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Max Attempts</label>
            <Input type="number" {...register("maxAttempts")} min={1} max={10} />
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Question Form Modal ──────────────────────────────────────────────────────

const questionSchema = z.object({
  questionText: z.string().min(5),
  option1: z.string().min(1),
  option2: z.string().min(1),
  option3: z.string().min(1),
  option4: z.string().min(1),
  correctOptionIndex: z.coerce.number().min(0).max(3),
  sortOrder: z.coerce.number().min(0),
});
type QuestionFormData = z.infer<typeof questionSchema>;

function QuestionFormModal({
  question,
  examId,
  onClose,
}: {
  question: QuestionAdmin | null;
  examId: string;
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
    mutationFn: (data: QuestionFormData) => {
      const payload: CreateQuestionRequest = { ...data, examId };
      return question
        ? examsApi.updateQuestion(question.id, payload)
        : examsApi.addQuestion(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam-questions", examId] });
      qc.invalidateQueries({ queryKey: ["admin", "exam", examId] });
      toast.success(question ? "Question updated" : "Question added");
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal isOpen onClose={onClose} title={question ? "Edit Question" : "Add Question"} size="xl">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Question *</label>
          <Textarea {...register("questionText")} rows={3} placeholder="Enter the question…" />
          {errors.questionText && <p className="mt-1 text-xs text-red-600">{errors.questionText.message}</p>}
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Options *</label>
          {([1, 2, 3, 4] as const).map((num) => {
            const key = `option${num}` as const;
            return (
              <div key={num}>
                <label className="mb-1 block text-xs text-slate-500">Option {num}</label>
                <Input {...register(key)} placeholder={`Option ${num}`} />
                {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]?.message}</p>}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sort Order</label>
            <Input type="number" {...register("sortOrder")} min={0} />
          </div>
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

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const examId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [showEditModal, setShowEditModal] = useState(false);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [unpublishConfirm, setUnpublishConfirm] = useState(false);

  // Questions tab state
  const [questionForm, setQuestionForm] = useState<QuestionAdmin | null | "new">(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<QuestionAdmin | null>(null);

  // Attempts tab state
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [viewAttempt, setViewAttempt] = useState<ExamAttempt | null>(null);

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["admin", "exam", examId],
    queryFn: () => examsApi.adminGetById(examId),
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["admin", "exam-questions", examId],
    queryFn: () => examsApi.getQuestions(examId),
    enabled: activeTab === "questions",
  });

  const { data: attemptsData, isLoading: attemptsLoading } = useQuery({
    queryKey: ["admin", "exam-attempts", examId, attemptsPage],
    queryFn: () => examsApi.getAttempts({ pageNumber: attemptsPage, pageSize: 20, examId }),
    enabled: activeTab === "attempts",
  });

  const publishMutation = useMutation({
    mutationFn: () => examsApi.publish(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam", examId] });
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam published");
      setPublishConfirm(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => examsApi.unpublish(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam", examId] });
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast.success("Exam unpublished");
      setUnpublishConfirm(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => examsApi.deleteQuestion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam-questions", examId] });
      qc.invalidateQueries({ queryKey: ["admin", "exam", examId] });
      toast.success("Question deleted");
      setDeleteQuestionTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (examLoading) return <FullPageSpinner />;
  if (!exam) return <p className="py-20 text-center text-slate-500">Exam not found.</p>;

  const status = STATUS_BADGE[exam.status] ?? STATUS_BADGE.Draft;
  const tabs: { key: TabKey; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "questions", label: "Questions" },
    { key: "attempts", label: "Attempts" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/exams")}
          className="mb-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Exams
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{exam.title}</h1>
            <Badge variant={status.variant} dot>{status.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setShowEditModal(true)}>
              Edit
            </Button>
            {exam.status === "Draft" && (
              <Button size="sm" leftIcon={<Globe className="h-4 w-4" />} onClick={() => setPublishConfirm(true)}>
                Publish
              </Button>
            )}
            {exam.status === "Active" && (
              <Button variant="outline" size="sm" leftIcon={<EyeOff className="h-4 w-4" />} onClick={() => setUnpublishConfirm(true)}>
                Unpublish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 uppercase tracking-wider">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Description</dt>
                <dd className="mt-0.5 text-slate-900">{exam.description}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="mt-0.5 flex items-center gap-1 text-slate-900">
                    <Clock className="h-4 w-4 text-slate-400" /> {exam.durationMinutes} min
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Passing %</dt>
                  <dd className="mt-0.5 text-slate-900">{exam.passingPercentage}%</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Max Attempts</dt>
                  <dd className="mt-0.5 text-slate-900">{exam.maxAttempts}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Questions</dt>
                  <dd className="mt-0.5 text-slate-900">{exam.questionCount}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 uppercase tracking-wider">Schedule</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="mt-0.5 text-slate-900">{formatDate(exam.createdAt)}</dd>
              </div>
              {exam.scheduledStartAt && (
                <div>
                  <dt className="text-slate-500">Scheduled Start</dt>
                  <dd className="mt-0.5 text-slate-900">{formatDate(exam.scheduledStartAt)}</dd>
                </div>
              )}
              {exam.scheduledEndAt && (
                <div>
                  <dt className="text-slate-500">Scheduled End</dt>
                  <dd className="mt-0.5 text-slate-900">{formatDate(exam.scheduledEndAt)}</dd>
                </div>
              )}
              {!exam.scheduledStartAt && !exam.scheduledEndAt && (
                <p className="text-slate-400 italic">No schedule configured.</p>
              )}
            </dl>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setQuestionForm("new")}>
              Add Question
            </Button>
          </div>
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
              {questionsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
              ) : !questions?.length ? (
                <TableEmpty colSpan={8} message="No questions yet." />
              ) : (
                questions.map((q, idx) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-sm text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate text-sm text-slate-900">{q.questionText}</p>
                    </TableCell>
                    {([0, 1, 2, 3] as const).map((optIdx) => {
                      const text = q[`option${optIdx + 1}` as keyof typeof q] as string;
                      const isCorrect = q.correctOptionIndex === optIdx;
                      return (
                        <TableCell key={optIdx}>
                          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                            isCorrect ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {isCorrect ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            <span className="max-w-[80px] truncate">{text}</span>
                          </span>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-sm text-slate-500">{q.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setQuestionForm(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteQuestionTarget(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "attempts" && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attemptsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : !attemptsData?.items?.length ? (
                <TableEmpty colSpan={7} message="No attempts for this exam." />
              ) : (
                attemptsData.items.map((attempt) => {
                  const aStatus = ATTEMPT_STATUS_BADGE[attempt.status];
                  return (
                    <TableRow key={attempt.id}>
                      <TableCell className="text-sm text-slate-700">
                        User #{attempt.userId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={aStatus.variant} dot>{aStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {attempt.score != null ? `${attempt.score}%` : "—"}
                      </TableCell>
                      <TableCell>
                        {attempt.status === "Completed" && attempt.isPassed != null ? (
                          attempt.isPassed ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                              <CheckCircle className="h-3.5 w-3.5" /> Pass
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                              <XCircle className="h-3.5 w-3.5" /> Fail
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatRelativeTime(attempt.startedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {attempt.completedAt ? formatRelativeTime(attempt.completedAt) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => setViewAttempt(attempt)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="View detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {attemptsData && attemptsData.totalPages > 1 && (
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={attemptsPage <= 1}
                  onClick={() => setAttemptsPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-slate-500">
                  Page {attemptsPage} of {attemptsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={attemptsPage >= attemptsData.totalPages}
                  onClick={() => setAttemptsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showEditModal && (
        <EditExamModal exam={exam} onClose={() => setShowEditModal(false)} />
      )}

      {questionForm !== null && (
        <QuestionFormModal
          question={questionForm === "new" ? null : questionForm}
          examId={examId}
          onClose={() => setQuestionForm(null)}
        />
      )}

      <ConfirmModal
        isOpen={publishConfirm}
        onClose={() => setPublishConfirm(false)}
        onConfirm={() => publishMutation.mutate()}
        title="Publish Exam"
        description={`Publish "${exam.title}"? Students will be able to take this exam.`}
        confirmLabel="Publish"
        isLoading={publishMutation.isPending}
      />

      <ConfirmModal
        isOpen={unpublishConfirm}
        onClose={() => setUnpublishConfirm(false)}
        onConfirm={() => unpublishMutation.mutate()}
        title="Unpublish Exam"
        description={`Unpublish "${exam.title}"? It will no longer be accessible to students.`}
        confirmLabel="Unpublish"
        isDangerous
        isLoading={unpublishMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteQuestionTarget}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={() => deleteQuestionTarget && deleteQuestionMutation.mutate(deleteQuestionTarget.id)}
        title="Delete Question"
        description="Delete this question? This cannot be undone."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteQuestionMutation.isPending}
      />

      {viewAttempt && (
        <Modal isOpen onClose={() => setViewAttempt(null)} title="Attempt Detail" size="lg">
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{viewAttempt.exam.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">Started {formatDate(viewAttempt.startedAt)}</p>
            </div>
            {viewAttempt.status === "Completed" && viewAttempt.score != null && (
              <div className="flex items-center gap-4">
                <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 font-bold ${
                  viewAttempt.isPassed ? "border-green-400 text-green-600" : "border-red-400 text-red-600"
                }`}>
                  <span className="text-2xl">{viewAttempt.score}%</span>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    {viewAttempt.isPassed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    {viewAttempt.isPassed ? "Passed" : "Failed"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Score: {viewAttempt.score}% · Pass threshold: {viewAttempt.exam.passingPercentage}%
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Started</p>
                <p className="mt-0.5 text-slate-900">{formatDate(viewAttempt.startedAt)}</p>
              </div>
              {viewAttempt.completedAt && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed</p>
                  <p className="mt-0.5 text-slate-900">{formatDate(viewAttempt.completedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
                <Badge variant={ATTEMPT_STATUS_BADGE[viewAttempt.status].variant} dot className="mt-0.5">
                  {ATTEMPT_STATUS_BADGE[viewAttempt.status].label}
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
