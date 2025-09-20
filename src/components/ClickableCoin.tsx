"use client";
import { useState } from "react";
import { Coin } from './Coin';

interface ClickableCoinProps {
  size?: number;
}

export function ClickableCoin({ size = 120 }: ClickableCoinProps) {
  const [flipTrigger, setFlipTrigger] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<'HEADS' | 'TAILS' | null>(null);

  const handleClick = () => {
    if (isFlipping) return; // Prevent clicking during flip
    
    setIsFlipping(true);
    
    // Generate random result
    const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
    setLastResult(result);
    
    setFlipTrigger(prev => prev + 1);
    
    // Reset flipping state after animation
    setTimeout(() => {
      setIsFlipping(false);
    }, 3000);
  };

  return (
    <div 
      className={`cursor-pointer select-none ${isFlipping ? 'pointer-events-none' : 'hover:scale-110'} transition-transform duration-300`}
      onClick={handleClick}
      title="Click to flip the coin! HEADS or TAILS"
    >
      <Coin size={size} trigger={flipTrigger} result={lastResult || undefined} />
      
      {/* Result display */}
      {lastResult && !isFlipping && (
        <div className="text-center mt-4">
          <div className={`text-2xl font-bold animate-scale-in ${
            lastResult === 'HEADS' ? 'text-pump-green' : 'text-white'
          }`}>
            🎯 {lastResult}!
          </div>
        </div>
      )}
      
      {/* Click instruction */}
      <div className="text-center mt-4">
        <div className="text-sm text-gray-400 hover:text-pump-green transition-colors duration-300">
          {isFlipping ? 'Flipping...' : 'Click to flip! HEADS or TAILS'}
        </div>
      </div>
    </div>
  );
}
