import React, { useState, useEffect } from "react";
import type { AuditLog } from "../../types";
import { auditService } from "../../services/audit.service";
import { AuditLogTable } from "../superadmin/AuditLogTable";

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await auditService.getAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Error fetching audit logs for pengawas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return <AuditLogTable logs={logs} isLoading={isLoading} />;
};
