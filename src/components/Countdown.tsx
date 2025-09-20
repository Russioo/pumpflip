"use client";
import { useEffect, useMemo, useState } from 'react';

export function Countdown({ endAt }: { endAt: number }) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, endAt - now);

  const time = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [remainingMs]);

  return (
    <span className="tabular-nums font-mono hover:scale-110 transition-transform duration-300 inline-block">{time}</span>
  );
}


