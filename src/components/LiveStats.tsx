"use client";
import { useEffect, useState } from "react";

type Stats = {
  ok: boolean;
  totalPlayers: number;
  positions1to50: number;
  positions51to100: number;
  feePool: number;
  recent: { index: number; result: string | null; totalPlayers: number; winningPositions: string }[];
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
        <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">Spillere i runde</div>
        <div className="text-3xl font-bold text-pump-green group-hover:scale-110 transition-transform duration-300">
          {stats?.totalPlayers ?? 0}<span className="text-lg text-gray-500">/100</span>
        </div>
        <div className="text-xs text-gray-400 mt-1 space-y-1">
          <div>Pos 1-50: {stats?.positions1to50 ?? 0}</div>
          <div>Pos 51-100: {stats?.positions51to100 ?? 0}</div>
        </div>
      </div>
      <div className="text-center group">
        <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">Prize Pool</div>
        <div className="text-3xl font-bold text-pump-green group-hover:scale-110 transition-transform duration-300">{(stats?.feePool ?? 0).toFixed(2)}</div>
        <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">$PUMPFLIP tokens</div>
      </div>
      <div className="text-center group">
        <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">Sidste resultater</div>
        <div className="text-lg font-bold text-pump-green group-hover:scale-110 transition-transform duration-300">
          {(stats?.recent ?? []).length === 0 && <div>-</div>}
          {(stats?.recent ?? []).slice(0, 3).map(r => (
            <div key={r.index} className="text-sm animate-fade-in space-y-1">
              <div className="font-bold">{r.result ?? '-'}</div>
              <div className="text-xs text-gray-400">Pos {r.winningPositions}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


