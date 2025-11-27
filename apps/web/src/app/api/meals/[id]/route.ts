import { NextResponse } from 'next/server';
import { prisma } from '@/src/server/db';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = params;
  const body = await req.json();
  const item = await prisma.meal.update({ where: { id }, data: body });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = params;
  await prisma.meal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
