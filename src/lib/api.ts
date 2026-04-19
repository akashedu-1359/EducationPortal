import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/config";
import type { ApiResponse } from "@/types";

const BASE_URL = config.apiUrl;

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // send httpOnly refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Token Management (in-memory) ────────────────────────────────────────────

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ─── Request Interceptor — attach Bearer token ────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response Interceptor — silent token refresh on 401 ──────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
          refreshPromise = silentRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — clear auth state
        setAccessToken(null);
        // Import lazily to avoid circular dependency
        const { useAuthStore } = await import("@/store/authStore");
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login?reason=session_expired";
        }
      }
    }

    return Promise.reject(error);
  }
);

async function silentRefresh(): Promise<string | null> {
  const response = await axios.post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
    `${BASE_URL}/api/auth/refresh`,
    {},
    { withCredentials: true }
  );
  return response.data.data.accessToken;
}

// ─── Helper — unwrap ApiResponse envelope ────────────────────────────────────

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message || "An error occurred");
  }
  return response.data.data;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    if (data?.message) return data.message;
    if (data?.errors?.length) return data.errors[0];
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
