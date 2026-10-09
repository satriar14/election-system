import React from "react";
import { Users, ShieldCheck, Activity, Award } from "lucide-react";

interface SuperAdminStatsProps {
  totalUsers?: number;
  totalAuditLogs?: number;
  totalElections?: number;
  activeElections?: number;
}

export const SuperAdminStats: React.FC<SuperAdminStatsProps> = ({
  totalUsers = 0,
  totalAuditLogs = 0,
  totalElections = 0,
  activeElections = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Log Sistem</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalAuditLogs}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pemilihan</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalElections}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pemilihan Aktif</p>
            <h4 className="text-2xl font-black text-sky-600 mt-1">{activeElections}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
