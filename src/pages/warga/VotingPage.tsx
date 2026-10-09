import React, { useState, useEffect } from "react";
import { CandidateCard } from "../../components/warga/CandidateCard";
import { HouseVoteModal } from "../../components/warga/HouseVoteModal";
import { VotingSuccessView } from "../../components/warga/VotingSuccessView";
import { votingService } from "../../services/voting.service";
import { candidateService } from "../../services/candidate.service";
import type { CastVoteResponse } from "../../services/voting.service";
import type { Election, Candidate } from "../../types";
import { deriveElectionState, getTimeRemaining, EMPTY_ELECTION_STATE } from "../../utils/electionStatus";
import type { ElectionState } from "../../utils/electionStatus";
import {
  ChevronDown,
  UserX,
  Loader2,
  Clock,
  Award,
} from "lucide-react";

export const VotingPage: React.FC = () => {
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [voteSuccessData, setVoteSuccessData] = useState<CastVoteResponse | null>(null);

  const [electionState, setElectionState] = useState<ElectionState>(EMPTY_ELECTION_STATE);
  const [countdown, setCountdown] = useState(getTimeRemaining(null));

  const fetchActiveData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await votingService.getActiveElection().catch(() => ({
        success: false,
        data: null,
      }));

      setElectionState(
        res.success && res.data ? deriveElectionState(res.data) : EMPTY_ELECTION_STATE
      );

      const candRes = await candidateService.getAllCandidates();

      if (
        candRes.success &&
        candRes.data &&
        candRes.data.length > 0
      ) {
        setActiveElection({
          id: candRes.data[0].electionId || "default-election",
          title:
            (res.success && res.data?.title) || "Pemilihan Ketua RT",
          description:
            (res.success && res.data?.description) ||
            "Agenda Pemilihan Ketua RT Resmi",
          status: "ONGOING",
          candidates: candRes.data, 
        } as Election);
      } else if (
        res.success &&
        res.data &&
        res.data.candidates &&
        res.data.candidates.length > 0
      ) {
        setActiveElection(res.data as Election);
      } else {
        setActiveElection(null);
      }
    } catch (err) {
      console.error("Fetch active data error:", err);
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

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getTimeRemaining(electionState.endTime);
      setCountdown(newCountdown);

      if (
        newCountdown.isExpired &&
        electionState.isPublished &&
        !electionState.isEnded
      ) {
        setElectionState((prev) => ({ ...prev, isEnded: true }));
        fetchActiveData(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [electionState.isPublished, electionState.isEnded, electionState.endTime]);

  // Sinkronkan status publikasi dari server (termasuk saat belum dibuka dan setelah berakhir)
  useEffect(() => {
    if (electionState.isEnded && electionState.showGraph) return;
    const interval = setInterval(() => {
      fetchActiveData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [electionState.isEnded, electionState.showGraph]);

  const handleSelectCandidate = (candidate: Candidate) => {
    if (electionState.isEnded || !electionState.isPublished) return;
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
    fetchActiveData(true);
  };

  const scrollToCandidates = () => {
    const el = document.getElementById("candidates-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const candidatesList = activeElection?.candidates || [];

  const totalVotes = candidatesList.reduce(
    (acc, c) => acc + (c.voteCount || 0),
    0
  );
  const winner =
    candidatesList.length > 0
      ? candidatesList.reduce(
          (max, c) =>
            (c.voteCount || 0) > (max.voteCount || 0) ? c : max,
          candidatesList[0]
        )
      : null;

  const getVotePercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  if (loading && !electionState.isPublished) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!electionState.isPublished) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center mx-auto border border-sky-100">
            <Clock className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Pemilihan Belum Dibuka
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Panitia belum mempublikasikan agenda pemilihan. Silakan cek kembali
            nanti.
          </p>
        </div>
      </div>
    );
  }

  if (voteSuccessData) {
    return (
      <VotingSuccessView
        voteData={voteSuccessData}
        onReset={handleResetVote}
      />
    );
  }

  const isEnded = electionState.isEnded || countdown.isExpired;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div
        className={`relative text-white pt-16 pb-32 px-4 sm:px-6 text-center overflow-hidden ${
          isEnded ? "bg-slate-500" : "bg-sky-500"
        }`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[11px] font-bold tracking-widest">
            <span>Website Voting</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {isEnded ? (
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
            {isEnded
              ? "Terima kasih atas partisipasi seluruh warga."
              : "Satu suara menentukan masa depan lingkungan kita. Yuk, gunakan hak pilihmu sekarang!"}
          </p>

          {!isEnded && (
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
                isEnded
                  ? "bg-slate-100 text-slate-600 border-slate-200"
                  : "bg-sky-50 text-sky-600 border-sky-100"
              }`}
            >
              Daftar Kandidat
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isEnded ? "Hasil Pemilihan" : "Kenali Calon Pemimpinmu"}
            </h2>
            {activeElection && (
              <p className="text-sm font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
                {activeElection.title}
                {!isEnded &&
                  ' Klik "Cek Visi Misi" untuk lihat detail, atau "Pilih Paslon" untuk memberikan suara.'}
              </p>
            )}

            {!isEnded &&
              electionState.isPublished &&
              !countdown.isExpired && (
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-xs font-bold text-slate-700">
                      Berakhir dalam:
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {countdown.days > 0 && (
                      <CountdownBox value={countdown.days} label="Hari" />
                    )}
                    <CountdownBox value={countdown.hours} label="Jam" />
                    <CountdownBox value={countdown.minutes} label="Menit" />
                    <CountdownBox value={countdown.seconds} label="Detik" />
                  </div>
                </div>
              )}
          </div>

          {isEnded && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 max-w-2xl mx-auto">
              <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-800">
                  Pemilihan Telah Berakhir
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Voting sudah ditutup. Terima kasih untuk partisipasi seluruh
                  warga RT.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Memuat calon kandidat...
              </p>
            </div>
          ) : candidatesList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-lg mx-auto space-y-4">
              <UserX className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-black text-slate-800">
                Belum Ada Calon Kandidat
              </h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {candidatesList.map((candidate, idx) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    index={idx}
                    isSelected={selectedCandidate?.id === candidate.id}
                    onSelect={handleSelectCandidate}
                    isElectionEnded={isEnded}
                    showGraph={electionState.showGraph && isEnded}
                    votePercentage={getVotePercentage(candidate.voteCount || 0)}
                  />
                ))}
              </div>

              {electionState.showGraph && isEnded && winner && totalVotes > 0 && (
                <div className="pt-6">
                  <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 -ml-24 -mb-24" />

                    <div className="relative z-10 space-y-5">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-black tracking-widest">
                        Voting Terbanyak
                      </div>

                      <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-2xl mx-auto border-4 border-white/30">
                        <div className="w-full h-full rounded-2xl bg-sky-50 overflow-hidden flex items-center justify-center">
                          {winner.photo ? (
                            <img
                              src={winner.photo}
                              alt={winner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl font-black text-sky-500">
                              {winner.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-3xl sm:text-4xl font-black">
                          {winner.name}
                        </h2>
                        <p className="text-white/80 text-sm font-medium">
                          Ketua RT Terpilih
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30">
                        <div className="text-left">
                          <p className="text-[10px] font-black tracking-widest text-white/70 uppercase">
                            Total Voting
                          </p>
                          <p className="text-xl font-black">
                            {winner.voteCount} Suara •{" "}
                            {getVotePercentage(winner.voteCount || 0)}%
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-white/70">
                        Dari total {totalVotes} suara yang masuk
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
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

const CountdownBox = ({ value, label }: { value: number; label: string }) => (
  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-sky-100 flex flex-col items-center justify-center shadow-sm">
    <span className="text-xl font-black text-sky-600 leading-none">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
      {label}
    </span>
  </div>
);