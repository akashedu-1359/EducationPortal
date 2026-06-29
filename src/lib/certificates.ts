import { api, unwrap } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types";

export interface Certificate {
  id: string;
  userId: string;
  examId: string;
  examTitle: string;
  userName: string;
  issuedAt: string;
  expiresAt?: string;
  downloadUrl: string;
  verificationUrl: string;
  verificationCode: string;
}

export interface AdminCertificate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId: string;
  examTitle: string;
  examAttemptId: string;
  issuedAt: string;
}

export const certificatesApi = {
  getMyCertificates: async (): Promise<Certificate[]> => {
    const res = await api.get("/user/certificates");
    const body = res.data as Certificate[] | { success?: boolean; data?: Certificate[] };
    if (body && typeof body === "object" && "success" in body && body.success) {
      return unwrap(res);
    }
    return Array.isArray(body) ? body : [];
  },

  getDownloadUrl: async (certificateId: string): Promise<{ url: string }> => {
    const res = await api.get(`/user/certificates/${certificateId}/download`);
    const body = res.data as { url?: string } | { success?: boolean; data?: { url: string } };
    if (body && typeof body === "object" && "success" in body && body.success) {
      return unwrap(res);
    }
    return body as { url: string };
  },

  verify: async (code: string): Promise<Certificate | null> => {
    const res = await api.get(`/certificates/verify/${code}`);
    return unwrap(res);
  },

  // Admin
  adminList: async (
    params?: PaginationParams & { search?: string }
  ): Promise<PaginatedResponse<AdminCertificate>> => {
    const res = await api.get("/admin/certificates", {
      params: {
        page: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
      },
    });
    return unwrap(res);
  },

  adminDownloadUrl: async (certificateId: string): Promise<{ url: string }> => {
    const res = await api.get(`/admin/certificates/${certificateId}/download`);
    return unwrap(res);
  },
};
