"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, UtensilsCrossed, CalendarDays, X } from "lucide-react";

import type { MealRecipe, MealType } from "../meal-data";
import {
  DIARY_STORAGE_PREFIX,
  DEFAULT_ENTRY,
  type DiaryEntry,
  type DiaryMeal,
} from "../../diary/diary-types";

type PortionVariant = {
  id: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

type AddToDiaryModalProps = {
  isOpen: boolean;
  defaultDate: string;
  onClose: () => void;
  onConfirm: (date: string) => void;
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
  dessert: "Десерт",
};

function AddToDiaryModal({
  isOpen,
  defaultDate,
  onClose,
  onConfirm,
}: AddToDiaryModalProps) {
  const [date, setDate] = useState(defaultDate);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] shadow-xl p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent-gold)]">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Добавить в дневник
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Выбери дату, за которую добавить это блюдо.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--surface-muted)] text-[var(--text-tertiary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-[var(--text-secondary)]">
            Дата (ГГГГ-ММ-ДД)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
          />
        </div>

        <div className="flex justify-between gap-2 mt-5 text-sm">
          <button
            onClick={() => {
              setDate(defaultDate);
              onConfirm(defaultDate);
            }}
            className="px-3 py-1.5 rounded-lg border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10"
          >
            Сегодня
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
            >
              Отмена
            </button>
            <button
              onClick={() => onConfirm(date)}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent-gold)] text-white font-semibold hover:brightness-105"
            >
              Добавить
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MealDetailClient({
  meal,
  targetFromQuery,
}: {
  meal: MealRecipe;
  targetFromQuery?: number;
}) {
  const todayISO = new Date().toISOString().split("T")[0];

  const variants: PortionVariant[] = useMemo(() => {
    const targets = [300, 400, 500, 600, 700, 800];

    if ((meal as any).variants && (meal as any).variants.length > 0) {
      const byId = new Map<string, PortionVariant>();

      (meal as any).variants.forEach((v: any) => {
        byId.set(String(v.calories), {
          id: String(v.calories),
          calories: v.calories,
          protein: v.protein,
          fat: v.fat,
          carbs: v.carbs,
        });
      });

      targets.forEach((t) => {
        if (!byId.has(String(t))) {
          const factor = t / meal.baseCalories;
          byId.set(String(t), {
            id: String(t),
            calories: t,
            protein: Math.round(meal.baseProtein * factor),
            fat: Math.round(meal.baseFat * factor),
            carbs: Math.round(meal.baseCarbs * factor),
          });
        }
      });

      return targets.map((t) => byId.get(String(t))!) as PortionVariant[];
    }

    return targets.map((t) => {
      const factor = t / meal.baseCalories;
      return {
        id: String(t),
        calories: t,
        protein: Math.round(meal.baseProtein * factor),
        fat: Math.round(meal.baseFat * factor),
        carbs: Math.round(meal.baseCarbs * factor),
      };
    });
  }, [meal]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    if (targetFromQuery && Number.isFinite(targetFromQuery)) {
      const closest = variants.reduce((best, current) => {
        const diffBest = Math.abs(best.calories - targetFromQuery);
        const diffCur = Math.abs(current.calories - targetFromQuery);
        return diffCur < diffBest ? current : best;
      }, variants[0]);
      return closest.id;
    }
    return variants.find((v) => v.calories === 400)?.id ?? variants[0].id;
  });

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  const portionFactor = selectedVariant.calories / meal.baseCalories;

  const scaledIngredients = useMemo(
    () =>
      meal.ingredients.map((ing) => {
        const raw = ing.amount * portionFactor;
        const unit = (ing.unit ?? "").toLowerCase();
        let display: number;

        if (!Number.isFinite(raw)) {
          display = ing.amount;
        } else if (unit.includes("шт")) {
          display = Math.round(raw);
          if (display === 0 && raw > 0) display = 1;
        } else if (unit.includes("г") || unit.includes("ml") || unit.includes("мл")) {
          if (raw <= 20) {
            display = Math.round(raw / 5) * 5;
            if (display === 0 && raw > 0) display = 5;
          } else {
            display = Math.round(raw / 10) * 10;
          }
        } else {
          if (raw >= 50) display = Math.round(raw);
          else if (raw >= 10) display = Math.round(raw * 2) / 2;
          else display = Math.round(raw * 10) / 10;
        }

        return { ...ing, scaledAmount: display };
      }),
    [meal.ingredients, portionFactor],
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleAddToDiary = (dateISO: string) => {
    if (!dateISO) return;

    try {
      setIsSaving(true);

      const key = `${DIARY_STORAGE_PREFIX}${dateISO}`;
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;

      let entry: DiaryEntry = DEFAULT_ENTRY;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          entry = {
            ...DEFAULT_ENTRY,
            ...parsed,
            meals: parsed.meals ?? [],
          };
        } catch {
          entry = DEFAULT_ENTRY;
        }
      }

      const newMeal: DiaryMeal = {
        id: `meal_${Date.now()}`,
        title: meal.title,
        calories: selectedVariant.calories,
        protein: selectedVariant.protein,
        fat: selectedVariant.fat,
        carbs: selectedVariant.carbs,
        type: meal.mealType,
        done: false,
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        slug: meal.slug,
      };

      const updated: DiaryEntry = {
        ...entry,
        meals: [...entry.meals, newMeal],
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(updated));
      }

      setSaveMessage("Блюдо добавлено в дневник");
    } finally {
      setIsSaving(false);
      setShowAddModal(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const currentCalories = selectedVariant.calories;
  const currentProtein = selectedVariant.protein;
  const currentFat = selectedVariant.fat;
  const currentCarbs = selectedVariant.carbs;

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <div className="w-full bg-[var(--accent-gold)] text-white">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-5 py-3 flex items-center gap-3">
            <Link
              href="/meals"
              className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>К рецептам</span>
            </Link>
            <div className="flex-1 text-center text-sm sm:text-base font-semibold">
              {meal.title}
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 md:px-5 pt-4 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-muted)] h-48 sm:h-64 flex items-center justify-center">
            {(meal as any).imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(meal as any).imageUrl}
                alt={meal.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center px-4">
                <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-xs text-[var(--text-secondary)]">
                  Здесь будет фото блюда.
                </p>
              </div>
            )}
          </div>

          <section className="glass-card px-4 py-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="uppercase text-[11px] text-[var(--text-muted)]">
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </span>
                {meal.subtitle && (
                  <span className="text-[var(--text-secondary)]">
                    {meal.subtitle}
                  </span>
                )}
              </div>
              <div className="font-semibold">
                ≈ {currentCalories} ккал · Б {currentProtein}г · Ж {currentFat}г · У{" "}
                {currentCarbs}г
              </div>
            </div>
          </section>

          <section className="glass-card px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Выбери калорийность порции</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                КБЖУ и ингредиенты пересчитаются под выбранный вариант.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = v.id === selectedVariantId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3 py-2 rounded-lg border text-xs transition min-w-[88px] ${
                      active
                        ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]"
                        : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
                    }`}
                  >
                    <div className="font-semibold text-[13px]">{v.calories} ккал</div>
                    <div className="mt-1 text-[10px]">
                      Б {v.protein}г · Ж {v.fat}г · У {v.carbs}г
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass-card px-4 py-4 space-y-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Добавь этот вариант порции в свой дневник как отдельный приём пищи.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--text-primary)] text-white py-2.5 text-sm font-semibold hover:brightness-105 disabled:opacity-60"
            >
              <UtensilsCrossed className="w-4 h-4" />
              {isSaving ? "Сохраняю..." : "Добавить в дневник"}
            </button>
            {saveMessage && (
              <p className="text-[11px] text-[var(--success-strong)]">{saveMessage}</p>
            )}
          </section>

          <section className="glass-card px-4 py-4 space-y-3">
            <h2 className="text-sm font-semibold">Ингредиенты</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Количество пересчитано под выбранную калорийность порции (
              {Math.round(portionFactor * 100)}% от базовой).
            </p>

            <div className="divide-y divide-[var(--border-soft)] text-sm">
              {scaledIngredients.map((ing, idx) => (
                <div
                  key={`${ing.name}-${idx}`}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex flex-col">
                    <span>{ing.name}</span>
                    {ing.note && (
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {ing.note}
                      </span>
                    )}
                  </div>
                  <span className="text-[var(--text-primary)] font-medium">
                    {ing.scaledAmount} {ing.unit ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {meal.steps && meal.steps.length > 0 && (
            <section className="glass-card px-4 py-4 space-y-3 mb-6">
              <h2 className="text-sm font-semibold">Подробный рецепт приготовления</h2>
              <ol className="space-y-2 text-sm list-decimal list-inside text-[var(--text-primary)]">
                {meal.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      <AddToDiaryModal
        isOpen={showAddModal}
        defaultDate={todayISO}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleAddToDiary}
      />
    </>
  );
}
