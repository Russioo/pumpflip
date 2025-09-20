import Link from 'next/link';
import { Countdown } from '@/components/Countdown';
import { JoinForm } from '@/components/JoinForm';
import { LiveStatsCards } from '@/components/LiveStats';
import { Coin } from '@/components/Coin';
import { Coins, Trophy, WalletIcon } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      <h2 className="mb-8 text-3xl font-bold text-center bg-gradient-to-r from-pump-green to-pump-green-light bg-clip-text text-transparent">{title}</h2>
      <div className="bg-pump-black border border-gray-700 rounded-2xl p-8 shadow-xl">
        {children}
      </div>
    </section>
  );
}

export default async function Page() {
  const now = Date.now();
  const nextFlip = now - (now % (3 * 60 * 1000)) + 3 * 60 * 1000; // aligns to 3-min grid

  return (
    <main className="flex min-h-screen flex-col bg-pump-black">
      {/* Hero */}
      <header className="bg-gradient-to-br from-pump-black to-pump-black-light border-b border-gray-800">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pump-green to-pump-green-light bg-clip-text text-transparent mb-4">
              PumpFlip
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Pick HEADS or TAILS. Every 3 minutes, winners split the pool. Solana-powered.
            </p>
            
            <div className="mb-8">
              <Coin size={120} />
            </div>
            
            <div className="bg-pump-black-light border border-gray-700 rounded-2xl p-6 mb-8 max-w-md mx-auto shadow-xl">
              <div className="text-sm text-gray-400 mb-2 text-center">Next flip in</div>
              <div className="text-3xl font-bold text-pump-green text-center"><Countdown endAt={nextFlip} /></div>
            </div>
            
            <div className="mx-auto max-w-md">
              <JoinForm />
            </div>
          </div>
        </div>
      </header>

      {/* How to Play */}
      <div className="bg-pump-black-light">
        <Section title="How to play">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pump-green to-pump-green-light rounded-full flex items-center justify-center shadow-lg">
                <WalletIcon className="h-8 w-8 text-pump-black" />
              </div>
              <div className="font-bold text-lg text-white">Verify wallet</div>
              <div className="text-gray-300">Enter your Solana wallet to verify $PUMPFLIP holdings</div>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pump-green to-pump-green-light rounded-full flex items-center justify-center shadow-lg">
                <Coins className="h-8 w-8 text-pump-black" />
              </div>
              <div className="font-bold text-lg text-white">Pick your side</div>
              <div className="text-gray-300">Choose HEADS or TAILS for this round</div>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pump-green to-pump-green-light rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="h-8 w-8 text-pump-black" />
              </div>
              <div className="font-bold text-lg text-white">Win rewards</div>
              <div className="text-gray-300">Winners split the pool every 3 minutes</div>
            </div>
          </div>
        </Section>
      </div>

      {/* Live Stats */}
      <Section title="Live Stats">
        <LiveStatsCards nextFlipAt={nextFlip} />
      </Section>

      {/* Footer */}
      <footer className="mt-auto bg-pump-black border-t border-gray-800">
        <div className="mx-auto w-full max-w-4xl px-6 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pump-green to-pump-green-light bg-clip-text text-transparent mb-4">PumpFlip</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Simple coin flip game. Pick HEADS or TAILS, wait 3 minutes, winners split the pool.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link className="text-pump-green hover:text-pump-green-light transition-colors font-semibold" href="https://twitter.com" target="_blank">
                Twitter
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">© {new Date().getFullYear()} PumpFlip</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}


