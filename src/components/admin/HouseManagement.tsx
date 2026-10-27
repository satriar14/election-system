import React, { useState, useEffect } from "react";
import type { House } from "../../types";
import { houseService } from "../../services/house.service";
import { HouseModal } from "./HouseModal";
import { useToast } from "../../context/ToastContext";
import { TableSkeleton } from "../common/Skeleton";
import { Home, Plus, Edit2, Trash2, Search } from "lucide-react";

export const HouseManagement: React.FC = () => {
  const { toast } = useToast();
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [houseToEdit, setHouseToEdit] = useState<House | null>(null);

  const fetchHouses = async () => {
    try {
      setIsLoading(true);
      const res = await houseService.getHouses();
      if (res.success && res.data) {
        setHouses(res.data);
      }
    } catch (err) {
      console.error("Error fetching houses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleOpenAdd = () => {
    setHouseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (house: House) => {
    setHouseToEdit(house);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, block: string, houseNumber: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data rumah Blok ${block} No. ${houseNumber}?`)) return;
    try {
      const res = await houseService.deleteHouse(id);
      if (res.success) {
        toast.success(`Rumah Blok ${block} No. ${houseNumber} berhasil dihapus!`);
        fetchHouses();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus data rumah");
    }
  };

  const filteredHouses = houses.filter((h) => {
    const term = searchTerm.toLowerCase();
    const fullAddr = `blok ${h.block} no ${h.houseNumber}`.toLowerCase();
    return fullAddr.includes(term) || h.block.toLowerCase().includes(term) || h.houseNumber.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl border border-sky-100">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Kuota Voting</h2>
            <p className="text-xs text-slate-500">
              Atur daftar alamat blok, nomor rumah warga, serta alokasi kuota suara voting.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rumah</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-600">
            Total Terdaftar: <span className="text-slate-900 font-bold">{houses.length} Rumah</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari blok atau no rumah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Blok</th>
                <th className="px-6 py-3.5">Nomor Rumah</th>
                <th className="px-6 py-3.5">Total Kuota</th>
                <th className="px-6 py-3.5">Suara Terpakai</th>
                <th className="px-6 py-3.5">Sisa Kuota</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data rumah yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredHouses.map((house) => (
                  <tr key={house.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Blok {house.block}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      No. {house.houseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs border border-sky-100 whitespace-nowrap">
                        {house.voterQuota} Hak Pilih
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sky-600 whitespace-nowrap">
                      {house.usedQuota ?? 0} Suara
                    </td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                          (house.remainingQuota ?? 0) === 0
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}
                      >
                        {house.remainingQuota ?? house.voterQuota} Sisa
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(house)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                          title="Edit Rumah"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(house.id, house.block, house.houseNumber)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Hapus Rumah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <HouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHouses}
        houseToEdit={houseToEdit}
      />
    </div>
  );
};
