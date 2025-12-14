// apps/web/src/app/layout.tsx
import "./globals.css";
import "../styles/themes.css";
import Script from "next/script";
import Navigation from "./components/Navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { TelegramProvider } from "@/context/TelegramContext";
import TelegramBoot from "./components/TelegramBoot";

export const metadata = {
  title: "AVYRA FitEat - Космический фитнес-помощник",
  description: "Персональный тренер по питанию и тренировкам в Telegram",
  keywords: "фитнес, питание, тренировки, здоровье, калории, бжу",
  openGraph: {
    title: "AVYRA FitEat - Твой персональный фитнес-коуч",
    description: "Рассчитай персональный план питания и достигни своих целей!",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVYRA FitEat - Космический фитнес-помощник",
    description: "Персональный тренер по питанию и тренировкам в Telegram",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#0d1d21" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        <meta name="telegram:webapp" content="true" />

        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>

      <body className="antialiased text-[var(--text-primary)] bg-[var(--background)]">
        <ThemeProvider>
          <TelegramProvider>
            <TelegramBoot />

            <div className="cosmic-bg"></div>

            <main className="relative z-10 min-h-screen pb-20">
              {children}
            </main>

            <Navigation />
          </TelegramProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
