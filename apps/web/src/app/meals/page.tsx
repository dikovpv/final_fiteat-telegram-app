// apps/web/src/app/meals/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Filter,
  Flame,
  UtensilsCrossed,
  Sparkles,
  Lock,
  Wand2,
  ChevronRight,
} from "lucide-react";

import {
  meals,
  type MealRecipe,
  type MealType,
  computeMealNutrition,
} from "./meals-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

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

type DailyRecommendation = {
  // по каждому приёму пищи — массив до 3 рецептов с подсказкой порции
  byType: Partial<Record<MealType, MealPortionSuggestion[]>>;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
};

type MealPortionSuggestion = {
  meal: MealRecipe;
  portionCalories: number;
  portionProtein: number;
  portionFat: number;
  portionCarbs: number;
  factor: number;
  score: number;
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

const MEAL_CALORIE_RATIOS: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.3,
  snack: 0.1,
  dessert: 0.05,
};

const PORTION_PRESETS = [400, 500, 600, 700];

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
  const [dailyRecommendation, setDailyRecommendation] =
    useState<DailyRecommendation | null>(null);

  useEffect(() => {
    const state = loadUserPlanState();
    setUserPlan(state);
  }, []);

  const isPro = !!userPlan?.isPro;
  const dailyCalories = userPlan?.calories ?? 2400;

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

  const buildPortionOptions = React.useCallback(
    (meal: MealRecipe) => {
      const base = computeMealNutrition(meal);
      const baseCalories = base.perPortionCalories || 1;

      return PORTION_PRESETS.map((portionCalories) => {
        const factor = portionCalories / baseCalories;

        return {
          meal,
          portionCalories,
          portionProtein: base.perPortionProtein * factor,
          portionFat: base.perPortionFat * factor,
          portionCarbs: base.perPortionCarbs * factor,
          factor,
          score: 0,
        } satisfies MealPortionSuggestion;
      });
    },
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

  // Авто-подбор дня: по КАЖДОМУ приёму — до 3 вариантов
  const handleBuildDay = () => {
    const plan = userPlan ?? {
      isPro,
      calories: dailyCalories,
      proteinGoal: 160,
      fatGoal: 80,
      carbsGoal: 300,
    };

    const availableMeals = mealsWithNutrition.filter((mwn) => {
      if (plan.isPro) return true;
      return !mwn.meal.proOnly;
    });

    const byType: Partial<Record<MealType, MealRecipe[]>> = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    for (const type of MEAL_TYPES_ORDER) {
      const candidates = availableMeals.filter(
        (mwn) => mwn.meal.mealType === type,
      );
      if (candidates.length === 0) continue;

      const share = MEAL_CALORIE_RATIOS[type] ?? 0.25;
      const targetCalories = plan.calories * share;
      const targetProtein = plan.proteinGoal * share;

      const suggestions: MealPortionSuggestion[] = candidates
        .map((candidate) => {
          const options = buildPortionOptions(candidate.meal);

          const bestOption = options.reduce<MealPortionSuggestion | null>(
            (best, option) => {
              const calorieDiff = Math.abs(option.portionCalories - targetCalories);
              const proteinPenalty = Math.max(0, targetProtein - option.portionProtein) * 1.5;
              const score = calorieDiff + proteinPenalty;

              if (!best || score < best.score) {
                return { ...option, score } satisfies MealPortionSuggestion;
              }
              return best;
            },
            null,
          );

          return (
            bestOption || {
              meal: candidate.meal,
              portionCalories: candidate.calories,
              portionProtein: candidate.protein,
              portionFat: candidate.fat,
              portionCarbs: candidate.carbs,
              factor: 1,
              score: Math.abs(candidate.calories - targetCalories),
            }
          );
        })
        .sort((a, b) => a.score - b.score);

      const top3 = suggestions.slice(0, 3);
      byType[type] = top3;

      const best = top3[0];
      if (best) {
        totalCalories += best.portionCalories;
        totalProtein += best.portionProtein;
        totalFat += best.portionFat;
        totalCarbs += best.portionCarbs;
      }
    }

    setDailyRecommendation({
      byType,
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
    });
  };

  useEffect(() => {
    if (userPlan) {
      handleBuildDay();
    }
  }, [userPlan]);

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

        {/* Блок авто-подбора по плану */}
        <motion.section
          className="glass-card p-4 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-teal-300" />
                Авто-подбор дня под твой план
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Я предложу до трёх вариантов для завтрака, обеда, ужина и
                перекусов, чтобы уложиться в {dailyCalories} ккал.
              </p>
            </div>
            <button
              onClick={handleBuildDay}
              className="cosmic-button px-3 py-2 text-xs"
            >
              Собрать день
            </button>
          </div>

          {dailyRecommendation && (
            <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">
                  Рекомендуемый день
                </span>
                <span className="text-gray-400">
                  ~{Math.round(dailyRecommendation.totalCalories)} ккал
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                {MEAL_TYPES_ORDER.map((t) => {
                  const mealsForType = dailyRecommendation.byType[t];
                  if (!mealsForType || mealsForType.length === 0) return null;

                  return (
                    <div
                      key={t}
                      className="bg-black/25 rounded-lg px-3 py-2 space-y-1"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-500">
                          {MEAL_TYPE_LABELS[t]}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          варианты: {mealsForType.length}
                        </span>
                      </div>

                      {mealsForType.slice(0, 3).map((suggestion, idx) => {
                        const meal = suggestion.meal;
                        const factorLabel =
                          suggestion.factor > 1.05
                            ? `x${suggestion.factor.toFixed(2)} порции`
                            : suggestion.factor < 0.95
                              ? `${(suggestion.factor * 100).toFixed(0)}% порции`
                              : "1 порция";

                        return (
                          <Link
                            key={meal.slug}
                            href={`/meals/${meal.slug}`}
                            className="flex items-center justify-between rounded-md bg-black/30 px-2 py-1.5 hover:bg-black/45 transition"
                          >
                            <div className="flex flex-col">
                              <span className="text-[11px] text-gray-400">
                                Вариант {idx + 1} · {factorLabel}
                              </span>
                              <span className="text-gray-100 text-[13px] line-clamp-1">
                                {meal.title}
                              </span>
                            </div>
                            <div className="flex items-end gap-3 text-[11px] text-right text-gray-400">
                              <div className="flex flex-col items-end leading-tight">
                                <span className="text-gray-300">
                                  ~{Math.round(suggestion.portionCalories)} ккал
                                </span>
                                <span>
                                  Б {Math.round(suggestion.portionProtein)}г · Ж{" "}
                                  {Math.round(suggestion.portionFat)}г · У{" "}
                                  {Math.round(suggestion.portionCarbs)}г
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-gray-500 border-t border-gray-700/70 pt-2 mt-1">
                Итог за день (по первым вариантам): ~
                {Math.round(dailyRecommendation.totalCalories)} ккал · Б{" "}
                {Math.round(dailyRecommendation.totalProtein)}г · Ж{" "}
                {Math.round(dailyRecommendation.totalFat)}г · У{" "}
                {Math.round(dailyRecommendation.totalCarbs)}г
              </div>
            </div>
          )}
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
}) {
  const { meal, calories, protein, fat, carbs, isLocked } = props;

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
