import React, { useState, useEffect } from "react";
import { votingService } from "../../services/voting.service";
import type { ElectionResultResponse } from "../../types";
import { LiveCountSkeleton } from "../common/Skeleton";
import { RefreshCw, ShieldAlert } from "lucide-react";

export const LiveCountOverview: React.FC = () => {
  const [resultData, setResultData] = useState<ElectionResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLiveData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const activeRes = await votingService.getActiveElection();
      if (activeRes.success && activeRes.data) {
        const resultsRes = await votingService.getElectionResults(activeRes.data.id);
        if (resultsRes.success && resultsRes.data) {
          setResultData(resultsRes.data);
        }
      } else {
        setErrorMsg(activeRes.message || "Tidak ada pemilihan yang sedang berlangsung");
        setResultData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Belum ada agenda pemilihan yang sedang berlangsung");
      setResultData(null);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">RealTime Vote Counting</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus perolehan suara warga secara langsung dan independen.
          </p>
        </div>

        <button
          onClick={fetchLiveData}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${isLoading ? "animate-spin" : ""}`} />
          <span>Perbarui Data ({lastUpdated.toLocaleTimeString("id-ID")})</span>
        </button>
      </div>

      {isLoading && !resultData ? (
        <LiveCountSkeleton />
      ) : errorMsg || !resultData ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-xs">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada pemilihan aktif</h4>
          <p className="text-xs text-slate-400 mt-1">{errorMsg || "Saat ini belum ada pemilihan berstatus ONGOING."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Election Info & Total Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Agenda Pemilihan</span>
              <h3 className="text-lg font-bold text-slate-900">{resultData.election.title}</h3>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-sky-50 border border-sky-100 text-center">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Total Suara Masuk</span>
              <span className="text-2xl font-black text-sky-600">{resultData.totalVotes} Suara</span>
            </div>
          </div>

          {/* Candidates Progress Bars */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {resultData.candidates.map((cand, idx) => (
              <div key={cand.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black text-lg">
                      0{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 break-words">{cand.name}</h4>
                      <span className="text-xs font-semibold text-slate-500">{cand.voteCount} Suara Perolehan</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-sky-600">{cand.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-700 rounded-full"
                    style={{ width: `${cand.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
