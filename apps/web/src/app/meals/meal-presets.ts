// apps/web/src/app/meals/meal-presets.ts

import { MealType } from "./meals-data";

export type MealSplitPreset = {
  id: "classic" | "heavy-lunch" | "even";
  label: string;
  description: string;
  ratios: Record<MealType, number>;
};

export const MEAL_SPLIT_PRESETS: MealSplitPreset[] = [
  {
    id: "classic",
    label: "Классика",
    description: "25% завтрак · 35% обед · 30% ужин · 10% перекус",
    ratios: {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.3,
      snack: 0.1,
      dessert: 0,
    },
  },
  {
    id: "heavy-lunch",
    label: "Тяжёлый обед",
    description: "30% завтрак · 40% обед · 15% ужин · 15% перекус",
    ratios: {
      breakfast: 0.3,
      lunch: 0.4,
      dinner: 0.15,
      snack: 0.15,
      dessert: 0,
    },
  },
  {
    id: "even",
    label: "Равномерно",
    description: "30% завтрак · 30% обед · 30% ужин · 10% перекус",
    ratios: {
      breakfast: 0.3,
      lunch: 0.3,
      dinner: 0.3,
      snack: 0.1,
      dessert: 0,
    },
  },
];

export const MEAL_SPLIT_STORAGE_KEY = "fitEatMealSplitPreset";
export const DEFAULT_MEAL_SPLIT_ID: MealSplitPreset["id"] =
  MEAL_SPLIT_PRESETS[0]?.id ?? "classic";
