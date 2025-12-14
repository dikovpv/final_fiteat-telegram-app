// apps/web/src/types/meal.ts

/** Тип приёма пищи */
export type MealKind =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "dessert";

export interface MealData {
  id?: string;

  /** slug рецепта (если блюдо из предустановленного рецепта) */
  slug?: string;

  title: string;

  /** Фактическая КБЖУ конкретной порции */
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;

  /** Произвольная категория/тэг */
  category?: string;

  /** Тип приёма пищи (завтрак/обед/ужин/перекус/десерт) */
  mealType?: MealKind;

  /** Время приёма пищи в дневнике */
  time?: string;

  /** Галочка «съедено» */
  done?: boolean;

  /** id варианта порции (например "300", "400", "500"…) */
  portionId?: string;

  /** Было ли блюдо из PRO-рецепта */
  isPremium?: boolean;
}

export interface MealCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MealPlan {
  id: string;
  name: string;
  meals: MealData[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  createdAt: string;
}

export interface MealHistory {
  date: string;
  meals: MealData[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}
