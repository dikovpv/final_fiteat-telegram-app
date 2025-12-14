"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import {
  WORKOUT_TEMPLATES,
  MUSCLE_GROUP_LABELS,
  type WorkoutExerciseTemplate,
} from "../../workouts-data";

type ExerciseItem = WorkoutExerciseTemplate & {
  slugResolved: string;
  planSlug: string;
  planTitle: string;
};

function resolveSlug(ex: WorkoutExerciseTemplate) {
  return (ex as any).slug ?? ex.id;
}

export default function GroupClient({ group }: { group: string }) {
  const groupLabel =
    (MUSCLE_GROUP_LABELS as any)[group] ?? "Группа мышц";

  const exercises = useMemo(() => {
    const out: ExerciseItem[] = [];
    const seen = new Set<string>();

    for (const plan of WORKOUT_TEMPLATES) {
      for (const ex of plan.exercises) {
        const exGroup = (ex as any).muscleGroup ?? "other";
        if (exGroup !== group) continue;

        const slugResolved = resolveSlug(ex);
        const key = `${group}:${slugResolved}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          ...(ex as any),
          slugResolved,
          planSlug: plan.slug,
          planTitle: plan.title,
        });
      }
    }

    // сортируем по имени
    out.sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", "ru-RU", {
        sensitivity: "base",
      }),
    );

    return out;
  }, [group]);

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title={groupLabel}
          backHref="/workouts"
          backLabel="Тренировки"
          rightLabel={`${exercises.length} упр.`}
        />

        <main className="px-3 pt-3 sm:px-4 md:px-5 flex flex-col gap-3">
          <motion.section
            className="glass-card px-4 py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-[var(--text-secondary)]">
              Здесь собраны упражнения для группы:{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {groupLabel}
              </span>
              . Нажми на упражнение — откроется карточка с техникой.
            </p>
          </motion.section>

          {exercises.length === 0 ? (
            <div className="glass-card px-4 py-4 text-sm text-[var(--text-secondary)] text-center">
              Пока нет упражнений для этой группы.
            </div>
          ) : (
            <section className="space-y-3 pb-10">
              {exercises.map((ex, idx) => (
                <Link
                  key={`${ex.slugResolved}-${idx}`}
                  href={`/workouts/muscles/${group}/${ex.slugResolved}`}
                  className="block"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card px-4 py-4 rounded-2xl border border-[var(--border-soft)] hover:border-[var(--accent-gold)]/70 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase text-[var(--text-muted)]">
                          из плана «{ex.planTitle}»
                        </div>
                        <div className="text-sm font-semibold mt-1">
                          {ex.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          {ex.sets} подходов × {ex.reps} повт.
                        </div>
                        {ex.note && (
                          <div className="text-[11px] text-[var(--text-muted)] mt-2 line-clamp-2">
                            {ex.note}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 w-9 h-9 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
