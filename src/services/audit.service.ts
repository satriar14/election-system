import api from "./api";
import type { ApiResponse, AuditLog } from "../types";

export const auditService = {
  getAuditLogs: async (): Promise<ApiResponse<AuditLog[]>> => {
    const response = await api.get("/audit-logs");
    return response.data;
  },
};
