// apps/web/src/app/diary/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Dumbbell,
  Droplets,
  Moon,
  Award,
  ListTodo,
  BookOpenText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";

import AddMealModal from "./components/AddMealModal";
import AddWorkoutModal from "./components/AddWorkoutModal";
import AddChecklistModal, {
  type ChecklistFormData,
} from "./components/AddChecklistModal";

import WaterTracker from "./components/WaterTracker";
import SleepTracker from "./components/SleepTracker";

import {
  meals as MEAL_RECIPES,
} from "../meals/meal-data";
import { getMealPortionForUser } from "../meals/meal-scale";
import { WORKOUT_TEMPLATES } from "../workouts/workouts-data";

import {
  DEFAULT_ENTRY,
  DIARY_STORAGE_PREFIX,
  DIARY_SELECTED_DATE_KEY,
  type DiaryEntry,
  type DiaryMeal,
  type Workout,
  type ChecklistItem,
} from "./diary-types";

import ProgressRing from "./components/ProgressRing";
import SectionHeader from "./components/SectionHeader";
import MealCard from "./components/MealCard";
import WorkoutCard from "./components/WorkoutCard";
import ChecklistCard, {
  type ChecklistItemExt,
} from "./components/ChecklistCard";
import AchievementCard from "./components/AchievementCard";
import CopyFromDateModal from "./components/CopyFromDateModal";
import TrainingSection from "./components/TrainingSection";
import ChecklistSection from "./components/ChecklistSection";



// ======================================================================
// ВСПОМОГАТЕЛЬНЫЕ ТИПЫ И КОНСТАНТЫ
// ======================================================================

const CHECKLIST_TEMPLATES_KEY = "fitEatChecklistTemplates";

export type ChecklistRepeatMode = "once" | "weekly";

export type ChecklistTemplate = {
  id: string;
  title: string;
  repeatMode: ChecklistRepeatMode;
  weekdays?: number[];
};


// ======================================================================
// СТРАНИЦА ДНЕВНИКА
// ======================================================================

