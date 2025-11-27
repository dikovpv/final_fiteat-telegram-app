// apps/web/src/app/meals/meal-scale.ts

import { Meal, NutritionFacts, Ingredient } from './meal-types';

export interface ScaledMeal {
  meal: Meal;
  portion: number;
  nutrition: NutritionFacts;
  ingredients: Ingredient[];
}

export function scaleMeal(meal: Meal, portion: number): ScaledMeal {
  const factor = portion / meal.basePortion;

  const nutrition: NutritionFacts = {
    calories: Math.round(meal.baseNutrition.calories * factor),
    protein: +(meal.baseNutrition.protein * factor).toFixed(1),
    fat: +(meal.baseNutrition.fat * factor).toFixed(1),
    carbs: +(meal.baseNutrition.carbs * factor).toFixed(1),
  };

  const ingredients: Ingredient[] = meal.ingredients.map((ing) => ({
    ...ing,
    amount: +(ing.amount * factor).toFixed(1),
  }));

  return {
    meal,
    portion,
    nutrition,
    ingredients,
  };
}
