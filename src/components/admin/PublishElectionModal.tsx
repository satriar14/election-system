import React, { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";

interface PublishElectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (endTime: string) => void;
    isLoading?: boolean;
}

export const PublishElectionModal: React.FC<PublishElectionModalProps> = ({
    isOpen,
    onClose,
    onPublish,
    isLoading = false,
}) => {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError("");

        if (!date || !time) {
            setError("Tanggal dan jam harus diisi.");
            return;
        }

        const endDateTime = new Date(`${date}T${time}`);
        if (endDateTime.getTime() <= new Date().getTime()) {
            setError("Waktu berakhir harus lebih dari waktu sekarang.");
            return;
        }

        onPublish(endDateTime.toISOString());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-100">
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
                        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                Publikasi Pemilihan
                            </p>
                            <h3 className="text-lg font-black text-white leading-tight">
                                Atur Waktu Berakhir
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="px-6 pt-6 pb-6 space-y-4">
                    <p className="text-center text-sm text-slate-600 leading-relaxed">
                        Setelah dipublikasikan, warga bisa melihat kandidat & melakukan voting sampai
                        waktu yang Anda tentukan.
                    </p>

                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                            Tanggal Berakhir
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                            <Clock className="w-3.5 h-3.5 text-sky-500" />
                            Jam Berakhir
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center">
                            {error}
                        </div>
                    )}
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
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-[2] py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-black shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                                <span>Publikasi Sekarang</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};