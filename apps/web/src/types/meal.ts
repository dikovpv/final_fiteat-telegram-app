export interface MealData {
  id?: string;
  title: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  category?: string;
  time?: string;
  done?: boolean;
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