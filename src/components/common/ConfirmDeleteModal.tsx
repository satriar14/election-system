import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  itemName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto z-10 border border-slate-100">
        <div className="relative bg-sky-500 text-white px-6 pt-6 pb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />

          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                Konfirmasi
              </p>
              <h3 className="text-lg font-black text-white leading-tight">{title}</h3>
            </div>
          </div>
        </div>  

        <div className="px-6 pt-5 pb-6 space-y-4">
          <p className="text-center text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          {itemName && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-center">
              <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">
                Data yang akan dihapus
              </p>
              <p className="text-sm font-bold text-slate-800 truncate">{itemName}</p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Tindakan ini bersifat permanen dan tidak dapat dikembalikan.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2.5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-sm font-bold transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-[2] py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-black shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <span>Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
