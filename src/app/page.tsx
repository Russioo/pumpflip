import Link from 'next/link';
import { Countdown } from '@/components/Countdown';
import { HoldersDisplay } from '@/components/HoldersDisplay';
import { LiveStatsCards } from '@/components/LiveStats';
import { Coin } from '@/components/Coin';
import { Coins, Trophy, Eye, Sparkles, Zap, Users } from 'lucide-react';

export default async function Page() {
  const now = Date.now();
  const nextFlip = now - (now % (3 * 60 * 1000)) + 3 * 60 * 1000; // aligns to 3-min grid

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Simple background */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              PumpFlip
            </h1>
            <p className="text-xl text-gray-300">
              Top 100 holders battle automatisk
            </p>
          </div>

          {/* Coin & Countdown */}
          <div className="flex flex-col items-center gap-8 mb-12">
            <Coin size={120} />
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-gray-400 mb-2 text-center">Næste battle om</div>
              <div className="text-3xl font-bold text-green-500 text-center">
                <Countdown endAt={nextFlip} />
              </div>
            </div>
          </div>

          {/* Teams Preview */}
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">HEADS Team</h3>
              <p className="text-green-500 font-semibold">Position 1-50</p>
              <p className="text-gray-400 text-sm">De største holders</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">TAILS Team</h3>
              <p className="text-orange-400 font-semibold">Position 51-100</p>
              <p className="text-gray-400 text-sm">The underdogs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Holders Display Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Live Battle</h2>
            <p className="text-gray-400">
              Se de top 100 holders kæmpe i real-time. Automatisk opdateret hver 30 sekunder.
            </p>
          </div>
          
          <HoldersDisplay />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Sådan virker det</h2>
            <p className="text-gray-400">Simpelt, automatisk og fair.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automatisk Scraping</h3>
              <p className="text-gray-400 text-sm">
                Vi scraper top 100 $PUMPFLIP holders automatisk fra blockchain.
              </p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Team Battle</h3>
              <p className="text-gray-400 text-sm">
                Position 1-50 (HEADS) kæmper mod position 51-100 (TAILS).
              </p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Vindende Team</h3>
              <p className="text-gray-400 text-sm">
                Coin flip hver 3. minut bestemmer vindende team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-4">Live Stats</h2>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <LiveStatsCards nextFlipAt={nextFlip} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-2">PumpFlip</h3>
          <p className="text-gray-400 mb-4">Automatisk token holder battle.</p>
          <div className="flex justify-center items-center gap-4">
            <Link 
              className="text-green-500 hover:text-green-400" 
              href="https://twitter.com" 
              target="_blank"
            >
              Twitter
            </Link>
            <span className="text-gray-500">© {new Date().getFullYear()} PumpFlip</span>
          </div>
        </div>
      </footer>
    </main>
  );
}


