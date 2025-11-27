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
  type WorkoutTemplate,
  type WorkoutExerciseTemplate,
} from "../../workouts-data";

import {
  DEFAULT_ENTRY,
  DIARY_STORAGE_PREFIX,
  DIARY_SELECTED_DATE_KEY,
  type DiaryEntry,
  type Workout as DiaryWorkout,
} from "../../../diary/diary-types";

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

type ExerciseWithPlan = {
  exercise: WorkoutExerciseTemplate;
  plan: WorkoutTemplate | null;
};

function findExerciseWithPlan(slug: string): ExerciseWithPlan | null {
  for (const plan of WORKOUT_TEMPLATES) {
    const ex = plan.exercises.find(
      (e: any) => e.slug === slug || e.id === slug
    );
    if (ex) {
      return { exercise: ex, plan };
    }
  }

  // если нигде не нашли — пробуем просто найти по всем упражнениям без плана
  for (const plan of WORKOUT_TEMPLATES) {
    for (const ex of plan.exercises) {
      if ((ex as any).slug === slug || ex.id === slug) {
        return { exercise: ex, plan };
      }
    }
  }

  return null;
}

export default function ExercisePage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<ExerciseWithPlan | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const found = findExerciseWithPlan(params.slug);
    setData(found);
  }, [params.slug]);

  const handleAddToDiary = () => {
    if (typeof window === "undefined") return;
    if (!data) return;

    const { exercise, plan } = data;

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

    const newWorkout: DiaryWorkout = {
      id: `${(plan?.slug ?? "exercise")}-${exercise.id}-${Date.now()}`,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      type: exercise.type,
      done: false,
      planSlug: plan?.slug,
      exerciseSlug: (exercise as any).slug ?? exercise.id,
    };

    const updated: DiaryEntry = {
      ...entry,
      workouts: [...existingWorkouts, newWorkout],
    };

    localStorage.setItem(key, JSON.stringify(updated));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0b2e] to-[#2d1b69] text-[#f0f0f5] flex items-center justify-center">
        <div className="glass-card p-6 max-w-md w-full text-center">
          <p className="mb-4 text-lg">Упражнение не найдено</p>
          <button
            onClick={() => router.push("/workouts")}
            className="cosmic-button inline-flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            К тренировкам
          </button>
        </div>
      </div>
    );
  }

  const { exercise, plan } = data;

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

        {plan && (
          <Link
            href={`/workouts/${plan.slug}`}
            className="text-xs text-teal-300 hover:text-teal-100 underline underline-offset-4"
          >
            К плану: {plan.title}
          </Link>
        )}
      </div>

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
            <h1 className="text-xl font-bold">{exercise.name}</h1>
            {plan && (
              <p className="text-xs text-gray-400">
                Часть плана:{" "}
                <span className="text-teal-300">{plan.title}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>
              {exercise.sets}×{exercise.reps}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>
              {exercise.type === "strength"
                ? "Силовое"
                : exercise.type === "cardio"
                ? "Кардио"
                : "Мобилити"}
            </span>
          </div>
        </div>

        {exercise.note && (
          <p className="text-sm text-gray-300 mb-3">{exercise.note}</p>
        )}

        <button
          onClick={handleAddToDiary}
          className="cosmic-button w-full flex items-center justify-center gap-2"
        >
          {added ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Упражнение добавлено в дневник</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Добавить упражнение в дневник</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
