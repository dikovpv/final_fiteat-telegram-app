"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Dumbbell, Lock } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { getUserPlan, type PlanType } from "@/lib/user-plan";
import {
  findProgramBySlug,
  findWorkoutBySlug,
  type MultiDayProgram,
} from "../../workouts-data";

export default function ProgramPage({
  params,
}: {
  params: { slug: string };
}) {
  const [plan, setPlan] = useState<PlanType>("free");

  useEffect(() => {
    setPlan(getUserPlan());
  }, []);

  const program = findProgramBySlug(params.slug);

  if (!program) {
    return (
      <div className="cosmic-bg">
        <div className="relative z-10 min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
          <div className="glass-card px-4 py-4 text-sm">
            Программа не найдена.
          </div>
        </div>
      </div>
    );
  }

  const isPro = plan === "pro";
  const locked = !!program.proOnly && !isPro;

  const levelLabel: Record<string, string> = {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  return (
    <>
      <div className="cosmic-bg" />
      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24">
        <PageHeader
          title={program.title}
          backHref="/workouts"
          backLabel="К списку тренировок"
        />

        <main className="px-3 sm:px-4 md:px-5 pt-3 flex flex-col gap-3 relative">
          {/* шапка программы */}
          <motion.section
            className="glass-card px-4 py-4 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase text-[var(--text-muted)] mb-1">
                  Сплит в зале
                </div>
                <h1 className="text-sm font-semibold">{program.title}</h1>
                {program.subtitle && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {program.subtitle}
                  </p>
                )}
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {program.focus}
                </p>
              </div>
              <div className="text-right text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  <span>~{program.duration} мин / тренировка</span>
                </div>
                <div className="mt-1">{levelLabel[program.level]}</div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              {program.description}
            </p>

            <div className="mt-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                Как пользоваться:
              </span>{" "}
              выбери день сплита — откроется полноценная страница тренировки
              с упражнениями и кнопкой «Добавить всю тренировку в дневник».
            </div>
          </motion.section>

          {/* список дней */}
          <motion.section
            className="space-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {program.days.map((day, idx) => {
              const tpl = findWorkoutBySlug(day.slug);
              const exercisesCount = tpl?.exercises.length ?? 0;

              const href = locked ? "/pro" : `/workouts/${day.slug}`;

              return (
                <Link key={day.slug} href={href} className="block">
                  <motion.article
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-card px-4 py-3 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden"
                  >
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)]">
                        {day.tag}
                      </div>
                      <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                        {day.title}
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--text-secondary)] flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{day.duration} мин
                        </span>
                        {exercisesCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Dumbbell className="w-3 h-3" />
                            {exercisesCount} упражнений
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </motion.article>
                </Link>
              );
            })}
          </motion.section>

          {/* затемнение для PRO */}
          {locked && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
              <div className="glass-card px-4 py-4 rounded-2xl max-w-xs text-center pointer-events-auto flex flex-col gap-2">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-[var(--accent-gold)]">
                  <Lock className="w-3 h-3" />
                  <span>Только PRO</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Сплит «тяни-толкай-ноги» доступен на тарифе{" "}
                  <span className="font-semibold">FitEat PRO</span>. Оформи
                  подписку, чтобы разблокировать все дни и добавить их в дневник.
                </p>
                <Link
                  href="/pro"
                  className="mt-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[var(--accent-gold)] text-[var(--accent-contrast)] text-xs font-semibold hover:brightness-105"
                >
                  Перейти к тарифу PRO
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
