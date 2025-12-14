// apps/web/src/hooks/useDiary.ts

import { useEffect, useState, useCallback } from 'react';
import type { MealType } from '@/app/meals/meal-data';

type NutritionFacts = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};


const STORAGE_KEY = 'fiteat_diary_v1';

export type DiaryMealType = MealType;

export interface DiaryMealEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  mealId: string;
  mealTitle: string;
  mealType: DiaryMealType;
  portion: number; // г
  nutrition: NutritionFacts;
}

interface AddMealArgs {
  date?: string;
  mealId: string;
  mealTitle: string;
  mealType: DiaryMealType;
  portion: number;
  nutrition: NutritionFacts;
}

function getTodayDateString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function loadDiary(): DiaryMealEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveDiary(entries: DiaryMealEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // игнорируем
  }
}

export function useDiary() {
  const [entries, setEntries] = useState<DiaryMealEntry[]>([]);

  useEffect(() => {
    const initial = loadDiary();
    setEntries(initial);
  }, []);

  const addMealToDiary = useCallback((args: AddMealArgs) => {
    const date = args.date ?? getTodayDateString();

    const newEntry: DiaryMealEntry = {
      id: `${date}-${args.mealId}-${Date.now()}`,
      date,
      mealId: args.mealId,
      mealTitle: args.mealTitle,
      mealType: args.mealType,
      portion: Math.round(args.portion),
      nutrition: {
        calories: Math.round(args.nutrition.calories),
        protein: +args.nutrition.protein.toFixed(1),
        fat: +args.nutrition.fat.toFixed(1),
        carbs: +args.nutrition.carbs.toFixed(1),
      },
    };

    setEntries((prev) => {
      const updated = [...prev, newEntry];
      saveDiary(updated);
      return updated;
    });

    return newEntry;
  }, []);

  const getEntriesByDate = useCallback(
    (date: string) => entries.filter((e) => e.date === date),
    [entries]
  );

  return {
    entries,
    addMealToDiary,
    getEntriesByDate,
  };
}
