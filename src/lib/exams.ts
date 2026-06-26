import { api, unwrap } from "./api";
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
  QuestionAdmin,
} from "@/types";

export const examsApi = {
  // ── Student endpoints ────────────────────────────────────────────────────

  list: async (params?: PaginationParams & { activeOnly?: boolean }) => {
    const res = await api.get("/user/exams", { params });
    return unwrap(res) as PaginatedResponse<Exam>;
  },

  getDetail: async (examId: string): Promise<UserExamDetailDto> => {
    const res = await api.get(`/user/exams/${examId}`);
    return unwrap(res);
  },

  startAttempt: async (examId: string): Promise<StartAttemptResponse> => {
    const res = await api.post(`/user/exams/${examId}/start`);
    return unwrap(res);
  },

  submitExam: async (data: ExamSubmitRequest): Promise<ExamSubmitResponse> => {
    const res = await api.post(`/user/exams/attempts/${data.attemptId}/submit`, data);
    return unwrap(res);
  },

  getMyAttempts: async (params?: PaginationParams & { examId?: string }): Promise<PaginatedResponse<UserAttemptDto>> => {
    const res = await api.get("/user/exams/attempts", { params });
    return unwrap(res);
  },

  getResult: async (attemptId: string): Promise<AttemptResultDto> => {
    const res = await api.get(`/user/exams/attempts/${attemptId}/result`);
    return unwrap(res);
  },

  // ── Admin endpoints ──────────────────────────────────────────────────────

  adminList: async (params?: PaginationParams): Promise<PaginatedResponse<Exam>> => {
    const res = await api.get("/admin/exams", { params });
    return unwrap(res);
  },

  adminGetById: async (id: string): Promise<Exam> => {
    const res = await api.get(`/admin/exams/${id}`);
    return unwrap(res);
  },

  create: async (data: CreateExamRequest): Promise<Exam> => {
    const res = await api.post("/admin/exams", data);
    return unwrap(res);
  },

  update: async (id: string, data: Partial<CreateExamRequest>): Promise<Exam> => {
    const res = await api.put(`/admin/exams/${id}`, data);
    return unwrap(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/exams/${id}`);
    unwrap(res);
  },

  publish: async (id: string): Promise<Exam> => {
    const res = await api.post(`/admin/exams/${id}/publish`);
    return unwrap(res);
  },

  unpublish: async (id: string): Promise<Exam> => {
    const res = await api.post(`/admin/exams/${id}/unpublish`);
    return unwrap(res);
  },

  // ── Admin question endpoints ─────────────────────────────────────────────

  getQuestions: async (examId: string): Promise<QuestionAdmin[]> => {
    const res = await api.get(`/admin/exams/${examId}/questions`);
    return unwrap(res);
  },

  addQuestion: async (data: CreateQuestionRequest): Promise<QuestionAdmin> => {
    const res = await api.post("/admin/questions", data);
    return unwrap(res);
  },

  updateQuestion: async (id: string, data: Partial<CreateQuestionRequest>): Promise<QuestionAdmin> => {
    const res = await api.put(`/admin/questions/${id}`, data);
    return unwrap(res);
  },

  deleteQuestion: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/questions/${id}`);
    unwrap(res);
  },

  // ── Admin attempts ───────────────────────────────────────────────────────

  getAttempts: async (params?: PaginationParams & { examId?: string }): Promise<PaginatedResponse<ExamAttempt>> => {
    const res = await api.get("/admin/exam-attempts", { params });
    return unwrap(res);
  },
};
