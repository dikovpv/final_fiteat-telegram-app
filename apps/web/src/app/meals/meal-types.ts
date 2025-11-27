// apps/web/src/app/meals/meal-types.ts

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface NutritionFacts {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type IngredientUnit = 'g' | 'ml' | 'piece';

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  amount: number; // количество для базовой порции
}

export interface Meal {
  id: string;
  slug: string;
  title: string;
  category: MealCategory;
  description?: string;
  imageUrl?: string;

  // базовая порция (например, 300 г готового блюда)
  basePortion: number;

  // КБЖУ именно для basePortion
  baseNutrition: NutritionFacts;

  ingredients: Ingredient[];

  // шаги рецепта
  steps?: string[];
}
