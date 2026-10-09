import api from "./api";
import type { ApiResponse, User } from "../types";

export const userService = {
  getUsers: async (role?: string, search?: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>("/users", {
      params: { role, search },
    });
    return response.data;
  },

  updateUserRole: async (id: string, role: string): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/status`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },
};
