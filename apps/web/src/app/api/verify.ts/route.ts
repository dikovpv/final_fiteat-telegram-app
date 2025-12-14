import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyTelegramInitData(initData: string, botToken: string, maxAgeSec = 24 * 60 * 60) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false as const, error: "No hash in initData" };

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw ? Number(authDateRaw) : 0;
  if (!authDate || !Number.isFinite(authDate)) {
    return { ok: false as const, error: "Invalid auth_date" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSec) {
    return { ok: false as const, error: "initData expired" };
  }

  // data_check_string: key=value lines sorted by key, excluding hash
  const dataPairs: string[] = [];
  params.forEach((value, key) => {
    if (key === "hash") return;
    dataPairs.push(`${key}=${value}`);
  });
  dataPairs.sort((a, b) => a.localeCompare(b, "en"));

  const dataCheckString = dataPairs.join("\n");

  // secret_key = sha256(bot_token)
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  // computed_hash = hex(hmac_sha256(secret_key, data_check_string))
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqual(computed, hash)) {
    return { ok: false as const, error: "Hash mismatch" };
  }

  // user comes as JSON string in "user"
  const userRaw = params.get("user");
  let user: any = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  return { ok: true as const, user, authDate };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const initData: string | undefined = body?.initData;

  if (!initData) {
    return NextResponse.json({ ok: false, error: "initData is required" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { ok: false, error: "Server misconfigured: TELEGRAM_BOT_TOKEN missing" },
      { status: 500 },
    );
  }

  const result = verifyTelegramInitData(initData, botToken);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  // Минимальная “сессия” без БД: просто отдаем user.
  // Позже тут можно создать пользователя в БД и выставить httpOnly cookie.
  return NextResponse.json({
    ok: true,
    user: result.user,
    authDate: result.authDate,
  });
}
