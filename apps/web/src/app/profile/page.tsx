// apps/web/src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

type TelegramUser = {
  id: number;
  firstName?: string;
  username?: string;
};

export default function ProfilePage() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [plan, setPlan] = useState<PlanType>("free");
  const { theme, toggleTheme } = useTheme();

  // Подтягиваем данные из Telegram WebApp
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (!user) return;
    setTelegramUser({
      id: user.id,
      firstName: user.first_name,
      username: user.username,
    });
  }, []);

  // Подтягиваем профиль из localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fitEatUserData");
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  // Читаем активный тариф (free / pro)
  useEffect(() => {
    const currentPlan = getUserPlan();
    setPlan(currentPlan);
  }, []);

  const currentTariff =
    plan === "pro" ? "FitEat PRO" : "Базовый (бесплатный)";

  const tariffUntil = userData?.tariffUntil
    ? new Date(userData.tariffUntil).toLocaleDateString("ru-RU")
    : null;

  // Сброс профиля целиком (анкета/замеры, но не весь localStorage)
  const handleResetUserData = () => {
    const ok = window.confirm(
      "Сбросить все данные профиля (анкета, цели, замеры)? Это действие нельзя отменить."
    );
    if (!ok) return;

    localStorage.removeItem("fitEatUserData");
    window.location.href = "/";
  };

  // Изменить стартовые данные — открыть анкету на главной
  const handleEditStartData = () => {
    localStorage.setItem("fitEatOpenSurveyOnHome", "1");
    window.location.href = "/";
  };

  const displayName =
    telegramUser?.firstName || userData?.name || "Безымянный спортсмен";

  const displayUsername =
    telegramUser?.username ? `@${telegramUser.username}` : "ник не указан";

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Золотая шапка профиля */}
      <PageHeader
        title="Профиль"
        backHref="/"
        backLabel="На главную"
        rightSlot={
          <Link
            href="/pro"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)]/70 border border-[var(--border-soft)] text-[11px] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: "var(--accent-gold)" }}
            />
            <span>{currentTariff}</span>
          </Link>
        }
      />

      <div className="relative z-10 max-w-3xl mx-auto px-3 sm:px-4 md:px-5 pt-4 pb-10 flex flex-col gap-4">
        {/* Карточка пользователя */}
        <section className="glass-card px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--surface-muted)] border border-[var(--border-soft)] flex items-center justify-center">
              <User
                className="w-7 h-7"
                style={{ color: "var(--accent-gold)" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{displayName}</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {displayUsername}
              </span>
              {telegramUser && (
                <span className="text-[11px] text-[var(--text-muted)] mt-1">
                  Telegram ID: {telegramUser.id}
                </span>
              )}
            </div>
          </div>

          {userData?.profile && (
            <div className="grid grid-cols-2 gap-3 text-xs mt-2">
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">Возраст</span>
                <span className="text-[var(--text-primary)]">
                  {userData.profile.age ?? "—"} лет
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">Рост</span>
                <span className="text-[var(--text-primary)]">
                  {userData.profile.heightCm ?? "—"} см
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">Вес</span>
                <span
                  className="text-[var(--text-primary)] font-semibold"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {userData.weight ?? userData.profile.weightKg ?? "—"} кг
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">Цель</span>
                <span className="text-[var(--text-primary)]">
                  {userData.profile.goal === "lose"
                    ? "Похудение"
                    : userData.profile.goal === "gain"
                    ? "Набор массы"
                    : userData.profile.goal === "maintain"
                    ? "Поддержание"
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Тариф и оплата — кликабельная секция → /pro */}
        <Link href="/pro" className="block">
          <section className="glass-card px-4 py-4 flex flex-col gap-3 cursor-pointer hover:border-[var(--accent-gold)]/70 hover:bg-[var(--surface-muted)] transition-all">
            <h2 className="text-sm font-semibold mb-1">Тариф и оплата</h2>

            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">Текущий тариф</span>
                <span
                  className="font-medium"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {currentTariff}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {tariffUntil
                  ? `активен до ${tariffUntil}`
                  : "без ограничений"}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-[var(--text-secondary)]">
              История оплат и управление подпиской появятся здесь, когда мы
              подключим биллинг.
            </div>

            <div
              className="mt-1 text-[11px] font-medium"
              style={{ color: "var(--accent-gold)" }}
            >
              Нажми, чтобы изменить тариф FitEat.
            </div>
          </section>
        </Link>

        {/* Настройки профиля */}
        <section className="glass-card px-4 py-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Настройки профиля</h2>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleEditStartData}
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--surface-muted)] transition-all border border-[var(--border-soft)] text-left"
            >
              Изменить стартовые данные
            </button>

            <button
              type="button"
              onClick={handleResetUserData}
              className="w-full px-4 py-2 text-xs text-red-600 border border-red-300 rounded-lg bg-red-50 hover:bg-red-100 transition-all text-left"
            >
              Сбросить профиль и пройти опрос заново
            </button>
          </div>
        </section>

        {/* История замеров */}
        {userData?.measurementsHistory &&
          Array.isArray(userData.measurementsHistory) &&
          userData.measurementsHistory.length > 0 && (
            <MeasurementsHistoryCard history={userData.measurementsHistory} />
          )}

        {/* Тема оформления */}
        <section className="glass-card px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Тема приложения</span>
            <span className="text-xs text-[var(--text-secondary)]">
              Переключайся между тёмной и светлой в один тап.
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] hover:bg-[var(--surface-muted)] transition-all text-xs text-[var(--text-primary)]"
          >
            {isDark ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Тёмная</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Светлая</span>
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
}

// ===== История замеров =====

type MeasurementRow = {
  date: string;
  [key: string]: any;
};

const METRIC_CONFIG: { key: string; label: string; unit: string }[] = [
  { key: "weight", label: "Вес", unit: "кг" },
  { key: "bodyFat", label: "% жира", unit: "%" },
  { key: "neck", label: "Шея", unit: "см" },
  { key: "shoulders", label: "Плечи", unit: "см" },
  { key: "chest", label: "Грудь", unit: "см" },
  { key: "arms", label: "Руки", unit: "см" },
  { key: "forearm", label: "Предплечье", unit: "см" },
  { key: "waist", label: "Талия", unit: "см" },
  { key: "hips", label: "Бёдра", unit: "см" },
  { key: "thigh", label: "Бедро", unit: "см" },
  { key: "calf", label: "Икра", unit: "см" },
];

function MeasurementsHistoryCard({ history }: { history: MeasurementRow[] }) {
  // сортируем по дате (новые сверху)
  const rows = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const total = rows.length;
  const LAST_COUNT = 5;

  const [showAll, setShowAll] = React.useState(false);

  const visibleRows = showAll ? rows : rows.slice(0, LAST_COUNT);
  const visibleCount = visibleRows.length;

  return (
    <section className="glass-card px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">История замеров</h2>

        {total > 0 && (
          <span className="text-[11px] text-[var(--text-secondary)]">
            {total <= LAST_COUNT
              ? `Всего ${total} замеров`
              : showAll
              ? `Показаны все ${total} замеров`
              : `Показаны последние ${visibleCount} из ${total}`}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {visibleRows.map((row) => (
          <MeasurementHistoryRow
            key={row.date}
            row={row}
            isLatest={row.date === rows[0]?.date}
          />
        ))}
      </div>

      {total > LAST_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-1 self-start text-[11px] px-3 py-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] transition-colors"
        >
          {showAll
            ? `Свернуть до последних ${LAST_COUNT}`
            : `Показать все ${total} замеров`}
        </button>
      )}

      <p className="text-[11px] text-[var(--text-muted)]">
        Листай карточки по горизонтали — внутри каждый замер: вес, % жира и все
        основные окружности.
      </p>
    </section>
  );
}

function MeasurementHistoryRow({
  row,
  isLatest,
}: {
  row: MeasurementRow;
  isLatest: boolean;
}) {
  const [showArrow, setShowArrow] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      const canScroll = el.scrollWidth > el.clientWidth + 1;
      if (!canScroll) {
        setShowArrow(false);
        return;
      }
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setShowArrow(!atEnd);
    };

    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);

    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const d = new Date(row.date);
  const dateLabel = d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2 flex flex-col gap-2 relative">
      {/* дата + бейдж «последний замер» */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
        <span>{dateLabel}</span>
        {isLatest && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium mr-8"
            style={{
              backgroundColor: "rgba(214, 179, 94, 0.12)",
              color: "var(--accent-gold)",
            }}
          >
            Последний замер
          </span>
        )}
      </div>

      {/* горизонтальный скролл с замерами */}
      <div className="relative mt-1">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1 pr-6"
        >
          {METRIC_CONFIG.map((m) => {
            const raw = (row as any)[m.key];
            if (raw === undefined || raw === null || raw === "") {
              return null;
            }

            const value =
              m.key === "bodyFat"
                ? `${Number(raw).toFixed(1)}${m.unit}`
                : `${raw} ${m.unit}`;

            const highlight =
              isLatest && (m.key === "weight" || m.key === "bodyFat");

            return (
              <div
                key={m.key}
                className="flex flex-col min-w-[60px] text-[11px]"
              >
                <span className="text-[var(--text-muted)]">{m.label}</span>
                <span
                  className="font-semibold"
                  style={
                    highlight ? { color: "var(--accent-gold)" } : undefined
                  }
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* стрелочка-подсказка */}
        {showArrow && (
          <div className="pointer-events-none absolute right-1 top-[-2rem]">
            <div className="rounded-full bg-[var(--surface)]/90 shadow-sm px-1.5 py-1 flex items-center justify-center">
              <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
