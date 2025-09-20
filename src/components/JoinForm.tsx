"use client";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { CheckCircle, Target, Coins, Loader2 } from "lucide-react";

type VerifyResponse = { ok: boolean; eligible?: boolean; walletId?: string; error?: string; message?: string; balance?: number };
type JoinResponse = { ok: boolean; roundIndex?: number; endsAt?: string; error?: string };

export function JoinForm() {
  const [wallet, setWallet] = useState("");
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [choiceMade, setChoiceMade] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const canSubmit = useMemo(() => wallet.trim().length >= 32 && !submitting && !isVerified, [wallet, submitting, isVerified]);

  // Reset verification status when wallet changes
  useEffect(() => {
    setIsVerified(false);
    setEligible(null);
    setChoiceMade(null);
    setMessage("");
  }, [wallet]);

  const verify = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (submitting || isVerified) return;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setSubmitting(true);
    setMessage("");
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet }),
        signal: abortControllerRef.current.signal,
      });
      
      if (res.aborted) return;
      
      const json: VerifyResponse = await res.json();
      if (!json.ok || json.eligible === false) {
        setEligible(false);
        setIsVerified(false);
        setMessage(json.message || "Wallet not eligible for $PUMPFLIP.");
        return;
      }
      setEligible(true);
      setIsVerified(true);
      setMessage(json.message || "Wallet verified! Choose HEADS or TAILS.");
    } catch (e: any) {
      if (e.name === 'AbortError') return; // Request was cancelled
      setMessage("Something went wrong. Try again.");
      setIsVerified(false);
    } finally {
      setSubmitting(false);
      abortControllerRef.current = null;
    }
  }, [wallet, submitting, isVerified]);

  const pick = useCallback(async (side: "HEADS" | "TAILS") => {
    if (submitting || choiceMade) return;
    
    setSubmitting(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet, side }),
      });
      const json: JoinResponse = await res.json();
      if (!json.ok) {
        setMessage(json.error || "Could not save choice.");
        return;
      }
      setChoiceMade(side);
      setMessage(`Choice saved: ${side}! You're in the round!`);
    } catch (e) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [wallet, submitting, choiceMade]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter your Solana wallet address"
              className="w-full rounded-xl border border-gray-600 bg-pump-black-light text-white px-4 py-3 text-center placeholder-gray-400 focus:border-pump-green focus:outline-none focus:ring-2 focus:ring-pump-green/20 focus:scale-[1.02] transition-all duration-300"
              name="wallet"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              disabled={submitting}
            />
            {wallet.length > 0 && wallet.length < 32 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
              </div>
            )}
            {wallet.length >= 32 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-pump-green animate-scale-in"></div>
              </div>
            )}
          </div>
          <button
            className={`rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-lg relative overflow-hidden ${
              canSubmit 
                ? 'bg-pump-green text-pump-black hover:bg-pump-green-light hover:scale-105 hover:shadow-xl' 
                : isVerified
                ? 'bg-pump-green-light text-pump-black cursor-default'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            onClick={verify}
            disabled={!canSubmit}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 -translate-x-full transition-all duration-700 ${
              submitting ? 'opacity-20 translate-x-full animate-shimmer' : ''
            }`}></div>
            <div className="relative">
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin-smooth" />
                  Verifying...
                </div>
              ) : isVerified ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verified!
                </div>
              ) : 'Verify'}
            </div>
          </button>
        </div>
        
        {message && (
          <div className={`rounded-xl p-4 text-sm text-center border animate-scale-in transition-all duration-500 relative overflow-hidden ${
            message.includes('verified') || message.includes('saved') 
              ? 'bg-pump-green text-pump-black border-pump-green shadow-lg shadow-pump-green/20' 
              : 'bg-pump-black-light text-gray-300 border-gray-600'
          }`}>
            {(message.includes('verified') || message.includes('saved')) && (
              <div className="absolute inset-0 bg-gradient-to-r from-pump-green-light via-white to-pump-green-light opacity-10 animate-pulse"></div>
            )}
            <div className="relative font-medium">{message}</div>
          </div>
        )}
        
        {eligible && (
          <div className="flex gap-3 animate-scale-in">
            <button
              className={`group flex-1 rounded-xl px-6 py-4 font-bold transition-all duration-300 shadow-lg relative overflow-hidden ${
                choiceMade === 'HEADS' 
                  ? 'bg-pump-green-light text-pump-black shadow-pump-green/30 scale-105' 
                  : choiceMade 
                  ? 'bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-pump-green text-pump-black hover:bg-pump-green-light hover:scale-105 hover:shadow-xl disabled:opacity-50'
              }`}
              onClick={() => pick("HEADS")}
              disabled={submitting || !!choiceMade}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${
                choiceMade === 'HEADS' 
                  ? 'bg-gradient-to-r from-white via-transparent to-white opacity-20 animate-shimmer' 
                  : 'bg-white opacity-0 group-hover:opacity-10'
              }`}></div>
              <div className="relative flex items-center justify-center gap-2">
                {submitting && choiceMade !== 'HEADS' ? (
                  <Loader2 className="h-4 w-4 animate-spin-smooth" />
                ) : choiceMade === 'HEADS' ? (
                  <Target className="h-5 w-5 animate-bounce" />
                ) : (
                  <Coins className="h-5 w-5 group-hover:animate-bounce" />
                )}
                Pick HEADS
              </div>
            </button>
            <button
              className={`group flex-1 rounded-xl px-6 py-4 font-bold transition-all duration-300 shadow-lg relative overflow-hidden ${
                choiceMade === 'TAILS' 
                  ? 'bg-pump-green text-pump-black shadow-pump-green/30 scale-105' 
                  : choiceMade 
                  ? 'bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed'
                  : 'border-2 border-pump-green bg-pump-black-light text-pump-green hover:bg-pump-green hover:text-pump-black hover:scale-105 hover:shadow-xl disabled:opacity-50'
              }`}
              onClick={() => pick("TAILS")}
              disabled={submitting || !!choiceMade}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${
                choiceMade === 'TAILS' 
                  ? 'bg-gradient-to-r from-pump-green via-white to-pump-green opacity-20 animate-shimmer' 
                  : 'bg-pump-green opacity-0 group-hover:opacity-100'
              }`}></div>
              <div className="relative flex items-center justify-center gap-2">
                {submitting && choiceMade !== 'TAILS' ? (
                  <Loader2 className="h-4 w-4 animate-spin-smooth" />
                ) : choiceMade === 'TAILS' ? (
                  <Target className="h-5 w-5 animate-bounce" />
                ) : (
                  <Coins className="h-5 w-5 group-hover:animate-bounce" />
                )}
                Pick TAILS
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


