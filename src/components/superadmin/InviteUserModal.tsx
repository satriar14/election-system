import React, { useState } from "react";
import { Modal } from "../common/Modal";
import type { UserRole } from "../../types";
import { invitationService } from "../../services/invitation.service";
import { useToast } from "../../context/ToastContext";
import { Mail, Shield, CheckCircle2, AlertCircle } from "lucide-react";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole?: UserRole;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserRole = "SUPERADMIN",
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email) {
      setError("Email wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const response = await invitationService.createInvitation({ email, role });
      if (response.success) {
        const msg = response.message || "Invitation email berhasil dikirim!";
        setSuccessMsg(msg);
        toast.success(msg);
        setEmail("");
        setTimeout(() => {
          setSuccessMsg(null);
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const errMsg = response.message || "Gagal membuat invitation";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat mengirim undang pengurus";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Undang Pengurus Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Alamat Email Pengurus <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pengurus@rt.id"
              required
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Role / Hak Akses <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            >
              {currentUserRole === "SUPERADMIN" && <option value="ADMIN">ADMIN</option>}
              <option value="PENGAWAS">PENGAWAS</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === "ADMIN"
              ? "Admin  memiliki wewenang membuat pemilihan, mengelola data kandidat dan DPT rumah."
              : "Pengawas hanya memiliki akses monitoring real-time dan audit log."}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim Email...</span>
              </>
            ) : (
              <span>Kirim Undangan</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
