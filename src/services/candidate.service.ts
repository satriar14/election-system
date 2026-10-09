import api from "./api";
import type { ApiResponse, Candidate } from "../types";

export interface CreateCandidateInput {
  electionId?: string;
  name: string;
  photo?: string | null;
  vision?: string | null;
  mission?: string | null;
}

export const candidateService = {
  getAllCandidates: async (): Promise<ApiResponse<Candidate[]>> => {
    const response = await api.get("/candidates");
    return response.data;
  },

  getCandidatesByElection: async (electionId: string): Promise<ApiResponse<Candidate[]>> => {
    const response = await api.get(`/candidates/election/${electionId}`);
    return response.data;
  },

  getCandidateById: async (id: string): Promise<ApiResponse<Candidate>> => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  createCandidate: async (data: CreateCandidateInput): Promise<ApiResponse<Candidate>> => {
    const response = await api.post("/candidates", data);
    return response.data;
  },

  updateCandidate: async (id: string, data: Partial<CreateCandidateInput>): Promise<ApiResponse<Candidate>> => {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data;
  },

  deleteCandidate: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};
