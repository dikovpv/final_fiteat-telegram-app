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
  slug?: string;
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
  type?: WorkoutType;
  duration?: number;

  /** с какого плана тренировки пришло упражнение (опционально) */
  planSlug?: string;

  /** название плана, чтобы показывать в списках */
  planTitle?: string;

  /** конкретное упражнение, чтобы открывать его страницу */
  exerciseSlug?: string;
}

// алиас для совместимости
export type DiaryWorkout = Workout;

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
  /** режим повтора: разово или по дням недели */
  repeatMode?: "once" | "weekly";
  /** дни недели, если repeatMode = "weekly" (0=вс ... 6=сб) */
  daysOfWeek?: number[];
}

export type DiaryChecklistItem = ChecklistItem;

/**
 * Данные по сну:
 * - можно указать время «с» / «по»
 * - можно указать просто количество часов сна (durationHours)
 * - при расчётах приоритет у времени, если оно заполнено
 */
export interface SleepData {
  start: string | null;        // "HH:MM" или null
  end: string | null;          // "HH:MM" или null
  durationHours?: number | null; // просто количество часов сна
}

export type DiarySleep = SleepData;

export interface DiaryEntry {
  meals: Meal[];
  workouts: Workout[];
  water: number;        // литры (0.25 = 250 мл)
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
  sleep: {
    start: null,
    end: null,
    durationHours: null,
  },
  isRestDay: false,
  mood: 5,
  energy: 5,
  notes: "",
  checklist: [],
};

// префикс ключа в localStorage для дневника по датам
export const DIARY_STORAGE_PREFIX = "fitEatDiary_";

// выбранную дату продолжаем хранить, дневник на неё опирается
export const DIARY_SELECTED_DATE_KEY = "fitEatDiarySelectedDate";
