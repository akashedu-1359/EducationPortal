import { api, unwrap } from "./api";
import type {
  Exam,
  ExamAttempt,
  ExamDelivery,
  ExamSubmitRequest,
  ExamResult,
  PaginatedResponse,
  PaginationParams,
  CreateExamRequest,
  CreateQuestionRequest,
  QuestionAdmin,
} from "@/types";

export const examsApi = {
  // ── Public / Student ──────────────────────────────────────────────────────

  list: async (params?: PaginationParams): Promise<PaginatedResponse<Exam>> => {
    const res = await api.get("/exams", { params });
    return unwrap(res);
  },

  getBySlug: async (slug: string): Promise<Exam> => {
    const res = await api.get(`/exams/${slug}`);
    return unwrap(res);
  },

  startAttempt: async (examId: string): Promise<ExamDelivery> => {
    const res = await api.post(`/exams/${examId}/start`);
    return unwrap(res);
  },

  submitExam: async (data: ExamSubmitRequest): Promise<ExamResult> => {
    const res = await api.post("/exams/submit", data);
    return unwrap(res);
  },

  getMyAttempts: async (examId?: string): Promise<ExamAttempt[]> => {
    const res = await api.get("/me/exam-attempts", { params: { examId } });
    return unwrap(res);
  },

  getResult: async (attemptId: string): Promise<ExamResult> => {
    const res = await api.get(`/exam-attempts/${attemptId}/result`);
    return unwrap(res);
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  adminList: async (params?: PaginationParams): Promise<PaginatedResponse<Exam>> => {
    const res = await api.get("/admin/exams", { params });
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

  publish: async (id: string): Promise<Exam> => {
    const res = await api.post(`/admin/exams/${id}/publish`);
    return unwrap(res);
  },

  archive: async (id: string): Promise<Exam> => {
    const res = await api.post(`/admin/exams/${id}/archive`);
    return unwrap(res);
  },

  getQuestions: async (examId: string): Promise<QuestionAdmin[]> => {
    const res = await api.get(`/admin/exams/${examId}/questions`);
    return unwrap(res);
  },

  createQuestion: async (data: CreateQuestionRequest): Promise<QuestionAdmin> => {
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

  getAttempts: async (params?: PaginationParams & { examId?: string }): Promise<PaginatedResponse<ExamAttempt>> => {
    const res = await api.get("/admin/exam-attempts", { params });
    return unwrap(res);
  },
};
