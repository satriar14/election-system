import api from "./api";
import type { ApiResponse, Election, ElectionStatus } from "../types";

export interface CreateElectionInput {
  title: string;
  description?: string;
  status?: ElectionStatus;
  startAt?: string | null;
  endAt?: string | null;
}

export interface ResetElectionResponse {
  success: boolean;
  message: string;
  data?: {
    deletedCandidates: number;
    deletedVotes: number;
  };
}

export const electionService = {
  getElections: async (): Promise<ApiResponse<Election[]>> => {
    const response = await api.get("/elections");
    return response.data;
  },

  getElectionById: async (id: string): Promise<ApiResponse<Election>> => {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  },

  createElection: async (data: CreateElectionInput): Promise<ApiResponse<Election>> => {
    const response = await api.post("/elections", data);
    return response.data;
  },

  updateElection: async (id: string, data: Partial<CreateElectionInput>): Promise<ApiResponse<Election>> => {
    const response = await api.put(`/elections/${id}`, data);
    return response.data;
  },

  deleteElection: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/elections/${id}`);
    return response.data;
  },
  resetElection: async (): Promise<ResetElectionResponse> => {
    const res = await api.post("/elections/reset");
    return res.data;
  },
};
