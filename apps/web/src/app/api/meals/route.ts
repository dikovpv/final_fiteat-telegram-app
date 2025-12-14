import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");
  if (!telegramId)
    return NextResponse.json({ error: "telegramId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return NextResponse.json({ items: [] });

  const rows = await prisma.meal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // alias date для совместимости со старым фронтом
  const items = rows.map((m) => ({
    ...m,
    date: m.createdAt,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramId, name, calories, protein, fat, carbs } = body;

    if (!telegramId)
      return NextResponse.json({ error: "telegramId required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user)
      return NextResponse.json({ error: "user not found" }, { status: 404 });

    const item = await prisma.meal.create({
      data: {
        userId: user.id,
        name: String(name ?? ""),
        calories: Number(calories ?? 0),
        protein: Number(protein ?? 0),
        fat: Number(fat ?? 0),
        carbs: Number(carbs ?? 0),
      },
    });

    return NextResponse.json({ item: { ...item, date: item.createdAt } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