export default function DiaryPage() {
  // "Сегодня" фиксируется при монтировании
  const [todayISO] = useState(() => new Date().toISOString().split("T")[0]);

  // выбранная дата
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  // какая секция открыта
  const [openSection, setOpenSection] = useState<string | null>("nutrition");

  // модалки
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  
  // ----- копирование питания -----
const [showCopyMealsModal, setShowCopyMealsModal] = useState(false);
const [copyMealsDate, setCopyMealsDate] = useState<string>(selectedDate);
const [copyMealsError, setCopyMealsError] = useState<string | null>(null);

// ----- копирование тренировок -----
const [showCopyWorkoutsModal, setShowCopyWorkoutsModal] = useState(false);
const [copyWorkoutsDate, setCopyWorkoutsDate] = useState<string>(selectedDate);
const [copyWorkoutsError, setCopyWorkoutsError] = useState<string | null>(null);

  // синхронизируем дефолтное значение в модалках с выбранной датой
  useEffect(() => {
    setCopyMealsDate(selectedDate);
    setCopyWorkoutsDate(selectedDate);
  }, [selectedDate]);

  const [diaryData, setDiaryData] = useState<DiaryEntry | null>(DEFAULT_ENTRY);
  const [isLoaded, setIsLoaded] = useState(false);

  // шаблоны повторяющихся задач чек-листа (общие, не привязаны к дате)
  const [checklistTemplates, setChecklistTemplates] = useState<
    ChecklistTemplate[]
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CHECKLIST_TEMPLATES_KEY);
      return raw ? (JSON.parse(raw) as ChecklistTemplate[]) : [];
    } catch {
      return [];
    }
  });

  const saveChecklistTemplates = (data: ChecklistTemplate[]) => {
    setChecklistTemplates(data);
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CHECKLIST_TEMPLATES_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // готовые рецепты
  const readyMeals = useMemo<DiaryMeal[]>(
  () =>
    MEAL_RECIPES.map((recipe) => {
      // здесь уже учитывается:
      // - дневная норма калорий
      // - выбранный стиль деления (classic / heavy_lunch / even)
      // - тип приёма пищи (breakfast/lunch/...)
      const nutrition = getMealPortionForUser(recipe);

      return {
        id: recipe.slug,
        slug: recipe.slug,
        title: recipe.title,
        calories: Math.round(nutrition.perPortionCalories),
        protein: Math.round(nutrition.perPortionProtein),
        fat: Math.round(nutrition.perPortionFat),
        carbs: Math.round(nutrition.perPortionCarbs),
        type: recipe.mealType,
        done: false,
      } satisfies DiaryMeal;
    }),
  [],
);


  
  // готовые упражнения
  const readyWorkouts = useMemo<Workout[]>(
    () =>
      WORKOUT_TEMPLATES.flatMap((plan) =>
        plan.exercises.map((exercise) => ({
          id: exercise.id || exercise.slug,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          type: exercise.type,
          planSlug: plan.slug,
          exerciseSlug: exercise.slug,
          planTitle: plan.title,
          done: false,
        }))
      ),
    []
  );

  // нормы КБЖУ из профиля
  const [goals, setGoals] = useState({
    calories: 2400,
    protein: 160,
    fat: 80,
    carbs: 300,
  });

  // загрузка дневника по дате
  useEffect(() => {
    const key = `${DIARY_STORAGE_PREFIX}${selectedDate}`;
    try {
      const saved =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        const entry: DiaryEntry = {
          ...DEFAULT_ENTRY,
          ...parsed,
          meals: parsed.meals ?? [],
          workouts: parsed.workouts ?? [],
          checklist: parsed.checklist ?? [],
        };
        setDiaryData(entry);
      } else {
        setDiaryData(DEFAULT_ENTRY);
      }
    } catch (e) {
      console.error("Ошибка чтения дневника:", e);
      setDiaryData(DEFAULT_ENTRY);
    }
    setIsLoaded(true);
  }, [selectedDate]);

  // сохранение дневника
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    const key = `${DIARY_STORAGE_PREFIX}${selectedDate}`;
    const entry = diaryData ?? DEFAULT_ENTRY;
    localStorage.setItem(key, JSON.stringify(entry));
  }, [diaryData, selectedDate, isLoaded]);

  // загрузка целей КБЖУ
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("fitEatUserData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGoals({
          calories: data.calories ?? 2400,
          protein: data.proteinGoal ?? 160,
          fat: data.fatGoal ?? 80,
          carbs: data.carbsGoal ?? 300,
        });
      } catch (err) {
        console.error("Ошибка при чтении fitEatUserData:", err);
      }
    }
  }, []);

  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  // безопасный текущий дневник + нормализация массивов
  const rawEntry = diaryData ?? DEFAULT_ENTRY;

  const entry: DiaryEntry = {
    ...DEFAULT_ENTRY,
    ...rawEntry,
    meals: Array.isArray(rawEntry.meals) ? rawEntry.meals : [],
    workouts: Array.isArray(rawEntry.workouts) ? rawEntry.workouts : [],
    checklist: Array.isArray(rawEntry.checklist) ? rawEntry.checklist : [],
  };

  // наборы для модалок
  const mealsForModal = useMemo(() => {
    const map = new Map<string, DiaryMeal>();

    [...readyMeals, ...entry.meals].forEach((meal) => {
      const id = meal.id || meal.slug || meal.title;
      if (id) map.set(id, meal);
    });

    return Array.from(map.values());
  }, [entry.meals, readyMeals]);

  const workoutsForModal = useMemo(() => {
    const map = new Map<string, Workout>();

    [...readyWorkouts, ...entry.workouts].forEach((workout) => {
      const id = workout.id || workout.name;
      if (id) map.set(id, workout);
    });

    return Array.from(map.values());
  }, [entry.workouts, readyWorkouts]);

  // ====================================================================
  // ЧЕК-ЛИСТ: ДЕРИВАЦИЯ ЗАДАЧ ИЗ ШАБЛОНОВ + ОДНОРАЗОВЫЕ
  // ====================================================================

  const weekdayIndex = useMemo(() => {
    try {
      return new Date(selectedDate).getDay(); // 0..6
    } catch {
      return new Date().getDay();
    }
  }, [selectedDate]);

  const storedChecklist = (entry.checklist as ChecklistItemExt[]) ?? [];

  // задачи из шаблонов, актуальные для выбранного дня
  const recurringChecklistForDay: ChecklistItemExt[] = useMemo(
    () =>
      checklistTemplates
        .filter(
          (tpl) =>
            tpl.repeatMode === "weekly" &&
            tpl.weekdays &&
            tpl.weekdays.includes(weekdayIndex)
        )
        .map((tpl) => {
          const state = storedChecklist.find(
            (it) => it.templateId === tpl.id
          );

          return {
            id: tpl.id,
            title: tpl.title,
            done: state?.done ?? false,
            repeatMode: "weekly",
            daysOfWeek: tpl.weekdays,
            templateId: tpl.id,
          } as ChecklistItemExt;
        }),
    [checklistTemplates, storedChecklist, weekdayIndex]
  );

  // одноразовые задачи
  const oneTimeChecklist: ChecklistItemExt[] = storedChecklist.filter(
    (it) => !it.templateId
  );

  const checklistForUI: ChecklistItemExt[] = [
    ...recurringChecklistForDay,
    ...oneTimeChecklist,
  ];

  // ====================================================================
  // ПОДСЧЁТ ПРОГРЕССОВ
  // ====================================================================

  const totals = entry.meals.reduce(
    (acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.fat += m.fat || 0;
      acc.carbs += m.carbs || 0;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const getProgress = (current: number, goal: number) =>
    goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  const nutritionProgress = getProgress(totals.calories, goals.calories);

  const workoutProgress = entry.isRestDay
    ? 100
    : entry.workouts.length > 0
    ? (entry.workouts.filter((w) => w.done).length / entry.workouts.length) *
      100
    : 0;

  const WATER_GOAL = 2;
  const waterProgress = getProgress(entry.water, WATER_GOAL);

  // прогресс сна (8 часов = 100%)
  const sleepProgress = (() => {
    const sleep = entry.sleep || ({} as any);
    const { start, end, durationHours } = sleep as {
      start?: string | null;
      end?: string | null;
      durationHours?: number;
    };

    let durationMinutes: number | null = null;

    if (start && end) {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      let dur = eh * 60 + em - (sh * 60 + sm);
      if (dur < 0) dur += 1440; // переход через полночь
      if (dur > 0) {
        durationMinutes = dur;
      }
    }

    if (durationMinutes == null && typeof durationHours === "number") {
      const hrs = Math.max(0, durationHours);
      if (hrs > 0) {
        durationMinutes = hrs * 60;
      }
    }

    if (!durationMinutes) return 0;

    return Math.min((durationMinutes / 480) * 100, 100);
  })();

  const checklistProgress =
    checklistForUI.length > 0
      ? (checklistForUI.filter((t) => t.done).length /
          checklistForUI.length) *
        100
      : 0;

  // день недели
  const weekday = new Date(selectedDate).toLocaleDateString("ru-RU", {
    weekday: "long",
  });

  // смещение выбранной даты относительно сегодняшней
  const selectedDiffFromToday = (() => {
    try {
      const today = new Date(todayISO);
      const current = new Date(selectedDate);
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((current.getTime() - today.getTime()) / msPerDay);
    } catch {
      return NaN;
    }
  })();

  const isYesterdaySelected = selectedDiffFromToday === -1;
  const isTodaySelected = selectedDiffFromToday === 0;
  const isTomorrowSelected = selectedDiffFromToday === 1;

  // ===== быстрые переключатели дат =====
  const setDateAndRemember = (iso: string) => {
    setSelectedDate(iso);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DIARY_SELECTED_DATE_KEY, iso);
      } catch {
        // ignore
      }
    }
  };

  const goToYesterday = () => {
    const base = new Date(todayISO);
    base.setDate(base.getDate() - 1);
    setDateAndRemember(base.toISOString().split("T")[0]);
  };

  const goToToday = () => setDateAndRemember(todayISO);

  const goToTomorrow = () => {
    const base = new Date(todayISO);
    base.setDate(base.getDate() + 1);
    setDateAndRemember(base.toISOString().split("T")[0]);
  };

  // ====================================================================
  // ОПЕРАЦИИ С ЕДОЙ / ТРЕНИРОВКАМИ / ЧЕК-ЛИСТОМ
  // ====================================================================

  const toggleMealDone = (id: string) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        meals: base.meals.map((meal) =>
          meal.id === id ? { ...meal, done: !meal.done } : meal
        ),
      };
    });

  const deleteMeal = (id: string) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        meals: base.meals.filter((meal) => meal.id !== id),
      };
    });

    // копирование питания с другой даты (из модалки)
