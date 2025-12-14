"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  WORKOUT_TEMPLATES,
  type WorkoutExerciseTemplate,
  MUSCLE_GROUP_LABELS,
} from "../../workouts-data";

import PageHeader from "@/app/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";

type ExerciseWithPlan = {
  exercise: WorkoutExerciseTemplate;
  planTitle: string;
  planSlug: string;
};

function findExerciseWithPlan(slug: string): ExerciseWithPlan | null {
  for (const plan of WORKOUT_TEMPLATES) {
    for (const ex of plan.exercises) {
      const exSlug = (ex as any).slug ?? ex.id;
      if (exSlug === slug) {
        return {
          exercise: ex,
          planTitle: plan.title,
          planSlug: plan.slug,
        };
      }
    }
  }
  return null;
}

export default function ExerciseClient({ slug }: { slug: string }) {
  // оставляю — вдруг тебе тема нужна дальше, но переменные не используем,
  // чтобы не было варнингов линтера. Если не нужно вообще — просто удали эти 2 строки.
  useTheme();

  const data = useMemo(() => findExerciseWithPlan(slug), [slug]);

  if (!data) notFound();

  const { exercise, planTitle, planSlug } = data;

  const muscleLabel = exercise.muscleGroup
    ? MUSCLE_GROUP_LABELS[exercise.muscleGroup]
    : "Общая группа";

  const typeLabel =
    exercise.type === "strength"
      ? "Силовое"
      : exercise.type === "cardio"
      ? "Кардио"
      : "Мобилити / кор";

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title={exercise.name}
          rightLabel={muscleLabel}
          backHref="/workouts"
          backLabel="Тренировки"
        />

        <main className="px-3 pt-3 sm:px-4 md:px-5 flex flex-col gap-3">
          {/* Блок 1 — базовая инфа */}
          <motion.section
            className="glass-card px-4 py-4 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">Тип</div>
                  <div className="text-[var(--text-primary)] font-medium">
                    {typeLabel}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Из программы
                  </div>
                  <Link
                    href={`/workouts/${planSlug}`}
                    className="text-[11px] text-[var(--accent-gold)] underline underline-offset-2"
                  >
                    {planTitle}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                <InfoBadge label="Основная группа" value={muscleLabel} />
                <InfoBadge label="Подходы" value={`${exercise.sets}`} />
                <InfoBadge label="Повторения" value={`${exercise.reps}`} />
              </div>
            </div>

            {exercise.description && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {exercise.description}
              </p>
            )}
          </motion.section>

          {/* Блок 2 — техника выполнения */}
          {exercise.techniqueSteps?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">Техника выполнения (по шагам)</h2>
              <ol className="list-decimal list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {exercise.techniqueSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </motion.section>
          ) : null}

          {/* Блок 3 — на что обратить внимание */}
          {exercise.keyCues?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">На что обратить внимание</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {exercise.keyCues.map((cue, idx) => (
                  <li key={idx}>{cue}</li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          {/* Блок 4 — частые ошибки */}
          {exercise.commonMistakes?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">Частые ошибки</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {exercise.commonMistakes.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          {/* Блок 5 — осторожность */}
          {exercise.safetyNotes?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">Осторожность и безопасность</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {exercise.safetyNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Если есть хронические травмы или сильный дискомфорт — лучше
                обсудить конкретное упражнение с врачом или тренером.
              </p>
            </motion.section>
          ) : null}
        </main>
      </div>
    </>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 flex flex-col gap-0.5">
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
      <span className="text-[11px] text-[var(--text-primary)] font-medium">
        {value}
      </span>
    </div>
  );
}
