import { api, unwrap } from "./api";

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalResources: number;
  publishedResources: number;
  totalEnrollments: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalCertificates: number;
  totalExams: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "enrollment" | "purchase" | "exam_passed" | "user_registered";
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface RevenueByDay {
  date: string;
  amount: number;
}

export const analyticsApi = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get("/admin/analytics/summary");
    return unwrap(res);
  },

  getRevenueChart: async (days: number = 30): Promise<RevenueByDay[]> => {
    const res = await api.get("/admin/analytics/revenue", { params: { days } });
    return unwrap(res);
  },

  getEnrollmentChart: async (days: number = 30): Promise<{ date: string; count: number }[]> => {
    const res = await api.get("/admin/analytics/enrollments", { params: { days } });
    return unwrap(res);
  },
};
