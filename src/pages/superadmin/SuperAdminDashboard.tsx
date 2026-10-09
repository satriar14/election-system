import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../../components/common/Sidebar";
import { UserManagementTable } from "../../components/superadmin/UserManagementTable";
import { AuditLogTable } from "../../components/superadmin/AuditLogTable";
import { CandidateManagement } from "../../components/admin/CandidateManagement";
import { HouseManagement } from "../../components/admin/HouseManagement";
import { LiveCountOverview } from "../../components/pengawas/LiveCountOverview";
import { votingService } from "../../services/voting.service";
import { houseService } from "../../services/house.service";
import { candidateService } from "../../services/candidate.service";
import { auditService } from "../../services/audit.service";
import type { AuditLog, ElectionResultResponse, House, Candidate } from "../../types";

import { 
  Users, 
  Vote, 
  Home, 
  Activity, 
  TrendingUp, 
  PieChart as PieIcon,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export const SuperAdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || localStorage.getItem("superadmin_tab") || "dashboard";
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
    localStorage.setItem("superadmin_tab", tab);
  };
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [resultsData, setResultsData] = useState<ElectionResultResponse | null>(null);
  const [trendData, setTrendData] = useState<{ date: string; label: string; suara: number; kumulatif: number }[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoadingLogs(true);
      const [auditRes, activeRes, housesRes, candidatesRes] = await Promise.all([
        auditService.getAuditLogs().catch(() => ({ success: false, data: [] })),
        votingService.getActiveElection().catch(() => ({ success: false, data: null })),
        houseService.getHouses().catch(() => ({ success: false, data: [] })),
        candidateService.getAllCandidates().catch(() => ({ success: false, data: [] })),
      ]);

      if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data);
      if (housesRes.success && housesRes.data) setHouses(housesRes.data);
      if (candidatesRes.success && candidatesRes.data) setCandidates(candidatesRes.data);

      if (activeRes.success && activeRes.data) {
        const [resultsRes, trendRes] = await Promise.all([
          votingService.getElectionResults(activeRes.data.id).catch(() => ({ success: false, data: null })),
          votingService.getVoteTrend(activeRes.data.id).catch(() => ({ success: false, data: [] })),
        ]);
        if (resultsRes.success && resultsRes.data) setResultsData(resultsRes.data);
        if (trendRes.success && trendRes.data) setTrendData(trendRes.data);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const totalQuota = houses.reduce((acc, h) => acc + h.voterQuota, 0);
  const totalVotesCast =
    resultsData?.totalVotes ?? houses.reduce((acc, h) => acc + (h.usedQuota || 0), 0);
  const participationRate =
    totalQuota > 0 ? Math.min(Math.round((totalVotesCast / totalQuota) * 100), 100) : 0;

  const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#6366F1"];

  const voteResultData =
    resultsData && resultsData.candidates.length > 0
      ? resultsData.candidates.map((c, idx) => ({
          name: c.name,
          value: c.voteCount || 0,
          percentage: c.percentage || 0,
          color: COLORS[idx % COLORS.length],
        }))
      : candidates.map((c, idx) => ({
          name: c.name,
          value: 0,
          percentage: 0,
          color: COLORS[idx % COLORS.length],
        }));

  const defaultParticipationData = [
    { label: "Sen", suara: 0 },
    { label: "Sel", suara: 0 },
    { label: "Rab", suara: 0 },
    { label: "Kam", suara: 0 },
    { label: "Jum", suara: 0 },
    { label: "Sab", suara: 0 },
    { label: "Min", suara: 0 },
  ];

  const chartTrendData = trendData.length > 0 ? trendData : defaultParticipationData;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
        
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Monitoring</h1>
                <p className="text-slate-500 text-sm mt-1">Pantau aktivitas pemilihan dan data warga secara realtime.</p>
              </div>
              <button 
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm"
              >
                Refresh Data
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total DPT Rumah" value={`${houses.length} Rumah`} sub={`${totalQuota} Hak Pilih terdaftar`} icon={<Home className="text-blue-600" />} bg="bg-blue-50" />
              <StatCard title="Paslon Kandidat" value={`${candidates.length} Paslon`} sub="Aktif dalam pemilihan" icon={<Users className="text-purple-600" />} bg="bg-purple-50" />
              <StatCard title="Suara Masuk" value={`${totalVotesCast} Suara`} sub={`${participationRate}% partisipasi warga`} icon={<Vote className="text-green-600" />} bg="bg-green-50" />
              <StatCard title="Aktivitas Sistem" value={`${auditLogs.length} Log`} sub="Aktivitas & jejak perubahan" icon={<Activity className="text-orange-600" />} bg="bg-orange-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500"/> Suara Partisipasi Warga
                    </h3>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartTrendData}>
                      <defs>
                        <linearGradient id="colorSuara" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10}/>
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}}/>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="suara" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSuara)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <PieIcon size={18} className="text-orange-500"/> Hasil Perolehan Suara
                </h3>
                
                <div className="flex-1 flex items-center justify-center min-h-[220px] relative">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={voteResultData} cx="50%" cy="50%" innerRadius="55%" outerRadius="78%" paddingAngle={4} dataKey="value">
                        {voteResultData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-800">100%</span>
                    <span className="text-xs text-slate-400 font-medium">Total Suara</span>
                  </div>
                </div>

                <div className="space-y-2.5 mt-4">
                  {voteResultData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-xs sm:text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-600 font-medium truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 shrink-0 whitespace-nowrap">{item.percentage}% ({item.value} Suara)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Aktivitas Terbaru</h3>
                <button onClick={() => setActiveTab('audit')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  Lihat Semua <ArrowRight size={14}/>
                </button>
              </div>
              
              <div className="space-y-4">
                {auditLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {typeof log.user === 'object' && log.user?.name 
                        ? log.user.name.substring(0, 2).toUpperCase() 
                        : "SA"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {typeof log.user === 'object' ? log.user?.name : (log.user || "Super Admin")}
                      </p>
                      <p className="text-xs text-slate-500">{log.action} - {log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">Belum ada aktivitas.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "users" && <UserManagementTable />}
        {activeTab === "audit" && <AuditLogTable logs={auditLogs} isLoading={loadingLogs} />}
        {activeTab === "candidates" && <CandidateManagement />}
        {activeTab === "houses" && <HouseManagement />}
        {activeTab === "live-count" && <LiveCountOverview />}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, bg }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
    <div className={`p-3 rounded-lg ${bg}`}>
      {icon}
    </div>
  </div>
);