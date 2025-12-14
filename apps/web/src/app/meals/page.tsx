"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import PageHeader from "../components/PageHeader";
import {
  meals,
  type MealRecipe,
  type MealType,
  computeMealNutrition,
} from "./meal-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";
import {
  DEFAULT_MEAL_SPLIT_ID,
  MEAL_SPLIT_PRESETS,
  MEAL_SPLIT_STORAGE_KEY,
  type MealSplitPreset,
} from "./meal-presets";

// ====================== ТИПЫ ======================

type UserPlanState = {
  isPro: boolean;
  calories: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
};

type MealWithNutrition = {
  meal: MealRecipe;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

type MealTarget = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  share: number; // доля 0–1
};

type MealTargetsMap = Partial<Record<MealType, MealTarget>>;

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
  dessert: "Десерт",
};

const MEAL_TYPES_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
];

// ====================== ЗАГРУЗКА СОСТОЯНИЯ ПОЛЬЗОВАТЕЛЯ ======================

function loadUserPlanState(): UserPlanState {
  let calories = 2400;
  let proteinGoal = 160;
  let fatGoal = 80;
  let carbsGoal = 300;
  let planType: PlanType = "free";

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("fitEatUserData");
      if (raw) {
        const data = JSON.parse(raw) || {};

        calories =
          Number(data.calories) ||
          Number(data.dailyCalories) ||
          calories;

        proteinGoal =
          Number(data.proteinGoal) ||
          Number(data.protein) ||
          proteinGoal;

        fatGoal =
          Number(data.fatGoal) ||
          Number(data.fat) ||
          fatGoal;

        carbsGoal =
          Number(data.carbsGoal) ||
          Number(data.carbs) ||
          carbsGoal;
      }
    } catch {
      // оставляем дефолты
    }

    planType = getUserPlan();
  }

  const isPro = planType === "pro";

  return {
    isPro,
    calories,
    proteinGoal,
    fatGoal,
    carbsGoal,
  };
}

// ====================== СТРАНИЦА ======================

