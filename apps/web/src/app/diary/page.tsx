"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  UtensilsCrossed,
  Dumbbell,
  Droplets,
  Moon,
  CheckCircle,
  Trash2,
  Plus,
  TrendingUp,
  Award,
  Activity,
  NotebookPen,
  ListTodo,
  BookOpenText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AddMealModal from "./components/AddMealModal";
import AddWorkoutModal from "./components/AddWorkoutModal";
import AddChecklistModal from "./components/AddChecklistModal";
import WaterTracker from "./components/WaterTracker";
import SleepTracker from "./components/SleepTracker";
import {
  meals as MEAL_RECIPES,
  computeMealNutrition,
} from "../meals/meals-data";
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

// ===== Страница дневника =====

export default function DiaryPage() {
  const todayISO = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (typeof window === "undefined") return todayISO;

    try {
      const stored = localStorage.getItem(DIARY_SELECTED_DATE_KEY);
      return stored || todayISO;
    } catch {
      return todayISO;
    }
  });

  const [openSection, setOpenSection] = useState<string | null>("nutrition");

  const [showMealModal, setShowMealModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const [diaryData, setDiaryData] = useState<DiaryEntry | null>(DEFAULT_ENTRY);
  const [isLoaded, setIsLoaded] = useState(false);

  // готовые списки рецептов и упражнений для быстрого добавления из модалок
  const readyMeals = useMemo<DiaryMeal[]>(
    () =>
      MEAL_RECIPES.map((recipe) => {
        const nutrition = computeMealNutrition(recipe);

        return {
          id: recipe.slug,
          slug: recipe.slug,
          title: recipe.title,
          calories: Math.round(nutrition.perPortionCalories),
          protein: Math.round(nutrition.perPortionProtein),
          fat: Math.round(nutrition.perPortionFat),
          carbs: Math.round(nutrition.perPortionCarbs),
          type: recipe.mealType,
          category: recipe.mealType,
        } satisfies DiaryMeal;
      }),
    []
  );

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
          // чтобы в списке было видно, из какого плана упражнение
          planTitle: plan.title,
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

  // при первом рендере пробуем восстановить последнюю выбранную дату
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(DIARY_SELECTED_DATE_KEY);
    if (stored) {
      setSelectedDate(stored);
    }
  }, []);

  // сохраняем текущую выбранную дату для рецептов/тренировок
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DIARY_SELECTED_DATE_KEY, selectedDate);
  }, [selectedDate]);

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

  // подсчёт БЖУ за день
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

  // прогресс (общая функция)
  const getProgress = (current: number, goal: number) =>
    goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  const nutritionProgress = getProgress(totals.calories, goals.calories);

  const workoutProgress = entry.isRestDay
    ? 100
    : entry.workouts.length > 0
    ? (entry.workouts.filter((w) => w.done).length / entry.workouts.length) *
      100
    : 0;

  const waterProgress = getProgress(entry.water, 2.5);

  const sleepProgress = (() => {
    const { start, end } = entry.sleep;
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let dur = eh * 60 + em - (sh * 60 + sm);
    if (dur < 0) dur += 1440;
    return Math.min((dur / 480) * 100, 100); // 8 часов = 100%
  })();

  const checklistProgress =
    entry.checklist.length > 0
      ? (entry.checklist.filter((t) => t.done).length /
          entry.checklist.length) *
        100
      : 0;

  // день недели
  const weekday = new Date(selectedDate).toLocaleDateString("ru-RU", {
    weekday: "long",
  });

  // статистика дня
  const dayStats = {
    mealsCount: entry.meals.length,
    completedMeals: entry.meals.filter((m) => m.done).length,
    workoutsCount: entry.workouts.length,
    completedWorkouts: entry.workouts.filter((w) => w.done).length,
    waterGlasses: Math.floor(entry.water / 0.25),
    sleepHours: (() => {
      const { start, end } = entry.sleep;
      if (!start || !end) return 0;
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      let dur = eh * 60 + em - (sh * 60 + sm);
      if (dur < 0) dur += 1440;
      return Math.round(dur / 60);
    })(),
  };

  // ===== быстрые переключатели дат =====

  const goToRelativeDay = (offset: number) => {
    const base = selectedDate ? new Date(selectedDate) : new Date(todayISO);
    base.setDate(base.getDate() + offset);
    const newISO = base.toISOString().split("T")[0];
    setSelectedDate(newISO);
  };

  const goToToday = () => {
    setSelectedDate(todayISO);
  };

  // ===== работа с едой / тренировками / чек-листом =====

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

  const toggleChecklistItem = (id: string) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        checklist: (base.checklist || []).map((item) =>
          item.id === id ? { ...item, done: !item.done } : item
        ),
      };
    });

  const deleteChecklistItem = (id: string) =>
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        checklist: (base.checklist || []).filter((item) => item.id !== id),
      };
    });

  // копирование питания с другой даты
  const copyMealsFromOtherDay = () => {
    const source = window.prompt(
      "Введите дату, откуда скопировать питание (ГГГГ-ММ-ДД):",
      selectedDate
    );
    if (!source) return;
    const key = `${DIARY_STORAGE_PREFIX}${source}`;
    const saved = localStorage.getItem(key);
    if (!saved) {
      alert("Нет данных за эту дату");
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
    } catch {
      alert("Ошибка чтения данных за выбранную дату");
    }
  };

  // копирование тренировок с другой даты
  const copyWorkoutsFromOtherDay = () => {
    const source = window.prompt(
      "Введите дату, откуда скопировать тренировки (ГГГГ-ММ-ДД):",
      selectedDate
    );
    if (!source) return;
    const key = `${DIARY_STORAGE_PREFIX}${source}`;
    const saved = localStorage.getItem(key);
    if (!saved) {
      alert("Нет данных за эту дату");
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
    } catch {
      alert("Ошибка чтения данных за выбранную дату");
    }
  };

  // сохранение задачи из модалки чек-листа
  const handleChecklistSave = (data: any) => {
    const title = String(data?.title || "").trim();
    if (!title) return;

    const repeatMode =
      (data.repeatMode || data.repeatType || "once") as "once" | "weekly";
    const daysOfWeek: number[] | undefined =
      data.daysOfWeek || data.selectedDays;

    const newItem: ChecklistItem = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title,
      done: false,
      repeatMode,
      daysOfWeek,
    };

    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        checklist: [...(base.checklist || []), newItem],
      };
    });

    setShowChecklistModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0b2e] to-[#2d1b69] text-[#f0f0f5] pb-24">
      <div className="cosmic-bg" />

      {/* заголовок с датой */}
      <motion.div
        className="glass-card p-4 mb-6 sticky top-0 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold neon-text-teal flex items-center gap-2 mb-4">
          <NotebookPen className="w-6 h-6" />
          Дневник
        </h1>

        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-teal-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);

                if (typeof window !== "undefined") {
                  try {
                    localStorage.setItem(DIARY_SELECTED_DATE_KEY, newDate);
                  } catch (err) {
                    console.error(
                      "Не удалось сохранить выбранную дату:",
                      err
                    );
                  }
                }
              }}
              className="bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
            />
          </div>

          {/* быстрые кнопки навигации по дням */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => goToRelativeDay(-1)}
              className="px-3 py-1.5 rounded-full bg-black/30 border border-gray-600 text-gray-200 hover:border-teal-400 hover:text-teal-200 transition"
            >
              Вчера
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-1.5 rounded-full border text-gray-200 transition ${
                selectedDate === todayISO
                  ? "bg-teal-500/20 border-teal-400 text-teal-200"
                  : "bg-black/30 border-gray-600 hover:border-teal-400 hover:text-teal-200"
              }`}
            >
              Сегодня
            </button>
            <button
              onClick={() => goToRelativeDay(1)}
              className="px-3 py-1.5 rounded-full bg-black/30 border border-gray-600 text-gray-200 hover:border-teal-400 hover:text-teal-200 transition"
            >
              Завтра
            </button>
          </div>

          <p className="capitalize text-gray-300 font-medium min-w-[80px] text-right">
            {weekday}
          </p>
        </div>
      </motion.div>

      {/* прогресс + статистика дня в одном блоке */}
      <motion.div
        className="glass-card p-4 mx-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* индикаторы прогресса дня */}
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-3">
            <ProgressRing
              icon={<UtensilsCrossed />}
              progress={nutritionProgress}
              color="#00d4aa"
              label="Питание"
            />
            <ProgressRing
              icon={<Dumbbell />}
              progress={workoutProgress}
              color="#39ff14"
              label={entry.isRestDay ? "Отдых" : "Тренировки"}
            />
            <ProgressRing
              icon={<Droplets />}
              progress={waterProgress}
              color="#00f3ff"
              label="Вода"
            />
            <ProgressRing
              icon={<Moon />}
              progress={sleepProgress}
              color="#8b5cf6"
              label="Сон"
            />
          </div>
        </div>

        {/* статистика дня */}
        {/*<h2 className="text-lg font-semibold mb-4 text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Статистика дян
         </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-teal-400">
              {dayStats.completedMeals}/{dayStats.mealsCount}
            </div>
            <div className="text-sm text-gray-400">приемов пищи</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {dayStats.completedWorkouts}/{dayStats.workoutsCount}
            </div>
            <div className="text-sm text-gray-400">упражнений</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {dayStats.waterGlasses}
            </div>
            <div className="text-sm text-gray-400">стаканов воды</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {dayStats.sleepHours}ч
            </div>
            <div className="text-sm text-gray-400">сна</div>
          </div>
        </div> */}
      </motion.div>

      {/* основной контент */}
      <div className="px-4 space-y-4">
        {/* Питание */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader
            title="Питание"
            icon={<UtensilsCrossed className="w-5 h-5 text-teal-400" />}
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
                  <span className="text-gray-400">
                    Можно выбирать блюда не только по КБЖУ, но и по рецептам.
                  </span>
                  <Link
                    href="/meals"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/60 text-emerald-100 hover:bg-emerald-500/20 transition"
                  >
                    <BookOpenText className="w-3 h-3" />
                    <span>Книга рецептов</span>
                  </Link>
                </div>

                {/* прогресс БЖУ */}
                <div className="mb-3 p-3 bg-black/20 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-300">
                    БЖУ на сегодня
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Калории:</span>
                      <span className="font-semibold text-teal-400">
                        {totals.calories}/{goals.calories}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Белки:</span>
                      <span className="font-semibold text-green-400">
                        {totals.protein}/{goals.protein}г
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Жиры:</span>
                      <span className="font-semibold text-blue-400">
                        {totals.fat}/{goals.fat}г
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Углеводы:</span>
                      <span className="font-semibold text-orange-400">
                        {totals.carbs}/{goals.carbs}г
                      </span>
                    </div>
                  </div>
                </div>

                {/* кнопка копирования питания */}
                <div className="flex justify-end mb-3">
                  <button
                    onClick={copyMealsFromOtherDay}
                    className="text-xs text-teal-300 hover:text-teal-200 underline underline-offset-4"
                  >
                    Скопировать питание с другой даты
                  </button>
                </div>

                {/* список блюд */}
                {entry.meals.length === 0 ? (
                  <div className="text-center py-8">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 mb-4">Нет добавленных блюд</p>
                    <button
                      onClick={() => setShowMealModal(true)}
                      className="cosmic-button flex items-center justify-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
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
                      className="w-full mt-3 text-teal-400 text-sm font-medium py-2 hover:text-teal-300 transition"
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
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader
            title={entry.isRestDay ? "Выходной" : "Тренировки"}
            icon={<Dumbbell className="w-5 h-5 text-green-400" />}
            isOpen={openSection === "training"}
            onToggle={() => toggleSection("training")}
            progress={workoutProgress}
          />

          <AnimatePresence>
            {openSection === "training" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                {entry.isRestDay ? (
                  <div className="text-center py-8">
                    <Moon className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    <p className="text-purple-400 font-semibold mb-2">
                      Сегодня выходной
                    </p>
                    <p className="text-sm text-gray-400">
                      Восстановление важно для прогресса!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={copyWorkoutsFromOtherDay}
                        className="text-xs text-green-300 hover:text-green-200 underline underline-offset-4"
                      >
                        Скопировать тренировки с другой даты
                      </button>
                    </div>

                    {entry.workouts.length === 0 ? (
                      <div className="text-center py-8">
                        <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 mb-4">
                          Нет упражнений на сегодня
                        </p>
                        <button
                          onClick={() => setShowWorkoutModal(true)}
                          className="cosmic-button flex items-center justify-center gap-2 mx-auto"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить упражнение
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {entry.workouts.map((workout) => (
                          <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            onToggle={() => toggleWorkoutDone(workout.id)}
                            onDelete={() => deleteWorkout(workout.id)}
                          />
                        ))}

                        <button
                          onClick={() => setShowWorkoutModal(true)}
                          className="w-full mt-3 text-green-400 text-sm font-medium py-2 hover:text-green-300 transition"
                        >
                          + Добавить еще упражнение
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* управление днем */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-600">
                  <button
                    onClick={() =>
                      setDiaryData((prev) => {
                        const base = prev ?? DEFAULT_ENTRY;
                        return {
                          ...base,
                          isRestDay: !base.isRestDay,
                          workouts: !base.isRestDay ? [] : base.workouts,
                        };
                      })
                    }
                    className={`px-4 py-2 rounded-xl font-semibold transition ${
                      entry.isRestDay
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : "border border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    }`}
                  >
                    {entry.isRestDay
                      ? "Отменить выходной"
                      : "Сделать выходной"}
                  </button>

                  {!entry.isRestDay && (
                    <button
                      onClick={() => setShowWorkoutModal(true)}
                      className="cosmic-button"
                    >
                      Добавить упражнение
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Вода */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader
            title="Вода"
            icon={<Droplets className="w-5 h-5 text-blue-400" />}
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
                  goal={2.5}
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
            icon={<Moon className="w-5 h-5 text-purple-400" />}
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

        {/* Самочувствие */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SectionHeader
            title="Самочувствие"
            icon={<Activity className="w-5 h-5 text-yellow-400" />}
            isOpen={openSection === "wellbeing"}
            onToggle={() => toggleSection("wellbeing")}
            progress={(((entry.mood || 5) + (entry.energy || 5)) / 2) * 20}
          />

          <AnimatePresence>
            {openSection === "wellbeing" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                <div className="space-y-4">
                  {/* настроение */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Настроение
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            setDiaryData((prev) => {
                              const base = prev ?? DEFAULT_ENTRY;
                              return { ...base, mood: num };
                            })
                          }
                          className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                            entry.mood === num
                              ? "bg-yellow-400 text-black scale-110"
                              : "bg-black/30 text-gray-400 hover:bg-yellow-400/20"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>😔 Плохо</span>
                      <span>😐 Нормально</span>
                      <span>😊 Отлично</span>
                    </div>
                  </div>

                  {/* энергия */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Уровень энергии
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            setDiaryData((prev) => {
                              const base = prev ?? DEFAULT_ENTRY;
                              return { ...base, energy: num };
                            })
                          }
                          className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                            entry.energy === num
                              ? "bg-green-400 text-black scale-110"
                              : "bg-black/30 text-gray-400 hover:bg-green-400/20"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>😴 Устал</span>
                      <span>⚡ Нормально</span>
                      <span>🔋 Полный</span>
                    </div>
                  </div>

                  {/* заметки */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Заметки о дне
                    </label>
                    <textarea
                      value={entry.notes || ""}
                      onChange={(e) =>
                        setDiaryData((prev) => {
                          const base = prev ?? DEFAULT_ENTRY;
                          return { ...base, notes: e.target.value };
                        })
                      }
                      placeholder="Как прошел день? Что получилось хорошо? Что можно улучшить?"
                      className="w-full h-24 bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-teal-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Чек-лист */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <SectionHeader
            title="Чек-лист"
            icon={<ListTodo className="w-5 h-5 text-emerald-400" />}
            isOpen={openSection === "checklist"}
            onToggle={() => toggleSection("checklist")}
            progress={checklistProgress}
          />

          <AnimatePresence>
            {openSection === "checklist" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                {entry.checklist.length === 0 ? (
                  <div className="text-center py-6">
                    <ListTodo className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 mb-3">
                      Пока нет задач на этот день
                    </p>
                    <button
                      onClick={() => setShowChecklistModal(true)}
                      className="cosmic-button flex items-center justify-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить задачу
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entry.checklist.map((item) => (
                      <ChecklistCard
                        key={item.id}
                        item={item}
                        onToggle={() => toggleChecklistItem(item.id)}
                        onDelete={() => deleteChecklistItem(item.id)}
                      />
                    ))}

                    <button
                      onClick={() => setShowChecklistModal(true)}
                      className="w-full mt-3 text-emerald-400 text-sm font-medium py-2 hover:text-emerald-300 transition"
                    >
                      + Добавить задачу
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Достижения дня */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Достижения дня
          </h2>

          <div className="space-y-3">
            {nutritionProgress >= 80 && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <Award className="w-6 h-6 text-green-400" />
                <div>
                  <div className="font-medium text-green-400">
                    Питание на высоте!
                  </div>
                  <div className="text-sm text-gray-400">
                    Выполнена норма калорий
                  </div>
                </div>
              </div>
            )}

            {waterProgress >= 80 && (
              <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <Droplets className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-medium text-blue-400">
                    Гидрация в норме!
                  </div>
                  <div className="text-sm text-gray-400">
                    Выполнена норма воды
                  </div>
                </div>
              </div>
            )}

            {sleepProgress >= 80 && (
              <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <Moon className="w-6 h-6 text-purple-400" />
                <div>
                  <div className="font-medium text-purple-400">
                    Отличный сон!
                  </div>
                  <div className="text-sm text-gray-400">
                    8 часов качественного отдыха
                  </div>
                </div>
              </div>
            )}

            {(entry.mood || 0) >= 8 && (
              <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <Activity className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="font-medium text-yellow-400">
                    Отличное настроение!
                  </div>
                  <div className="text-sm text-gray-400">
                    Продолжай в том же духе
                  </div>
                </div>
              </div>
            )}

            {entry.checklist.length > 0 &&
              entry.checklist.every((t) => t.done) && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <ListTodo className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="font-medium text-emerald-400">
                      Все задачи на сегодня выполнены!
                    </div>
                    <div className="text-sm text-gray-400">
                      Это и есть настоящая дисциплина
                    </div>
                  </div>
                </div>
              )}
          </div>
        </motion.div>
      </div>

      {/* Модальные окна */}
      {showMealModal && (
        <AddMealModal
          onClose={() => setShowMealModal(false)}
          // сюда даём всё, что уже есть в разделе "Питание" дневника + база рецептов
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
          // сюда даём всё, что уже есть в разделе "Тренировки" дневника + база планов
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

// ===== UI-компоненты =====

function ProgressRing({
  icon,
  progress,
  color,
  label,
}: {
  icon: JSX.Element;
  progress: number;
  color: string;
  label: string;
}) {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="20"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
            fill="none"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="20"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ color }} className="text-lg">
            {icon}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-white">
        {Math.round(progress)}%
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  isOpen,
  onToggle,
  progress,
}: {
  title: string;
  icon: JSX.Element;
  isOpen: boolean;
  onToggle: () => void;
  progress: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 text-left"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold text-gray-300">{title}</span>
        <div className="text-xs text-gray-500">{Math.round(progress)}%</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-12 h-1 bg-gray-600 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-green-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </button>
  );
}

// карточка блюда
function MealCard({
  meal,
  onToggle,
  onDelete,
}: {
  meal: DiaryMeal;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();

  const handleCardClick = () => {
    if (meal.slug) {
      router.push(`/meals/${meal.slug}`);
    }
  };

  const handleToggleClick = (e: any) => {
    e.stopPropagation();
    onToggle();
  };

  const handleDeleteClick = (e: any) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-all cursor-pointer ${
        meal.done
          ? "bg-green-500/10 border-green-500/30"
          : "bg-black/20 border-gray-600"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p
            className={`font-medium ${
              meal.done ? "text-green-400 line-through" : "text-white"
            }`}
          >
            {meal.title}
          </p>
          {meal.time && (
            <span className="text-xs text-gray-500">{meal.time}</span>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {meal.calories} ккал • Б {meal.protein}г • Ж {meal.fat}г • У{" "}
          {meal.carbs}г
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleClick}
          className="text-teal-400 hover:text-teal-300 transition"
        >
          {meal.done ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5 border-2 border-gray-400 rounded-full hover:border-teal-400 transition" />
          )}
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// карточка упражнения
function WorkoutCard({
  workout,
  onToggle,
  onDelete,
}: {
  workout: Workout;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();

  const handleCardClick = () => {
    if (workout.exerciseSlug) {
      router.push(`/workouts/exercises/${workout.exerciseSlug}`);
    } else if (workout.planSlug) {
      router.push(`/workouts/${workout.planSlug}`);
    }
  };

  const handleToggleClick = (e: any) => {
    e.stopPropagation();
    onToggle();
  };

  const handleDeleteClick = (e: any) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={`border rounded-xl p-4 flex justify между items-center transition-all cursor-pointer ${
        workout.done
          ? "bg-green-500/10 border-green-500/30"
          : "bg-black/20 border-gray-600"
      }`}
    >
      <div>
        <p
          className={`font-semibold mb-1 ${
            workout.done ? "text-green-400 line-through" : "text-white"
          }`}
        >
          {workout.name}
        </p>
        <p className="text-xs text-gray-400">
          {workout.sets} подходов × {workout.reps} повторений
          {workout.weight ? ` • ${workout.weight} кг` : ""}
          {workout.duration ? ` • ${workout.duration} мин` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleClick}
          className="text-teal-400 hover:text-teal-300 transition"
        >
          {workout.done ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <div className="w-6 h-6 border-2 border-gray-400 rounded-full hover:border-teal-400 transition" />
          )}
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// карточка чек-листа
function ChecklistCard({
  item,
  onToggle,
  onDelete,
}: {
  item: ChecklistItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-all ${
        item.done
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-black/20 border-gray-600"
      }`}
    >
      <div className="flex-1">
        <p
          className={`font-medium ${
            item.done ? "text-emerald-400 line-through" : "text-white"
          }`}
        >
          {item.title}
        </p>
        {item.repeatMode === "weekly" && item.daysOfWeek?.length ? (
          <p className="text-[11px] text-emerald-300 mt-1">
            Повтор каждую неделю ({item.daysOfWeek.length}× в неделю)
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="text-emerald-400 hover:text-emerald-300 transition"
        >
          {item.done ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5 border-2 border-gray-400 rounded-full hover:border-emerald-400 transition" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
