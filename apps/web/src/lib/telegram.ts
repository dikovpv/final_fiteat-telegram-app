// apps/web/src/lib/telegram.ts

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
    [key: string]: unknown;
  };

  ready?: () => void;
  expand?: () => void;
  close?: () => void;

  // не всегда есть, зависит от версии Telegram
  disableVerticalSwipes?: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const TELEGRAM_USER_STORAGE_KEY = "fitEatTelegramUser";

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function readTelegramUserFromWebApp(): TelegramUser | null {
  const tg = getTelegramWebApp();
  const user = tg?.initDataUnsafe?.user;
  if (!user?.id) return null;
  return user;
}

export function saveTelegramUserToStorage(user: TelegramUser) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TELEGRAM_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

export function loadTelegramUserFromStorage(): TelegramUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TELEGRAM_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id) return null;
    return parsed as TelegramUser;
  } catch {
    return null;
  }
}
