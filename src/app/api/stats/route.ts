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
    include: { choices: { orderBy: { position: 'asc' } } }
  });

  const totalPlayers = round ? round.choices.length : 0;
  const positions1to50 = round ? round.choices.filter(c => c.position <= 50).length : 0;
  const positions51to100 = round ? round.choices.filter(c => c.position >= 51 && c.position <= 100).length : 0;
  const feePool = round ? round.feePool : 0;

  const recent = await prisma.round.findMany({
    orderBy: { index: 'desc' },
    take: 5,
    where: { result: { not: null } },
    include: {
      choices: {
        select: { position: true },
        orderBy: { position: 'asc' }
      }
    }
  });

  return NextResponse.json({ 
    ok: true, 
    totalPlayers,
    positions1to50,
    positions51to100,
    feePool, 
    recent: recent.map(r => ({
      index: r.index,
      result: r.result,
      totalPlayers: r.choices.length,
      winningPositions: r.result === 'HEADS' ? '1-50' : '51-100'
    }))
  });
}


