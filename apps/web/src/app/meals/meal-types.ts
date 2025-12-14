// apps/web/src/app/meals/meal-types.ts
import type { MealKind } from "@/types/meal";

export interface MealPortionVariant {
  /** Условный id порции, удобно делать строкой с ккал: "300", "400" и т.п. */
  id: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealRecipe {
  /** slug для роутов /meals/[slug] */
  slug: string;

  /** Название блюда */
  title: string;

  /** Тип приёма пищи */
  mealType: MealKind;

  /** Платное ли блюдо (PRO) */
  isPremium: boolean;

  /** Опциональные теги – завтрак, быстрый, на сковороде и т.п. */
  tags?: string[];

  /** Набор заранее рассчитанных порций по калориям */
  portionVariants: MealPortionVariant[];
}

/** id стиля деления калорий */
export type MealSplitStyleId = "classic" | "heavy-lunch" | "even";

export interface MealSplitPercents {
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number; // сюда можно включать и перекус, и десерт
}

export interface MealSplitStyle {
  id: MealSplitStyleId;
  title: string;
  percents: MealSplitPercents;
}

export type NutritionFacts = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};
