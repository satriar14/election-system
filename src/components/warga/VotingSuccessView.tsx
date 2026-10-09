import React, { useEffect, useState } from "react";
import type { CastVoteResponse } from "../../services/voting.service";
import { CheckCircle2, Home, User, Vote, ArrowLeft } from "lucide-react";

interface VotingSuccessViewProps {
  voteData: CastVoteResponse;
  onReset: () => void;
}

export const VotingSuccessView: React.FC<VotingSuccessViewProps> = ({
  voteData,
  onReset,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#38bdf8" : "#7dd3fc",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center space-y-6 mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-sky-400 opacity-20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-sky-400 opacity-10 animate-pulse"></div>

            <div className="relative w-24 h-24 rounded-full bg-sky-500 flex items-center justify-center shadow-2xl shadow-sky-500/40">
              <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black tracking-widest uppercase border border-sky-100">
              Suara Berhasil Dikonfirmasi
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terima Kasih!
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
              Suara Anda telah tercatat dengan aman. Partisipasi Anda sangat berarti untuk
              masa depan lingkungan kita.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-sky-500 px-6 py-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />

            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                  Bukti Voting
                </p>
                <h2 className="text-base font-black text-white">
                  Detail Partisipasi Anda
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <DetailRow
              icon={<Home className="w-4 h-4" />}
              label="Alamat Pemilih"
              value={`Blok ${voteData.block} No. ${voteData.houseNumber}`}
              iconBg="bg-sky-50"
              iconColor="text-sky-600"
            />

            <DetailRow
              icon={<User className="w-4 h-4" />}
              label="Pilihan Kandidat"
              value={voteData.candidateName}
              iconBg="bg-sky-50"
              iconColor="text-sky-600"
              valueClass="text-sky-600 font-black"
            />

            <DetailRow
              icon={<Vote className="w-4 h-4" />}
              label="Kuota Suara Rumah Ini"
              value={`${voteData.usedQuota} dari ${voteData.voterQuota} Terpakai`}
              iconBg="bg-slate-50"
              iconColor="text-slate-600"
            />

            <div className="pl-14 pr-1 pt-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(voteData.usedQuota / voteData.voterQuota) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                {Math.round((voteData.usedQuota / voteData.voterQuota) * 100)}% kuota
                rumah sudah digunakan
              </p>
            </div>

            <div className="border-t border-dashed border-slate-200"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Sisa Hak Pilih
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Rumah Anda
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-xl text-sm font-black ${
                  voteData.remainingQuota > 0
                    ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-2 border-rose-200"
                }`}
              >
                {voteData.remainingQuota} Suara
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                voteData.remainingQuota > 0
                  ? "bg-sky-50 text-sky-700 border border-sky-100"
                  : "bg-slate-50 text-slate-600 border border-slate-100"
              }`}
            >
              {voteData.remainingQuota > 0 ? (
                <>
                  Masih ada{" "}
                  <strong>{voteData.remainingQuota} hak pilih</strong> di rumah Anda.
                  Anggota keluarga lain bisa lanjut memilih.
                </>
              ) : (
                <>
                  Semua hak pilih rumah Anda sudah digunakan. Terima kasih atas
                  partisipasinya!
                </>
              )}
            </div>
          </div>

          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onReset}
              className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-lg shadow-sky-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Pemilihan</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-medium mt-6">
          Suara Anda tersimpan dengan aman dan tidak dapat diubah
        </p>
      </div>
    </div>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  valueClass = "text-slate-900 font-bold",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  valueClass?: string;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center border border-slate-100 shrink-0`}
      >
        {icon}
      </div>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
    <span className={`text-xs ${valueClass} text-right truncate`}>{value}</span>
  </div>
);