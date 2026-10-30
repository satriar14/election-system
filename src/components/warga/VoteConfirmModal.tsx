import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import type { Candidate } from "../../types";
import { Vote, AlertTriangle, CheckCircle, User, AlertCircle } from "lucide-react";

interface VoteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (voterName: string) => void;
  candidate: Candidate | null;
  block: string;
  houseNumber: string;
  initialOwnerName?: string | null;
  loading?: boolean;
}

export const VoteConfirmModal: React.FC<VoteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  candidate,
  block,
  houseNumber,
  initialOwnerName = "",
  loading = false,
}) => {
  const [voterName, setVoterName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVoterName(initialOwnerName || "");
      setError(null);
    }
  }, [isOpen, initialOwnerName]);

  if (!candidate) return null;

  const handleConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voterName.trim()) {
      setError("Nama calon pemilih / pemilik rumah wajib diisi.");
      return;
    }
    setError(null);
    onConfirm(voterName.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Suara Voting Anda">
      <form onSubmit={handleConfirm} className="space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-2 border border-sky-100 shadow-xs">
          <Vote className="w-7 h-7" />
        </div>

        <h4 className="text-base font-black text-slate-900">
          Apakah Anda yakin memilih Paslon ini?
        </h4>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Alamat Pemilih:</span>
            <span className="font-bold text-slate-900">Blok {block} No. {houseNumber}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Kandidat Dipilih:</span>
            <span className="font-black text-sky-600">{candidate.name}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="text-left space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Nama<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={voterName}
              onChange={(e) => {
                setVoterName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Masukkan nama Anda (misal: Bpk. Bambang)"
              required
              disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold text-slate-800"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Wajib diisi untuk verifikasi hak pilih dan pencatatan pemilik rumah.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] text-left flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>Suara yang telah dimasukkan tidak dapat diubah kembali. Pastikan pilihan Anda sudah benar.</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !voterName.trim()}
            className="px-6 py-2.5 text-xs font-extrabold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim Suara...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Ya, Kirim Suara Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
