import React, { useState, useEffect } from "react";
import type { House } from "../../types";
import { houseService } from "../../services/house.service";
import { Search, ShieldCheck } from "lucide-react";

export const HouseQuotaMonitor: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setIsLoading(true);
      const res = await houseService.getHouses();
      if (res.success && res.data) {
        setHouses(res.data);
      }
    } catch (err) {
      console.error("Error fetching houses for pengawas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHouses = houses.filter((h) => {
    const term = searchTerm.toLowerCase();
    return h.block.toLowerCase().includes(term) || h.houseNumber.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Kuota Voting</h2>
            <p className="text-xs text-slate-500">
              Pantau transparansi penggunaan kuota suara tiap alamat rumah warga.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari blok / no rumah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Blok / Nomor</th>
                <th className="px-6 py-3.5">Hak Pilih Mula</th>
                <th className="px-6 py-3.5">Suara Digunakan</th>
                <th className="px-6 py-3.5">Sisa Kuota</th>
                <th className="px-6 py-3.5">Status Partisipasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat data pengawasan kuota...
                  </td>
                </tr>
              ) : filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data rumah ditemukan.
                  </td>
                </tr>
              ) : (
                filteredHouses.map((h) => {
                  const used = h.usedQuota ?? 0;
                  const isFullyUsed = used >= h.voterQuota;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        Blok {h.block} No. {h.houseNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold">{h.voterQuota} Suara</td>
                      <td className="px-6 py-4 font-bold text-sky-600">{used} Suara</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{h.remainingQuota ?? (h.voterQuota - used)} Sisa</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            isFullyUsed
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                              : used > 0
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isFullyUsed ? "LUNAS VOTING" : used > 0 ? "PARTISIPASI PARSIAL" : "BELUM MEMILIH"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
