import { api, unwrap } from "./api";
import type { User, UserRole, PaginatedResponse, PaginationParams } from "@/types";

export const usersApi = {
  list: async (params?: PaginationParams & { role?: UserRole; isActive?: boolean }): Promise<PaginatedResponse<User>> => {
    const res = await api.get("/admin/users", { params });
    return unwrap(res);
  },

  getById: async (id: string): Promise<User> => {
    const res = await api.get(`/admin/users/${id}`);
    return unwrap(res);
  },

  updateRole: async (id: string, role: UserRole): Promise<User> => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return unwrap(res);
  },

  setActive: async (id: string, isActive: boolean): Promise<User> => {
    const res = await api.put(`/admin/users/${id}/active`, { isActive });
    return unwrap(res);
  },
};
