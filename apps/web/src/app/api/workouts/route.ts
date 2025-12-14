import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type WorkoutCreateBody = {
  telegramId?: string;
  type?: string; // то, что шлёт фронт
  duration?: number | string;
  calories?: number | string;
};

function getWorkoutModel() {
  const dmmf = (Prisma as any).dmmf ?? (prisma as any)?._dmmf;
  const models = dmmf?.datamodel?.models ?? [];
  return models.find((m: any) => m.name === "Workout") ?? null;
}

function buildWorkoutCreateData(userId: string, body: WorkoutCreateBody) {
  const model = getWorkoutModel();

  const durationNum =
    body.duration !== undefined ? Number(body.duration) : undefined;
  const caloriesNum =
    body.calories !== undefined ? Number(body.calories) : undefined;

  const typeValue = String(body.type ?? "workout");

  // базовые поля, которые почти наверняка есть
  const data: Record<string, any> = {
    userId,
    ...(Number.isFinite(durationNum!) ? { duration: durationNum } : {}),
    ...(Number.isFinite(caloriesNum!) ? { calories: caloriesNum } : {}),
  };

  // Если DMMF не доступен — просто вернём базу (Prisma сам скажет, чего не хватает)
  if (!model) return data;

  const fields: any[] = model.fields ?? [];
  const fieldNames = new Set(fields.map((f) => f.name));

  // 1) если реально есть поле "type" — используем его
  if (fieldNames.has("type")) {
    data.type = typeValue;
    return data;
  }

  // 2) иначе: найдём обязательные scalar-поля без дефолта и заполним
  //    (кроме технических)
  const skip = new Set(["id", "createdAt", "updatedAt", "userId"]);

  const requiredScalars = fields.filter((f) => {
    const isScalar = f.kind === "scalar";
    const required = !!f.isRequired;
    const hasDefault = f.hasDefaultValue === true;
    return isScalar && required && !hasDefault && !skip.has(f.name);
  });

  // если есть обязательное строковое поле — считаем, что это "тип/название"
  const reqString = requiredScalars.find((f) => f.type === "String");
  if (reqString) {
    data[reqString.name] = typeValue;
  }

  // если остались обязательные числа/булевы — подстрахуемся
  for (const f of requiredScalars) {
    if (data[f.name] !== undefined) continue;

    if (f.type === "Int" || f.type === "Float" || f.type === "Decimal") {
      data[f.name] = 0;
      continue;
    }
    if (f.type === "Boolean") {
      data[f.name] = false;
      continue;
    }

    // enum: возьмём первый вариант из DMMF
    const enums = (model?.dmmf?.datamodel?.enums ??
      (Prisma as any).dmmf?.datamodel?.enums ??
      []) as any[];
    const enumDef = enums.find((e) => e.name === f.type);
    if (enumDef?.values?.length) {
      data[f.name] = enumDef.values[0].name ?? enumDef.values[0];
    }
  }

  return data;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");

  if (!telegramId) {
    return NextResponse.json({ error: "telegramId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return NextResponse.json({ items: [] });

  const rows = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // совместимость со старым фронтом (date)
  const items = rows.map((w: any) => ({ ...w, date: w.createdAt }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WorkoutCreateBody;

    if (!body.telegramId) {
      return NextResponse.json({ error: "telegramId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: body.telegramId },
    });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    // ВАЖНО: кастуем в any, потому что поля могут отличаться в схеме
    const data = buildWorkoutCreateData(user.id, body) as any;

    const item = await prisma.workout.create({ data });

    return NextResponse.json({ item: { ...item, date: (item as any).createdAt } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
