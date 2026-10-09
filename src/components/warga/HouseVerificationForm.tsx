import React, { useState } from "react";
import type { VerifyHouseResponse } from "../../types";
import { votingService } from "../../services/voting.service";
import { Home, Hash, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

interface HouseVerificationFormProps {
  onVerified: (data: VerifyHouseResponse, block: string, houseNumber: string) => void;
}

export const HouseVerificationForm: React.FC<HouseVerificationFormProps> = ({ onVerified }) => {
  const [block, setBlock] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!block.trim() || !houseNumber.trim()) {
      setError("Mohon isi Blok dan Nomor Rumah Anda secara lengkap.");
      return;
    }

    try {
      setLoading(true);
      const res = await votingService.verifyHouse(block.trim().toUpperCase(), houseNumber.trim());
      if (res.success && res.data) {
        onVerified(res.data, block.trim().toUpperCase(), houseNumber.trim());
      } else {
        setError(res.message || "Nomor rumah tidak terdaftar atau kuota telah habis.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verifikasi gagal. Pastikan nomor rumah Anda terdaftar sebagai DPT.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3 border border-sky-100 shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Verifikasi Rumah</h2>
        <p className="text-xs text-slate-500 mt-1">
          Masukkan Blok dan Nomor Rumah Anda untuk memeriksa hak pilih voting RT.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Blok Rumah <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Home className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value.toUpperCase())}
              placeholder="Contoh: A, B, C"
              required
              className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 uppercase font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Nomor Rumah <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="Contoh: 12, 05"
              required
              className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Memeriksa Hak Pilih...</span>
            </>
          ) : (
            <>
              <span>Lanjut ke Bilik Suara</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
