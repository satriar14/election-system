import React, { useState } from "react";
import { UserPlus, Mail, Shield, Info } from "lucide-react";
import { InviteUserModal } from "../superadmin/InviteUserModal";
import { useAuth } from "../../context/AuthContext";

export const InvitationManagement: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl border border-sky-100">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Undang Pengurus RT & Pengawas</h2>
            <p className="text-xs text-slate-500">
              Kirimkan token tautan pendaftaran aman via email bagi rekan pengurus RT atau panitia pengawas.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          <span>Buat Undangan Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Undang Admin Baru</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Admin  memiliki hak penuh mengelola agenda pemilihan, paslon kandidat, dan menginputkan kuota DPT rumah. Undangan berlaku selama 24 jam.
          </p>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="text-xs font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
          >
            Undang Admin  &rarr;
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Undang Tim Pengawas</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pengawas bertugas memantau perolehan live vote counter serta audit log keamanan sistem secara transparan tanpa akses mengubah data.
          </p>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
          >
            Undang Pengawas &rarr;
          </button>
        </div>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {}}
        currentUserRole={user?.role}
      />
    </div>
  );
};
