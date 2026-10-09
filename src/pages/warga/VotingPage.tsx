import React, { useState, useEffect } from "react";
import { CandidateCard } from "../../components/warga/CandidateCard";
import { HouseVoteModal } from "../../components/warga/HouseVoteModal";
import { VotingSuccessView } from "../../components/warga/VotingSuccessView";
import { votingService } from "../../services/voting.service";
import { candidateService } from "../../services/candidate.service";
import type { CastVoteResponse } from "../../services/voting.service";
import type { Election, Candidate } from "../../types";
import { electionStatusHelper } from "../../utils/electionStatus";
import { ChevronDown, UserX, Loader2, AlertTriangle } from "lucide-react";

export const VotingPage: React.FC = () => {
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [voteSuccessData, setVoteSuccessData] = useState<CastVoteResponse | null>(null);
  const [isElectionEnded, setIsElectionEnded] = useState(electionStatusHelper.isEnded());

  const fetchActiveData = async () => {
    try {
      setLoading(true);
      setIsElectionEnded(electionStatusHelper.isEnded());

      const res = await votingService.getActiveElection();
      if (res.success && res.data && res.data.candidates && res.data.candidates.length > 0) {
        setActiveElection(res.data as Election);
      } else {
        const candRes = await candidateService.getAllCandidates();
        if (candRes.success && candRes.data && candRes.data.length > 0) {
          setActiveElection({
            id: candRes.data[0].electionId || "default-election",
            title: res.data?.title || "Pemilihan Ketua RT",
            description: res.data?.description || "Agenda Pemilihan Ketua RT Resmi",
            status: "ONGOING",
            candidates: candRes.data,
          } as Election);
        } else {
          setActiveElection(res.data ? (res.data as Election) : null);
        }
      }
    } catch {
      try {
        const candRes = await candidateService.getAllCandidates();
        if (candRes.success && candRes.data && candRes.data.length > 0) {
          setActiveElection({
            id: candRes.data[0].electionId || "default-election",
            title: "Pemilihan Ketua RT",
            description: "Agenda Pemilihan Ketua RT Resmi",
            status: "ONGOING",
            candidates: candRes.data,
          } as Election);
        } else {
          setActiveElection(null);
        }
      } catch {
        setActiveElection(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveData();
  }, []);

  const handleSelectCandidate = (candidate: Candidate) => {
    if (isElectionEnded) return; // Guard tambahan
    setSelectedCandidate(candidate);
    setIsVoteModalOpen(true);
  };

  const handleVoteSuccess = (data: CastVoteResponse) => {
    setVoteSuccessData(data);
    setIsVoteModalOpen(false);
  };

  const handleResetVote = () => {
    setVoteSuccessData(null);
    setSelectedCandidate(null);
  };

  const scrollToCandidates = () => {
    const el = document.getElementById("candidates-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const candidatesList = activeElection?.candidates || [];

  if (voteSuccessData) {
    return (
      <VotingSuccessView voteData={voteSuccessData} onReset={handleResetVote} />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className={`relative text-white pt-16 pb-32 px-4 sm:px-6 text-center overflow-hidden ${
        isElectionEnded ? "bg-slate-500" : "bg-sky-500"
      }`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[11px] font-bold tracking-widest">
            <span>Website Voting</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {isElectionEnded ? (
              <>
                Pemilihan Telah
                <br />
                Berakhir
              </>
            ) : (
              <>
                "Suaramu, Aksimu!
                <br />
                Jadilah Bagian dari Perubahan,
                <br />
                Pilih Ketua RT Masa Depan!"
              </>
            )}
          </h1>

          <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto font-medium">
            {isElectionEnded
              ? "Terima kasih atas partisipasi seluruh warga. Hasil pemilihan akan segera diumumkan."
              : "Satu suara menentukan masa depan lingkungan kita. Yuk, gunakan hak pilihmu sekarang!"}
          </p>

          {!isElectionEnded && (
            <div className="pt-4">
              <button
                onClick={scrollToCandidates}
                className="group px-8 py-4 rounded-full bg-white text-sky-600 hover:bg-sky-50 font-black text-sm shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 inline-flex items-center gap-2"
              >
                <span>Cusss ke pemilihan</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0">
          <svg
            className="relative block w-full h-16 sm:h-24 text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 space-y-12">
        <div id="candidates-section" className="space-y-10 pt-4">
          <div className="text-center space-y-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                isElectionEnded
                  ? "bg-slate-100 text-slate-600 border-slate-200"
                  : "bg-sky-50 text-sky-600 border-sky-100"
              }`}
            >
              Daftar Kandidat
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isElectionEnded ? "Hasil Kandidat" : "Kenali Calon Pemimpinmu"}
            </h2>
            {activeElection && (
              <p className="text-sm font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
                {isElectionEnded
                  ? "Pemilihan sudah ditutup. Berikut adalah daftar kandidat yang ikut serta."
                  : `${activeElection.title}. Klik "Cek Visi Misi" untuk lihat detail, atau "Pilih Paslon" untuk memberikan suara.`}
              </p>
            )}
          </div>

          {isElectionEnded && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 max-w-2xl mx-auto">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Pemilihan Telah Berakhir</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Voting sudah ditutup. Terima kasih untuk partisipasi seluruh warga RT.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Memuat calon kandidat real-time...
              </p>
            </div>
          ) : candidatesList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-white text-slate-400 flex items-center justify-center mx-auto border border-slate-100 shadow-xs">
                <UserX className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">Belum Ada Calon Kandidat</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Admin belum menambahkan calon kandidat untuk pemilihan ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {candidatesList.map((candidate, idx) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  index={idx}
                  isSelected={selectedCandidate?.id === candidate.id}
                  onSelect={handleSelectCandidate}
                  isElectionEnded={isElectionEnded}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <HouseVoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        candidate={selectedCandidate}
        election={activeElection}
        onVoteSuccess={handleVoteSuccess}
      />
    </div>
  );
};