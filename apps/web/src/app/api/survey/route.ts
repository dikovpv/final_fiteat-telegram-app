import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // Пока не сохраняем в БД — чтобы НЕ стопорить билд/деплой из-за moduleResolution.
    // (Позже подключим Prisma через "@/server/db" и нормальную модель.)
    return NextResponse.json({ ok: true, received: body ?? {} });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
