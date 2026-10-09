import React, { useState, useEffect } from "react";
import type { Election, ElectionStatus } from "../../types";
import { electionService } from "../../services/election.service";
import { StatusBadge } from "../common/StatusBadge";
import { ElectionModal } from "./ElectionModal";
import { useToast } from "../../context/ToastContext";
import { ElectionCardSkeleton } from "../common/Skeleton";
import { Plus, Edit2, Trash2, Vote, Play, CheckCircle } from "lucide-react";

export const ElectionManagement: React.FC = () => {
  const { toast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  const fetchElections = async () => {
    try {
      setIsLoading(true);
      const res = await electionService.getElections();
      if (res.success && res.data) {
        setElections(res.data);
      }
    } catch (err) {
      console.error("Error fetching elections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleOpenAdd = () => {
    setSelectedElection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (election: Election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pemilihan "${title}"?`)) return;
    try {
      const res = await electionService.deleteElection(id);
      if (res.success) {
        toast.success(`Pemilihan "${title}" berhasil dihapus!`);
        fetchElections();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus pemilihan");
    }
  };

  const handleQuickStatusChange = async (election: Election, newStatus: ElectionStatus) => {
    try {
      const res = await electionService.updateElection(election.id, { status: newStatus });
      if (res.success) {
        toast.success(`Status pemilihan berhasil diubah ke ${newStatus}!`);
        fetchElections();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengubah status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl border border-sky-100">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Manajemen Pemilihan RT</h2>
            <p className="text-xs text-slate-500">
              Buat, kelola status, dan pantau jalannya agenda pemungutan suara RT.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pemilihan Baru</span>
        </button>
      </div>

      {/* Elections List */}
      {isLoading ? (
        <ElectionCardSkeleton count={3} />
      ) : elections.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-xs">
          <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Belum ada agenda pemilihan</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Klik tombol di atas untuk membuat pemilihan baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              className={`bg-white rounded-2xl border ${
                election.status === "ONGOING"
                  ? "border-emerald-300 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-100 shadow-xs"
              } p-5 hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <StatusBadge status={election.status} type="election" />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(election)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                      title="Edit Pemilihan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(election.id, election.title)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Hapus Pemilihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">{election.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{election.description || "Tidak ada deskripsi."}</p>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Kandidat</span>
                    <span className="font-extrabold text-slate-800">{election.candidateCount ?? 0} Paslon</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Suara</span>
                    <span className="font-extrabold text-sky-600">{election.voteCount ?? 0} Masuk</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status Switches */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {election.status === "DRAFT" && (
                  <button
                    onClick={() => handleQuickStatusChange(election, "ONGOING")}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai Pemilihan Sekarang</span>
                  </button>
                )}

                {election.status === "ONGOING" && (
                  <button
                    onClick={() => handleQuickStatusChange(election, "COMPLETED")}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selesaikan Pemilihan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ElectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchElections}
        electionToEdit={selectedElection}
      />
    </div>
  );
};
