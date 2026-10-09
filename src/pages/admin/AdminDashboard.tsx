import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../../components/common/Sidebar";
import { CandidateManagement } from "../../components/admin/CandidateManagement";
import { HouseManagement } from "../../components/admin/HouseManagement";
import { LiveCountOverview } from "../../components/pengawas/LiveCountOverview";
import { AdminOverviewDashboard } from "../../components/admin/AdminOverviewDashboard";

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || localStorage.getItem("admin_tab") || "dashboard";
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
    localStorage.setItem("admin_tab", tab);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
        {activeTab === "dashboard" && <AdminOverviewDashboard onNavigateTab={setActiveTab} />}
        {activeTab === "candidates" && <CandidateManagement />}
        {activeTab === "houses" && <HouseManagement />}
        {activeTab === "live-count" && <LiveCountOverview />}
      </main>
    </div>
  );
};