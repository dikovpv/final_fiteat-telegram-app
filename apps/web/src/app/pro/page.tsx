"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Star,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { getUserPlan, setUserPlan, type PlanType } from "@/lib/user-plan";

export default function ProPage() {
  const [plan, setPlan] = useState<PlanType>("free");
  const isPro = plan === "pro";

  // читаем текущий план из localStorage
  useEffect(() => {
    const current = getUserPlan();
    setPlan(current);
  }, []);

  const handleSwitchToPro = () => {
    setUserPlan("pro");
    setPlan("pro");
  };

  const handleSwitchToFree = () => {
    setUserPlan("free");
    setPlan("free");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#050818] to-[#050814] text-gray-50 pb-24">
      <div className="cosmic-bg" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>

          <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-black/40 border border-white/10">
            <span className="text-gray-400">Текущий план:</span>
            <span
              className={
                isPro
                  ? "font-semibold text-emerald-300"
                  : "font-semibold text-gray-200"
              }
            >
              {isPro ? "FitEat PRO" : "Бесплатный"}
            </span>
          </div>
        </div>

        {/* Хиро-блок */}
        <motion.div
          className="glass-card p-6 sm:p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-100 text-xs mb-3">
                <Crown className="w-4 h-4" />
                <span>FitEat PRO — больше, чем трекер</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 neon-text-teal">
                Сделай тело и голову чуть лучше, чем вчера
              </h1>
              <p className="text-sm sm:text-base text-gray-300 max-w-xl">
                PRO-версия открывает готовые меню, продуманные тренировки,
                расширенные советы и аналитику. Всё, что помогает не сорваться и
                дойти до результата.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 min-w-[220px]">
              {isPro ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-300 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>У тебя уже активен FitEat PRO</span>
                  </div>
                  <button
                    onClick={handleSwitchToFree}
                    className="w-full px-4 py-2 rounded-xl border border-gray-600 text-gray-200 hover:bg-white/5 text-sm transition"
                  >
                    Вернуться на бесплатный план
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-300 text-sm">
                    <Lock className="w-5 h-5" />
                    <span>Часть контента пока закрыта</span>
                  </div>
                  <button
                    onClick={handleSwitchToPro}
                    className="w-full cosmic-button flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    <span>Активировать FitEat PRO</span>
                  </button>
                  <p className="text-[11px] text-gray-500 text-center max-w-[220px]">
                    Сейчас это тестовый переключатель через localStorage, позже
                    сюда приедет реальная оплата.
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Сравнение планов */}
        <motion.div
          className="grid md:grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Free */}
          <div className="glass-card p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Бесплатный
                </h2>
                <p className="text-xs text-gray-400">
                  Базовый трекинг и ручной ввод
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-200">0 ₽</div>
                <div className="text-[11px] text-gray-500">навсегда</div>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[2px]" />
                <span>Дневник питания, тренировок, воды и сна</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[2px]" />
                <span>Ручное добавление блюд и упражнений</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[2px]" />
                <span>Базовые советы и статьи</span>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <Lock className="w-4 h-4 text-gray-400 mt-[2px]" />
                <span>Готовые рецепты и меню (частично)</span>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <Lock className="w-4 h-4 text-gray-400 mt-[2px]" />
                <span>PRO-тренировки и программы</span>
              </li>
            </ul>
          </div>

          {/* PRO */}
          <div className="glass-card p-5 border border-emerald-400/40 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div>
                <h2 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  FitEat PRO
                </h2>
                <p className="text-xs text-emerald-100/80">
                  Всё, чтобы реально дойти до цели
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-200">
                  ??? ₽
                </div>
                <div className="text-[11px] text-emerald-100/70">
                  цена появится позже
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-sm relative z-10">
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-amber-300 mt-[2px]" />
                <span>Полный доступ ко всем рецептам и книге блюд</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-300 mt-[2px]" />
                <span>Готовые планы питания под твой КБЖУ</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-sky-300 mt-[2px]" />
                <span>Программы тренировок под разные цели</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-300 mt-[2px]" />
                <span>PRO-советы: питание, тренировки, здоровье и голова</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[2px]" />
                <span>Расширенная аналитика прогресса и привычек</span>
              </li>
            </ul>

            <div className="mt-4">
              {isPro ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs text-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Активен PRO-доступ</span>
                </div>
              ) : (
                <button
                  onClick={handleSwitchToPro}
                  className="cosmic-button w-full mt-1 flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  <span>Включить FitEat PRO</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Подсказка куда он влияет */}
        <motion.div
          className="glass-card p-4 mb-10 text-xs text-gray-300 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-semibold text-gray-100 mb-1">
            Где используется твой план:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              В разделе <span className="font-semibold">«Советы»</span> — PRO-статьи
              открываются только при плане PRO.
            </li>
            <li>
              В <span className="font-semibold">книге рецептов</span> — часть блюд
              можно пометить как PRO (будем делать дальше).
            </li>
            <li>
              В будущих разделах с{" "}
              <span className="font-semibold">готовыми тренировками</span> и
              <span className="font-semibold"> планами питания</span>.
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
