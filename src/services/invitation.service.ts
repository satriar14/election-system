import api from "./api";
import type { ApiResponse, UserRole } from "../types";

export interface CreateInvitationInput {
  email: string;
  role: UserRole;
}

export interface AcceptInvitationInput {
  token: string;
  name: string;
  password: string;
}

export const invitationService = {
  createInvitation: async (data: CreateInvitationInput): Promise<ApiResponse<any>> => {
    const response = await api.post("/invitations", data);
    return response.data;
  },

  getInvitationByToken: async (token: string): Promise<ApiResponse<{ email: string; role: UserRole; expiresAt: string }>> => {
    const response = await api.get(`/invitations/verify/${token}`);
    return response.data;
  },

  acceptInvitation: async (data: AcceptInvitationInput): Promise<ApiResponse<{ user: any }>> => {
    const response = await api.post("/invitations/accept", data);
    return response.data;
  },
};
