import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function currentRoundWindow() {
  const now = Date.now();
  const step = 3 * 60 * 1000;
  const start = now - (now % step);
  const end = start + step;
  const index = Math.floor(end / step);
  return { start: new Date(start), end: new Date(end), index };
}

export async function GET() {
  const { index } = currentRoundWindow();
  const round = await prisma.round.findUnique({
    where: { index },
    include: { choices: true }
  });

  const heads = round ? round.choices.filter(c => c.side === 'HEADS').length : 0;
  const tails = round ? round.choices.filter(c => c.side === 'TAILS').length : 0;
  const feePool = round ? round.feePool : 0;

  const recent = await prisma.round.findMany({
    orderBy: { index: 'desc' },
    take: 5,
    where: { result: { not: null } },
    select: { index: true, result: true }
  });

  return NextResponse.json({ ok: true, heads, tails, feePool, recent });
}


