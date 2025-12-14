"use client";

import { useEffect } from "react";
import {
  getTelegramWebApp,
  readTelegramUserFromWebApp,
  saveTelegramUserToStorage,
} from "@/lib/telegram";

export default function TelegramBoot() {
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;

    tg.ready?.();
    tg.expand?.();
    tg.disableVerticalSwipes?.();

    const user = readTelegramUserFromWebApp();
    if (user) saveTelegramUserToStorage(user);
  }, []);

  return null;
}
