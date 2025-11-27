import { NextResponse } from 'next/server';
import { prisma } from '@fit-eat/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      telegramId, name, username,
      gender, age, heightCm, weightKg, goal, activity, preferences
    } = body;

    if (!telegramId) return NextResponse.json({ error: 'telegramId required' }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { name, username, gender, age, heightCm, weightKg, goal, activity, preferences },
      create: { telegramId, name, username, gender, age, heightCm, weightKg, goal, activity, preferences }
    });

    return NextResponse.json({ ok: true, user });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
