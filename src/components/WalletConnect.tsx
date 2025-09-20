"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { connected, publicKey, disconnect } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-pump-black-light text-pump-green px-4 py-2 rounded-xl border border-pump-green">
          <Wallet className="h-4 w-4" />
          <span className="font-mono text-sm">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-adapter-button-wrapper">
      <WalletMultiButton className="!bg-pump-green !text-pump-black hover:!bg-pump-green-light !rounded-xl !font-semibold !transition-all !duration-300 !shadow-lg hover:!scale-105" />
    </div>
  );
}
