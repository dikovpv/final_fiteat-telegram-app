"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, CalendarDays, Plus, CheckCircle } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

import {
  MULTI_DAY_PROGRAMS,
  WORKOUT_TEMPLATES,
  type MultiDayProgram,
  type WorkoutTemplate,
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

function findProgram(slug: string): MultiDayProgram | undefined {
  return MULTI_DAY_PROGRAMS.find((p) => p.slug === slug);
}

/**
 * Универсально: у многодневной программы есть days[] со slug тренировок.
 * Мы пытаемся достать эти планы из WORKOUT_TEMPLATES.
 */
function resolveDayWorkouts(program: MultiDayProgram): {
  daySlug: string;
  dayTitle: string;
  workout?: WorkoutTemplate;
}[] {
  const days: any[] = (program as any).days ?? [];
  return days.map((d, idx) => {
    const daySlug = String(d.slug ?? d.workoutSlug ?? "");
    const dayTitle = String(d.title ?? d.name ?? `День ${idx + 1}`);
    const workout = WORKOUT_TEMPLATES.find((w) => w.slug === daySlug);
    return { daySlug, dayTitle, workout };
  });
}

export default function ProgramClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [planType, setPlanType] = useState<PlanType>("free");
  const [entryDate, setEntryDate] = useState<string>("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setPlanType(getUserPlan());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(DIARY_SELECTED_DATE_KEY);
    setEntryDate(stored || getTodayISO());
  }, []);

  const program = useMemo(() => findProgram(slug), [slug]);
  if (!program) notFound();

  const isPro = planType === "pro";
  const locked = !!program.proOnly && !isPro;

  const levelLabel: Record<string, string> = {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  const dayWorkouts = useMemo(() => resolveDayWorkouts(program), [program]);

  const handleAddWholeProgramToDiary = () => {
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

    // добавляем ВСЕ дни подряд как набор упражнений (каждый день — отдельным блоком)
    const newWorkouts: DiaryWorkout[] = [];

    for (const day of dayWorkouts) {
      if (!day.workout) continue;
      day.workout.exercises.forEach((ex: any, idx: number) => {
        newWorkouts.push({
          id: `${program.slug}:${day.daySlug}:${ex.id}:${timestamp}:${idx}`,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          type: ex.type,
          done: false,
          planSlug: day.workout!.slug,
          exerciseSlug: ex.slug ?? ex.id,
        });
      });
    }

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
          title={program.title}
          backHref="/workouts"
          backLabel="К тренировкам"
          rightSlot={
            locked ? (
              <div className="inline-flex items-center gap-1 text-[11px] text-white/85">
                <Lock className="w-3 h-3" />
                <span>PRO</span>
              </div>
            ) : (
              <span className="text-[11px] text-white/85">
                {levelLabel[(program as any).level] ?? "Программа"}
              </span>
            )
          }
        />

        <main className="px-3 pt-3 sm:px-4 md:px-5 flex flex-col gap-3">
          {/* описание */}
          <motion.section
            className="glass-card px-4 py-4 space-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {(program as any).subtitle && (
              <p className="text-sm font-semibold">{(program as any).subtitle}</p>
            )}
            <p className="text-xs text-[var(--text-secondary)]">
              {program.description}
            </p>

            <div className="mt-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
              <div>
                <span className="font-semibold text-[var(--text-primary)]">
                  Формат:
                </span>{" "}
                сплит на несколько дней
              </div>
              <div className="mt-1">
                <span className="font-semibold text-[var(--text-primary)]">
                  Длительность:
                </span>{" "}
                ~{(program as any).duration ?? 60} мин за тренировку
              </div>
            </div>

            {/* выбор даты + добавить */}
            <div className="mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="whitespace-nowrap flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Добавить в дневник на дату:
                </span>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <button
                onClick={handleAddWholeProgramToDiary}
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
                    <span>Добавить весь сплит в дневник</span>
                  </>
                )}
              </button>
            </div>
          </motion.section>

          {/* дни программы */}
          <motion.section
            className="glass-card px-4 py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Дни программы</h2>
              <Link
                href="/workouts"
                className="text-[11px] text-[var(--accent-gold)] underline underline-offset-2"
              >
                Все тренировки
              </Link>
            </div>

            <div className="space-y-3">
              {dayWorkouts.length === 0 ? (
                <div className="text-sm text-[var(--text-secondary)]">
                  В этой программе пока не описаны дни.
                </div>
              ) : (
                dayWorkouts.map((d, idx) => {
                  const title = d.dayTitle || `День ${idx + 1}`;
                  const href = d.daySlug
                    ? `/workouts/${d.daySlug}`
                    : "/workouts";

                  return (
                    <Link key={`${d.daySlug}-${idx}`} href={href} className="block">
                      <div className="rounded-xl px-3 py-3 border border-[var(--border-soft)] bg-[var(--surface)] hover:border-[var(--accent-gold)]/80 hover:bg-[var(--surface-muted)] transition">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] uppercase text-[var(--text-muted)]">
                              День {idx + 1}
                            </div>
                            <div className="text-sm font-semibold mt-1">
                              {title}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              {d.workout
                                ? `${d.workout.exercises.length} упражнений · ~${d.workout.duration} мин`
                                : "План не найден (но ссылка оставлена)"}
                            </div>
                          </div>

                          <ArrowLeft className="w-0 h-0" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.section>

          {/* маленькая подсказка */}
          {locked && (
            <motion.section
              className="glass-card px-4 py-4 border border-purple-500/30 bg-purple-500/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-300" />
                <p className="text-xs text-[var(--text-secondary)]">
                  Этот сплит доступен только в <span className="font-semibold">PRO</span>.
                </p>
              </div>
            </motion.section>
          )}
        </main>
      </div>
    </>
  );
}
