import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { invitationService } from "../../services/invitation.service";
import type { UserRole } from "../../types";
import { UserCheck, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [invitationInfo, setInvitationInfo] = useState<{ email: string; role: UserRole } | null>(null);
  const [loadingVerify, setLoadingVerify] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyError("Tautan undangan tidak valid atau token hilang.");
      setLoadingVerify(false);
      return;
    }

    invitationService
      .getInvitationByToken(token)
      .then((res) => {
        if (res.success && res.data) {
          setInvitationInfo({ email: res.data.email!, role: res.data.role! });
        } else {
          setVerifyError(res.message || "Invitation tidak ditemukan atau sudah kadaluarsa.");
        }
      })
      .catch((err) => {
        setVerifyError(err.response?.data?.message || "Invitation tidak ditemukan atau sudah kadaluarsa.");
      })
      .finally(() => {
        setLoadingVerify(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !password) {
      setSubmitError("Nama dan Password wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setSubmitError("Password minimal 8 karakter.");
      return;
    }

    try {
      setSubmitLoading(true);
      const res = await invitationService.acceptInvitation({
        token: token!,
        name: name.trim(),
        password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setSubmitError(res.message || "Gagal menerima undangan.");
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Terjadi kesalahan saat menerima undangan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto border border-sky-100 shadow-xs">
            <UserCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Aktivasi Akun Pengurus</h2>
          <p className="text-xs text-slate-500">Lengkapi data Anda untuk bergabung sebagai Pengurus RT.</p>
        </div>

        {loadingVerify ? (
          <div className="space-y-4 p-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded-md w-3/4 mx-auto" />
            <div className="h-10 bg-slate-200 rounded-2xl w-full" />
            <div className="h-10 bg-slate-200 rounded-2xl w-full" />
            <div className="h-10 bg-slate-200 rounded-2xl w-full" />
          </div>
        ) : verifyError ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-rose-700">{verifyError}</p>
            <Link to="/login" className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm">
              Kembali ke Login
            </Link>
          </div>
        ) : success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-800">Akun Berhasil Dibuat!</h4>
            <p className="text-xs text-emerald-700">Mengarahkan Anda ke halaman login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div>Email Terdaftar: <strong className="text-slate-900">{invitationInfo?.email}</strong></div>
              <div>Hak Akses / Role: <strong className="text-sky-600 font-bold">{invitationInfo?.role}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nama Lengkap Anda <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Pengurus"
                  required
                  className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Buat Kata Sandi (Minimal 8 Karakter) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitLoading ? "Memproses Akun..." : "Aktifkan Akun & Simpan"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
