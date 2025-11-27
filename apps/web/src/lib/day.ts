// src/lib/day.ts

export interface FoodEntry {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  // опционально: время, категория (завтрак/обед/ужин/перекус)
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time?: string; // 'HH:mm'
}

export interface DaySummary {
  date: string; // '2025-11-14'
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
}

export function calculateDaySummary(
  date: string,
  entries: FoodEntry[]
): DaySummary {
  const totals = entries.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.fats += item.fats;
      acc.carbs += item.carbs;
      return acc;
    },
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );

  return {
    date,
    entries,
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.protein),
    totalFats: Math.round(totals.fats),
    totalCarbs: Math.round(totals.carbs),
  };
}
