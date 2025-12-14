"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  readTelegramUserFromWebApp,
  saveTelegramUserToStorage,
  loadTelegramUserFromStorage,
  type TelegramUser,
} from "@/lib/telegram";

type TelegramContextValue = {
  user: TelegramUser | null;
  isFromTelegram: boolean;
  loading: boolean;
};

const TelegramContext = createContext<TelegramContextValue | undefined>(
  undefined,
);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromTelegram, setIsFromTelegram] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1) сначала пробуем достать из Telegram.WebApp, но ждём SDK (ретраи)
      let tgUser: TelegramUser | null = null;

      for (let i = 0; i < 20; i++) {
        if (cancelled) return;

        tgUser = readTelegramUserFromWebApp();
        if (tgUser) break;

        await sleep(100); // ждём SDK
      }

      if (cancelled) return;

      if (tgUser) {
        // sdk есть, пользователь есть
        setIsFromTelegram(true);
        setUser(tgUser);
        saveTelegramUserToStorage(tgUser);

        // косметика для Telegram WebApp
        try {
          window.Telegram?.WebApp?.ready?.();
          window.Telegram?.WebApp?.expand?.();
        } catch {}
      } else {
        // 2) если не Telegram — берём сохранённого (если был)
        const stored = loadTelegramUserFromStorage();
        setIsFromTelegram(false);
        setUser(stored);
      }

      setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isFromTelegram, loading }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) {
    throw new Error("useTelegram must be used within <TelegramProvider>");
  }
  return ctx;
}
