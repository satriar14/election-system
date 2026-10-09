import React, { useState, useEffect } from "react";
import type { Candidate } from "../../types";
import { candidateService } from "../../services/candidate.service";
import { CandidateModal } from "./CandidateModal";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";
import { useToast } from "../../context/ToastContext";
import { CandidateCardSkeleton } from "../common/Skeleton";
import { electionStatusHelper } from "../../utils/electionStatus";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  StopCircle,
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

  const [isEndElectionModalOpen, setIsEndElectionModalOpen] = useState(false);
  const [isEndingElection, setIsEndingElection] = useState(false);
  const [isElectionEnded, setIsElectionEnded] = useState(electionStatusHelper.isEnded());

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
    fetchCandidates();
  }, []);

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

  const handleEndElection = async () => {
    try {
      setIsEndingElection(true);
      electionStatusHelper.setEnded(true);
      setIsElectionEnded(true);
      setIsEndElectionModalOpen(false);
      toast.success("Pemilihan telah berakhir. Warga tidak bisa voting lagi.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengakhiri pemilihan");
    } finally {
      setIsEndingElection(false);
    }
  };

  const handleReopenElection = () => {
    electionStatusHelper.setEnded(false);
    setIsElectionEnded(false);
    toast.success("Pemilihan dibuka kembali.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={fetchCandidates}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {isElectionEnded ? (
            <button
              onClick={handleReopenElection}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Buka Kembali</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEndElectionModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <StopCircle className="w-4 h-4 text-sky-500" />
              <span>Akhiri Pemilihan</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Paslon Baru</span>
          </button>
        </div>
      </div>

      {isElectionEnded && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Pemilihan Telah Berakhir</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Warga tidak bisa melakukan voting lagi. Klik "Buka Kembali" kalau mau mengaktifkan lagi.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <CandidateCardSkeleton count={3} />
      ) : candidates.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-xs space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Belum Ada Candidate Terdaftar</h4>
          <p className="text-xs text-slate-400">
            Klik tombol di atas untuk membuat card kandidat pertama.
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
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

      {isEndElectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={!isEndingElection ? () => setIsEndElectionModalOpen(false) : undefined}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-100">
            <div className="relative bg-sky-500 text-white px-6 pt-6 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />

              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <StopCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    Konfirmasi
                  </p>
                  <h3 className="text-lg font-black text-white leading-tight">
                    Akhiri Pemilihan
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-6 pt-5 pb-6 space-y-4">
              <p className="text-center text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin <strong>mengakhiri pemilihan</strong>?
                Setelah diakhiri, warga tidak bisa lagi memberikan suara.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Anda masih bisa membuka kembali pemilihan kalau ini salah klik.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2.5">
              <button
                onClick={() => setIsEndElectionModalOpen(false)}
                disabled={isEndingElection}
                className="flex-1 py-3 rounded-xl bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-sm font-bold transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleEndElection}
                disabled={isEndingElection}
                className="flex-[2] py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-black shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isEndingElection ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4" />
                    <span>Ya, Akhiri</span>
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