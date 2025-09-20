import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  wallet: z.string().min(3).max(128),
  side: z.enum(['HEADS', 'TAILS'])
});

async function getOrCreateCurrentRound() {
  // Round boundaries aligned to 3-minute windows since epoch
  const now = new Date();
  const threeMinMs = 3 * 60 * 1000;
  const startMs = now.getTime() - (now.getTime() % threeMinMs);
  const endMs = startMs + threeMinMs;
  const index = Math.floor(endMs / threeMinMs); // monotonic increasing

  let round = await prisma.round.findUnique({ where: { index } });
  if (!round) {
    round = await prisma.round.create({
      data: {
        index,
        startedAt: new Date(startMs),
        endsAt: new Date(endMs),
        feePool: 0
      }
    });
  }
  return round;
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  let payload: z.infer<typeof bodySchema> | null = null;

  if (contentType.includes('application/json')) {
    const json = await req.json().catch(() => null);
    if (json) {
      const parsed = bodySchema.safeParse(json);
      if (parsed.success) payload = parsed.data; else return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 });
    }
  } else {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ ok: false, error: 'Missing form' }, { status: 400 });
    const wallet = String(form.get('wallet') || '');
    const side = String(form.get('side') || '');
    const parsed = bodySchema.safeParse({ wallet, side });
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 });
    payload = parsed.data;
  }

  if (!payload) return NextResponse.json({ ok: false, error: 'Missing body' }, { status: 400 });

  const wallet = await prisma.wallet.findUnique({ where: { address: payload.wallet } });
  if (!wallet) return NextResponse.json({ ok: false, error: 'Wallet not verified' }, { status: 403 });

  const round = await getOrCreateCurrentRound();

  // Check if player already has a choice in this round
  const existingChoice = await prisma.choice.findUnique({
    where: { walletId_roundId: { walletId: wallet.id, roundId: round.id } }
  });

  let position: number;
  
  if (existingChoice) {
    // Player is updating their choice, keep same position
    position = existingChoice.position;
    await prisma.choice.update({
      where: { walletId_roundId: { walletId: wallet.id, roundId: round.id } },
      data: { side: payload.side as any }
    });
  } else {
    // New player - assign next available position (1-100)
    const currentChoices = await prisma.choice.findMany({
      where: { roundId: round.id },
      orderBy: { position: 'asc' }
    });

    // Find next available position (1-100)
    position = 1;
    for (const choice of currentChoices) {
      if (choice.position === position) {
        position++;
      } else {
        break;
      }
    }

    // Max 100 players per round
    if (position > 100) {
      return NextResponse.json({ ok: false, error: 'Runde er fuld (max 100 spillere)' }, { status: 400 });
    }

    await prisma.choice.create({
      data: {
        walletId: wallet.id,
        roundId: round.id,
        side: payload.side as any,
        position
      }
    });
  }

  return NextResponse.json({ 
    ok: true, 
    roundIndex: round.index, 
    endsAt: round.endsAt,
    position,
    winCondition: position <= 50 ? 'HEADS' : 'TAILS'
  });
}


