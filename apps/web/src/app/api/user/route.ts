import { NextResponse } from 'next/server';
import { prisma } from '@db/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { id, firstName, username } = body;

  if (!id || !firstName) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Найти пользователя по Telegram ID
  const existingUser = await prisma.user.findUnique({
    where: { telegramId: id },
  });

  if (existingUser) {
    return NextResponse.json(existingUser);
  }

  // Создать нового пользователя
  const newUser = await prisma.user.create({
    data: {
      telegramId: id,
      firstName,
      username,
    },
  });

  return NextResponse.json(newUser);
}