const handleCopyMealsConfirm = () => {
  if (!copyMealsDate) {
    setCopyMealsError("Выберите дату");
    return;
  }

  // чтобы не копировать саму же дату в себя
  if (copyMealsDate === selectedDate) {
    setCopyMealsError("Нельзя копировать в ту же самую дату");
    return;
  }

  try {
    const key = `${DIARY_STORAGE_PREFIX}${copyMealsDate}`;
    const saved = localStorage.getItem(key);

    if (!saved) {
      setCopyMealsError("Нет данных за выбранную дату");
      return;
    }

    const data: DiaryEntry = JSON.parse(saved);

    setDiaryData(prev => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        meals: data.meals ?? [],
      };
    });

    // закрываем модалку и чистим ошибку
    setShowCopyMealsModal(false);
    setCopyMealsError(null);
  } catch (e) {
    console.error("Ошибка при копировании питания:", e);
    setCopyMealsError("Ошибка чтения данных. Попробуйте другую дату.");
  }
};

// копирование тренировок с другой даты (из модалки)
const handleCopyWorkoutsConfirm = () => {
  if (!copyWorkoutsDate) {
    setCopyWorkoutsError("Выберите дату");
    return;
  }

  if (copyWorkoutsDate === selectedDate) {
    setCopyWorkoutsError("Нельзя копировать в ту же самую дату");
    return;
  }

  try {
    const key = `${DIARY_STORAGE_PREFIX}${copyWorkoutsDate}`;
    const saved = localStorage.getItem(key);

    if (!saved) {
      setCopyWorkoutsError("Нет данных за выбранную дату");
      return;
    }

    const data: DiaryEntry = JSON.parse(saved);

    setDiaryData(prev => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        workouts: data.workouts ?? [],
        isRestDay: data.isRestDay ?? false,
      };
    });

    setShowCopyWorkoutsModal(false);
    setCopyWorkoutsError(null);
  } catch (e) {
    console.error("Ошибка при копировании тренировок:", e);
    setCopyWorkoutsError("Ошибка чтения данных. Попробуйте другую дату.");
  }
};

  const toggleWorkoutDone = (id: string) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        workouts: base.workouts.map((workout) =>
          workout.id === id ? { ...workout, done: !workout.done } : workout
        ),
      };
    });

  const deleteWorkout = (id: string) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        workouts: base.workouts.filter((workout) => workout.id !== id),
      };
    });

  const updateWorkoutWeight = (id: string, weight?: number) =>
    setDiaryData(prev => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        workouts: base.workouts.map(w =>
          w.id === id ? { ...w, weight } : w
        ),
      };
    });


  const toggleChecklistItem = (item: ChecklistItemExt) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      const list = (base.checklist as ChecklistItemExt[]) ?? [];

      // задача из шаблона
      if (item.templateId) {
        const idx = list.findIndex((i) => i.templateId === item.templateId);
        if (idx === -1) {
          const newItem: ChecklistItemExt = {
            id: `tpl_${item.templateId}`,
            title: item.title,
            done: true,
            repeatMode: "weekly",
            daysOfWeek: item.daysOfWeek,
            templateId: item.templateId,
          };
          return { ...base, checklist: [...list, newItem] };
        } else {
          const updated = [...list];
          updated[idx] = { ...updated[idx], done: !updated[idx].done };
          return { ...base, checklist: updated };
        }
      }

      // обычная задача
      const updated = list.map((i) =>
        i.id === item.id ? { ...i, done: !i.done } : i
      );
      return { ...base, checklist: updated };
    });

  const deleteChecklistItem = (item: ChecklistItemExt) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      const list = (base.checklist as ChecklistItemExt[]) ?? [];

      if (item.templateId) {
        // удаляем только состояние на этот день (шаблон остаётся)
        const updated = list.filter((i) => i.templateId !== item.templateId);
        return { ...base, checklist: updated };
      }

      const updated = list.filter((i) => i.id !== item.id);
      return { ...base, checklist: updated };
    });

  // копирование питания/тренировок из другой даты (через модалки)

  const applyMealsCopyFromDate = (source: string) => {
    if (!source || typeof window === "undefined") return;

    const key = `${DIARY_STORAGE_PREFIX}${source}`;
    const saved = localStorage.getItem(key);
    if (!saved) {
      setCopyMealsError("Нет данных по питанию за эту дату");
      return;
    }
    try {
      const data: DiaryEntry = JSON.parse(saved);
      setDiaryData((prev) => {
        const base = prev ?? DEFAULT_ENTRY;
        return {
          ...base,
          meals: data.meals ?? [],
        };
      });
      setShowCopyMealsModal(false);
      setCopyMealsError(null);
    } catch {
      setCopyMealsError("Ошибка чтения данных за выбранную дату");
    }
  };

  const applyWorkoutsCopyFromDate = (source: string) => {
    if (!source || typeof window === "undefined") return;

    const key = `${DIARY_STORAGE_PREFIX}${source}`;
    const saved = localStorage.getItem(key);
    if (!saved) {
      setCopyWorkoutsError("Нет тренировок за эту дату");
      return;
    }
    try {
      const data: DiaryEntry = JSON.parse(saved);
      setDiaryData((prev) => {
        const base = prev ?? DEFAULT_ENTRY;
        return {
          ...base,
          workouts: data.workouts ?? [],
          isRestDay: data.isRestDay ?? false,
        };
      });
      setShowCopyWorkoutsModal(false);
      setCopyWorkoutsError(null);
    } catch {
      setCopyWorkoutsError("Ошибка чтения данных за выбранную дату");
    }
  };

  // сохранение задачи из модалки чек-листа
  const handleChecklistSave = (data: ChecklistFormData) => {
    const title = data.title.trim();
    if (!title) return;

    const anyData = data as any;
    const weekdays: number[] =
      anyData.weekdays ?? anyData.daysOfWeek ?? anyData.selectedDays ?? [];

    if (data.repeatMode === "weekly" && weekdays.length > 0) {
      const template: ChecklistTemplate = {
        id: `tpl_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        title,
        repeatMode: "weekly",
        weekdays,
      };

      // сохраняем шаблон
      saveChecklistTemplates([...checklistTemplates, template]);

      // если выбранный день входит в список — добавляем экземпляр
      if (weekdays.includes(weekdayIndex)) {
        setDiaryData((prev) => {
          const base = prev ?? DEFAULT_ENTRY;
          const list = (base.checklist as ChecklistItemExt[]) ?? [];

          const exists = list.some((i) => i.templateId === template.id);
          if (exists) return base;

          const newItem: ChecklistItemExt = {
            id: `tpl_${template.id}`,
            title: template.title,
            done: false,
            repeatMode: "weekly",
            daysOfWeek: template.weekdays,
            templateId: template.id,
          };

          return { ...base, checklist: [...list, newItem] };
        });
      }

      setShowChecklistModal(false);
      return;
    }

    // одноразовая задача
    const newItem: ChecklistItemExt = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title,
      done: false,
      repeatMode: "once",
    };

    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      const list = (base.checklist as ChecklistItemExt[]) ?? [];
      return { ...base, checklist: [...list, newItem] };
    });

    setShowChecklistModal(false);
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pb-24 relative">
      <div className="cosmic-bg" />

      <PageHeader
        title="Дневник"
        rightSlot={
          <p className="capitalize text-sm font-medium text-white/90">
            {weekday}
          </p>
        }
      />

      {/* Карточка с датой и быстрыми кнопками — закреплена под шапкой */}
      <motion.div
        className="glass-card p-4 mb-6 max-w-5xl mx-auto mt-4 sticky top-[72px] z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setDateAndRemember(newDate);
              }}
              className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={goToYesterday}
              className={`px-3 py-1.5 rounded-full border text-[var(--text-secondary)] transition ${
                isYesterdaySelected
                  ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-strong)]"
                  : "bg-[var(--surface)] border-[var(--border-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              Вчера
            </button>

            <button
              onClick={goToToday}
              className={`px-3 py-1.5 rounded-full border text-[var(--text-secondary)] transition ${
                isTodaySelected
                  ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-strong)]"
                  : "bg-[var(--surface)] border-[var(--border-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              Сегодня
            </button>

            <button
              onClick={goToTomorrow}
              className={`px-3 py-1.5 rounded-full border text-[var(--text-secondary)] transition ${
                isTomorrowSelected
                  ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-strong)]"
                  : "bg-[var(--surface)] border-[var(--border-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              Завтра
            </button>
          </div>
        </div>
      </motion.div>

      {/* Прогресс дня */}
      <motion.div
        className="glass-card p-4 mx-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Прогресс дня
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ProgressRing
            icon={<UtensilsCrossed className="w-4 h-4" />}
            progress={nutritionProgress}
            color="var(--accent)"
            label="Питание"
          />
          <ProgressRing
            icon={<Dumbbell className="w-4 h-4" />}
            progress={workoutProgress}
            color="var(--success)"
            label={entry.isRestDay ? "Отдых" : "Тренировки"}
          />
          <ProgressRing
            icon={<Droplets className="w-4 h-4" />}
            progress={waterProgress}
            color="var(--info)"
            label="Вода"
          />
          <ProgressRing
            icon={<Moon className="w-4 h-4" />}
            progress={sleepProgress}
            color="var(--purple)"
            label="Сон"
          />
        </div>
      </motion.div>

      {/* Основной контент */}
      <div className="px-4 space-y-4 max-w-3xl mx-auto">
        {/* Питание */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader
            title="Питание"
            icon={<UtensilsCrossed className="w-5 h-5 text-[var(--accent)]" />}
            isOpen={openSection === "nutrition"}
            onToggle={() => toggleSection("nutrition")}
            progress={nutritionProgress}
          />

          <AnimatePresence>
            {openSection === "nutrition" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                {/* ссылка на книгу рецептов */}
                <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[var(--text-secondary)]">
                    Можно выбирать блюда не только по КБЖУ, но и по рецептам.
                  </span>
                  <Link
                    href="/meals"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)] text-[var(--accent-strong)] hover:bg-[var(--accent)] hover:text-white transition"
                  >
                    <BookOpenText className="w-3 h-3" />
                    <span>Книга рецептов</span>
                  </Link>
                </div>

                {/* прогресс БЖУ */}
                <div className="mb-3 p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-soft)]">
                  <h3 className="font-semibold mb-2 text-sm text-[var(--text-primary)]">
                    БЖУ на сегодня
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <BjuRow
                      label="Калории"
                      value={totals.calories}
                      goal={goals.calories}
                    />
                    <BjuRow
                      label="Белки"
                      value={totals.protein}
                      goal={goals.protein}
                      unit="г"
                    />
                    <BjuRow
                      label="Жиры"
                      value={totals.fat}
                      goal={goals.fat}
                      unit="г"
                    />
                    <BjuRow
                      label="Углеводы"
                      value={totals.carbs}
                      goal={goals.carbs}
                      unit="г"
                    />
                  </div>
                </div>

                {/* копирование питания */}
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => {
                      setCopyMealsDate(selectedDate);
                      setCopyMealsError(null);
                      setShowCopyMealsModal(true);
                    }}
                    className="text-xs text-[var(--accent)] hover:text-[var(--accent-strong)] underline underline-offset-4"
                  >
                    Скопировать питание с другой даты
                  </button>
                </div>

                {/* список блюд */}
                {entry.meals.length === 0 ? (
                  <div className="text-center py-8">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-[var(--border-soft)]" />
                    <p className="text-[var(--text-secondary)] mb-4">
                      Нет добавленных блюд
                    </p>
                    <button
                      onClick={() => setShowMealModal(true)}
                      className="cosmic-button flex items-center justify-center gap-2 mx-auto"
                    >
                      <PlusIcon />
                      Добавить первое блюдо
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entry.meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onToggle={() => toggleMealDone(meal.id)}
                        onDelete={() => deleteMeal(meal.id)}
                      />
                    ))}
                    <button
                      onClick={() => setShowMealModal(true)}
                      className="w-full mt-3 text-[var(--accent)] text-sm font-medium py-2 hover:text-[var(--accent-strong)] transition"
                    >
                      + Добавить еще блюдо
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Тренировки */}
        <TrainingSection
          entry={entry}
          open={openSection === "training"}
          progress={workoutProgress}
          onToggle={() => toggleSection("training")}
          onCopyClick={() => {
            setCopyWorkoutsDate(selectedDate);
            setCopyWorkoutsError(null);
            setShowCopyWorkoutsModal(true);
          }}
          onAddWorkout={() => setShowWorkoutModal(true)}
          onToggleWorkout={toggleWorkoutDone}
          onDeleteWorkout={deleteWorkout}
          setDiaryData={setDiaryData}
        />

        {/* Вода */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader
            title="Вода"
            icon={<Droplets className="w-5 h-5 text-[var(--info)]" />}
            isOpen={openSection === "water"}
            onToggle={() => toggleSection("water")}
            progress={waterProgress}
          />

          <AnimatePresence>
            {openSection === "water" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                <WaterTracker
                  value={entry.water}
                  onChange={(val) =>
                    setDiaryData((prev) => {
                      const base = prev ?? DEFAULT_ENTRY;
                      return { ...base, water: val };
                    })
                  }
                  goal={WATER_GOAL}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Сон */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SectionHeader
            title="Сон"
            icon={<Moon className="w-5 h-5 text-[var(--purple)]" />}
            isOpen={openSection === "sleep"}
            onToggle={() => toggleSection("sleep")}
            progress={sleepProgress}
          />

          <AnimatePresence>
            {openSection === "sleep" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                <SleepTracker
                  value={entry.sleep}
                  onChange={(val) =>
                    setDiaryData((prev) => {
                      const base = prev ?? DEFAULT_ENTRY;
                      return { ...base, sleep: val };
                    })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Чек-лист */}
        <ChecklistSection
          open={openSection === "checklist"}
          progress={checklistProgress}
          checklist={checklistForUI}
          onToggle={() => toggleSection("checklist")}
          onToggleItem={toggleChecklistItem}
          onDeleteItem={deleteChecklistItem}
          onAddClick={() => setShowChecklistModal(true)}
        />

        {/* Достижения дня */}
        <motion.div
          className="glass-card p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <Award className="w-5 h-5 text-[var(--accent-gold)]" />
            Достижения дня
          </h2>

          <div className="space-y-3 text-sm">
            {nutritionProgress >= 80 && (
              <AchievementCard
                icon={<Award className="w-6 h-6" />}
                title="Питание на высоте!"
                description="Выполнена норма калорий"
                color="var(--success)"
              />
            )}

            {waterProgress >= 80 && (
              <AchievementCard
                icon={<Droplets className="w-6 h-6" />}
                title="Гидрация в норме!"
                description="Выполнена норма воды"
                color="var(--info)"
              />
            )}

            {sleepProgress >= 80 && (
              <AchievementCard
                icon={<Moon className="w-6 h-6" />}
                title="Отличный сон!"
                description="8 часов качественного отдыха"
                color="var(--purple)"
              />
            )}

            {checklistForUI.length > 0 &&
              checklistForUI.every((t) => t.done) && (
                <AchievementCard
                  icon={<ListTodo className="w-6 h-6" />}
                  title="Все задачи на сегодня выполнены!"
                  description="Это и есть настоящая дисциплина"
                  color="var(--success)"
                />
              )}
          </div>
        </motion.div>
      </div>

      {/* Модалки копирования с другой даты */}
      <AnimatePresence>
        {showCopyMealsModal && (
          <CopyFromDateModal
              isOpen
              title="Скопировать питание с другой даты"
              description="Питание за выбранную дату будет заменено."
              date={copyMealsDate}
              error={copyMealsError}
              onDateChange={setCopyMealsDate}
              onCancel={() => {
                setShowCopyMealsModal(false);
                setCopyMealsError(null);
              }}
              onConfirm={handleCopyMealsConfirm}
            />
        )}

        {showCopyWorkoutsModal && (
         <CopyFromDateModal
            isOpen
            title="Скопировать тренировки с другой даты"
            description="Тренировки за выбранную дату будут заменены."
            date={copyWorkoutsDate}
            error={copyWorkoutsError}
            onDateChange={setCopyWorkoutsDate}
            onCancel={() => {
              setShowCopyWorkoutsModal(false);
              setCopyWorkoutsError(null);
            }}
            onConfirm={handleCopyWorkoutsConfirm}
          />
        )}
      </AnimatePresence>

      {/* Модалки добавления блюд / тренировок / задач */}
      {showMealModal && (
        <AddMealModal
          onClose={() => setShowMealModal(false)}
          readyMeals={mealsForModal}
          onSave={(meal) => {
            const m = meal as any;

            const newMeal: DiaryMeal = {
              id: Date.now().toString(),
              title: m.title,
              calories: m.calories ?? 0,
              protein: m.protein ?? 0,
              fat: m.fat ?? 0,
              carbs: m.carbs ?? 0,
              done: false,
              time: new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: m.type as DiaryMeal["type"] | undefined,
              slug: m.slug,
            };

            setDiaryData((prev) => {
              const base = prev ?? DEFAULT_ENTRY;
              return {
                ...base,
                meals: [...base.meals, newMeal],
              };
            });

            setShowMealModal(false);
          }}
        />
      )}

      {showWorkoutModal && (
        <AddWorkoutModal
          onClose={() => setShowWorkoutModal(false)}
          readyWorkouts={workoutsForModal}
          onSave={(workout) => {
            const newWorkout: Workout = {
              id: Date.now().toString(),
              name: workout.name,
              sets: workout.sets ?? 3,
              reps: workout.reps ?? 10,
              weight: workout.weight,
              duration: workout.duration,
              type: workout.type,
              planSlug: workout.planSlug,
              planTitle: workout.planTitle,
              exerciseSlug: workout.exerciseSlug,
              done: false,
            };

            setDiaryData((prev) => {
              const base = prev ?? DEFAULT_ENTRY;
              return {
                ...base,
                workouts: [...base.workouts, newWorkout],
              };
            });

            setShowWorkoutModal(false);
          }}
        />
      )}

      <AnimatePresence>
        {showChecklistModal && (
          <AddChecklistModal
            onClose={() => setShowChecklistModal(false)}
            onSave={handleChecklistSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ======================================================================
// МЕЛКИЕ ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ, КОТОРЫЕ ЛУЧШЕ ОСТАВИТЬ ЗДЕСЬ
// ======================================================================

function BjuRow({
  label,
  value,
  goal,
  unit,
}: {
  label: string;
  value: number;
  goal: number;
  unit?: string;
}) {
  return (
    <div className="flex justify-between text-xs sm:text-sm">
      <span className="text-[var(--text-secondary)]">{label}:</span>
      <span className="font-semibold text-[var(--text-primary)]">
        {value}/{goal}
        {unit}
      </span>
    </div>
  );
}

function PlusIcon() {
  return <span className="inline-block w-4 h-4 leading-none">+</span>;
}
