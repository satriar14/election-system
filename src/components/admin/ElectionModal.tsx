import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import type { Election, ElectionStatus } from "../../types";
import { electionService } from "../../services/election.service";
import { useToast } from "../../context/ToastContext";
import { Vote, AlertCircle } from "lucide-react";

interface ElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  electionToEdit?: Election | null;
}

export const ElectionModal: React.FC<ElectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  electionToEdit,
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ElectionStatus>("DRAFT");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (electionToEdit) {
      setTitle(electionToEdit.title || "");
      setDescription(electionToEdit.description || "");
      setStatus(electionToEdit.status || "DRAFT");
      setStartAt(
        electionToEdit.startAt
          ? new Date(electionToEdit.startAt).toISOString().slice(0, 16)
          : ""
      );
      setEndAt(
        electionToEdit.endAt
          ? new Date(electionToEdit.endAt).toISOString().slice(0, 16)
          : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setStatus("DRAFT");
      setStartAt("");
      setEndAt("");
    }
    setError(null);
  }, [electionToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Judul pemilihan wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      };

      let response;
      if (electionToEdit) {
        response = await electionService.updateElection(electionToEdit.id, payload);
      } else {
        response = await electionService.createElection(payload);
      }

      if (response.success) {
        toast.success(electionToEdit ? "Berhasil memperbarui data pemilihan!" : "Berhasil membuat pemilihan baru!");
        onSuccess();
        onClose();
      } else {
        const errMsg = response.message || "Gagal menyimpan data pemilihan";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat menyimpan data pemilihan";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={electionToEdit ? "Edit Data Pemilihan RT" : "Tambah Pemilihan RT Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Judul Pemilihan <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Vote className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pemilihan Ketua RT Periode 2026-2029"
              required
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Keterangan</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat mengenai aturan atau catatan pemilihan..."
            rows={3}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Status Pemilihan</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ElectionStatus)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
          >
            <option value="DRAFT">DRAFT (Belum Dipublikasikan)</option>
            <option value="UPCOMING">UPCOMING (Akan Datang)</option>
            <option value="ONGOING">ONGOING (Sedang Berlangsung - Warga Bisa Memilih)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Mulai</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Selesai</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : electionToEdit ? "Perbarui Pemilihan" : "Buat Pemilihan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
