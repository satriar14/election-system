import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "./StatusBadge";
import { Vote, Shield, BarChart2 } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user } = useAuth();



  return (
    <nav className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:bg-sky-600 transition-all">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">E-Voting RT</span>
              <span className="hidden sm:block text-[10px] text-sky-600 font-bold tracking-wider uppercase whitespace-nowrap">Sistem Pemilihan Digital</span>
            </div>
          </Link>

          {/* Navigation links & User Info */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/results"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all border border-sky-100 whitespace-nowrap"
            >
              <BarChart2 className="w-4 h-4 text-sky-500" />
              <span>Hasil Real-Time</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    <StatusBadge status={user.role} type="role" />
                  </div>
                </div>

                
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all"
              >
                <Shield className="w-4 h-4" />
                <span>Masuk Pengurus</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
