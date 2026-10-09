import api from "./api";
import type { ApiResponse, User } from "../types";

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
