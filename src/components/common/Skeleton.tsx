import React from "react";

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = "h-4 w-full" }) => (
  <div className={`bg-slate-200/80 rounded-xl animate-pulse ${className}`} />
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <tbody className="divide-y divide-slate-100 animate-pulse">
    {Array.from({ length: rows }).map((_, rIdx) => (
      <tr key={rIdx} className="hover:bg-slate-50/50">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <td key={cIdx} className="px-6 py-4">
            <div className="flex items-center gap-3">
              {cIdx === 0 && <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />}
              <div className="space-y-1.5 w-full">
                <div className={`h-3.5 bg-slate-200 rounded-md ${cIdx === 0 ? "w-3/4" : "w-1/2"}`} />
                {cIdx === 0 && <div className="h-2.5 bg-slate-200/70 rounded-md w-1/2" />}
              </div>
            </div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export const CandidateCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-3xl border-2 border-slate-100 p-4 space-y-4 shadow-xs animate-pulse overflow-hidden"
      >
        <div className="h-5 w-24 bg-slate-200 rounded-full mx-auto" />
        <div className="w-full h-64 rounded-2xl bg-slate-200/80" />
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-slate-200 rounded-md w-3/4 mx-auto" />
          <div className="h-3 bg-slate-200/70 rounded-md w-1/2 mx-auto" />
        </div>
        <div className="pt-2 flex gap-3">
          <div className="h-10 bg-slate-200 rounded-xl flex-1" />
          <div className="h-10 bg-slate-200 rounded-xl flex-1" />
        </div>
      </div>
    ))}
  </div>
);

export const ElectionCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs animate-pulse"
      >
        <div className="flex justify-between items-center">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-slate-200 rounded-lg" />
            <div className="w-7 h-7 bg-slate-200 rounded-lg" />
          </div>
        </div>
        <div className="h-5 bg-slate-200 rounded-md w-3/4" />
        <div className="h-3 bg-slate-200/70 rounded-md w-full" />
        <div className="h-3 bg-slate-200/70 rounded-md w-2/3" />
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 w-24 bg-slate-200 rounded-md" />
          <div className="h-8 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export const LiveCountSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="space-y-2 w-full sm:w-1/2">
        <div className="h-3 w-28 bg-slate-200 rounded-md" />
        <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
      </div>
      <div className="h-12 w-36 bg-slate-200 rounded-2xl shrink-0" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-3 w-24 bg-slate-200/70 rounded-md" />
              </div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded-md" />
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex animate-pulse">
    <div className="w-64 bg-white border-r border-slate-200 p-4 hidden md:block space-y-6">
      <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
      <div className="space-y-3 pt-6">
        <div className="h-10 bg-slate-200 rounded-lg w-full" />
        <div className="h-10 bg-slate-200/70 rounded-lg w-full" />
        <div className="h-10 bg-slate-200/70 rounded-lg w-full" />
        <div className="h-10 bg-slate-200/70 rounded-lg w-full" />
      </div>
    </div>
    <div className="flex-1 p-8 space-y-6">
      <div className="h-8 w-1/3 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 h-80" />
    </div>
  </div>
);
