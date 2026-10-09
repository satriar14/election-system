import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import type { House } from "../../types";
import { houseService } from "../../services/house.service";
import { useToast } from "../../context/ToastContext";
import { Home, Hash, Users, AlertCircle } from "lucide-react";

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  houseToEdit?: House | null;
}

export const HouseModal: React.FC<HouseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  houseToEdit,
}) => {
  const { toast } = useToast();
  const [block, setBlock] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [voterQuota, setVoterQuota] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (houseToEdit) {
      setBlock(houseToEdit.block || "");
      setHouseNumber(houseToEdit.houseNumber || "");
      setVoterQuota(houseToEdit.voterQuota || 1);
    } else {
      setBlock("A");
      setHouseNumber("");
      setVoterQuota(1);
    }
    setError(null);
  }, [houseToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!block.trim() || !houseNumber.trim()) {
      setError("Blok dan nomor rumah wajib diisi");
      return;
    }

    if (voterQuota < 1) {
      setError("Kuota hak pilih minimal 1");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        block: block.trim().toUpperCase(),
        houseNumber: houseNumber.trim(),
        voterQuota: Number(voterQuota),
      };

      if (houseToEdit) {
        await houseService.updateHouse(houseToEdit.id, payload);
        toast.success("Data rumah berhasil diperbarui!");
      } else {
        await houseService.createHouse(payload);
        toast.success("Data rumah baru berhasil ditambahkan!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Gagal menyimpan data rumah";
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
      title={houseToEdit ? "Edit Rumah" : "Tambah Data Rumah"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Blok Rumah <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value.toUpperCase())}
                placeholder="Misal: A, B, C"
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Rumah <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Misal: 12, 05B"
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Kuota Hak Pilih Per Rumah <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min={1}
              max={10}
              value={voterQuota}
              onChange={(e) => setVoterQuota(parseInt(e.target.value) || 1)}
              required
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Jumlah suara / anggota keluarga berhak memilih di alamat rumah ini.
          </p>
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
            {loading ? "Menyimpan..." : houseToEdit ? "Perbarui Rumah" : "Tambah Rumah"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
