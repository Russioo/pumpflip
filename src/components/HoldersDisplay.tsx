"use client";
import { useEffect, useState } from "react";
import { Coins, Trophy, Target } from "lucide-react";

interface TokenHolder {
  address: string;
  balance: number;
  position: number;
}

interface HoldersData {
  ok: boolean;
  totalHolders: number;
  holders: TokenHolder[];
  lastUpdated?: string;
}

export function HoldersDisplay() {
  const [holdersData, setHoldersData] = useState<HoldersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch holders data
  useEffect(() => {
    let mounted = true;
    
    async function fetchHolders() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/holders?action=top&limit=100');
        const data = await response.json();
        
        if (!mounted) return;
        
        if (data.ok) {
          // Add position to each holder
          const holdersWithPosition = data.holders.map((holder: any, index: number) => ({
            ...holder,
            position: index + 1
          }));
          
          setHoldersData({
            ok: true,
            totalHolders: data.count,
            holders: holdersWithPosition,
            lastUpdated: new Date().toLocaleTimeString('da-DK')
          });
          setError(null);
        } else {
          setError('Kunne ikke hente holder data');
        }
      } catch (err) {
        if (mounted) {
          setError('Fejl ved hentning af data');
          console.error('Holders fetch error:', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchHolders();
    
    // Opdater hver 30 sekunder
    const interval = setInterval(fetchHolders, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="bg-pump-black-light border border-gray-600 rounded-xl p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-pump-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Scraper $PUMPFLIP holders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="bg-red-900/20 border border-red-600 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <p className="text-gray-400 text-sm mt-2">Prøver igen om lidt...</p>
        </div>
      </div>
    );
  }

  if (!holdersData || holdersData.holders.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="bg-pump-black-light border border-gray-600 rounded-xl p-6 text-center">
          <p className="text-gray-400">Ingen holders fundet</p>
        </div>
      </div>
    );
  }

  const headsTeam = holdersData.holders.slice(0, 50); // Position 1-50
  const tailsTeam = holdersData.holders.slice(50, 100); // Position 51-100

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toFixed(0);
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Teams Display */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* HEADS Team */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-pump-green/10 to-pump-green/5 border border-pump-green/30 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pump-green to-pump-green-light rounded-xl flex items-center justify-center">
                <Coins className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">HEADS Team</h3>
                <p className="text-pump-green font-semibold">Position 1-50</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pump-green">{headsTeam.length}</div>
              <div className="text-sm text-gray-400">holders</div>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {headsTeam.map((holder, index) => (
              <div 
                key={holder.address} 
                className="group flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pump-green/50 transition-all duration-300 hover:scale-[1.02]"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pump-green/20 to-pump-green/10 rounded-xl flex items-center justify-center">
                    <span className="text-pump-green font-bold text-sm">
                      #{holder.position}
                    </span>
                  </div>
                  <code className="text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    {formatAddress(holder.address)}
                  </code>
                </div>
                <div className="text-right">
                  <div className="text-pump-green font-bold text-lg">
                    {formatBalance(holder.balance)}
                  </div>
                  <div className="text-xs text-gray-500">$PUMPFLIP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TAILS Team */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">TAILS Team</h3>
                <p className="text-orange-400 font-semibold">Position 51-100</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">{tailsTeam.length}</div>
              <div className="text-sm text-gray-400">holders</div>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {tailsTeam.map((holder, index) => (
              <div 
                key={holder.address} 
                className="group flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:scale-[1.02]"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400/20 to-orange-400/10 rounded-xl flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-sm">
                      #{holder.position}
                    </span>
                  </div>
                  <code className="text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    {formatAddress(holder.address)}
                  </code>
                </div>
                <div className="text-right">
                  <div className="text-orange-400 font-bold text-lg">
                    {formatBalance(holder.balance)}
                  </div>
                  <div className="text-xs text-gray-500">$PUMPFLIP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center mt-8">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-3 inline-block">
          <p className="text-sm text-gray-400">
            <span className="inline-block w-2 h-2 bg-pump-green rounded-full animate-pulse mr-2"></span>
            Sidst opdateret: {holdersData.lastUpdated} • Opdaterer automatisk hver 30 sek
          </p>
        </div>
      </div>
    </div>
  );
}