export default function MealsPage() {
  const [userPlan, setUserPlan] = useState<UserPlanState | null>(null);
  const [selectedType, setSelectedType] = useState<MealType | "all">("all");
  const [calorieMin, setCalorieMin] = useState<string>("");
  const [calorieMax, setCalorieMax] = useState<string>("");

  const [mealSplitPresetId, setMealSplitPresetId] =
    useState<MealSplitPreset["id"]>(DEFAULT_MEAL_SPLIT_ID);

  // загрузка данных пользователя
  useEffect(() => {
    const state = loadUserPlanState();
    setUserPlan(state);
  }, []);

  // загрузка выбранного стиля деления калорий
  useEffect(() => {
    if (typeof window === "undefined") return;

    const presetFromStorage = window.localStorage.getItem(
      MEAL_SPLIT_STORAGE_KEY,
    );
    if (
      presetFromStorage &&
      MEAL_SPLIT_PRESETS.some((p) => p.id === presetFromStorage)
    ) {
      setMealSplitPresetId(presetFromStorage as MealSplitPreset["id"]);
    }
  }, []);

  // сохранение выбранного стиля
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MEAL_SPLIT_STORAGE_KEY, mealSplitPresetId);
  }, [mealSplitPresetId]);

  // активный пресет деления
  const mealSplitPreset = useMemo<MealSplitPreset>(() => {
    return (
      MEAL_SPLIT_PRESETS.find(
        (preset: MealSplitPreset) => preset.id === mealSplitPresetId,
      ) ?? MEAL_SPLIT_PRESETS[0]
    );
  }, [mealSplitPresetId]);

  const isPro = !!userPlan?.isPro;
  const dailyCalories = userPlan?.calories ?? 2400;

  // цели по каждому приёму пищи
  const mealTargets = useMemo<MealTargetsMap>(() => {
    if (!mealSplitPreset || !userPlan) return {};

    return MEAL_TYPES_ORDER.reduce<MealTargetsMap>((acc, type) => {
      const share = mealSplitPreset.ratios[type] ?? 0; // 0–1
      if (share <= 0) return acc;

      acc[type] = {
        calories: Math.round(dailyCalories * share),
        protein: Math.round(userPlan.proteinGoal * share),
        fat: Math.round(userPlan.fatGoal * share),
        carbs: Math.round(userPlan.carbsGoal * share),
        share,
      };
      return acc;
    }, {});
  }, [dailyCalories, mealSplitPreset, userPlan]);

  // считаем КБЖУ для каждой порции с учётом цели по ккал
  const mealsWithNutrition: MealWithNutrition[] = useMemo(() => {
    return meals.map((meal: MealRecipe) => {
      const targetForType = mealTargets[meal.mealType];
      const n = computeMealNutrition(meal, targetForType?.calories);
      return {
        meal,
        calories: n.perPortionCalories,
        protein: n.perPortionProtein,
        fat: n.perPortionFat,
        carbs: n.perPortionCarbs,
      };
    });
  }, [mealTargets]);

  // фильтрация по типу и ккал
  const filteredMeals: MealWithNutrition[] = useMemo(() => {
    const minCals = calorieMin ? Number(calorieMin) : null;
    const maxCals = calorieMax ? Number(calorieMax) : null;

    return mealsWithNutrition.filter((mwn) => {
      const { meal, calories } = mwn;

      if (selectedType !== "all" && meal.mealType !== selectedType) {
        return false;
      }

      if (minCals !== null && !isNaN(minCals) && calories < minCals) {
        return false;
      }
      if (maxCals !== null && !isNaN(maxCals) && calories > maxCals) {
        return false;
      }

      return true;
    });
  }, [mealsWithNutrition, selectedType, calorieMin, calorieMax]);

  const currentTariffLabel = isPro ? "FitEat PRO" : "Базовый тариф";

  // ====================== RENDER ======================

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title="Питание"
          backHref="/"
          backLabel="На главную"
          rightSlot={
            <span className="text-[11px] text-white/85">
              Тариф: {currentTariffLabel}
            </span>
          }
        />

        <div className="px-3 pt-3 sm:px-4 md:px-5 flex flex-col gap-3">
          {/* Деление калорий по приёмам пищи */}
          <motion.section
            className="glass-card px-4 py-4 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Деление калорий по приёмам пищи
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Выбери стиль:{" "}
                  <span className="font-medium">классика</span>,{" "}
                  <span className="font-medium">тяжёлый обед</span> или{" "}
                  <span className="font-medium">равномерно</span>. Эти
                  проценты я буду использовать, когда подбираю порцию рецепта
                  под твою дневную норму.
                </p>
              </div>
            </div>

            {/* кнопки стилей — только название */}
            <div className="flex flex-wrap gap-2">
              {MEAL_SPLIT_PRESETS.map((preset: MealSplitPreset) => {
                const active = preset.id === mealSplitPreset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setMealSplitPresetId(preset.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                      active
                        ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]"
                        : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-secondary)]"
                    }`}
                  >
                    <div className="font-semibold text-[13px] flex items-center gap-2">
                      {preset.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Цели по приёмам пищи */}
            <div className="grid gap-2 md:grid-cols-2 text-[11px] text-[var(--text-secondary)]">
              {MEAL_TYPES_ORDER.map((type) => {
                const target = mealTargets[type];
                if (!target) return null;

                return (
                  <div
                    key={type}
                    className="rounded-lg bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span>{MEAL_TYPE_LABELS[type]}</span>
                      <span className="text-[var(--text-muted)]">
                        {Math.round(target.share * 100)}%
                      </span>
                    </div>
                    <div className="text-right">
                      ~{target.calories} ккал · Б {target.protein}г · Ж{" "}
                      {target.fat}г · У {target.carbs}г
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Фильтры */}
          <motion.section
            className="glass-card px-4 py-4 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setSelectedType("all")}
                  className={`px-3 py-1.5 rounded-full border text-xs transition ${
                    selectedType === "all"
                      ? "bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white"
                      : "bg-[var(--surface)] border-[var(--border-soft)] text-[var(--text-secondary)]"
                  }`}
                >
                  Все
                </button>
                {MEAL_TYPES_ORDER.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-1.5 rounded-full border text-xs transition ${
                      selectedType === t
                        ? "bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white"
                        : "bg-[var(--surface)] border-[var(--border-soft)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {MEAL_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="text-[var(--text-secondary)]">
                Калории / порция
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-20 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                  placeholder="от"
                  value={calorieMin}
                  onChange={(e) => setCalorieMin(e.target.value)}
                />
                <span className="text-[var(--text-muted)]">—</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-20 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                  placeholder="до"
                  value={calorieMax}
                  onChange={(e) => setCalorieMax(e.target.value)}
                />
                <span className="text-[var(--text-muted)]">ккал</span>
              </div>
            </div>
          </motion.section>

          {/* Список рецептов */}
          <motion.section
            className="space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {filteredMeals.length === 0 ? (
              <div className="glass-card px-4 py-4 text-sm text-[var(--text-secondary)] text-center">
                Нет рецептов под такой фильтр. Попробуй изменить условия.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMeals.map((mwn) => (
                  <MealCard
                    key={mwn.meal.slug}
                    meal={mwn.meal}
                    calories={mwn.calories}
                    protein={mwn.protein}
                    fat={mwn.fat}
                    carbs={mwn.carbs}
                    isLocked={!!mwn.meal.proOnly && !isPro}
                    target={mealTargets[mwn.meal.mealType]}
                  />
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </>
  );
}

// ====================== КАРТОЧКА РЕЦЕПТА ======================

function MealCard(props: {
  meal: MealRecipe;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isLocked: boolean;
  target?: { calories: number; protein: number; fat: number; carbs: number };
}) {
  const { meal, calories, protein, fat, carbs, isLocked, target } = props;

const href = isLocked
  ? "/pro"
  : `/meals/${meal.slug}${
      target ? `?target=${encodeURIComponent(target.calories)}` : ""
    }`;


  return (
    <Link href={href} className="block">
      <motion.div
        className="glass-card px-4 py-4 h-full flex flex-col justify-between relative overflow-hidden"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {isLocked && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)] text-[10px] text-[var(--accent-gold)]">
            <span className="uppercase">PRO</span>
          </div>
        )}

        <div
          className={`flex flex-col gap-2 mb-2 ${
            isLocked ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] uppercase">
            <span>{MEAL_TYPE_LABELS[meal.mealType]}</span>
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
            {meal.title}
          </h3>
          {meal.subtitle && (
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">
              {meal.subtitle}
            </p>
          )}

          {target && (
            <p className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface-muted)] border border-[var(--border-soft)] rounded-lg px-2 py-1 mt-2">
              Цель для этого приёма пищи: ~{target.calories} ккал. Я подбираю
              ближайший вариант порции к этой цели.
            </p>
          )}
        </div>

        <div
          className={`flex items-center justify-between mt-1 text-[11px] text-[var(--text-secondary)] ${
            isLocked ? "opacity-60" : ""
          }`}
        >
          <span>≈ {Math.round(calories)} ккал / порция</span>
          <span>
            Б {Math.round(protein)}г · Ж {Math.round(fat)}г · У{" "}
            {Math.round(carbs)}г
          </span>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-center px-4">
            <p className="text-[11px] text-gray-100 max-w-xs">
              Это PRO-рецепт. Оформи PRO-тариф, чтобы открыть.
            </p>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
