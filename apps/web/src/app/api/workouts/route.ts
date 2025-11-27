import { NextResponse } from 'next/server';
import { prisma } from '@/src/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');
  if (!telegramId) return NextResponse.json({ error: 'telegramId required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return NextResponse.json({ items: [] });

  const items = await prisma.workout.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }});
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramId, name, sets, reps, weight } = body;
    if (!telegramId) return NextResponse.json({ error: 'telegramId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

    const item = await prisma.workout.create({
      data: { userId: user.id, name, sets, reps, weight }
    });
    return NextResponse.json({ item });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
