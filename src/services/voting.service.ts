import api from "./api";
import type { ApiResponse, Election, ElectionResultResponse, VerifyHouseResponse } from "../types";

export interface CastVoteInput {
  block: string;
  houseNumber: string;
  candidateId: string;
  electionId: string;
  ownerName?: string;
  voterName?: string;
}

export interface CastVoteResponse {
  voteId: string;
  electionId: string;
  candidateId: string;
  candidateName: string;
  block: string;
  houseNumber: string;
  ownerName?: string | null;
  voterQuota: number;
  usedQuota: number;
  remainingQuota: number;
  votedAt: string;
}

export const votingService = {
  verifyHouse: async (block: string, houseNumber: string, signal?: AbortSignal): Promise<ApiResponse<VerifyHouseResponse>> => {
    const response = await api.post("/voting/verify-house", { block, houseNumber }, { signal });
    return response.data;
  },

  getActiveElection: async (): Promise<ApiResponse<Election>> => {
    const response = await api.get("/voting/active-election");
    return response.data;
  },

  castVote: async (data: CastVoteInput, signal?: AbortSignal): Promise<ApiResponse<CastVoteResponse>> => {
    const response = await api.post("/voting/cast-vote", data, { signal });
    return response.data;
  },

  getElectionResults: async (electionId: string): Promise<ApiResponse<ElectionResultResponse>> => {
    const response = await api.get(`/voting/results/${electionId}`);
    return response.data;
  },

  getVoteTrend: async (electionId: string): Promise<ApiResponse<{ date: string; label: string; suara: number; kumulatif: number }[]>> => {
    const response = await api.get(`/voting/vote-trend/${electionId}`);
    return response.data;
  },
};
