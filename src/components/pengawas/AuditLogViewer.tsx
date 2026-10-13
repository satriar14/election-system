import React, { useState, useEffect } from "react";
import type { AuditLog } from "../../types";
import { auditService } from "../../services/audit.service";
import { AuditLogTable } from "../superadmin/AuditLogTable";

interface AuditLogViewerProps {
  viewerRole?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  viewerRole,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AuditLogTable
      logs={logs}
      isLoading={isLoading}
      viewerRole={viewerRole || "PENGAWAS"}
    />
  );
};