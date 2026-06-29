import { api } from "./api";
import type { ApiResponse } from "@/types";
import type {
  Exam,
  ExamAttempt,
  ExamSubmitRequest,
  StartAttemptResponse,
  ExamSubmitResponse,
  AttemptResultDto,
  UserExamDetailDto,
  UserAttemptDto,
  PaginatedResponse,
  PaginationParams,
  CreateExamRequest,
  CreateQuestionRequest,
  BulkQuestionInput,
  BulkAddQuestionsResponse,
  QuestionAdmin,
} from "@/types";

/** Exam controllers return raw DTOs; other APIs use { success, data }. */
function unwrapExamApi<T>(response: { data: unknown; status?: number }): T {
  if (response.status === 204 || response.data === "" || response.data == null) {
    return undefined as T;
  }
  const body = response.data as ApiResponse<T> & Record<string, unknown>;
  if (body && typeof body === "object" && body.success === true) {
    return (body.data !== undefined && body.data !== null ? body.data : response.data) as T;
  }
  return response.data as T;
}

function normalizeExamPagedResult<T>(raw: unknown): PaginatedResponse<T> {
  let payload = raw;
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as ApiResponse<unknown>).success === true
  ) {
    payload = (payload as ApiResponse<unknown>).data;
  }

  const obj = (payload ?? {}) as Record<string, unknown>;
  const items = obj.items ?? obj.Items;

  return {
    items: Array.isArray(items) ? (items as T[]) : [],
    pageNumber: Number(obj.pageNumber ?? obj.PageNumber ?? 1),
    pageSize: Number(obj.pageSize ?? obj.PageSize ?? 15),
    totalCount: Number(obj.totalCount ?? obj.TotalCount ?? (Array.isArray(items) ? items.length : 0)),
    totalPages: Number(obj.totalPages ?? obj.TotalPages ?? 1),
    hasPreviousPage: Boolean(obj.hasPreviousPage ?? obj.HasPreviousPage ?? false),
    hasNextPage: Boolean(obj.hasNextPage ?? obj.HasNextPage ?? false),
  };
}

function normalizeAttemptResult(raw: unknown): AttemptResultDto {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const questionResultsRaw = (obj.questionResults ?? obj.QuestionResults ?? []) as Record<
    string,
    unknown
  >[];

  return {
    attemptId: String(obj.attemptId ?? obj.AttemptId ?? ""),
    examId: String(obj.examId ?? obj.ExamId ?? ""),
    examTitle: String(obj.examTitle ?? obj.ExamTitle ?? ""),
    score: Number(obj.score ?? obj.Score ?? 0),
    isPassed: Boolean(obj.isPassed ?? obj.IsPassed ?? false),
    passingPercentage: Number(obj.passingPercentage ?? obj.PassingPercentage ?? 0),
    totalQuestions: Number(obj.totalQuestions ?? obj.TotalQuestions ?? 0),
    correctAnswers: Number(obj.correctAnswers ?? obj.CorrectAnswers ?? 0),
    startedAt: String(obj.startedAt ?? obj.StartedAt ?? ""),
    completedAt:
      obj.completedAt != null || obj.CompletedAt != null
        ? String(obj.completedAt ?? obj.CompletedAt)
        : undefined,
    certificateId:
      obj.certificateId != null || obj.CertificateId != null
        ? String(obj.certificateId ?? obj.CertificateId)
        : undefined,
    questionResults: questionResultsRaw.map((qr) => ({
      questionId: String(qr.questionId ?? qr.QuestionId ?? ""),
      questionText: String(qr.questionText ?? qr.QuestionText ?? ""),
      option1: String(qr.option1 ?? qr.Option1 ?? ""),
      option2: String(qr.option2 ?? qr.Option2 ?? ""),
      option3: String(qr.option3 ?? qr.Option3 ?? ""),
      option4: String(qr.option4 ?? qr.Option4 ?? ""),
      selectedOptionIndex:
        qr.selectedOptionIndex != null || qr.SelectedOptionIndex != null
          ? Number(qr.selectedOptionIndex ?? qr.SelectedOptionIndex)
          : null,
      correctOptionIndex: Number(qr.correctOptionIndex ?? qr.CorrectOptionIndex ?? 0),
      isCorrect: Boolean(qr.isCorrect ?? qr.IsCorrect ?? false),
    })),
  };
}

function normalizeUserExamDetail(raw: unknown): UserExamDetailDto {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(obj.id ?? obj.Id ?? ""),
    title: String(obj.title ?? obj.Title ?? ""),
    description: String(obj.description ?? obj.Description ?? ""),
    durationMinutes: Number(obj.durationMinutes ?? obj.DurationMinutes ?? 0),
    passingPercentage: Number(obj.passingPercentage ?? obj.PassingPercentage ?? 0),
    maxAttempts: Number(obj.maxAttempts ?? obj.MaxAttempts ?? 0),
    status: String(obj.status ?? obj.Status ?? "Draft") as UserExamDetailDto["status"],
    questionCount: Number(obj.questionCount ?? obj.QuestionCount ?? 0),
    userAttemptCount: Number(obj.userAttemptCount ?? obj.UserAttemptCount ?? 0),
    createdAt: String(obj.createdAt ?? obj.CreatedAt ?? ""),
    scheduledStartAt:
      obj.scheduledStartAt != null || obj.ScheduledStartAt != null
        ? String(obj.scheduledStartAt ?? obj.ScheduledStartAt)
        : undefined,
    scheduledEndAt:
      obj.scheduledEndAt != null || obj.ScheduledEndAt != null
        ? String(obj.scheduledEndAt ?? obj.ScheduledEndAt)
        : undefined,
    isTakeable: Boolean(obj.isTakeable ?? obj.IsTakeable ?? false),
  };
}

