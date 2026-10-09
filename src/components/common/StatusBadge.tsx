import React from "react";
import type { ElectionStatus, InvitationStatus, UserRole } from "../../types";

interface StatusBadgeProps {
  status?: ElectionStatus | InvitationStatus | UserRole | string;
  type?: "election" | "invitation" | "role";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "election" }) => {
  if (!status) return null;

  let bgClass = "bg-slate-100 text-slate-700";
  let label = status;

  if (type === "election") {
    switch (status) {
      case "DRAFT":
        bgClass = "bg-slate-100 text-slate-600 border border-slate-200";
        label = "DRAFT";
        break;
      case "UPCOMING":
        bgClass = "bg-sky-50 text-sky-600 border border-sky-200";
        label = "AKAN DATANG";
        break;
      case "ONGOING":
        bgClass = "bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold";
        label = "SEDANG BERLANGSUNG";
        break;
      case "COMPLETED":
        bgClass = "bg-indigo-50 text-indigo-600 border border-indigo-200";
        label = "SELESAI";
        break;
      case "CANCELLED":
        bgClass = "bg-rose-50 text-rose-600 border border-rose-200";
        label = "DIBATALKAN";
        break;
    }
  } else if (type === "invitation") {
    switch (status) {
      case "PENDING":
        bgClass = "bg-amber-50 text-amber-600 border border-amber-200";
        label = "MENUNGGU";
        break;
      case "ACCEPTED":
        bgClass = "bg-emerald-50 text-emerald-600 border border-emerald-200";
        label = "DITERIMA";
        break;
      case "EXPIRED":
        bgClass = "bg-rose-50 text-rose-600 border border-rose-200";
        label = "KADALUARSA";
        break;
    }
  } else if (type === "role") {
    switch (status) {
      case "SUPERADMIN":
        bgClass = "bg-sky-50 text-sky-600 font-bold border border-sky-200";
        label = "SUPERADMIN";
        break;
      case "ADMIN":
        bgClass = "bg-sky-50 text-sky-600 font-bold border border-sky-200";
        label = "ADMIN";
        break;
      case "PENGAWAS":
        bgClass = "bg-teal-50 text-teal-700 font-bold border border-teal-200";
        label = "PENGAWAS";
        break;
      case "WARGA":
        bgClass = "bg-slate-100 text-slate-700 font-semibold border border-slate-200";
        label = "WARGA";
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${bgClass}`}>
      {label}
    </span>
  );
};
