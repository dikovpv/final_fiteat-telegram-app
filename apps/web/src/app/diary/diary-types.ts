// apps/web/src/app/diary/diary-types.ts

// Общие типы для дневника + константы хранения в localStorage

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "dessert";

export interface Meal {
  id: string;
  title: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  done?: boolean;
  time?: string;
  type?: MealType;
  slug?: string; // <-- вот это добавили
}

// алиас, чтобы можно было использовать и старое название
export type DiaryMeal = Meal;

export type WorkoutType = "strength" | "cardio" | "flexibility";

export interface Workout {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  done?: boolean;
  type?: "strength" | "cardio" | "flexibility";
  duration?: number;

  /** с какого плана тренировки пришло упражнение (опционально) */
  planSlug?: string;

  /** конкретное упражнение, чтобы открывать его страницу */
  exerciseSlug?: string;
}



// алиас для совместимости
export type DiaryWorkout = Workout;

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
  repeatMode?: "once" | "weekly";
  daysOfWeek?: number[];
}

export type DiaryChecklistItem = ChecklistItem;

export interface SleepData {
  start: string;
  end: string;
  quality?: number;
}

export type DiarySleep = SleepData;

export interface DiaryEntry {
  meals: Meal[];
  workouts: Workout[];
  water: number;
  sleep: SleepData;
  isRestDay?: boolean;
  mood?: number;
  energy?: number;
  notes?: string;
  checklist: ChecklistItem[];
}

// дефолтное состояние дневника
export const DEFAULT_ENTRY: DiaryEntry = {
  meals: [],
  workouts: [],
  water: 0,
  sleep: { start: "", end: "", quality: 5 },
  isRestDay: false,
  mood: 5,
  energy: 5,
  notes: "",
  checklist: [],
};

// префикс ключа в localStorage для дневника по датам
export const DIARY_STORAGE_PREFIX = "fitEatDiary_";
export const DIARY_SELECTED_DATE_KEY = "fitEatDiarySelectedDate";
