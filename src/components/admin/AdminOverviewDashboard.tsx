import React, { useState, useEffect } from "react";
import { votingService } from "../../services/voting.service";
import { houseService } from "../../services/house.service";
import { candidateService } from "../../services/candidate.service";
import type { ElectionResultResponse, House, Candidate } from "../../types";
import {
  Award,
  Home,
  Vote,
  RefreshCw,
  TrendingUp,
  PieChart as PieIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdminOverviewDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({ onNavigateTab }) => {
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState<ElectionResultResponse | null>(null);
  const [trendData, setTrendData] = useState<{ date: string; label: string; suara: number; kumulatif: number }[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [activeRes, housesRes, candidatesRes] = await Promise.all([
        votingService.getActiveElection().catch(() => ({ success: false, data: null })),
        houseService.getHouses().catch(() => ({ success: false, data: [] })),
        candidateService.getAllCandidates().catch(() => ({ success: false, data: [] })),
      ]);

      if (activeRes.success && activeRes.data) {
        const [resultsRes, trendRes] = await Promise.all([
          votingService.getElectionResults(activeRes.data.id).catch(() => ({ success: false, data: null })),
          votingService.getVoteTrend(activeRes.data.id).catch(() => ({ success: false, data: [] })),
        ]);
        if (resultsRes.success && resultsRes.data) setResultsData(resultsRes.data);
        if (trendRes.success && trendRes.data) setTrendData(trendRes.data);
      }

      if (housesRes.success && housesRes.data) setHouses(housesRes.data);
      if (candidatesRes.success && candidatesRes.data) setCandidates(candidatesRes.data);
    } catch (err) {
      console.error("Dashboard overview error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const totalQuota = houses.reduce((acc, h) => acc + h.voterQuota, 0);
  const totalVotesCast =
    resultsData?.totalVotes ?? houses.reduce((acc, h) => acc + (h.usedQuota || 0), 0);
  const participationRate =
    totalQuota > 0 ? Math.min(Math.round((totalVotesCast / totalQuota) * 100), 100) : 0;

  const COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#6366f1"];

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Dashboard Ringkasan System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau ringkasan statistik Kuota Voting, kandidat, realtime perolehan suara, dan aktivitas pengurus secara langsung.
          </p>
        </div>
        <button
          onClick={fetchOverviewData}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 text-sky-500 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          title="Total DPT Rumah"
          value={`${houses.length} Rumah`}
          sub={`${totalQuota} Hak Pilih terdaftar`}
          icon={<Home className="text-sky-600" />}
          bg="bg-sky-50"
          onClick={() => onNavigateTab("houses")}
        />
        <StatCard
          title="Paslon Kandidat"
          value={`${candidates.length} Paslon`}
          sub="Aktif dalam pemilihan"
          icon={<Award className="text-indigo-600" />}
          bg="bg-indigo-50"
          onClick={() => onNavigateTab("candidates")}
        />
        <StatCard
          title="Suara Masuk"
          value={`${totalVotesCast} Suara`}
          sub={`${participationRate}% partisipasi warga`}
          icon={<Vote className="text-emerald-600" />}
          bg="bg-emerald-50"
          onClick={() => onNavigateTab("live-count")}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="min-w-0 xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-sky-500" />
              Suara Partisipasi warga
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrendData}>
                <defs>
                  <linearGradient id="colorSuara" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="suara"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSuara)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-orange-500" />
            Hasil Perolehan Suara
          </h3>

          <div className="flex-1 flex items-center justify-center min-h-[220px] relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={voteResultData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {voteResultData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-black text-slate-800">100%</span>
              <span className="text-[11px] text-slate-400 font-semibold">Total Suara</span>
            </div>
          </div>

          <div className="space-y-2.5 mt-4">
            {voteResultData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs sm:text-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-slate-600 font-semibold truncate">{item.name}</span>
                </div>
                <span className="font-black text-slate-800 shrink-0 whitespace-nowrap">{item.percentage}% ({item.value} Suara)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-sky-500" />
              <span>Ringkasan Kuota Voting</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi kuota suara per alamat rumah yang terdaftar dalam sistem
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("houses")}
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
          >
            <span>Kelola Kuota Voting</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="px-5 py-3">Blok / No. Rumah</th>
                <th className="px-5 py-3">Hak Pilih Mula</th>
                <th className="px-5 py-3">Suara Digunakan</th>
                <th className="px-5 py-3">Sisa Kuota</th>
                <th className="px-5 py-3 text-right">Status Partisipasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {houses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-400 italic">
                    Belum ada data DPT rumah terdaftar.
                  </td>
                </tr>
              ) : (
                houses.slice(0, 5).map((h) => {
                  const used = h.usedQuota ?? 0;
                  const isFullyUsed = used >= h.voterQuota;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-900">
                        Blok {h.block} No. {h.houseNumber}
                      </td>
                      <td className="px-5 py-3 font-semibold">{h.voterQuota} Hak Pilih</td>
                      <td className="px-5 py-3 font-bold text-sky-600">{used} Suara</td>
                      <td className="px-5 py-3 font-bold text-slate-700">
                        {h.remainingQuota ?? h.voterQuota - used} Sisa
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            isFullyUsed
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                              : used > 0
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isFullyUsed
                            ? "LUNAS VOTING"
                            : used > 0
                            ? "PARTISIPASI PARSIAL"
                            : "BELUM MEMILIH"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  sub,
  icon,
  bg,
  onClick,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all ${
      onClick ? "cursor-pointer group" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </span>
      <div
        className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-all`}
      >
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
    <p className="text-xs text-slate-500 mt-1 font-semibold">{sub}</p>
  </div>
);
