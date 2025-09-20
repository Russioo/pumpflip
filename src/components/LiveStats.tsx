"use client";
import { useEffect, useState } from "react";

type Stats = {
  ok: boolean;
  heads: number;
  tails: number;
  feePool: number;
  recent: { index: number; result: string | null }[];
};

export function LiveStatsCards({ nextFlipAt }: { nextFlipAt: number }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const json = await res.json();
        if (mounted) setStats(json);
      } catch {
        // ignore
      }
    }
    load();
    const id = setInterval(load, 2000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="text-center group">
        <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">Players</div>
        <div className="text-3xl font-bold text-pump-green group-hover:scale-110 transition-transform duration-300">
          {stats?.heads ?? 0} <span className="text-gray-500">vs</span> {stats?.tails ?? 0}
        </div>
        <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">HEADS vs TAILS</div>
      </div>
      <div className="text-center group">
        <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">Fee Pool</div>
        <div className="text-3xl font-bold text-pump-green group-hover:scale-110 transition-transform duration-300">{(stats?.feePool ?? 0).toFixed(2)}</div>
        <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">Total rewards</div>
      </div>
      <div className="text-center group">
        <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">Last winners</div>
        <div className="text-lg font-bold text-pump-green group-hover:scale-110 transition-transform duration-300">
          {(stats?.recent ?? []).length === 0 && <div>-</div>}
          {(stats?.recent ?? []).slice(0, 3).map(r => (
            <div key={r.index} className="text-sm animate-fade-in">{r.result ?? '-'}</div>
          ))}
        </div>
      </div>
    </div>
  );
}


