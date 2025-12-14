"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Lock } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

import {
  WORKOUT_TEMPLATES,
  MUSCLE_GROUP_LABELS,
  MULTI_DAY_PROGRAMS,
  type WorkoutTemplate,
  type WorkoutExerciseTemplate,
  type MuscleGroup,
  type MultiDayProgram,
} from "./workouts-data";

type TabKey = "general" | "muscle" | "exercises";

type ExerciseListItem = WorkoutExerciseTemplate & {
  planSlug: string;
  planTitle: string;
};

// порядок фильтров по группам мышц во вкладке «Упражнения»
const MUSCLE_FILTER_ORDER: (MuscleGroup | "all")[] = [
  "all",
  "chest",
  "back",
  "legs",
  "glutes",
  "shoulders",
  "biceps",
  "triceps",
  "core",
  "fullbody",
  "cardio",
];

// какие ОДНОДНЕВНЫЕ программы считаем «общими»
const GENERAL_SINGLE_WORKOUT_SLUGS = new Set<string>([
  "fullbody-3x-week",
  "home-no-equipment",
  "dropset-upper-body-gym",
]);

// а какие — «по группам мышц»
const MUSCLE_PROGRAM_SLUGS = new Set<string>([
  "arms-biceps-triceps",
  "back-thickness-width",
]);

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<PlanType>("free");

  useEffect(() => {
    const p = getUserPlan();
    setPlan(p);
  }, []);

  const isPro = plan === "pro";
  const planLabel = isPro ? "FitEat PRO" : "Базовый тариф";

  // общие однодневные программы (фуллбади + домашка)
  const generalPrograms = useMemo(
    () =>
      WORKOUT_TEMPLATES.filter((w) =>
        GENERAL_SINGLE_WORKOUT_SLUGS.has(w.slug),
      ),
    [],
  );

  // программы по группам мышц
  const musclePrograms = useMemo(
    () =>
      WORKOUT_TEMPLATES.filter((w) => MUSCLE_PROGRAM_SLUGS.has(w.slug)),
    [],
  );

  // справочник упражнений
  const allExercises: ExerciseListItem[] = useMemo(() => {
    const result: ExerciseListItem[] = [];
    const seen = new Set<string>();

    for (const plan of WORKOUT_TEMPLATES) {
      for (const ex of plan.exercises) {
        const key = ex.slug || ex.id;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          ...ex,
          planSlug: plan.slug,
          planTitle: plan.title,
        });
      }
    }

    return result.sort((a, b) =>
      a.name.localeCompare(b.name, "ru-RU", { sensitivity: "base" }),
    );
  }, []);

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allExercises.filter((ex) => {
      if (selectedGroup !== "all") {
        const group = ex.muscleGroup ?? "other";
        if (group !== selectedGroup) return false;
      }

      if (!q) return true;
      return ex.name.toLowerCase().includes(q);
    });
  }, [allExercises, selectedGroup, search]);

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24">
        <PageHeader
          title="Тренировки"
          backHref="/"
          backLabel="На главную"
          rightSlot={
            <div className="inline-flex items-center justify-end">
              <span className="px-3 py-1 rounded-full bg-white/16 text-[11px] font-medium text-white whitespace-nowrap">
                {planLabel}
              </span>
            </div>
          }
        />

        <main className="px-3 sm:px-4 md:px-5 pt-3 flex flex-col gap-3">
          {/* Intro card */}
          <section className="glass-card px-4 py-4 space-y-2">
            <h2 className="text-sm font-semibold">
              Как работает раздел «Тренировки»
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Здесь лежат: готовые программы (фуллбади, сплиты, домашка),
              отдельные дни по мышечным группам и справочник упражнений.
              Любую программу можно закинуть в дневник одним нажатием.
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              В бесплатной версии полностью доступна базовая программа
              фуллбади и часть упражнений. Остальные планы и упражнения
              помечены как PRO.
            </p>
          </section>

          {/* Tabs */}
          <section className="px-1">
            <div className="glass-card flex p-1 rounded-2xl text-xs gap-1">
              <TabButton
                active={activeTab === "general"}
                label="Общие программы"
                onClick={() => setActiveTab("general")}
              />
              <TabButton
                active={activeTab === "muscle"}
                label="По группам мышц"
                onClick={() => setActiveTab("muscle")}
              />
              <TabButton
                active={activeTab === "exercises"}
                label="Упражнения"
                onClick={() => setActiveTab("exercises")}
              />
            </div>
          </section>

          {/* Общие программы */}
          {activeTab === "general" && (
            <section className="space-y-3">
              {/* Сплит тяни-толкай-ноги как отдельная многодневная программа */}
              {MULTI_DAY_PROGRAMS.map((program, idx) => (
                <MultiDayProgramCard
                  key={program.slug}
                  program={program}
                  index={idx}
                  isPro={isPro}
                />
              ))}

              {/* Обычные однодневные планы — фуллбади и домашка */}
              {generalPrograms.map((w, idx) => (
                <WorkoutProgramCard
                  key={w.slug}
                  workout={w}
                  index={idx + MULTI_DAY_PROGRAMS.length}
                  labelTop={
                    w.slug === "fullbody-3x-week"
                      ? "Фуллбади — зал 3 раза в неделю"
                      : "Домашняя тренировка"
                  }
                  isPro={isPro}
                />
              ))}
            </section>
          )}

          {/* Программы по группам мышц */}
          {activeTab === "muscle" && (
            <section className="space-y-3">
              {musclePrograms.length === 0 ? (
                <div className="glass-card px-4 py-4 text-sm text-[var(--text-secondary)] text-center">
                  Пока нет отдельных программ по группам мышц.
                </div>
              ) : (
                musclePrograms.map((w, idx) => (
                  <WorkoutProgramCard
                    key={w.slug}
                    workout={w}
                    index={idx}
                    labelTop="ДЕНЬ ПОД ОТДЕЛЬНУЮ ГРУППУ"
                    isPro={isPro}
                  />
                ))
              )}
            </section>
          )}

          {/* Справочник упражнений */}
          {activeTab === "exercises" && (
            <section className="space-y-4">
              <motion.div
                className="glass-card p-3 space-y-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap gap-2 text-xs">
                  {MUSCLE_FILTER_ORDER.map((g) => {
                    const isAll = g === "all";
                    const label = isAll ? "Все" : MUSCLE_GROUP_LABELS[g];
                    const active = selectedGroup === g;
                    return (
                      <button
                        key={g}
                        onClick={() =>
                          setSelectedGroup(isAll ? "all" : (g as MuscleGroup))
                        }
                        className={
                          active
                            ? "px-3 py-1.5 rounded-full bg-[var(--accent-gold)] text-[var(--accent-contrast)] text-xs shadow-sm"
                            : "px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-secondary)] text-xs"
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs">
                  <div className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border border-[var(--border-soft)] bg-[var(--surface)]">
                    <Search className="w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Поиск по упражнениям..."
                      className="bg-transparent outline-none text-xs flex-1 text-[var(--text-primary)]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>

              {filteredExercises.length === 0 ? (
                <div className="glass-card p-4 text-sm text-center text-[var(--text-secondary)]">
                  Ничего не нашлось. Попробуй изменить группу мышц или запрос.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-10">
                  {filteredExercises.map((ex) => (
                    <ExerciseCard key={ex.slug} ex={ex} isPro={isPro} />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}

// ---------------- helpers ----------------

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "flex-1 px-3 py-2 rounded-2xl bg-[var(--accent-gold)] text-[var(--accent-contrast)] text-xs font-semibold shadow-sm"
          : "flex-1 px-3 py-2 rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-secondary)] text-xs"
      }
    >
      {label}
    </button>
  );
}

function WorkoutProgramCard({
  workout,
  index,
  labelTop,
  isPro,
}: {
  workout: WorkoutTemplate;
  index: number;
  labelTop?: string;
  isPro: boolean;
}) {
  const levelLabel: Record<string, string> = {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  const locked = !!workout.proOnly && !isPro;
  const href = locked ? "/pro" : `/workouts/${workout.slug}`;

  return (
    <Link href={href} className="block">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="glass-card px-4 py-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden"
      >
        {locked && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
            <div className="glass-card px-4 py-3 rounded-2xl text-center flex flex-col gap-2 max-w-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-[var(--accent-gold)]">
                <Lock className="w-3 h-3" />
                <span>PRO-программа</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Доступно на тарифе <span className="font-semibold">FitEat PRO</span>.
                Нажми, чтобы перейти к оформлению.
              </p>
            </div>
          </div>
        )}

        {labelTop && (
          <div className="text-[10px] font-medium tracking-wide text-[var(--text-muted)] uppercase mb-1">
            {labelTop}
          </div>
        )}

        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {workout.title}
        </h3>

        <p className="text-xs text-[var(--text-secondary)]">
          {workout.description}
        </p>

        <div className="mt-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
          <div>
            <span className="font-semibold text-[var(--text-primary)]">
              Цель:
            </span>{" "}
            {workout.focus}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Формат: {workout.category === "general" ? "общий план" : "день под группу"}
            </span>
            <span>Время: ~{workout.duration} мин.</span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
          <span>{levelLabel[workout.level] ?? "Уровень"}</span>
          <span>
            {locked
              ? "Нажми, чтобы открыть PRO"
              : "Нажми, чтобы открыть список упражнений"}
          </span>
        </div>
      </motion.article>
    </Link>
  );
}

function MultiDayProgramCard({
  program,
  index,
  isPro,
}: {
  program: MultiDayProgram;
  index: number;
  isPro: boolean;
}) {
  const levelLabel: Record<string, string> = {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  const locked = !!program.proOnly && !isPro;
  const href = locked ? "/pro" : `/workouts/programs/${program.slug}`;

  return (
    <Link href={href} className="block">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="glass-card px-4 py-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden"
      >
        {locked && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
            <div className="glass-card px-4 py-3 rounded-2xl text-center flex flex-col gap-2 max-w-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-[var(--accent-gold)]">
                <Lock className="w-3 h-3" />
                <span>PRO-программа</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Сплит «тяни-толкай-ноги» доступен на тарифе{" "}
                <span className="font-semibold">FitEat PRO</span>.
                Нажми, чтобы перейти к оформлению.
              </p>
            </div>
          </div>
        )}

        <div className="text-[10px] font-medium tracking-wide text-[var(--text-muted)] uppercase mb-1">
          Сплит в зале
        </div>

        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {program.title}
        </h3>
        {program.subtitle && (
          <p className="text-xs text-[var(--text-secondary)]">
            {program.subtitle}
          </p>
        )}

        <p className="text-xs text-[var(--text-secondary)]">
          {program.description}
        </p>

        <div className="mt-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
          <div>
            <span className="font-semibold text-[var(--text-primary)]">
              Внутри:
            </span>{" "}
            3 дня — PUSH, PULL и LEGS.
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>Формат: сплит на 3 дня</span>
            <span>Время: ~{program.duration} мин за тренировку</span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
          <span>{levelLabel[program.level] ?? "Уровень"}</span>
          <span>
            {locked
              ? "Нажми, чтобы открыть PRO"
              : "Нажми, чтобы выбрать день сплита"}
          </span>
        </div>
      </motion.article>
    </Link>
  );
}

function ExerciseCard({
  ex,
  isPro,
}: {
  ex: ExerciseListItem;
  isPro: boolean;
}) {
  const groupLabel =
    ex.muscleGroup && MUSCLE_GROUP_LABELS[ex.muscleGroup]
      ? MUSCLE_GROUP_LABELS[ex.muscleGroup]
      : "Упражнение";

  const slug = ex.slug || ex.id;
  const locked = !!ex.proOnly && !isPro;
  const href = locked ? "/pro" : `/workouts/exercises/${slug}`;

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass-card p-4 rounded-2xl flex flex-col gap-2 h-full relative overflow-hidden"
      >
        {locked && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
            <div className="glass-card px-4 py-3 rounded-2xl text-center flex flex-col gap-2 max-w-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-[var(--accent-gold)]">
                <Lock className="w-3 h-3" />
                <span>PRO</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Это упражнение доступно только в PRO. Нажми, чтобы перейти к
                тарифу.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--text-muted)] uppercase">
              {groupLabel}
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {ex.name}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] text-right">
            из плана «{ex.planTitle}»
          </span>
        </div>

        <div className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
          <span>
            {ex.sets} подходов × {ex.reps} повт.
          </span>
        </div>

        {ex.note && (
          <p className="text-[11px] mt-1 text-[var(--text-muted)] line-clamp-2">
            {ex.note}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
