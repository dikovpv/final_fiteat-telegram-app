// apps/web/src/app/meals/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Filter, Flame, UtensilsCrossed, Sparkles, Lock } from "lucide-react";

import { meals, type MealRecipe, type MealType, computeMealNutrition } from "./meals-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";
import {
  DEFAULT_MEAL_SPLIT_ID,
  MEAL_SPLIT_PRESETS,
  MEAL_SPLIT_STORAGE_KEY,
  type MealSplitPreset,
} from "./meal-presets";

// ----- типы и константы -----

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

// читаем только КБЖУ из localStorage, а тип плана — через getUserPlan()
function loadUserPlanState(): UserPlanState {
  let calories = 2400;
  let proteinGoal = 160;
  let fatGoal = 80;
  let carbsGoal = 300;

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
      // падаем в дефолты
    }
  }

  const planType: PlanType = getUserPlan(); // "free" | "pro"
  const isPro = planType === "pro";

  return {
    isPro,
    calories,
    proteinGoal,
    fatGoal,
    carbsGoal,
  };
}

// ----- страница -----

export default function MealsPage() {
  const [userPlan, setUserPlan] = useState<UserPlanState | null>(null);
  const [selectedType, setSelectedType] = useState<MealType | "all">("all");
  const [calorieMin, setCalorieMin] = useState<string>("");
  const [calorieMax, setCalorieMax] = useState<string>("");
  const [mealSplitPresetId, setMealSplitPresetId] =
    useState<MealSplitPreset["id"]>(DEFAULT_MEAL_SPLIT_ID);


  useEffect(() => {
    const state = loadUserPlanState();
    setUserPlan(state);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const presetFromStorage = window.localStorage.getItem(MEAL_SPLIT_STORAGE_KEY);
    if (presetFromStorage && MEAL_SPLIT_PRESETS.some((p) => p.id === presetFromStorage)) {
      setMealSplitPresetId(presetFromStorage as MealSplitPreset["id"]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MEAL_SPLIT_STORAGE_KEY, mealSplitPresetId);
  }, [mealSplitPresetId]);

  const mealSplitPreset = useMemo(
    () =>
      MEAL_SPLIT_PRESETS.find((preset) => preset.id === mealSplitPresetId) ||
      MEAL_SPLIT_PRESETS[0],
    [mealSplitPresetId],
  );

  const isPro = !!userPlan?.isPro;
  const dailyCalories = userPlan?.calories ?? 2400;

  const mealTargets = useMemo(() => {
    if (!mealSplitPreset) return {};

    return MEAL_TYPES_ORDER.reduce<
      Partial<
        Record<
          MealType,
          {
            calories: number;
            protein: number;
            fat: number;
            carbs: number;
            share: number;
          }
        >
      >
    >((acc, type) => {
      const share = mealSplitPreset.ratios[type] ?? 0;
      if (share <= 0) return acc;

      acc[type] = {
        calories: Math.round(dailyCalories * share),
        protein: Math.round((userPlan?.proteinGoal ?? 0) * share),
        fat: Math.round((userPlan?.fatGoal ?? 0) * share),
        carbs: Math.round((userPlan?.carbsGoal ?? 0) * share),
        share,
      };
      return acc;
    }, {});
  }, [dailyCalories, mealSplitPreset, userPlan]);

  // Предрасчёт КБЖУ для всех рецептов
  const mealsWithNutrition: MealWithNutrition[] = useMemo(
    () =>
      meals.map((meal: MealRecipe) => {
        const n = computeMealNutrition(meal);
        return {
          meal,
          calories: n.perPortionCalories,
          protein: n.perPortionProtein,
          fat: n.perPortionFat,
          carbs: n.perPortionCarbs,
        };
      }),
    [],
  );

  // Фильтр по типу и диапазону калорий
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

      // PRO-рецепты тоже показываем — они просто под замком
      return true;
    });
  }, [mealsWithNutrition, selectedType, calorieMin, calorieMax]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05050a] via-[#10081d] to-[#1a1238] text-white pb-24">
      <div className="cosmic-bg" />

      <div className="relative z-10 px-4 pt-6 pb-8 space-y-6">
        {/* Заголовок */}
        <motion.div
          className="flex items-center justify-between mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-teal-300" />
              Рецепты FitEat
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Подбирай блюда под свой план КБЖУ и собирай день из рецептов.
            </p>
          </div>
          {isPro && (
            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-400/40 text-xs text-yellow-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>PRO активно</span>
            </div>
          )}
        </motion.div>

        {/* Блок выбора пресета */}
        <motion.section
          className="glass-card p-4 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                Настрой деление калорий по приёмам пищи
              </h2>
              <p className="text-xs text-gray-400">
                Выбери стиль (классика / тяжёлый обед / равномерно). Эти проценты
                сохранятся и будут применяться при открытии рецепта: я пересчитаю
                порцию под твою цель без дробных ингредиентов.
              </p>
            </div>
            <div className="text-right text-[11px] text-gray-500">
              Текущая норма: ~{dailyCalories} ккал
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {MEAL_SPLIT_PRESETS.map((preset) => {
              const active = preset.id === mealSplitPreset?.id;
              const ratios = preset.ratios;

              return (
                <button
                  key={preset.id}
                  onClick={() => setMealSplitPresetId(preset.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    active
                      ? "border-teal-400/70 bg-teal-500/10 text-teal-100"
                      : "border-white/10 bg-black/20 text-gray-200"
                  }`}
                >
                  <div className="font-semibold text-[13px] flex items-center gap-2">
                    {preset.label}
                    {active && (
                      <span className="text-[10px] text-teal-200 bg-teal-500/20 px-2 py-0.5 rounded-full">
                        выбрано
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 leading-tight">
                    {preset.description}
                  </div>
                  <div className="text-[11px] text-gray-500 leading-tight mt-1">
                    З {Math.round(ratios.breakfast * 100)}% · О {Math.round(ratios.lunch * 100)}% · У {Math.round(ratios.dinner * 100)}% · П {Math.round(ratios.snack * 100)}%
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-2 md:grid-cols-2 text-[11px] text-gray-300">
            {MEAL_TYPES_ORDER.map((type) => {
              const target = mealTargets[type];
              if (!target) return null;

              return (
                <div
                  key={type}
                  className="rounded-lg bg-black/25 border border-white/5 px-3 py-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{MEAL_TYPE_LABELS[type]}</span>
                    <span className="text-gray-500">{Math.round(target.share * 100)}%</span>
                  </div>
                  <div className="text-right text-gray-200">
                    ~{target.calories} ккал · Б {target.protein}г · Ж {target.fat}г · У {target.carbs}г
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Фильтры */}
        <motion.section
          className="glass-card p-4 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Навигация по приёмам пищи */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1.5 rounded-full border text-xs transition ${
                  selectedType === "all"
                    ? "bg-teal-500/20 border-teal-400 text-teal-200"
                    : "bg-black/20 border-white/10 text-gray-300"
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
                      ? "bg-teal-500/20 border-teal-400 text-teal-200"
                      : "bg-black/20 border-white/10 text-gray-300"
                  }`}
                >
                  {MEAL_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Диапазон калорий */}
          <div className="mt-2 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Калории / порция</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                className="w-20 bg-black/30 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-teal-400"
                placeholder="от"
                value={calorieMin}
                onChange={(e) => setCalorieMin(e.target.value)}
              />
              <span className="text-gray-500">—</span>
              <input
                type="number"
                inputMode="numeric"
                className="w-20 bg-black/30 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-teal-400"
                placeholder="до"
                value={calorieMax}
                onChange={(e) => setCalorieMax(e.target.value)}
              />
              <span className="text-gray-500">ккал</span>
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
            <div className="glass-card p-4 text-sm text-gray-400 text-center">
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
  );
}

// ----- карточка рецепта -----

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

  const href = isLocked ? "/pro" : `/meals/${meal.slug}`;

  return (
    <Link href={href} className="block">
      <motion.div
        className="glass-card p-4 h-full flex flex-col justify-between relative overflow-hidden"
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isLocked && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600/15 border border-purple-400/60 text-[10px] text-purple-200">
            <span className="uppercase tracking-wide">PRO</span>
          </div>
        )}

        <div
          className={`flex items-start gap-3 mb-3 ${
            isLocked ? "opacity-40" : ""
          }`}
        >
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase text-teal-300">
                {MEAL_TYPE_LABELS[meal.mealType]}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-50 line-clamp-2">
              {meal.title}
            </h3>
            {meal.subtitle && (
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                {meal.subtitle}
              </p>
            )}

            {target && (
              <p className="text-[11px] text-teal-100/90 bg-teal-500/10 border border-teal-500/20 rounded-lg px-2 py-1 mt-2">
                Цель пресета: ~{target.calories} ккал. Граммовки пересчитаю под эту цель без дробных ингредиентов.
              </p>
            )}
          </div>
        </div>

        <div
          className={`flex items-center justify-between mt-1 ${
            isLocked ? "opacity-40" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{Math.round(calories)} ккал / порция</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Б {Math.round(protein)}г · Ж {Math.round(fat)}г · У{" "}
            {Math.round(carbs)}г
          </div>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-center px-4">
            <Lock className="w-6 h-6 text-purple-200 mb-2" />
            <p className="text-[11px] text-gray-200 max-w-xs">
              Это PRO-рецепт. Оформи PRO-тариф, чтобы открыть.
            </p>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
