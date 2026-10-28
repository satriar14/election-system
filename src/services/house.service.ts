import api from "./api";
import type { ApiResponse, House } from "../types";

export interface CreateHouseInput {
  block: string;
  houseNumber: string;
  ownerName?: string | null;
  voterQuota: number;
}

export const houseService = {
  getHouses: async (): Promise<ApiResponse<House[]>> => {
    const response = await api.get("/houses");
    return response.data;
  },

  getHouseById: async (id: string): Promise<ApiResponse<House>> => {
    const response = await api.get(`/houses/${id}`);
    return response.data;
  },

  createHouse: async (data: CreateHouseInput): Promise<ApiResponse<House>> => {
    const response = await api.post("/houses", data);
    return response.data;
  },

  updateHouse: async (id: string, data: Partial<CreateHouseInput>): Promise<ApiResponse<House>> => {
    const response = await api.put(`/houses/${id}`, data);
    return response.data;
  },

  deleteHouse: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/houses/${id}`);
    return response.data;
  },
};
