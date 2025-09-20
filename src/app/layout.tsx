import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PumpFlip',
  description: 'Pick HEADS or TAILS. Every 3 minutes, winners take all fees!'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}


