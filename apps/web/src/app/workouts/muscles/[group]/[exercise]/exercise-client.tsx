"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import PageHeader from "@/app/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";

import {
  WORKOUT_TEMPLATES,
  type WorkoutExerciseTemplate,
  MUSCLE_GROUP_LABELS,
} from "../../../workouts-data";

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
        return { exercise: ex, planTitle: plan.title, planSlug: plan.slug };
      }
    }
  }
  return null;
}

export default function ExerciseClient({
  group,
  exercise,
}: {
  group: string;
  exercise: string;
}) {
  // чтобы не ругался линтер на неиспользуемую тему — просто дергаем
  useTheme();

  const data = useMemo(() => findExerciseWithPlan(exercise), [exercise]);
  if (!data) notFound();

  const { exercise: ex, planTitle, planSlug } = data;

  const muscleLabel =
    (MUSCLE_GROUP_LABELS as any)[ex.muscleGroup ?? group] ??
    (MUSCLE_GROUP_LABELS as any)[group] ??
    "Группа мышц";

  const typeLabel =
    ex.type === "strength"
      ? "Силовое"
      : ex.type === "cardio"
      ? "Кардио"
      : "Мобилити / кор";

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title={ex.name}
          rightLabel={muscleLabel}
          backHref="/workouts"
          backLabel="Тренировки"
        />

        <main className="px-3 pt-3 sm:px-4 md:px-5 flex flex-col gap-3">
          <motion.section
            className="glass-card px-4 py-4 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap justify-between gap-2 text-xs text-[var(--text-secondary)]">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <InfoBadge label="Группа" value={muscleLabel} />
              <InfoBadge label="Подходы" value={`${ex.sets}`} />
              <InfoBadge label="Повторения" value={`${ex.reps}`} />
            </div>

            {ex.description && (
              <p className="text-xs text-[var(--text-secondary)]">
                {ex.description}
              </p>
            )}
          </motion.section>

          {ex.techniqueSteps?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">Техника выполнения</h2>
              <ol className="list-decimal list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {ex.techniqueSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </motion.section>
          ) : null}

          {ex.keyCues?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">На что обратить внимание</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {ex.keyCues.map((cue, idx) => (
                  <li key={idx}>{cue}</li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          {ex.commonMistakes?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">Частые ошибки</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {ex.commonMistakes.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          {ex.safetyNotes?.length ? (
            <motion.section
              className="glass-card px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold">Осторожность</h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                {ex.safetyNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Если есть травмы/боль — лучше обсудить упражнение с врачом или тренером.
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
