export {};

declare global {
  type TelegramUser = {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };

  type TelegramWebApp = {
    initData?: string;
    initDataUnsafe?: {
      user?: TelegramUser;
      [key: string]: any;
    };

    expand?: () => void;
    ready?: () => void;
    close?: () => void;

    disableVerticalSwipes?: () => void;

    viewportHeight?: number;
    viewportStableHeight?: number;
    onEvent?: (event: string, cb: (...args: any[]) => void) => void;
    offEvent?: (event: string, cb: (...args: any[]) => void) => void;
  };

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
