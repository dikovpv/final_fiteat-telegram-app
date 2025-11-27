// apps/web/src/app/workouts/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Flame,
  Plus,
  CheckCircle,
} from "lucide-react";

import {
  WORKOUT_TEMPLATES,
  findWorkoutBySlug,
  type WorkoutTemplate,
  type WorkoutExerciseTemplate,
  MUSCLE_GROUP_LABELS,
} from "../workouts-data";

import {
  DEFAULT_ENTRY,
  DIARY_STORAGE_PREFIX,
  DIARY_SELECTED_DATE_KEY,
  type DiaryEntry,
  type Workout as DiaryWorkout,
} from "../../diary/diary-types";

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function WorkoutPlanPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutTemplate | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const w = findWorkoutBySlug(params.slug);
    if (w) {
      setWorkoutPlan(w);
    } else {
      setWorkoutPlan(null);
    }
  }, [params.slug]);

  const handleAddPlanToDiary = () => {
    if (typeof window === "undefined") return;
    if (!workoutPlan) return;

    const selectedDate =
      localStorage.getItem(DIARY_SELECTED_DATE_KEY) || getTodayISO();
    const key = `${DIARY_STORAGE_PREFIX}${selectedDate}`;

    let entry: DiaryEntry;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        entry = {
          ...DEFAULT_ENTRY,
          ...parsed,
          meals: parsed.meals ?? [],
          workouts: parsed.workouts ?? [],
          checklist: parsed.checklist ?? [],
        };
      } else {
        entry = { ...DEFAULT_ENTRY };
      }
    } catch {
      entry = { ...DEFAULT_ENTRY };
    }

    const existingWorkouts = Array.isArray(entry.workouts)
      ? entry.workouts
      : [];

    const timestamp = Date.now().toString();

    const newWorkouts: DiaryWorkout[] = workoutPlan.exercises.map(
      (ex: WorkoutExerciseTemplate, idx: number) => ({
        id: `${workoutPlan.slug}-${ex.id}-${timestamp}-${idx}`,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        type: ex.type,
        done: false,
        planSlug: workoutPlan.slug,
        // если в шаблоне есть slug — используем; если нет — подстрахуемся id
        exerciseSlug: (ex as any).slug ?? ex.id,
      })
    );

    const updated: DiaryEntry = {
      ...entry,
      workouts: [...existingWorkouts, ...newWorkouts],
    };

    localStorage.setItem(key, JSON.stringify(updated));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!workoutPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0b2e] to-[#2d1b69] text-[#f0f0f5] flex items-center justify-center">
        <div className="glass-card p-6 max-w-md w-full text-center">
          <p className="mb-4 text-lg">Тренировка не найдена</p>
          <button
            onClick={() => router.push("/workouts")}
            className="cosmic-button inline-flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            К списку тренировок
          </button>
        </div>
      </div>
    );
  }

  const levelLabel: Record<string, string> = {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0b2e] to-[#2d1b69] text-[#f0f0f5] pb-24">
      <div className="cosmic-bg"></div>

      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      {/* Основная карточка плана */}
      <motion.div
        className="glass-card mx-4 p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{workoutPlan.title}</h1>
            <p className="text-xs text-gray-400">{workoutPlan.focus}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>{workoutPlan.duration} мин</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{levelLabel[workoutPlan.level] ?? "Уровень"}</span>
          </div>
        </div>

        <p className="text-sm text-gray-300">{workoutPlan.description}</p>

        <div className="mt-4">
          <button
            onClick={handleAddPlanToDiary}
            className="cosmic-button w-full flex items-center justify-center gap-2"
          >
            {added ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Добавлено в дневник</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Добавить всю тренировку в дневник</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Список упражнений в плане */}
      <motion.div
        className="glass-card mx-4 p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-green-400" />
          Упражнения в тренировке
        </h2>

        <div className="space-y-3">
          {workoutPlan.exercises.map((ex: WorkoutExerciseTemplate, idx) => {
            const slug = (ex as any).slug ?? ex.id;

            const typeLabel =
              ex.type === "strength"
                ? "Силовое"
                : ex.type === "cardio"
                ? "Кардио"
                : "Мобилити / кор";

            // безопасно получаем название группы мышц
            const muscleLabel = ex.muscleGroup
              ? MUSCLE_GROUP_LABELS[ex.muscleGroup]
              : "Общее упражнение";

            return (
              <Link
                key={ex.id}
                href={`/workouts/exercises/${slug}`}
                className="block border border-gray-700 bg-black/20 rounded-xl px-3 py-3 hover:border-green-400/70 hover:bg-green-500/5 transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <p className="font-medium text-white">{ex.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/40">
                      {typeLabel}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-500/10 text-slate-200 border border-slate-400/40">
                      {muscleLabel}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  {ex.sets} подходов × {ex.reps} повторений
                </p>

                {ex.note && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    {ex.note}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
