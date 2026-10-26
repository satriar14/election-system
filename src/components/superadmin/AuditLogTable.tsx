import React, { useState, useEffect, useMemo } from "react";
import type { AuditLog } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { TableSkeleton } from "../common/Skeleton";
import { Search, Calendar, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  viewerRole?: string;
}

const ITEMS_PER_PAGE = 10;

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading,
  viewerRole,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const visibleLogs = useMemo(() => {
    if (viewerRole === "SUPERADMIN" || !viewerRole) {
      return logs;
    }
    return logs.filter((log) => log.user?.role !== "SUPERADMIN");
  }, [logs, viewerRole]);

  const filteredLogs = useMemo(() => {
    return visibleLogs.filter((log) => {
      const term = searchTerm.toLowerCase();
      const actionMatch = log.action.toLowerCase().includes(term);
      const detailsMatch = log.details?.toLowerCase().includes(term);
      const userMatch =
        log.user?.name.toLowerCase().includes(term) ||
        log.user?.email.toLowerCase().includes(term);
      const entityMatch = log.entity?.toLowerCase().includes(term);
      return actionMatch || detailsMatch || userMatch || entityMatch;
    });
  }, [visibleLogs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }
    return pages;
  };

  const startItem =
    filteredLogs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl border border-sky-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Audit Log Aktivitas Sistem
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan Jejak Aktivitas dan Perubahan Data oleh Pengurus
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari log atau pengurus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 text-[11px]">
            <tr>
              <th className="px-6 py-3.5">Waktu</th>
              <th className="px-6 py-3.5">Pengurus</th>
              <th className="px-6 py-3.5">Aksi</th>
              <th className="px-6 py-3.5">Entitas</th>
              <th className="px-6 py-3.5">Detail Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Belum ada catatan audit log yang cocok.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs border border-sky-100 shrink-0">
                        {log.user?.name.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate max-w-[150px]">
                          {log.user?.name || "Pengguna"}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {log.user?.email}
                        </div>
                      </div>
                      {log.user?.role && (
                        <StatusBadge status={log.user.role} type="role" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === "CREATE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : log.action === "UPDATE"
                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                          : log.action === "DELETE"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {log.entity || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-600 max-w-md break-words">
                    {log.details || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredLogs.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500">
            Menampilkan{" "}
            <span className="font-bold text-slate-700">{startItem}</span> -{" "}
            <span className="font-bold text-slate-700">{endItem}</span> dari{" "}
            <span className="font-bold text-slate-700">
              {filteredLogs.length}
            </span>{" "}
            log
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-2 text-slate-400 text-xs font-bold">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};