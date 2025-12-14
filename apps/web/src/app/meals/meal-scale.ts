// apps/web/src/app/meals/meal-scale.ts
"use client";

import type { MealType, MealRecipe } from "./meal-data";
import { computeMealNutrition } from "./meal-data";
import {
  getSplitById,
  type MealSplitId,
  DEFAULT_MEAL_SPLIT_ID,
} from "./meal-presets";

/**
 * Расчёт целевых калорий на конкретный приём пищи
 * по общей дневной норме и выбранному стилю деления.
 *
 * Теперь используем split.ratios[mealType] как долю (0–1),
 * а не проценты 0–100.
 */
export function getMealTargetCalories(
  dailyCalories: number,
  splitId: MealSplitId,
  mealType: MealType,
): number {
  if (!dailyCalories || !Number.isFinite(dailyCalories)) return 0;

  // Пытаемся взять выбранный стиль, если нет — дефолтный
  const split =
    getSplitById(splitId) ?? getSplitById(DEFAULT_MEAL_SPLIT_ID);

  if (!split) return 0;

  const ratio = split.ratios[mealType] ?? 0; // доля 0–1

  if (ratio <= 0) return 0;

  return Math.round(dailyCalories * ratio);
}

/**
 * Забираем данные пользователя из localStorage:
 * - дневную норму калорий
 * - стиль деления приёмов пищи (если сохранён)
 *
 * Если ничего не нашли — используем дефолтный стиль.
 */
export function getUserMealTargetCalories(mealType: MealType): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = localStorage.getItem("fitEatUserData");
    if (!raw) return 0;

    const data = JSON.parse(raw);

    const dailyCalories: number =
      Number(data.calories) ??
      Number(data.dailyCalories) ??
      0;

    const splitId: MealSplitId =
      data.mealSplitStyle ?? DEFAULT_MEAL_SPLIT_ID;

    if (!dailyCalories || !Number.isFinite(dailyCalories)) return 0;

    return getMealTargetCalories(dailyCalories, splitId, mealType);
  } catch {
    return 0;
  }
}

/**
 * Главная функция, которую удобно использовать в дневнике/модалках:
 * - сама читает дневную норму и стиль
 * - считает целевые ккал для приёма пищи
 * - возвращает ближайший вариант порции.
 */
export function getMealPortionForUser(meal: MealRecipe) {
  const target = getUserMealTargetCalories(meal.mealType);
  return computeMealNutrition(meal, target);
}
