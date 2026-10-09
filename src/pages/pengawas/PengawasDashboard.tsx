import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../../components/common/Sidebar";
import { LiveCountOverview } from "../../components/pengawas/LiveCountOverview";
import { HouseQuotaMonitor } from "../../components/pengawas/HouseQuotaMonitor";
import { AuditLogViewer } from "../../components/pengawas/AuditLogViewer";
import { AdminOverviewDashboard } from "../../components/admin/AdminOverviewDashboard";

export const PengawasDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || localStorage.getItem("pengawas_tab") || "dashboard";
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
    localStorage.setItem("pengawas_tab", tab);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
        {activeTab === "dashboard" && <AdminOverviewDashboard onNavigateTab={setActiveTab} />}
        {activeTab === "live-count" && <LiveCountOverview />}
        {activeTab === "audit" && <AuditLogViewer />}
        {activeTab === "houses" && <HouseQuotaMonitor />}
      </main>
    </div>
  );
};