import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../../components/common/Sidebar";
import { LiveCountOverview } from "../../components/pengawas/LiveCountOverview";
import { HouseManagement } from "../../components/admin/HouseManagement";
import { AuditLogViewer } from "../../components/pengawas/AuditLogViewer";
import { AdminOverviewDashboard } from "../../components/admin/AdminOverviewDashboard";

export const PengawasDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") ||
    localStorage.getItem("pengawas_tab") ||
    "dashboard";
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
    localStorage.setItem("pengawas_tab", tab);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <AdminOverviewDashboard onNavigateTab={setActiveTab} />
        )}
        {activeTab === "live-count" && <LiveCountOverview />}
        {activeTab === "audit" && <AuditLogViewer viewerRole="PENGAWAS" />}
        {activeTab === "houses" && <HouseManagement />}
      </main>
    </div>
  );
};
