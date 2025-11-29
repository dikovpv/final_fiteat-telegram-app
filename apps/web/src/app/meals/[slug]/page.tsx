"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  UtensilsCrossed,
  Sparkles,
  Lock,
  Scale,
  PlusCircle,
} from "lucide-react";

import {
  meals,
  type MealRecipe,
  type MealType,
  type MealIngredient,
  computeMealNutrition,
} from "@/lib/meals-data";
import { INGREDIENTS } from "@/lib/ingredients-data";
import {
  DEFAULT_MEAL_SPLIT_ID,
  MEAL_SPLIT_PRESETS,
  MEAL_SPLIT_STORAGE_KEY,
  type MealSplitPreset,
} from "../meal-presets";

type UserPlan = {
  isPro?: boolean;
  calories: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
  dessert: "Десерт",
};

// Локальная дата YYYY-MM-DD
function getLocalISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadUserPlanFromLocalStorage(): UserPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("fitEatUserData");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      isPro: !!data.isPro,
      calories: Number(data.calories) || 2400,
      proteinGoal: Number(data.proteinGoal) || 160,
      fatGoal: Number(data.fatGoal) || 80,
      carbsGoal: Number(data.carbsGoal) || 300,
    };
  } catch {
    return null;
  }
}

function clampAndRoundScale(targetCalories: number, baseCalories: number) {
  if (!baseCalories || !isFinite(targetCalories)) return 1;
  const raw = targetCalories / baseCalories;
  const clamped = Math.min(3, Math.max(0.5, raw));
  return Math.round(clamped * 4) / 4; // шаг 0.25 порции, без экстремальных значений
}

function roundIngredientAmount(amount: number, unit?: string) {
  if (!isFinite(amount)) return 0;

  if (unit && unit.includes("шт")) {
    return Math.max(1, Math.round(amount));
  }

  const safeAmount = Math.max(amount, 0);

  if (safeAmount < 5) {
    return Math.max(0.5, Math.round(safeAmount * 2) / 2);
  }

  return Math.round(safeAmount / 5) * 5;
}

