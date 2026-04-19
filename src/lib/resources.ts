import type {
  Resource,
  ResourceDetail,
  Category,
  Enrollment,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
  PaginatedResponse,
  PaginationParams,
} from "@/types";
import { api, unwrap } from "./api";

export const resourcesApi = {
  // ─── Public ─────────────────────────────────────────────────────────────────

  list: async (
    params?: PaginationParams & ResourceFilters
  ): Promise<PaginatedResponse<Resource>> => {
    const res = await api.get("/resources", { params });
    return unwrap(res);
  },

  getBySlug: async (slug: string): Promise<ResourceDetail> => {
    const res = await api.get(`/resources/${slug}`);
    return unwrap(res);
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get("/categories");
    return unwrap(res);
  },

  // ─── Enrollment ──────────────────────────────────────────────────────────────

  enroll: async (resourceId: string): Promise<Enrollment> => {
    const res = await api.post(`/resources/${resourceId}/enroll`);
    return unwrap(res);
  },

  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const res = await api.get("/me/enrollments");
    return unwrap(res);
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────

  adminList: async (
    params?: PaginationParams & ResourceFilters
  ): Promise<PaginatedResponse<Resource>> => {
    const res = await api.get("/admin/resources", { params });
    return unwrap(res);
  },

  create: async (data: CreateResourceRequest): Promise<Resource> => {
    const res = await api.post("/admin/resources", data);
    return unwrap(res);
  },

  update: async (
    id: string,
    data: UpdateResourceRequest
  ): Promise<Resource> => {
    const res = await api.put(`/admin/resources/${id}`, data);
    return unwrap(res);
  },

  publish: async (id: string): Promise<Resource> => {
    const res = await api.post(`/admin/resources/${id}/publish`);
    return unwrap(res);
  },

  archive: async (id: string): Promise<Resource> => {
    const res = await api.post(`/admin/resources/${id}/archive`);
    return unwrap(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/resources/${id}`);
    unwrap(res);
  },

  // ─── Categories Admin ─────────────────────────────────────────────────────────

  createCategory: async (data: {
    name: string;
    description?: string;
  }): Promise<Category> => {
    const res = await api.post("/admin/categories", data);
    return unwrap(res);
  },

  updateCategory: async (
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<Category> => {
    const res = await api.put(`/admin/categories/${id}`, data);
    return unwrap(res);
  },

  deleteCategory: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/categories/${id}`);
    unwrap(res);
  },
};
