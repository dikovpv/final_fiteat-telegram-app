import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegramId");
    if (!telegramId)
      return NextResponse.json({ error: "telegramId required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user)
      return NextResponse.json({ error: "user not found" }, { status: 404 });

    const weight = user.weightKg ?? 80;
    const height = user.heightCm ?? 176;
    const age = user.age ?? 30;
    const goal = user.goal ?? "maintain";
    const act = user.activity ?? "medium";
    const g = user.gender ?? "male";

    // BMR (Mifflin–St Jeor)
    const BMR = 10 * weight + 6.25 * height - 5 * age + (g === "female" ? -161 : 5);
    let TDEE = BMR * (act === "low" ? 1.2 : act === "high" ? 1.75 : 1.55);
    if (goal === "lose") TDEE *= 0.85;
    if (goal === "gain") TDEE *= 1.15;

    const targetCal = Math.round(TDEE);
    const targetProtein = Math.round(weight * 1.8);
    const targetFat = Math.round(weight * 0.9);
    const calAfterPF = targetProtein * 4 + targetFat * 9;
    const targetCarbs = Math.max(0, Math.round((targetCal - calAfterPF) / 4));

    // Consumed today (server local midnight)
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const meals = await prisma.meal.findMany({
      where: { userId: user.id, createdAt: { gte: start } },
    });

    const sum = meals.reduce(
      (acc, m) => {
        acc.cal += m.calories ?? 0;
        acc.p += m.protein ?? 0;
        acc.f += m.fat ?? 0;
        acc.c += m.carbs ?? 0;
        return acc;
      },
      { cal: 0, p: 0, f: 0, c: 0 }
    );

    return NextResponse.json({
      target: { cal: targetCal, p: targetProtein, f: targetFat, c: targetCarbs },
      consumed: sum,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
