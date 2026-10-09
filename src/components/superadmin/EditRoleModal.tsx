import React, { useState } from "react";
import { Modal } from "../common/Modal";
import type { User, UserRole } from "../../types";
import { userService } from "../../services/user.service";
import { useToast } from "../../context/ToastContext";
import { Shield, AlertCircle } from "lucide-react";

interface EditRoleModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await userService.updateUserRole(user.id, selectedRole);
      if (res.success) {
        toast.success(`Role ${user.name} berhasil diubah ke ${selectedRole}!`);
        onSuccess();
        onClose();
      } else {
        const errMsg = res.message || "Gagal mengubah role pengguna";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan pada server";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ubah Role Pengguna: ${user.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pengguna
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium">
            {user.name} ({user.email})
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Role Baru
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
            >
              <option value="PENGAWAS">PENGAWAS</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? "Menyimpan..." : "Simpan Role"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
