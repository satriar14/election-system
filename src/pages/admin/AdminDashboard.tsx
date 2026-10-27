import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/common/Sidebar";
import { CandidateManagement } from "../../components/admin/CandidateManagement";
import { HouseManagement } from "../../components/admin/HouseManagement";
import { LiveCountOverview } from "../../components/pengawas/LiveCountOverview";
import { AuditLogTable } from "../../components/superadmin/AuditLogTable";
import { AdminOverviewDashboard } from "../../components/admin/AdminOverviewDashboard";
import { auditService } from "../../services/audit.service";
import type { AuditLog } from "../../types";

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (activeTab === "audit") {
      setLoadingLogs(true);
      auditService
        .getAuditLogs()
        .then((res) => {
          if (res.success && res.data) setAuditLogs(res.data);
        })
        .catch(console.error)
        .finally(() => setLoadingLogs(false));
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <AdminOverviewDashboard onNavigateTab={setActiveTab} />
        )}
        {activeTab === "candidates" && <CandidateManagement />}
        {activeTab === "houses" && <HouseManagement />}
        {activeTab === "live-count" && <LiveCountOverview />}
        {activeTab === "audit" && (
          <AuditLogTable
            logs={auditLogs}
            isLoading={loadingLogs}
            viewerRole="ADMIN"
          />
        )}
      </main>
    </div>
  );
};
