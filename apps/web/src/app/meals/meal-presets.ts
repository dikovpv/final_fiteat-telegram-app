// apps/web/src/app/meals/meal-presets.ts

import type { MealType } from "./meal-data";

// ID пресета (стиля деления)
export type MealSplitStyleId = "classic" | "heavy_lunch" | "even";

// Для обратной совместимости со старыми импортами
export type MealSplitId = MealSplitStyleId;

// Базовый тип стиля деления по приёмам пищи
export type MealSplitStyle = {
  id: MealSplitStyleId;
  label: string; // название на кнопке
  ratios: Record<MealType, number>; // доли 0–1 по каждому приёму пищи
};

// Пресет = стиль (чтобы не дублировать сущности)
export type MealSplitPreset = MealSplitStyle;

// Набор пресетов для страницы /meals
export const MEAL_SPLIT_PRESETS: MealSplitPreset[] = [
  {
    id: "classic",
    label: "Классика",
    // завтрак 25%, обед 35%, ужин 30%, перекус 10%, десерт 0
    ratios: {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.3,
      snack: 0.1,
      dessert: 0,
    },
  },
  {
    id: "heavy_lunch",
    label: "Тяжёлый обед",
    ratios: {
      breakfast: 0.2,
      lunch: 0.4,
      dinner: 0.25,
      snack: 0.15,
      dessert: 0,
    },
  },
  {
    id: "even",
    label: "Равномерно",
    ratios: {
      breakfast: 0.3,
      lunch: 0.3,
      dinner: 0.3,
      snack: 0.1,
      dessert: 0,
    },
  },
];

// ID пресета по умолчанию
export const DEFAULT_MEAL_SPLIT_ID: MealSplitStyleId = "even";

// ключ в localStorage
export const MEAL_SPLIT_STORAGE_KEY = "fitEat_meal_split_preset";

// Утилита для поиска пресета по id (чтобы старый код meal-scale.ts не ломался)
export function getSplitById(
  id: MealSplitId,
): MealSplitStyle | undefined {
  return MEAL_SPLIT_PRESETS.find((preset) => preset.id === id);
}
