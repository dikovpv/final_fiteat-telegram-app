// apps/web/src/app/pro/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Lock,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
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

  const handleResetAccount = () => {
    const ok = window.confirm(
      "Сбросить аккаунт FitEat?\n\n" +
        "Будут удалены ВСЕ локальные данные приложения на этом устройстве:\n" +
        "— профиль и анкета\n" +
        "— цели и замеры\n" +
        "— дневник питания, тренировок, воды и сна\n" +
        "— выбранный тариф и настройки.\n\n" +
        "Это действие нельзя отменить."
    );
    if (!ok) return;

    try {
      localStorage.clear();
    } catch (e) {
      console.error("Ошибка очистки localStorage:", e);
    }

    window.location.href = "/";
  };

  const currentPlanLabel = isPro ? "FitEat PRO" : "Базовый (бесплатный)";

  return (
    <>
      <div className="cosmic-bg" />

      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] relative z-10 pb-16">
        {/* золотая шапка */}
        <PageHeader
          title="Тариф FitEat"
          backHref="/profile"
          backLabel="Профиль"
          rightSlot={
            <div className="px-3 py-1 rounded-full bg-[var(--surface)]/60 border border-[var(--border-soft)] text-[11px] font-medium">
              {currentPlanLabel}
            </div>
          }
        />

        <main className="max-w-3xl mx-auto px-3 sm:px-4 md:px-5 pt-4 flex flex-col gap-4">
          {/* Хиро-блок / описание PRO */}
          <motion.section
            className="glass-card p-5 sm:p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border-soft)] text-[11px]">
                  <Crown
                    className="w-4 h-4"
                    style={{ color: "var(--accent-gold)" }}
                  />
                  <span>FitEat PRO — больше, чем трекер</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold mt-3 mb-2">
                  Сделай тело и голову чуть лучше, чем вчера
                </h1>
                <p className="text-sm text-[var(--text-secondary)] max-w-xl">
                  PRO-версия открывает готовые меню, продуманные тренировки,
                  расширенные советы и аналитику. Всё, что помогает не сорваться
                  и дойти до результата.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 min-w-[220px]">
                {isPro ? (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-[var(--text-secondary)]">
                        У тебя уже активен{" "}
                        <span className="font-semibold">FitEat PRO</span>
                      </span>
                    </div>
                    <button
                      onClick={handleSwitchToFree}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] text-xs font-semibold hover:bg-[var(--surface-muted)] transition"
                    >
                      Вернуться на бесплатный план
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <Lock className="w-5 h-5 text-[var(--text-secondary)]" />
                      <span className="text-[var(--text-secondary)]">
                        Часть контента пока закрыта
                      </span>
                    </div>
                    <button
                      onClick={handleSwitchToPro}
                      className="w-full cosmic-button flex items-center justify-center gap-2 text-sm"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Активировать FitEat PRO</span>
                    </button>
                    <p className="text-[11px] text-[var(--text-muted)] text-center">
                      Сейчас это тестовый переключатель через localStorage,
                      позже сюда приедет реальная оплата.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.section>

          {/* Сравнение планов */}
          <motion.section
            className="grid md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {/* Бесплатный план */}
            <div className="glass-card p-4 sm:p-5 border border-[var(--border-soft)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold">Бесплатный</h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Базовый трекинг и ручной ввод
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">0 ₽</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    навсегда
                  </div>
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
                <li className="flex items-start gap-2 opacity-70">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] mt-[2px]" />
                  <span>Готовые рецепты и меню (частично)</span>
                </li>
                <li className="flex items-start gap-2 opacity-70">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] mt-[2px]" />
                  <span>PRO-тренировки и программы</span>
                </li>
              </ul>
            </div>

            {/* PRO план */}
            <div className="glass-card p-4 sm:p-5 border border-[var(--accent-gold)]/60 relative overflow-hidden">
              <div
                className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-40 pointer-events-none"
                style={{ backgroundColor: "rgba(214, 179, 94, 0.25)" }}
              />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Crown
                      className="w-5 h-5"
                      style={{ color: "var(--accent-gold)" }}
                    />
                    <span>FitEat PRO</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Всё, чтобы реально дойти до цели
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">??? ₽</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    цена появится позже
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm relative z-10">
                <li className="flex items-start gap-2">
                  <Star
                    className="w-4 h-4 mt-[2px]"
                    style={{ color: "var(--accent-gold)" }}
                  />
                  <span>Полный доступ ко всем рецептам и книге блюд</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-[2px]" />
                  <span>Готовые планы питания под твой КБЖУ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-sky-400 mt-[2px]" />
                  <span>Программы тренировок под разные цели</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 mt-[2px]" />
                  <span>PRO-советы: питание, тренировки, здоровье и голова</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[2px]" />
                  <span>Расширенная аналитика прогресса и привычек</span>
                </li>
              </ul>

              <div className="mt-4 relative z-10">
                {isPro ? (
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px]"
                    style={{
                      backgroundColor: "rgba(214, 179, 94, 0.12)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Активен PRO-доступ</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSwitchToPro}
                    className="cosmic-button w-full mt-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <Crown className="w-5 h-5" />
                    <span>Включить FitEat PRO</span>
                  </button>
                )}
              </div>
            </div>
          </motion.section>

          {/* Подсказка, где используется тариф */}
          <motion.section
            className="glass-card p-4 text-xs text-[var(--text-secondary)] space-y-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="font-semibold text-[var(--text-primary)] mb-1">
              Где используется твой план:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                В разделе <span className="font-semibold">«Советы»</span> —
                PRO-статьи открываются только при плане PRO.
              </li>
              <li>
                В <span className="font-semibold">книге рецептов</span> — часть
                блюд можно пометить как PRO.
              </li>
              <li>
                В разделах с{" "}
                <span className="font-semibold">готовыми тренировками</span> и{" "}
                <span className="font-semibold">планами питания</span>.
              </li>
            </ul>

            <button
              onClick={handleResetAccount}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--danger-soft)] text-[11px] text-[var(--danger-strong)] hover:bg-[var(--danger-soft)]/20 transition"
            >
              Сбросить аккаунт и очистить данные
            </button>
          </motion.section>
        </main>
      </div>
    </>
  );
}
