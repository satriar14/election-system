import React, { useState, useEffect, useRef } from "react";
import { Modal } from "../common/Modal";
import type { Candidate } from "../../types";
import { candidateService } from "../../services/candidate.service";
import { votingService } from "../../services/voting.service";
import { electionService } from "../../services/election.service";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Image as ImageIcon,
  AlertCircle,
  UploadCloud,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidateToEdit?: Candidate | null;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  candidateToEdit,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuperadmin = user?.role === "SUPERADMIN";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [mission, setMission] = useState("");
  const [isLag, setIsLag] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [electionId, setElectionId] = useState<string | null>(null);

  useEffect(() => {
    if (candidateToEdit) {
      setName(candidateToEdit.name || "");
      setPhoto(candidateToEdit.photo || "");
      setMission(candidateToEdit.mission || "");
      setIsLag(!!candidateToEdit.isLag);
      if (candidateToEdit.photo && candidateToEdit.photo.startsWith("http")) {
        setUploadMode("url");
      } else {
        setUploadMode("file");
      }
    } else {
      setName("");
      setPhoto("");
      setMission("");
      setIsLag(false);
      setUploadMode("file");
    }
    setError(null);
  }, [candidateToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen || candidateToEdit) return;

    const fetchElectionId = async () => {
      try {
        const res = await votingService.getActiveElection();
        if (res.success && res.data) {
          setElectionId(res.data.id);
          return;
        }
      } catch {}

      try {
        const allRes = await electionService.getElections();
        if (allRes.success && allRes.data && allRes.data.length > 0) {
          const draftElection = allRes.data.find(
            (e: any) => e.status === "DRAFT"
          );
          if (draftElection) {
            setElectionId(draftElection.id);
            return;
          }

          setElectionId(allRes.data[0].id);
        }
      } catch (err) {
        console.error("Gagal fetch election ID:", err);
      }
    };

    fetchElectionId();
  }, [isOpen, candidateToEdit]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih harus berupa gambar (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const msg = "Ukuran file foto terlalu besar. Maksimal 5 MB.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPhoto(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama kandidat wajib diisi");
      return;
    }

    try {
      setLoading(true);

      if (candidateToEdit) {
        const payload = {
          name: name.trim(),
          photo: photo.trim() || null,
          vision: null,
          mission: mission.trim() || null,
          ...(isSuperadmin && { isLag }),
        };
        await candidateService.updateCandidate(candidateToEdit.id, payload);
        toast.success("Berhasil memperbarui data kandidat!");
      } else {
        const payload = {
          electionId: electionId || undefined,
          name: name.trim(),
          photo: photo.trim() || null,
          vision: null,
          mission: mission.trim() || null,
          ...(isSuperadmin && { isLag }),
        };
        await candidateService.createCandidate(payload);
        toast.success("Berhasil menambahkan kandidat baru!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || "Gagal menyimpan data kandidat";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        candidateToEdit
          ? "Edit Data Candidate"
          : "Tambah Pasangan Calon / Candidate Baru"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Lengkap Pasangan Calon <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bpk. H. Ahmad Dahlan & Ibu Siti"
              required
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 font-semibold"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Foto Profil
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                  uploadMode === "file"
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Galeri / File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                  uploadMode === "url"
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>Link URL</span>
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && handleFileChange(e.target.files[0])
            }
            className="hidden"
          />

          {uploadMode === "file" ? (
            <div>
              {photo ? (
                <div className="relative group bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 shadow-sm">
                    <img
                      src={photo}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Foto Berhasil Diupload</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Foto siap disimpan dan akan langsung tampil di halaman
                      voting warga.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ganti Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto("")}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-white text-sky-500 shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-sky-600 transition-colors">
                    Klik di sini untuk memilih foto
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Format gambar didukung: JPG, PNG, WEBP
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://example.com/foto-kandidat.jpg"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
                />
              </div>
              {photo && (
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Preview Foto URL
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Alasan Dukungan Warga
          </label>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Tuliskan alasan dukungan warga untuk kandidat ini..."
            rows={4}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
          ></textarea>
        </div>

        {isSuperadmin && (
          <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
            <span className="text-xs font-bold text-slate-700">Is Lag</span>
            <input
              type="checkbox"
              checked={isLag}
              onChange={(e) => setIsLag(e.target.checked)}
              className="w-4 h-4 accent-sky-500"
            />
          </label>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? "Menyimpan..."
              : candidateToEdit
              ? "Perbarui Candidate"
              : "Simpan Candidate"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
