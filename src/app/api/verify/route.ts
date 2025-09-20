import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { solanaService } from '@/lib/solana';

const bodySchema = z.object({
  wallet: z.string().min(32).max(44), // Solana addresses are 32-44 chars
});

// Check if wallet holds $PUMPFLIP tokens on Solana
async function holdsPumpflipToken(wallet: string): Promise<{ hasTokens: boolean; balance: number }> {
  // Validate Solana address format
  if (!solanaService.isValidSolanaAddress(wallet)) {
    return { hasTokens: false, balance: 0 };
  }

  // Use demo for now - replace with real check when you have the token mint address
  return await solanaService.checkPumpFlipBalanceDemo(wallet);
  
  // For production, use this:
  // return await solanaService.checkPumpFlipBalance(wallet);
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  let wallet: string | undefined;

  if (contentType.includes('application/json')) {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 });
    wallet = parsed.data.wallet;
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData();
    wallet = String(form.get('wallet') || '');
  } else {
    const form = await req.formData().catch(() => undefined);
    wallet = form ? String(form.get('wallet') || '') : undefined;
  }

  if (!wallet) return NextResponse.json({ ok: false, error: 'Missing wallet' }, { status: 400 });

  const result = await holdsPumpflipToken(wallet);
  if (!result.hasTokens) {
    return NextResponse.json({ 
      ok: false, 
      eligible: false, 
      message: `Wallet has ${result.balance} $PUMPFLIP tokens. Minimum required: 1` 
    });
  }

  // Upsert wallet to pool
  const w = await prisma.wallet.upsert({
    where: { address: wallet },
    update: {},
    create: { address: wallet }
  });

  return NextResponse.json({ 
    ok: true, 
    eligible: true, 
    walletId: w.id,
    balance: result.balance,
    message: `Verified! You hold ${result.balance.toFixed(2)} $PUMPFLIP tokens`
  });
}


