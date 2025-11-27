// apps/bot/src/index.ts

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Bot } from "grammy";

// =============== ЗАГРУЗКА .env =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: envPath });
console.log("✅ .env loaded from:", envPath);

// =============== ОБРАБОТКА ОШИБОК =================
process.on("uncaughtException", (err) => {
  console.error("❌ uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ unhandledRejection:", reason);
});

// =============== ПЕРЕМЕННЫЕ =================
const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";
const botName = process.env.BOT_NAME || "FitFoodBot";
const providerToken = process.env.TELEGRAM_PROVIDER_TOKEN;

if (!token) {
  console.error("⚠️ Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

// =============== ИНИЦИАЛИЗАЦИЯ БОТА =================
const bot = new Bot(token);

// /start — приветственное сообщение с кнопкой открытия мини-приложения
bot.command("start", async (ctx) => {
  const text = `Привет, ${ctx.from?.first_name || "друг"}!\nОткрывай мини-приложение FitEat 👇`;
  const kb = {
    reply_markup: {
      inline_keyboard: [[{ text: "🍽️ Открыть FitEat", web_app: { url: appUrl } }]],
    },
  };
  await ctx.reply(text, kb as any);
});

// /ping — тестовая команда
bot.hears("ping", (ctx) => ctx.reply("pong 🏓"));

// /buy — Telegram Payments
bot.command("buy", async (ctx) => {
  if (!providerToken) {
    return ctx.reply("💳 Оплата пока недоступна, свяжитесь с тренером.");
  }

  await ctx.api.sendInvoice(
    ctx.chat!.id, // chat_id
    "Fit пакет (питание + тренировки)", // title
    "Доступ ко всем разделам на 30 дней", // description
    "fiteat_all_30", // payload
    "RUB", // currency
    [{ label: "Подписка", amount: 99000 }], // цены в копейках
    {
      provider_token: providerToken,
      photo_url: "https://your-app/logo.png",
      start_parameter: "fit-subscription",
      need_email: true,
    }
  );
});

// успешная оплата
bot.on("message:successful_payment", async (ctx) => {
  await ctx.reply("✅ Оплата прошла успешно! Доступ активирован. Приятных тренировок 💪");
});

// =============== ЗАПУСК =================
bot.start().then(() => {
  console.log(`🤖 ${botName} запущен (long polling)`);
  console.log(`🌐 Mini app URL: ${appUrl}`);
});
