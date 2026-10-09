import React, { useState, useEffect } from "react";
import type { User } from "../../types";
import { userService } from "../../services/user.service";
import { StatusBadge } from "../common/StatusBadge";
import { EditRoleModal } from "./EditRoleModal";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";
import { useToast } from "../../context/ToastContext";
import { TableSkeleton } from "../common/Skeleton";
import {
  Users,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Pencil,
} from "lucide-react";
import { InviteUserModal } from "../../components/superadmin/InviteUserModal";

export const UserManagementTable: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers(
        roleFilter === "ALL" ? undefined : roleFilter,
        searchTerm || undefined
      );
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const res = await userService.deleteUser(userToDelete.id);
      if (res.success) {
        toast.success(`Akun ${userToDelete.name} berhasil dihapus!`);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus pengguna");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-500 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                Daftar Akun Pengurus System
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola hak akses role, status keaktifan, dan akun pengurus terdaftar.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Admin / Pengawas</span>
          </button>
        </div>

        <div className="border-t border-slate-100"></div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
            />
          </form>

          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
            {["ALL", "SUPERADMIN", "ADMIN", "PENGAWAS"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  roleFilter === role
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-800"
                }`}
              >
                {role === "ALL" ? "Semua Role" : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Pengguna</th>
                <th className="py-4 px-6">Role / Hak Akses</th>
                <th className="py-4 px-6">Status Akun</th>
                <th className="py-4 px-6">Terdaftar</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : filteredUsers.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400 text-xs">
                    Tidak ada pengguna ditemukan untuk kriteria filter ini.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={user.role} type="role" />
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        {user.isActive ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserForEdit(user)}
                          title="Ubah Role"
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-all border border-sky-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          title="Hapus Akun"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Modal Edit Role */}
      <EditRoleModal
        isOpen={!!selectedUserForEdit}
        user={selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onSuccess={fetchUsers}
      />

      {/* Modal Invite */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchUsers}
        currentUserRole="SUPERADMIN"
      />

      {/* ============ MODAL KONFIRMASI HAPUS ============ */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Akun Pengurus"
        description="Apakah Anda yakin ingin menghapus akun pengurus ini? Semua data terkait akan dihapus secara permanen."
        itemName={userToDelete ? `${userToDelete.name} (${userToDelete.email})` : ""}
      />
    </div>
  );
};