export const examsApi = {
  // ── Student endpoints ────────────────────────────────────────────────────

  list: async (params?: PaginationParams & { activeOnly?: boolean }) => {
    const res = await api.get("/user/exams", {
      params: {
        page: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 12,
      },
    });
    return normalizeExamPagedResult<Exam>(unwrapExamApi(res));
  },

  getDetail: async (examId: string): Promise<UserExamDetailDto> => {
    const res = await api.get(`/user/exams/${examId}`);
    return normalizeUserExamDetail(unwrapExamApi(res));
  },

  startAttempt: async (examId: string): Promise<StartAttemptResponse> => {
    const res = await api.post(`/user/exams/${examId}/start`);
    return unwrapExamApi(res);
  },

  submitExam: async (data: ExamSubmitRequest): Promise<ExamSubmitResponse> => {
    const res = await api.post(`/user/exams/attempts/${data.attemptId}/submit`, data);
    return unwrapExamApi(res);
  },

  timeOutAttempt: async (attemptId: string): Promise<void> => {
    await api.post(`/user/exams/attempts/${attemptId}/timeout`);
  },

  getMyAttempts: async (params?: PaginationParams & { examId?: string }): Promise<PaginatedResponse<UserAttemptDto>> => {
    const res = await api.get("/user/exams/attempts", {
      params: {
        page: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 20,
        examId: params?.examId,
      },
    });
    return normalizeExamPagedResult<UserAttemptDto>(unwrapExamApi(res));
  },

  getResult: async (attemptId: string): Promise<AttemptResultDto> => {
    const res = await api.get(`/user/exams/attempts/${attemptId}/result`);
    return normalizeAttemptResult(unwrapExamApi(res));
  },

  // ── Admin endpoints ──────────────────────────────────────────────────────

  adminList: async (params?: PaginationParams): Promise<PaginatedResponse<Exam>> => {
    const res = await api.get("/admin/exams", {
      params: {
        page: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 15,
      },
    });
    return normalizeExamPagedResult<Exam>(unwrapExamApi(res));
  },

  adminGetById: async (id: string): Promise<Exam> => {
    const res = await api.get(`/admin/exams/${id}`);
    return unwrapExamApi(res);
  },

  create: async (data: CreateExamRequest): Promise<Exam> => {
    const res = await api.post("/admin/exams", data);
    const body = unwrapExamApi<{ id: string }>(res);
    return (body.id ? { id: body.id } : body) as Exam;
  },

  update: async (id: string, data: Partial<CreateExamRequest>): Promise<void> => {
    await api.put(`/admin/exams/${id}`, { id, ...data });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/exams/${id}`);
  },

  publish: async (id: string): Promise<void> => {
    await api.post(`/admin/exams/${id}/publish`);
  },

  unpublish: async (id: string): Promise<void> => {
    await api.post(`/admin/exams/${id}/unpublish`);
  },

  // ── Admin question endpoints ─────────────────────────────────────────────

  getQuestions: async (examId: string): Promise<QuestionAdmin[]> => {
    const res = await api.get(`/admin/exams/${examId}/questions`);
    return unwrapExamApi(res);
  },

  addQuestion: async (data: CreateQuestionRequest): Promise<QuestionAdmin> => {
    const res = await api.post("/admin/questions", data);
    const body = unwrapExamApi<{ id: string }>(res);
    return (body.id ? { id: body.id } : body) as QuestionAdmin;
  },

  bulkAddQuestions: async (
    examId: string,
    questions: BulkQuestionInput[]
  ): Promise<BulkAddQuestionsResponse> => {
    const res = await api.post(`/admin/exams/${examId}/questions/bulk`, { questions });
    const body = unwrapExamApi<{ addedCount?: number; AddedCount?: number }>(res);
    return {
      addedCount: Number(body.addedCount ?? body.AddedCount ?? questions.length),
    };
  },

  updateQuestion: async (id: string, data: Partial<CreateQuestionRequest>): Promise<void> => {
    await api.put(`/admin/questions/${id}`, { id, ...data });
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/${id}`);
  },

  // ── Admin attempts ───────────────────────────────────────────────────────

  getAttempts: async (params?: PaginationParams & { examId?: string }): Promise<PaginatedResponse<ExamAttempt>> => {
    const res = await api.get("/admin/exam-attempts", {
      params: {
        page: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 20,
        examId: params?.examId,
      },
    });
    return normalizeExamPagedResult<ExamAttempt>(unwrapExamApi(res));
  },
};
