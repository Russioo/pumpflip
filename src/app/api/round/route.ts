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

  const choices = await prisma.choice.findMany({ where: { roundId: round.id } });
  const headsCount = choices.filter(c => c.side === 'HEADS').length;
  const tailsCount = choices.filter(c => c.side === 'TAILS').length;

  const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
  const winners = choices.filter(c => c.side === result);

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

  return NextResponse.json({ ok: true, index, result, headsCount, tailsCount, feePool, perWinner });
}


