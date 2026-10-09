import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Home,
  Activity,
  Award,
  BarChart3,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Vote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const handleTabClick = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navContent = (
    <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
      <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
        Menu Utama
      </p>

      <button
        onClick={() => handleTabClick("dashboard")}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          activeTab === "dashboard"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 ${activeTab === "dashboard" ? "text-white" : "text-slate-500"}`} />
        <span>Dashboard</span>
      </button>

      {role === "SUPERADMIN" && (
        <>
          <button
            onClick={() => handleTabClick("users")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "users"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === "users" ? "text-white" : "text-slate-500"}`} />
            <span>Kelola Pengguna</span>
          </button>

          <button
            onClick={() => handleTabClick("audit")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "audit"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === "audit" ? "text-white" : "text-slate-500"}`} />
            <span>Audit Log Sistem</span>
          </button>
        </>
      )}

      {(role === "SUPERADMIN" || role === "ADMIN") && (
        <>
          <button
            onClick={() => handleTabClick("candidates")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "candidates"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Award className={`w-4 h-4 ${activeTab === "candidates" ? "text-white" : "text-slate-500"}`} />
            <span>Kelola Kandidat</span>
          </button>

          <button
            onClick={() => handleTabClick("houses")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "houses"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === "houses" ? "text-white" : "text-slate-500"}`} />
            <span>Kuota Voting</span>
          </button>
        </>
      )}

      {(role === "SUPERADMIN" || role === "ADMIN" || role === "PENGAWAS") && (
        <>
          {role === "PENGAWAS" && (
            <>
              <button
                onClick={() => handleTabClick("houses")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "houses"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === "houses" ? "text-white" : "text-slate-500"}`} />
                <span>Kuota Voting</span>
              </button>
              <button
                onClick={() => handleTabClick("audit")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "audit"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Activity className={`w-4 h-4 ${activeTab === "audit" ? "text-white" : "text-slate-500"}`} />
                <span>Audit Log Sistem</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleTabClick("live-count")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "live-count"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === "live-count" ? "text-white" : "text-slate-500"}`} />
            <span>Monitoring Live Vote</span>
          </button>
        </>
      )}
    </div>
  );

  const footerContent = (
    <div className="pt-4 border-t border-slate-200 mt-auto">
      <div className="flex items-center gap-3 px-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
          <UserIcon className="w-5 h-5" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-bold text-slate-800 truncate">
            {user.name || "Pengguna"}
          </span>
          <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded w-fit border border-sky-100 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {role}
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 text-sm font-semibold transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar Akun</span>
      </button>
    </div>
  );

  return (
    <>
      <div className="md:hidden bg-white border-b border-slate-200 p-3 flex items-center justify-between sticky top-0 z-30 shadow-sm w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">Web Voting</span>
          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-bold rounded-full">
            {activeTab}
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-all"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full p-5 flex flex-col shadow-2xl z-10 animate-slide-in-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <span className="text-lg font-black text-slate-900 tracking-tight">Web Voting</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>

            {footerContent}
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white text-slate-700 h-[calc(100vh)] p-4 flex-col border-r border-slate-200 shrink-0 sticky top-0">
        <div className="flex items-center gap-2 px-2 mb-8 h-10">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">
            <Vote/>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">Web Voting</span>
        </div>

        {navContent}

        {footerContent}
      </aside>
    </>
  );
};