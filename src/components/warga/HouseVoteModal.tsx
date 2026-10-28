import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "../common/Modal";
import type { Candidate, Election } from "../../types";
import { votingService } from "../../services/voting.service";
import type { CastVoteResponse } from "../../services/voting.service";
import { Home, Hash, Vote, AlertCircle, ShieldCheck, User } from "lucide-react";

interface HouseVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  election: Election | null;
  onVoteSuccess: (data: CastVoteResponse) => void;
}

export const HouseVoteModal: React.FC<HouseVoteModalProps> = ({
  isOpen,
  onClose,
  candidate,
  election,
  onVoteSuccess,
}) => {
  const [block, setBlock] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Saat modal ditutup, batalkan request yang masih berjalan dan hentikan loading
  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [isOpen]);

  if (!candidate || !election) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanBlock = block.trim().toUpperCase();
    const cleanHouse = houseNumber.trim();
    const cleanOwner = ownerName.trim();

    if (!cleanBlock || !cleanHouse || !cleanOwner) {
      setError("Mohon isi Blok, Nomor Rumah, dan Nama Pemilih Anda.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      const verifyRes = await votingService.verifyHouse(cleanBlock, cleanHouse, controller.signal);
      if (!verifyRes.success || !verifyRes.data) {
        setError(verifyRes.message || "Nomor rumah tidak terdaftar atau kuota suara telah habis.");
        setLoading(false);
        return;
      }

      if (verifyRes.data.remainingQuota <= 0) {
        setError("Kuota hak pilih untuk alamat rumah ini sudah habis terpakai.");
        setLoading(false);
        return;
      }

      const voteRes = await votingService.castVote({
        block: cleanBlock,
        houseNumber: cleanHouse,
        candidateId: candidate.id,
        electionId: election.id,
        ownerName: cleanOwner,
      }, controller.signal);

      if (voteRes.success && voteRes.data) {
        setBlock("");
        setHouseNumber("");
        setOwnerName("");
        onVoteSuccess(voteRes.data);
      } else {
        setError(voteRes.message || "Gagal menyimpan suara voting.");
      }
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err.response?.data?.message || "Verifikasi atau pengiriman suara gagal. Pastikan alamat rumah terdaftar.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Masukan Nomor dan Blok Rumah Anda">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-black text-sky-600">
            {candidate.photo ? (
              <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
            ) : (
              candidate.name.charAt(0)
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
              Kandidat Pilihan Anda
            </span>
            <h4 className="text-sm font-black text-slate-900 leading-tight">{candidate.name}</h4>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Masukkan Alamat Rumah terdaftar untuk memverifikasi hak pilih Anda.</span>
        </div>

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
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold text-slate-800 uppercase"
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
                placeholder="Misal: 12, 05"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Calon Pemilih / Pemilik Rumah <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Misal: Bpk. Bambang / Nama Pemilih"
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold text-slate-800"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Wajib diisi untuk verifikasi hak pilih dan pencatatan pemilik rumah.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses Voting...</span>
              </>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                <span>Kirim Suara Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
