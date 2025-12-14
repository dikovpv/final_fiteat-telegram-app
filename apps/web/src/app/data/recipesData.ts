import type { MealRecipe } from "../meals/meal-data";
import * as Meals from "../meals/meals-data";

const raw =
  (Meals as any).MEALS ??
  (Meals as any).MEAL_RECIPES ??
  (Meals as any).RECIPES ??
  (Meals as any).meals ??
  (Meals as any).default ??
  [];

export const recipesData: MealRecipe[] = raw as MealRecipe[];
export default recipesData;
