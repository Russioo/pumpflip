"use client";
import { useEffect, useRef, useState } from "react";

export function Coin({ size = 80, trigger, result }: { size?: number; trigger?: number; result?: 'HEADS' | 'TAILS' }) {
  const [side, setSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [currentSide, setCurrentSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [flipping, setFlipping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === undefined) return;
    setFlipping(true);
    
    // Use provided result or random
    const target = result || (Math.random() < 0.5 ? 'HEADS' : 'TAILS');
    
    // Change side halfway through the animation (at 1.5 seconds out of 3)
    const changeTimer = setTimeout(() => {
      setSide(target);
      setCurrentSide(target);
    }, 1500);
    
    // End flip animation after full duration
    const endTimer = setTimeout(() => {
      setFlipping(false);
    }, 3000);
    
    return () => {
      clearTimeout(changeTimer);
      clearTimeout(endTimer);
    };
  }, [trigger, result]);

  // Update currentSide when result prop changes
  useEffect(() => {
    if (result) {
      setCurrentSide(result);
      setSide(result);
    }
  }, [result]);

  return (
    <div className="perspective-1000 hover:scale-110 transition-transform duration-300" style={{ perspective: '1000px' }}>
      <div
        ref={ref}
        className={`relative mx-auto rounded-full transition-all duration-500 hover:shadow-2xl ${flipping ? 'animate-[flip_3s_ease-in-out]' : 'hover:rotate-12'}`}
        style={{ 
          width: size, 
          height: size,
          transformStyle: 'preserve-3d'
        }}
        aria-label={`Coin shows ${currentSide}`}
      >
        {/* HEADS side */}
        <div 
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-pump-green shadow-xl ring-2 ring-white transition-opacity duration-300 ${
            flipping ? 'opacity-100' : (currentSide === 'HEADS' ? 'opacity-100' : 'opacity-0')
          }`}
          style={{ 
            backfaceVisibility: flipping ? 'visible' : 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <div className="relative flex flex-col items-center justify-center text-white">
            <div className="text-2xl font-bold" style={{ fontSize: size * 0.3 }}>
              H
            </div>
            <div className="absolute inset-3 rounded-full border border-white/30" />
          </div>
        </div>

        {/* TAILS side */}
        <div 
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-xl ring-2 ring-pump-green transition-opacity duration-300 ${
            flipping ? 'opacity-100' : (currentSide === 'TAILS' ? 'opacity-100' : 'opacity-0')
          }`}
          style={{ 
            backfaceVisibility: flipping ? 'visible' : 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="relative flex flex-col items-center justify-center text-pump-green">
            <div className="text-2xl font-bold" style={{ fontSize: size * 0.3 }}>
              T
            </div>
            <div className="absolute inset-3 rounded-full border border-pump-green/30" />
          </div>
        </div>
      </div>
    </div>
  );
}


