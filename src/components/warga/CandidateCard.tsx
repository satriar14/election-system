import React, { useState } from "react";
import type { Candidate } from "../../types";
import { Modal } from "../common/Modal";
import { Info, Vote, CheckCircle2, Target, Flag, User, X } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  isSelected?: boolean;
  onSelect: (candidate: Candidate) => void;
  isElectionEnded?: boolean; 
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  index,
  isSelected,
  onSelect,
  isElectionEnded = false,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const candidateNumber = `0${index + 1}`;

  return (
    <>
      <div
        className={`relative bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1 ${
          isSelected
            ? "border-sky-500 ring-4 ring-sky-500/20"
            : "border-slate-100 hover:border-sky-200"
        } ${isElectionEnded ? "opacity-90" : ""}`}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div
            className={`px-4 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest shadow-md flex items-center gap-1.5 ${
              isElectionEnded ? "bg-slate-400" : "bg-sky-500"
            }`}
          >
            <Vote className="w-3 h-3" />
            <span>PASLON {candidateNumber}</span>
          </div>
        </div>

        <div className="relative pt-14 pb-4 px-4">
          <div className="w-full h-64 rounded-2xl bg-sky-50 overflow-hidden relative flex items-center justify-center border-4 border-white shadow-inner">
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={candidate.name}
                className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                  !isElectionEnded ? "hover:scale-105" : "grayscale"
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-3">
                  <User className="w-12 h-12 text-sky-400" />
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Foto Belum Tersedia
                </span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                Calon Ketua RT
              </p>
              <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                {candidate.name}
              </h3>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={() => setShowDetailModal(true)}
            className="w-full py-3 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 hover:border-sky-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4 text-sky-500" />
            <span>Cek Visi & Misi</span>
          </button>

          <button
            onClick={() => !isElectionEnded && onSelect(candidate)}
            disabled={isElectionEnded}
            className={`w-full py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
              isElectionEnded
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : isSelected
                ? "bg-sky-600 text-white shadow-sm hover:shadow-md cursor-pointer"
                : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md cursor-pointer"
            }`}
          >
            {isElectionEnded ? (
              <>
                <Vote className="w-4 h-4" />
                <span>PEMILIHAN BERAKHIR</span>
              </>
            ) : isSelected ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>PILIHAN ANDA</span>
              </>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                <span>PILIH PASLON INI</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title=""
        hideHeader
        maxWidth="lg"
      >
        <div className="-mx-0 -mt-0">
          <div className="relative bg-sky-500 text-white px-6 pt-8 pb-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/10 -ml-14 -mb-14" />

            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[10px] font-black tracking-widest mb-3">
                <Vote className="w-3 h-3" />
                PASLON {candidateNumber}
              </div>
              <h3 className="text-2xl font-black leading-tight">{candidate.name}</h3>
              <p className="text-xs text-white/80 font-medium mt-1">Calon Ketua RT</p>
            </div>
          </div>

          <div className="relative -mt-14 px-6 flex justify-center">
            <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100">
              <div className="w-full h-full rounded-xl bg-sky-50 overflow-hidden flex items-center justify-center">
                {candidate.photo ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-sky-400" />
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pt-6 pb-6 space-y-4">
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-widest leading-none">
                    Visi Utama
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Tujuan utama kandidat
                  </p>
                </div>
              </div>
              <p className="italic text-slate-700 leading-relaxed text-sm">
                "{candidate.vision || "Belum ada deskripsi visi."}"
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-widest leading-none">
                    Program Kerja & Misi
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Rencana yang akan dijalankan
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-line text-slate-700 leading-relaxed text-sm">
                {candidate.mission || "Belum ada deskripsi misi."}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2.5">
            <button
              onClick={() => setShowDetailModal(false)}
              className="flex-1 py-3 rounded-xl bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-sm font-bold transition-all"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                setShowDetailModal(false);
                onSelect(candidate);
              }}
              disabled={isElectionEnded}
              className={`flex-[2] py-3 rounded-xl text-sm font-black shadow-sm flex items-center justify-center gap-2 transition-all ${
                isElectionEnded
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-600 text-white hover:shadow-md"
              }`}
            >
              <Vote className="w-4 h-4" />
              <span>{isElectionEnded ? "PEMILIHAN BERAKHIR" : "PILIH PASLON INI"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};