export default function MealPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const recipe = useMemo<MealRecipe | undefined>(
    () => meals.find((m: MealRecipe) => m.slug === params.slug),
    [params.slug]
  );

  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [portionScale, setPortionScale] = useState<number>(1);
  const [diaryMealType, setDiaryMealType] = useState<MealType>("lunch");
  const [mealSplitPreset, setMealSplitPreset] =
    useState<MealSplitPreset | null>(null);

  useEffect(() => {
    const plan = loadUserPlanFromLocalStorage();
    setUserPlan(plan);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(MEAL_SPLIT_STORAGE_KEY);
    const presetFromStorage = MEAL_SPLIT_PRESETS.find((p) => p.id === saved);
    const fallbackPreset =
      MEAL_SPLIT_PRESETS.find((p) => p.id === DEFAULT_MEAL_SPLIT_ID) ||
      MEAL_SPLIT_PRESETS[0];

    setMealSplitPreset(presetFromStorage ?? fallbackPreset ?? null);
  }, []);

  useEffect(() => {
    if (recipe) {
      setDiaryMealType(recipe.mealType);
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-white">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Рецепт не найден</p>
          <button
            onClick={() => router.back()}
            className="text-teal-300 underline underline-offset-4"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const isPro = !!userPlan?.isPro;
  const isLocked = !!recipe.proOnly && !isPro;

  // Базовая нутриция (на 1 порцию)
  const baseNutrition = computeMealNutrition(recipe);
  const baseCalories = baseNutrition.perPortionCalories;
  const baseProtein = baseNutrition.perPortionProtein;
  const baseFat = baseNutrition.perPortionFat;
  const baseCarbs = baseNutrition.perPortionCarbs;

  const targetForMeal = useMemo(() => {
    if (!userPlan || !mealSplitPreset) return null;
    const share = mealSplitPreset.ratios[recipe.mealType] ?? 0;
    if (share <= 0) return null;

    return {
      calories: Math.round(userPlan.calories * share),
      protein: Math.round(userPlan.proteinGoal * share),
      fat: Math.round(userPlan.fatGoal * share),
      carbs: Math.round(userPlan.carbsGoal * share),
      share,
    };
  }, [mealSplitPreset, recipe.mealType, userPlan]);

  useEffect(() => {
    if (!targetForMeal || !baseCalories) return;
    const nextScale = clampAndRoundScale(targetForMeal.calories, baseCalories);

    if (Math.abs(nextScale - portionScale) > 0.01) {
      setPortionScale(nextScale);
    }
  }, [targetForMeal, baseCalories, portionScale]);

  // Масштабирование
  const scaledCalories = baseCalories * portionScale;
  const scaledProtein = baseProtein * portionScale;
  const scaledFat = baseFat * portionScale;
  const scaledCarbs = baseCarbs * portionScale;

  const scaledIngredients: MealIngredient[] = (recipe.ingredients || []).map(
    (ing: MealIngredient) => ({
      ...ing,
      amount: roundIngredientAmount(ing.amount * portionScale, ing.unit),
    })
  );

  const mealLabel = MEAL_TYPE_LABELS[recipe.mealType];

  const handleScaleToPlan = () => {
    if (!userPlan) {
      alert("Сначала заполни профиль, чтобы я знал твой план по калориям.");
      return;
    }

    if (!baseCalories || baseCalories <= 0) {
      alert("Для этого рецепта нет корректных данных по калорийности.");
      return;
    }

    const fallbackRatio = 0.25;
    const targetCalories =
      targetForMeal?.calories ?? userPlan.calories * fallbackRatio;

    const scale = clampAndRoundScale(targetCalories, baseCalories);
    setPortionScale(scale);
  };

  const portionScalePercent = Math.round(portionScale * 100);

  // Добавление в дневник
  const handleAddToDiary = () => {
    if (typeof window === "undefined") return;

    const dateISO = getLocalISODate();
    const key = `fitEatDiary_${dateISO}`;

    let diary: any = {
      meals: [],
      workouts: [],
      water: 0,
      sleep: {},
    };

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          diary = { ...diary, ...parsed };
          diary.meals = Array.isArray(parsed.meals)
            ? parsed.meals
            : diary.meals;
        }
      }
    } catch {
      // если что-то не так — начинаем с чистого
    }

    const newMeal = {
      id: `recipe-${recipe.slug}-${Date.now()}`,
      title: recipe.title,
      source: "recipe",
      recipeSlug: recipe.slug,
      calories: Math.round(scaledCalories),
      protein: Math.round(scaledProtein),
      fat: Math.round(scaledFat),
      carbs: Math.round(scaledCarbs),
      mealType: diaryMealType,
      done: false,
      portionScale,
      baseServings: recipe.baseServings,
    };

    diary.meals = [...(diary.meals || []), newMeal];

    localStorage.setItem(key, JSON.stringify(diary));

    alert(
      `Блюдо добавлено в дневник на сегодня в раздел «${MEAL_TYPE_LABELS[diaryMealType]}».`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05050a] via-[#10081d] to-[#1a1238] text-white pb-24">
      <div className="cosmic-bg"></div>

      <div className="relative z-10 px-4 pt-6 pb-6 space-y-6">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-teal-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          {isPro && (
            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-400/40 text-xs text-yellow-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>FitEat PRO</span>
            </div>
          )}
        </div>

        {/* Карточка заголовка */}
        <motion.div
          className="glass-card p-4 flex gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/50 flex-shrink-0 h-fit">
            <UtensilsCrossed className="w-7 h-7 text-emerald-300" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase text-teal-300">
                {mealLabel}
              </span>
              {recipe.proOnly && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-200 border border-yellow-400/40">
                  <Lock className="w-3 h-3" />
                  PRO
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold">{recipe.title}</h1>
            {recipe.subtitle && (
              <p className="text-xs text-gray-400">{recipe.subtitle}</p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-gray-300 mt-2">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-300" />
                <span>{Math.round(baseCalories)} ккал / порция</span>
              </div>
              <div className="text-[11px] text-gray-400">
                Б {Math.round(baseProtein)}г • Ж {Math.round(baseFat)}г • У{" "}
                {Math.round(baseCarbs)}г
              </div>
            </div>
          </div>
        </motion.div>

        {/* PRO-замок */}
        {isLocked ? (
          <motion.div
            className="glass-card p-6 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-400/40">
                <Lock className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-yellow-100">
                  Рецепт доступен только в FitEat PRO
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Здесь у тебя будут подробные рецепты, граммовки под твой план
                  и множество готовых вариантов питания.
                </p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/pro")}
              className="cosmic-button w-full mt-2"
            >
              Открыть возможности PRO
            </button>
          </motion.div>
        ) : (
          <>
            {/* Подгонка порции + добавление в дневник */}
            <motion.section
              className="glass-card p-4 space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Scale className="w-4 h-4 text-teal-300" />
                      Подогнать порцию под мой план
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Я изменю граммовки так, чтобы калорийность порции была
                      ближе к твоему плану по калориям.
                    </p>
                    {targetForMeal ? (
                      <p className="text-[11px] text-teal-200 mt-1">
                        Цель пресета для {mealLabel.toLowerCase()}: ~{targetForMeal.calories} ккал · Б {targetForMeal.protein}г · Ж {targetForMeal.fat}г · У {targetForMeal.carbs}г. Ингредиенты округлю до целых яиц и шага 5 г.
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-1">
                        Использую базовую порцию, пресет пока не выбран.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleScaleToPlan}
                    className="cosmic-button px-3 py-2 text-xs"
                  >
                    Подогнать
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mt-1">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-gray-400 mb-1">Размер порции</div>
                    <div className="text-lg font-bold">
                      {portionScalePercent}%
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {portionScalePercent === 100
                        ? "Базовая порция"
                        : portionScalePercent > 100
                        ? "Порция больше базовой"
                        : "Порция меньше базовой"}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-gray-400 mb-1">Калории / порция</div>
                    <div className="text-lg font-bold text-emerald-300">
                      {Math.round(scaledCalories)} ккал
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Б {Math.round(scaledProtein)}г • Ж{" "}
                      {Math.round(scaledFat)}г • У {Math.round(scaledCarbs)}г
                    </div>
                  </div>
                </div>
              </div>

              {/* Добавить в дневник */}
              <div className="mt-3 pt-3 border-t border-gray-700/60 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <PlusCircle className="w-4 h-4 text-teal-300" />
                    <span>Добавить в дневник на сегодня</span>
                  </div>
                  <select
                    value={diaryMealType}
                    onChange={(e) =>
                      setDiaryMealType(e.target.value as MealType)
                    }
                    className="bg-black/40 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="breakfast">Завтрак</option>
                    <option value="lunch">Обед</option>
                    <option value="dinner">Ужин</option>
                    <option value="snack">Перекус</option>
                    <option value="dessert">Десерт</option>
                  </select>
                </div>
                <button
                  onClick={handleAddToDiary}
                  className="cosmic-button w-full flex items-center justify-center gap-2 text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Добавить в дневник
                </button>
              </div>
            </motion.section>

            {/* Ингредиенты */}
            <motion.section
              className="glass-card p-4 space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-sm font-semibold mb-1">Ингредиенты</h2>
              <p className="text-[11px] text-gray-500 mb-1">
                Количество пересчитано под выбранный размер порции (
                {portionScalePercent}% от базовой).
              </p>
              <div className="space-y-2 text-sm">
                {scaledIngredients.map((ing: MealIngredient, idx: number) => {
                  const base = INGREDIENTS[ing.ingredientId];
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-black/25 rounded-lg px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-100">
                          {base?.name ?? ing.ingredientId}
                        </span>
                        {ing.note && (
                          <span className="text-[11px] text-gray-500">
                            {ing.note}
                          </span>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-300">
                        {ing.amount} {ing.unit || base?.defaultUnit || ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Шаги */}
            {recipe.steps && recipe.steps.length > 0 && (
              <motion.section
                className="glass-card p-4 space-y-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-sm font-semibold mb-1">Как готовить</h2>
                <ol className="space-y-2 text-sm text-gray-200 list-decimal list-inside">
                  {recipe.steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </motion.section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
