// apps/web/src/app/meals/meals-data.ts
// Прокидываем общий каталог рецептов в страницы.

import {
  meals as baseMeals,
  computeMealNutrition,
  type MealRecipe,
  type MealType,
} from "@/lib/meals-data";

export type { MealRecipe, MealType };
export { computeMealNutrition };

export const meals = baseMeals;
export const MEALS = baseMeals;

export const MEALS_BY_TYPE: Record<MealType, MealRecipe[]> = baseMeals.reduce(
  (acc, meal) => {
    acc[meal.mealType] = acc[meal.mealType] || [];
    acc[meal.mealType].push(meal);
    return acc;
  },
  {
    breakfast: [] as MealRecipe[],
    lunch: [] as MealRecipe[],
    dinner: [] as MealRecipe[],
    snack: [] as MealRecipe[],
    dessert: [] as MealRecipe[],
  },
);
