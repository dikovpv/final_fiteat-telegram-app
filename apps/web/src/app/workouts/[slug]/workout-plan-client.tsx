"use client";

import React, { useEffect, useState } from "react";
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
  Lock,
} from "lucide-react";

import PageHeader from "@/app/components/PageHeader";

import {
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

import { getUserPlan, type PlanType } from "@/lib/user-plan";

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function WorkoutPlanClient({ slug }: { slug: string }) {
  const router = useRouter();

  const workoutPlan: WorkoutTemplate | undefined = findWorkoutBySlug(slug);

  const [planType, setPlanType] = useState<PlanType>("free");
  const [added, setAdded] = useState(false);
  const [entryDate, setEntryDate] = useState<string>("");

  useEffect(() => {
    setPlanType(getUserPlan());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(DIARY_SELECTED_DATE_KEY);
    setEntryDate(stored || getTodayISO());
  }, []);

  const isPro = planType === "pro";

  if (!workoutPlan) {
    return (
      <>
        <div className="cosmic-bg" />
        <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col">
          <PageHeader
            title="Тренировка"
            backHref="/workouts"
            backLabel="К тренировкам"
          />
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="glass-card p-6 max-w-md w-full text-center">
              <p className="mb-4 text-lg font-semibold">Тренировка не найдена</p>
              <button
                onClick={() => router.push("/workouts")}
                className="inline-flex items-center gap-2 text-sm text-[var(--accent)] underline underline-offset-4"
              >
                <ArrowLeft className="w-4 h-4" />
                К списку тренировок
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const locked = !!workoutPlan.proOnly && !isPro;

  const levelLabel: Record<string, string> = {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  const handleAddPlanToDiary = () => {
    if (locked) {
      router.push("/pro");
      return;
    }

    if (typeof window === "undefined") return;

    const selectedDate = entryDate || getTodayISO();
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

    const existingWorkouts = Array.isArray(entry.workouts) ? entry.workouts : [];

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
        exerciseSlug: ex.slug ?? ex.id,
      }),
    );

    const updated: DiaryEntry = {
      ...entry,
      workouts: [...existingWorkouts, ...newWorkouts],
    };

    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(DIARY_SELECTED_DATE_KEY, selectedDate);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title={workoutPlan.title}
          backHref="/workouts"
          backLabel="К тренировкам"
          rightSlot={
            locked ? (
              <div className="inline-flex items-center gap-1 text-[11px] text-white/85">
                <Lock className="w-3 h-3" />
                <span>PRO-программа</span>
              </div>
            ) : (
              <span className="text-[11px] text-white/85">
                {levelLabel[workoutPlan.level] ?? "Уровень"}
              </span>
            )
          }
        />

        <main className="px-3 pt-3 sm:px-4 md:px-5 flex flex-col gap-3">
          <motion.div
            className="glass-card px-4 py-4 mb-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/15 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-[var(--accent-gold)]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  {workoutPlan.title}
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  {workoutPlan.focus}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-3 text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>~{workoutPlan.duration} мин</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{levelLabel[workoutPlan.level] ?? "Уровень"}</span>
              </div>
              {workoutPlan.dayTag && (
                <span className="text-[11px] px-2 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border-soft)]">
                  {workoutPlan.dayTag}
                </span>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)]">
              {workoutPlan.description}
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="whitespace-nowrap">
                  Добавить тренировку в дневник на дату:
                </span>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <button
                onClick={handleAddPlanToDiary}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--accent)] text-[var(--accent-contrast)] px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition"
              >
                {locked ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Открыть в PRO, чтобы добавить</span>
                  </>
                ) : added ? (
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

          <motion.div
            className="glass-card px-4 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-semibold mb-3">
              Упражнения в этой тренировке
            </h2>

            <div className="space-y-3">
              {workoutPlan.exercises.map((ex, idx) => {
                const exSlug = ex.slug ?? ex.id;

                const typeLabel =
                  ex.type === "strength"
                    ? "Силовое"
                    : ex.type === "cardio"
                    ? "Кардио"
                    : "Статика / кор";

                const muscleLabel = ex.muscleGroup
                  ? MUSCLE_GROUP_LABELS[ex.muscleGroup]
                  : "Общее упражнение";

                return (
                  <Link
                    key={ex.id}
                    href={`/workouts/exercises/${exSlug}`}
                    className="block rounded-xl px-3 py-3 border border-[var(--border-soft)] bg-[var(--surface)] hover:border-[var(--accent-gold)]/80 hover:bg-[var(--surface-muted)] transition"
                  >
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <p className="font-medium text-[var(--text-primary)]">
                          {ex.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/40">
                          {typeLabel}
                        </span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border-soft)]">
                          {muscleLabel}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)]">
                      {ex.sets} подходов × {ex.reps} повторений
                    </p>

                    {ex.note && (
                      <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                        {ex.note}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
