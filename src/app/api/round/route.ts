import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const STEP_MS = 3 * 60 * 1000;

function windowFromNow(nowMs: number) {
  const startMs = nowMs - (nowMs % STEP_MS);
  const endMs = startMs + STEP_MS;
  const index = Math.floor(endMs / STEP_MS);
  return { startMs, endMs, index };
}

export async function POST() {
  const nowMs = Date.now();
  const { startMs, endMs, index } = windowFromNow(nowMs - 1); // operate on last closed window if exactly on boundary

  // ensure round exists
  const round = await prisma.round.upsert({
    where: { index },
    update: {},
    create: { index, startedAt: new Date(startMs), endsAt: new Date(endMs), feePool: 0 }
  });

  if (round.result) {
    return NextResponse.json({ ok: true, alreadySettled: true, index: round.index, result: round.result });
  }

  const choices = await prisma.choice.findMany({ 
    where: { roundId: round.id },
    orderBy: { position: 'asc' }
  });
  
  const totalPlayers = choices.length;

  const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
  
  // New winning logic: position-based winners
  let winners: typeof choices = [];
  if (result === 'HEADS') {
    // Top 1-50 players win on HEADS
    winners = choices.filter(c => c.position <= 50);
  } else {
    // Players 51-100 win on TAILS
    winners = choices.filter(c => c.position >= 51 && c.position <= 100);
  }

  // For demo: static fee pool amount per round, e.g., 10.00
  const feePool = 10.0;
  const perWinner = winners.length > 0 ? feePool / winners.length : 0;

  await prisma.$transaction(async (tx) => {
    await tx.round.update({ where: { id: round.id }, data: { result, feePool } });

    if (perWinner > 0) {
      for (const w of winners) {
        await tx.reward.upsert({
          where: { walletId_roundId: { walletId: w.walletId, roundId: round.id } },
          update: { amount: perWinner },
          create: { walletId: w.walletId, roundId: round.id, amount: perWinner }
        });
      }
    }
  });

  return NextResponse.json({ 
    ok: true, 
    index, 
    result, 
    totalPlayers,
    winnersCount: winners.length,
    feePool, 
    perWinner,
    winningPositions: result === 'HEADS' ? '1-50' : '51-100'
  });
}


