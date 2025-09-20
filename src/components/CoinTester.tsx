"use client";
import { useState } from "react";
import { ClickableCoin } from './ClickableCoin';

export function CoinTester() {
  const [results, setResults] = useState<Array<{ flip: number; result: 'HEADS' | 'TAILS' }>>([]);
  const [flipCount, setFlipCount] = useState(0);

  const addResult = (result: 'HEADS' | 'TAILS') => {
    setResults(prev => [...prev, { flip: flipCount + 1, result }]);
    setFlipCount(prev => prev + 1);
  };

  const headsCount = results.filter(r => r.result === 'HEADS').length;
  const tailsCount = results.filter(r => r.result === 'TAILS').length;
  const headsPercentage = results.length > 0 ? ((headsCount / results.length) * 100).toFixed(1) : 0;
  const tailsPercentage = results.length > 0 ? ((tailsCount / results.length) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-pump-green mb-8">
        🧪 COIN FLIP TESTER 🧪
      </h2>
      
      {/* Coin */}
      <div className="text-center mb-8">
        <ClickableCoin size={120} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-pump-black-light border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-pump-green">{results.length}</div>
          <div className="text-gray-400">Total Flips</div>
        </div>
        
        <div className="bg-pump-black-light border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-pump-green">{headsCount}</div>
          <div className="text-gray-400">HEADS ({headsPercentage}%)</div>
        </div>
        
        <div className="bg-pump-black-light border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-white">{tailsCount}</div>
          <div className="text-gray-400">TAILS ({tailsPercentage}%)</div>
        </div>
      </div>

      {/* Manual result buttons for testing */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-4">Manual test (bypass coin animation):</div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => addResult('HEADS')}
            className="px-4 py-2 bg-pump-green text-pump-black rounded-lg font-semibold hover:bg-pump-green-light transition-colors"
          >
            Add HEADS
          </button>
          <button 
            onClick={() => addResult('TAILS')}
            className="px-4 py-2 bg-white text-pump-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Add TAILS
          </button>
          <button 
            onClick={() => {setResults([]); setFlipCount(0);}}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results history */}
      {results.length > 0 && (
        <div className="bg-pump-black-light border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-pump-green mb-4">Last 10 Results:</h3>
          <div className="flex flex-wrap gap-2">
            {results.slice(-10).map((result, index) => (
              <div 
                key={`${result.flip}-${index}`}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  result.result === 'HEADS' 
                    ? 'bg-pump-green text-pump-black' 
                    : 'bg-white text-pump-black'
                }`}
              >
                #{result.flip}: {result.result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

