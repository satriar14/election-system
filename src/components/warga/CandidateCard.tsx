import React from "react";
import type { Candidate } from "../../types";
import { Vote, CheckCircle2, User } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  isSelected?: boolean;
  onSelect: (candidate: Candidate) => void;
  isElectionEnded?: boolean;
  showGraph?: boolean;
  votePercentage?: number;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  index,
  isSelected,
  onSelect,
  isElectionEnded = false,
  showGraph = false,
  votePercentage = 0,
}) => {
  const candidateNumber = `0${index + 1}`;

  return (
    <div
      className={`relative bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col shadow-md ${
        !isElectionEnded ? "hover:shadow-xl hover:-translate-y-1" : ""
      } ${
        isSelected
          ? "border-sky-500 ring-4 ring-sky-500/20"
          : "border-slate-100 hover:border-sky-200"
      }`}
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
                isElectionEnded ? "grayscale opacity-70" : "hover:scale-105"
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-3">
                <User className="w-12 h-12 text-sky-400" />
              </div>
              <span className="text-xs font-bold text-slate-400">Foto Belum Tersedia</span>
            </div>
          )}

          {showGraph && isElectionEnded && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-5xl font-black">{votePercentage}%</div>
                <div className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">
                  {candidate.voteCount || 0} Suara
                </div>
              </div>
            </div>
          )}

          {!showGraph && (
            <>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  Calon Ketua RT
                </p>
                <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                  {candidate.name}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>

      {showGraph && isElectionEnded && (
        <div className="px-4 pb-2 text-center">
          <h3 className="text-lg font-black text-slate-900">{candidate.name}</h3>
        </div>
      )}

      <div className="px-4 pb-4 space-y-3 flex-1 flex flex-col justify-between">
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
              <span>{showGraph ? "HASIL DITAMPILKAN" : "PEMILIHAN BERAKHIR"}</span>
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
  );
};