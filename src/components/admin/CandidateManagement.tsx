import React, { useState, useEffect, useRef } from "react";
import type { Candidate } from "../../types";
import { candidateService } from "../../services/candidate.service";
import { electionService } from "../../services/election.service";
import { votingService } from "../../services/voting.service";
import { CandidateModal } from "./CandidateModal";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";
import { PublishElectionModal } from "./PublishElectionModal";
import { useToast } from "../../context/ToastContext";
import { CandidateCardSkeleton } from "../common/Skeleton";
import { electionStatusHelper } from "../../utils/electionStatus";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  RotateCcw,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export const CandidateManagement: React.FC = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);

  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [electionState, setElectionState] = useState(electionStatusHelper.getState());

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isEndNowModalOpen, setIsEndNowModalOpen] = useState(false);
  const [isEndingNow, setIsEndingNow] = useState(false);

  const [activeElectionId, setActiveElectionId] = useState<string | null>(null);

  const autoEndRef = useRef<boolean>(false);

  const fetchElectionStatus = async () => {
    try {
      const res = await votingService.getActiveElection().catch(() => ({
        success: false,
        data: null,
      }));
  
      if (res.success && res.data) {
        setActiveElectionId(res.data.id);
        const synced = electionStatusHelper.syncFromElection(res.data);
        setElectionState(synced);
        return;
      }
  
      const allRes = await electionService.getElections().catch(() => ({
        success: false,
        data: null,
      }));
  
      if (allRes.success && allRes.data && allRes.data.length > 0) {
        const completedElection = allRes.data.find(
          (e: any) => e.status === "COMPLETED"
        );
        const draftElection = allRes.data.find(
          (e: any) => e.status === "DRAFT"
        );
        const targetElection =
          completedElection || draftElection || allRes.data[0];
  
        setActiveElectionId(targetElection.id);
        const synced = electionStatusHelper.syncFromElection(targetElection);
        setElectionState(synced);
        return;
      }
  
      setActiveElectionId(null);
      electionStatusHelper.reset();
      setElectionState(electionStatusHelper.getState());
    } catch (err) {
      console.error("Fetch election status error:", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const res = await candidateService.getAllCandidates();
      if (res.success && res.data) {
        setCandidates(res.data);
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchCandidates(), fetchElectionStatus()]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        electionState.isPublished &&
        !electionState.isEnded &&
        electionState.endTime
      ) {
        const endTime = new Date(electionState.endTime).getTime();
        const now = new Date().getTime();

        if (now >= endTime && !autoEndRef.current) {
          autoEndRef.current = true;
          handleAutoEnd();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [electionState.isPublished, electionState.isEnded, electionState.endTime]);

  const handleAutoEnd = async () => {
    if (!activeElectionId) {
      autoEndRef.current = false;
      return;
    }

    try {
      const res = await electionService.endElectionNow(activeElectionId);
      if (res.success && res.data) {
        const synced = electionStatusHelper.syncFromElection(res.data);
        setElectionState(synced);
        toast.success("Waktu pemilihan telah habis. Pemilihan otomatis diakhiri.");
      }
    } catch (err) {
      console.error("Auto end election error:", err);
    } finally {
      setTimeout(() => {
        autoEndRef.current = false;
      }, 5000);
    }
  };

  const handleOpenAdd = () => {
    setCandidateToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setCandidateToEdit(cand);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    try {
      setIsDeleting(true);
      const res = await candidateService.deleteCandidate(candidateToDelete.id);
      if (res.success) {
        toast.success(`Kandidat "${candidateToDelete.name}" berhasil dihapus!`);
        setCandidateToDelete(null);
        fetchCandidates();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus kandidat");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishElection = async (endTime: string) => {
    try {
      setIsPublishing(true);

      let electionId = activeElectionId;

      if (!electionId) {
        const allRes = await electionService.getElections().catch(() => ({
          success: false,
          data: null,
        }));

        if (allRes.success && allRes.data && allRes.data.length > 0) {
          const draftElection = allRes.data.find(
            (e: any) => e.status === "DRAFT"
          );
          const targetElection = draftElection || allRes.data[0];
          electionId = targetElection.id;
          setActiveElectionId(electionId);
        }
      }

      if (!electionId) {
        toast.error("Pemilihan belum siap. Silakan refresh halaman ini.");
        setIsPublishing(false);
        return;
      }

      const res = await electionService.publishElection(electionId, endTime);

      if (res.success && res.data) {
        const synced = electionStatusHelper.syncFromElection(res.data);
        setElectionState(synced);
        setIsPublishModalOpen(false);

        const endDate = new Date(endTime);
        toast.success(
          `Pemilihan dipublikasikan sampai ${endDate.toLocaleDateString(
            "id-ID"
          )} ${endDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        );
      } else {
        toast.error(res.message || "Gagal publikasi");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mempublikasikan pemilihan"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShowGraph = async () => {
    try {
      if (!activeElectionId) {
        toast.error("Pemilihan tidak ditemukan");
        return;
      }
  
      const res = await electionService.showGraphElection(activeElectionId);
  
      if (res.success && res.data) {
        const synced = electionStatusHelper.syncFromElection(res.data);
        setElectionState(synced);
        toast.success("Grafik perolehan suara ditampilkan ke warga.");
      } else {
        toast.error(res.message || "Gagal menampilkan grafik");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menampilkan grafik"
      );
    }
  };

  const handleEndNow = async () => {
    try {
      setIsEndingNow(true);

      if (!activeElectionId) {
        toast.error("Pemilihan tidak ditemukan");
        return;
      }

      const res = await electionService.endElectionNow(activeElectionId);

      if (res.success && res.data) {
        const synced = electionStatusHelper.syncFromElection(res.data);
        setElectionState(synced);
        setIsEndNowModalOpen(false);
        toast.success(
          "Pemilihan diakhiri lebih awal. Warga tidak bisa voting lagi."
        );
      } else {
        toast.error(res.message || "Gagal mengakhiri pemilihan");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mengakhiri pemilihan"
      );
    } finally {
      setIsEndingNow(false);
    }
  };

  const handleResetElection = async () => {
    try {
      setIsResetting(true);
      const res = await electionService.resetElection();

      if (res.success) {
        electionStatusHelper.reset();
        setElectionState(electionStatusHelper.getState());

        setCandidates([]);
        setActiveElectionId(null);

        await fetchElectionStatus();
        await fetchCandidates();

        setIsResetModalOpen(false);

        toast.success(
          `Pemilihan baru siap dimulai. ${
            res.data?.deletedCandidates ?? 0
          } kandidat lama telah dihapus.`
        );
      } else {
        toast.error(res.message || "Gagal reset pemilihan");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal memulai pemilihan baru"
      );
    } finally {
      setIsResetting(false);
    }
  };

  const formatEndTime = (
    isoString: string | null
  ): { date: string; time: string } => {
    if (!isoString) return { date: "-", time: "-" };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const endTimeFormatted = formatEndTime(electionState.endTime);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl border border-sky-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Kelola Kandidat</h2>
            <p className="text-xs text-slate-500">
              Tambah, edit, dan atur profil, foto, visi, serta misi kandidat.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => {
              fetchCandidates();
              fetchElectionStatus();
            }}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          {electionState.isPublished && electionState.endTime && (
            <div className="px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <div className="text-[11px] leading-tight">
                <p className="text-slate-500 font-medium">Berakhir</p>
                <p className="text-slate-800 font-bold">
                  {endTimeFormatted.date} • {endTimeFormatted.time}
                </p>
              </div>
            </div>
          )}

          {!electionState.isPublished ? (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Publikasi Sekarang</span>
            </button>
          ) : !electionState.isEnded ? (
            <>
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sedang Berlangsung</span>
              </div>

              <button
                onClick={() => setIsEndNowModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Akhiri Sekarang</span>
              </button>
            </>
          ) : !electionState.showGraph ? (
            <button
              onClick={handleShowGraph}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tunjukkan Grafik</span>
            </button>
          ) : (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Mulai Pemilihan Baru</span>
            </button>
          )}

          {!electionState.isPublished && !electionState.showGraph && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Paslon Baru</span>
            </button>
          )}
        </div>
      </div>

      {electionState.isPublished && !electionState.isEnded && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-800">
              Pemilihan Sedang Berlangsung
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Warga bisa melakukan voting sampai{" "}
              <strong>
                {endTimeFormatted.date} pukul {endTimeFormatted.time}
              </strong>
              . Atau klik <strong>"Akhiri Sekarang"</strong> untuk menutup
              lebih awal.
            </p>
          </div>
        </div>
      )}

      {electionState.isEnded && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">
              Pemilihan Telah Berakhir
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              {electionState.showGraph
                ? 'Grafik sudah ditampilkan. Klik "Mulai Pemilihan Baru" untuk memulai siklus berikutnya.'
                : 'Klik "Tunjukkan Grafik" untuk menampilkan hasil ke warga.'}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <CandidateCardSkeleton count={3} />
      ) : candidates.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-xs space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">
            Belum Ada Candidate Terdaftar
          </h4>
          <p className="text-xs text-slate-400">
            Klik tombol "Buat Paslon Baru" untuk memulai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="bg-sky-50 text-sky-600 border-b border-sky-100 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold tracking-wider uppercase">
                    Paslon Nomor 0{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(candidate)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white transition-all"
                      title="Edit Candidate"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(candidate)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                      title="Hapus Candidate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 overflow-hidden border border-sky-100 shrink-0 flex items-center justify-center font-black text-xl">
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        candidate.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                        {candidate.name}
                      </h4>
                      <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 font-bold text-[10px] border border-sky-100">
                        {candidate.voteCount ?? 0} Perolehan Suara
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] mb-0.5">
                        Visi:
                      </span>
                      <p className="line-clamp-2 italic text-slate-600">
                        "{candidate.vision || "Belum diisi"}"
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] mb-0.5">
                        Misi & Program:
                      </span>
                      <p className="line-clamp-3 text-slate-600">
                        {candidate.mission || "Belum diisi"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCandidates}
        candidateToEdit={candidateToEdit}
      />

      <ConfirmDeleteModal
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Kandidat"
        description="Apakah Anda yakin ingin menghapus kandidat ini? Semua data terkait akan dihapus secara permanen."
        itemName={candidateToDelete ? candidateToDelete.name : ""}
      />

      <PublishElectionModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublishElection}
        isLoading={isPublishing}
      />

      {isEndNowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={!isEndingNow ? () => setIsEndNowModalOpen(false) : undefined}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-100">
            <div className="relative bg-sky-500 text-white px-6 pt-6 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />

              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    Konfirmasi
                  </p>
                  <h3 className="text-lg font-black text-white leading-tight">
                    Akhiri Pemilihan Sekarang
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-6 pt-5 pb-6 space-y-4">
              <p className="text-center text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin{" "}
                <strong>mengakhiri pemilihan sekarang</strong>? Warga tidak akan
                bisa vote lagi.
              </p>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 space-y-1.5 text-xs">
                <p className="font-bold text-sky-700">Yang bakal terjadi:</p>
                <ul className="text-sky-600 space-y-1 pl-4 list-disc">
                  <li>Voting langsung ditutup sekarang</li>
                  <li>Warga tidak bisa vote lagi</li>
                  <li>Hasil akhir bisa langsung ditampilkan</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  Pastikan semua suara sudah masuk sebelum mengakhiri lebih
                  awal.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2.5">
              <button
                onClick={() => setIsEndNowModalOpen(false)}
                disabled={isEndingNow}
                className="flex-1 py-3 rounded-xl bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-sm font-bold transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleEndNow}
                disabled={isEndingNow}
                className="flex-[2] py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-black shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isEndingNow ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ya, Akhiri</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={!isResetting ? () => setIsResetModalOpen(false) : undefined}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-100">
            <div className="relative bg-sky-500 text-white px-6 pt-6 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />

              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    Konfirmasi
                  </p>
                  <h3 className="text-lg font-black text-white leading-tight">
                    Mulai Pemilihan Baru
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-6 pt-5 pb-6 space-y-4">
              <p className="text-center text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin <strong>memulai pemilihan baru</strong>?
              </p>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 space-y-1.5 text-xs">
                <p className="font-bold text-sky-700">Yang bakal terjadi:</p>
                <ul className="text-sky-600 space-y-1 pl-4 list-disc">
                  <li>
                    Semua <strong>{candidates.length} paslon</strong> lama akan
                    dihapus
                  </li>
                  <li>Data hasil vote ikut terhapus</li>
                  <li>Election baru dibuat dengan status "Belum Dipublikasi"</li>
                  <li>Warga gak bisa akses sampai dipublikasi lagi</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  Pastikan hasil pemilihan sebelumnya sudah di-arsip kalau perlu.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2.5">
              <button
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
                className="flex-1 py-3 rounded-xl bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-sm font-bold transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleResetElection}
                disabled={isResetting}
                className="flex-[2] py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-black shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Ya, Mulai Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};