import React, { useState, useEffect } from "react";
import { votingService } from "../../services/voting.service";
import type { ElectionResultResponse } from "../../types";
import { LiveCountSkeleton } from "../common/Skeleton";
import { RefreshCw, Vote } from "lucide-react";

export const LiveResultsView: React.FC = () => {
  const [results, setResults] = useState<ElectionResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchResults = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const activeRes = await votingService.getActiveElection();
      if (activeRes.success && activeRes.data) {
        const resData = await votingService.getElectionResults(activeRes.data.id);
        if (resData.success && resData.data) {
          setResults(resData.data);
        }
      } else {
        setErrorMsg("Belum ada agenda pemilihan yang sedang berlangsung.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Belum ada agenda pemilihan aktif.");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-extrabold mb-3 border border-sky-100">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            <span>TRANSPARANSI REAL-TIME</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hasil Perolehan Suara</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data diperbarui secara otomatis setiap beberapa detik dari server E-Voting.
          </p>
        </div>

        <button
          onClick={fetchResults}
          className="px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 text-sky-500 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan ({lastUpdated.toLocaleTimeString("id-ID")})</span>
        </button>
      </div>

      {loading && !results ? (
        <LiveCountSkeleton />
      ) : errorMsg || !results ? (
        <div className="bg-white p-16 rounded-3xl text-center border border-slate-100 shadow-xs">
          <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak Ada Pemilihan Berlangsung</h3>
          <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Judul Pemilihan</span>
              <h2 className="text-xl font-black text-slate-900">{results.election.title}</h2>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-sky-50 border border-sky-100 text-center">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">Total Suara Masuk</span>
              <span className="text-2xl font-black text-sky-600">{results.totalVotes} Suara</span>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.candidates.map((cand, idx) => (
              <div key={cand.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black text-lg">
                      0{idx + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{cand.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">{cand.voteCount} Suara Perolehan</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-sky-600">{cand.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-700"
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
