import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from "@/types";
import { api, unwrap } from "./api";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", data);
    return unwrap<LoginResponse>(res);
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const { firstName, lastName, ...rest } = data;
    const res = await api.post("/auth/register", {
      ...rest,
      fullName: `${firstName} ${lastName}`.trim(),
    });
    return unwrap<LoginResponse>(res);
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return unwrap<User>(res);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const res = await api.put("/auth/profile", data);
    return unwrap<User>(res);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    const res = await api.put("/auth/change-password", data);
    unwrap(res);
  },

  googleCallback: async (code: string): Promise<LoginResponse> => {
    const res = await api.post("/auth/google", { code });
    return unwrap<LoginResponse>(res);
  },
};
