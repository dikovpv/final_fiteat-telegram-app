"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { User, ArrowLeft, Sparkles, Moon, Sun } from "lucide-react";
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

  // Читаем активный тариф (free / pro) из единого источника
  useEffect(() => {
    const currentPlan = getUserPlan(); // "free" | "pro"
    setPlan(currentPlan);
  }, []);

  const currentTariff =
    plan === "pro" ? "FitEat PRO" : "Базовый (бесплатный)";

  const tariffUntil = userData?.tariffUntil
    ? new Date(userData.tariffUntil).toLocaleDateString("ru-RU")
    : null;

  // Сброс профиля целиком
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
    <>
      {/* Космический фон, такой же как на главной */}
      <div className="cosmic-bg"></div>

      <div className="relative z-10 min-h-screen px-4 sm:px-6 md:px-8 pt-6 pb-10 flex flex-col gap-6">
        {/* Верхняя панель: назад и заголовок */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 border border-white/15 hover:bg-black/50 transition-all text-sm text-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </Link>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Профиль</span>
          </div>
        </div>

        {/* Карточка пользователя */}
        <section className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-500/30 border border-teal-300/60 flex items-center justify-center">
              <User className="w-7 h-7 text-teal-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white">
                {displayName}
              </span>
              <span className="text-sm text-gray-400">{displayUsername}</span>
              {telegramUser && (
                <span className="text-[11px] text-gray-500 mt-1">
                  Telegram ID: {telegramUser.id}
                </span>
              )}
            </div>
          </div>

          {userData?.profile && (
            <div className="grid grid-cols-2 gap-3 text-xs mt-2">
              <div className="flex flex-col">
                <span className="text-gray-500">Возраст</span>
                <span className="text-gray-200">
                  {userData.profile.age ?? "—"} лет
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Рост</span>
                <span className="text-gray-200">
                  {userData.profile.heightCm ?? "—"} см
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Вес</span>
                <span className="text-gray-200">
                  {userData.weight ?? userData.profile.weightKg ?? "—"} кг
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Цель</span>
                <span className="text-gray-200">
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
          <section className="glass-card p-6 flex flex-col gap-3 cursor-pointer hover:border-teal-400/60 hover:bg-white/5 transition-all">
            <h2 className="text-base font-semibold text-white mb-1">
              Тариф и оплата
            </h2>

            <div className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-gray-400">Текущий тариф</span>
                <span className="text-gray-100 font-medium">
                  {currentTariff}
                </span>
              </div>
              <span className="text-[11px] text-gray-500">
                {tariffUntil
                  ? `активен до ${tariffUntil}`
                  : "без ограничений"}
              </span>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              История оплат и управление подпиской появятся здесь, когда мы
              подключим биллинг.
            </div>

            <div className="mt-1 text-[11px] text-teal-300">
              Нажми, чтобы изменить тариф FitEat.
            </div>
          </section>
        </Link>

        {/* Настройки профиля */}
        <section className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-white">
            Настройки профиля
          </h2>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleEditStartData}
              className="w-full px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all border border-white/20 text-left"
            >
              Изменить стартовые данные
            </button>

            <button
              type="button"
              onClick={handleResetUserData}
              className="w-full px-4 py-2 text-xs text-red-300/90 border border-red-500/40 rounded-xl bg-red-900/10 hover:bg-red-900/30 hover:text-red-100 transition-all text-left"
            >
              Сбросить профиль и пройти опрос заново
            </button>
          </div>
        </section>

        {/* История замеров */}
        {userData?.measurementsHistory &&
          Array.isArray(userData.measurementsHistory) &&
          userData.measurementsHistory.length > 0 && (
            <MeasurementsHistoryCard
              history={userData.measurementsHistory}
            />
          )}

        {/* Тема оформления */}
        <section className="glass-card p-6 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white">
              Тема приложения
            </span>
            <span className="text-xs text-gray-400">
              Переключайся между тёмной и светлой в один тап.
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 transition-all text-sm text-gray-100"
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
    </>
  );
}

// ===== История замеров =====

function MeasurementsHistoryCard({ history }: { history: any[] }) {
  const rows = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <section className="glass-card p-6 flex flex-col gap-3">
      <h2 className="text-base font-semibold text-white">
        История замеров
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px] text-gray-200 border-collapse">
          <thead className="bg-black/30">
            <tr>
              <th className="px-2 py-1 text-left font-medium">Дата</th>
              <th className="px-2 py-1 text-right font-medium">Вес</th>
              <th className="px-2 py-1 text-right font-medium">% жира</th>
              <th className="px-2 py-1 text-right font-medium">Талия</th>
              <th className="px-2 py-1 text-right font-medium">Грудь</th>
              <th className="px-2 py-1 text-right font-medium">Бёдра</th>
              <th className="px-2 py-1 text-right font-medium">Плечи</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const d = new Date(row.date);
              const dateLabel = d.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
              });
              return (
                <tr key={row.date} className="border-t border-white/5">
                  <td className="px-2 py-1">{dateLabel}</td>
                  <td className="px-2 py-1 text-right">
                    {row.weight != null ? `${row.weight} кг` : "—"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.bodyFat != null
                      ? `${Number(row.bodyFat).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.waist != null ? `${row.waist} см` : "—"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.chest != null ? `${row.chest} см` : "—"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.hips != null ? `${row.hips} см` : "—"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.shoulders != null ? `${row.shoulders} см` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-500">
        Запястье мы тут не трогаем — оно живёт только в формулах и пропорциях,
        а не как динамический замер.
      </p>
    </section>
  );
}
