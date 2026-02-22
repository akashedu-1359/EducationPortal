import { api, unwrap } from "./api";

export interface Certificate {
  id: string;
  userId: string;
  examId: string;
  examTitle: string;
  userName: string;
  issuedAt: string;
  expiresAt?: string;
  downloadUrl: string;    // pre-signed S3 URL
  verificationUrl: string;
  verificationCode: string;
}

export const certificatesApi = {
  getMyCertificates: async (): Promise<Certificate[]> => {
    const res = await api.get("/me/certificates");
    return unwrap(res);
  },

  getDownloadUrl: async (certificateId: string): Promise<{ url: string }> => {
    const res = await api.get(`/certificates/${certificateId}/download`);
    return unwrap(res);
  },

  verify: async (code: string): Promise<Certificate | null> => {
    const res = await api.get(`/certificates/verify/${code}`);
    return unwrap(res);
  },

  // Admin
  adminList: async (): Promise<Certificate[]> => {
    const res = await api.get("/admin/certificates");
    return unwrap(res);
  },

  revoke: async (id: string): Promise<void> => {
    const res = await api.post(`/admin/certificates/${id}/revoke`);
    unwrap(res);
  },
};
