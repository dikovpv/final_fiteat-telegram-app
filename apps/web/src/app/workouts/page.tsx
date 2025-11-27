// apps/web/src/app/workouts/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Clock,
  Activity,
  Search,
} from "lucide-react";

import {
  WORKOUT_TEMPLATES,
  type WorkoutTemplate,
  type WorkoutExerciseTemplate,
  type MuscleGroup,
  MUSCLE_GROUP_LABELS, 
} from "./workouts-data";

// ----- тип для списка упражнений на вкладке "Упражнения" -----
type ExerciseListItem = WorkoutExerciseTemplate & {
  planSlug: string;
  planTitle: string;
};

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
  "cardio",
  "fullbody",
];

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<"programs" | "exercises">(
    "programs",
  );
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  // Собираем уникальные упражнения из всех программ
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

    // лёгкая сортировка по названию
    return result.sort((a, b) =>
      a.name.localeCompare(b.name, "ru-RU", { sensitivity: "base" }),
    );
  }, []);

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allExercises.filter((ex) => {
      // фильтр по группе мышц
      if (selectedGroup !== "all") {
        const group = ex.muscleGroup ?? "other";
        if (group !== selectedGroup) return false;
      }

      // фильтр по поиску
      if (!q) return true;
      return ex.name.toLowerCase().includes(q);
    });
  }, [allExercises, selectedGroup, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050510] via-[#120826] to-[#1f1247] text-slate-50 pb-24">
      <div className="cosmic-bg" />

      {/* Header */}
      <header className="sticky top-0 z-20 glass-card px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold neon-text-teal flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            Тренировки
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Выбирай программы или отдельные упражнения и добавляй в дневник.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="glass-card flex p-1 rounded-2xl border border-slate-700/70 text-xs">
          <button
            className={`flex-1 px-3 py-2 rounded-2xl transition ${
              activeTab === "programs"
                ? "bg-teal-500/20 text-teal-100 border border-teal-400/70 shadow-[0_0_20px_rgba(45,212,191,0.35)]"
                : "text-slate-300 border border-transparent hover:bg-white/5"
            }`}
            onClick={() => setActiveTab("programs")}
          >
            Программы
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-2xl transition ${
              activeTab === "exercises"
                ? "bg-teal-500/20 text-teal-100 border border-teal-400/70 shadow-[0_0_20px_rgba(45,212,191,0.35)]"
                : "text-slate-300 border border-transparent hover:bg-white/5"
            }`}
            onClick={() => setActiveTab("exercises")}
          >
            Упражнения
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pt-4 space-y-4">
        {activeTab === "programs" ? (
          // ---------- Вкладка "Программы" ----------
          <section className="space-y-3">
            {WORKOUT_TEMPLATES.map((w, idx) => (
              <WorkoutCard key={w.slug} workout={w} index={idx} />
            ))}
          </section>
        ) : (
          // ---------- Вкладка "Упражнения" ----------
          <section className="space-y-4">
            {/* Фильтр по группам мышц + поиск */}
            <motion.div
              className="glass-card p-3 space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Кнопки групп мышц */}
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
                      className={`px-3 py-1.5 rounded-full border transition ${
                        active
                          ? "bg-teal-500/20 border-teal-400 text-teal-200"
                          : "bg-black/20 border-white/10 text-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Поиск по упражнениям */}
              <div className="flex items-center gap-2 mt-1 text-xs">
                <div className="flex items-center gap-2 flex-1 bg-black/30 border border-slate-700 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Поиск по упражнениям..."
                    className="bg-transparent outline-none text-xs text-slate-100 flex-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Список упражнений */}
            {filteredExercises.length === 0 ? (
              <div className="glass-card p-4 text-sm text-slate-400 text-center">
                Ничего не нашлось. Попробуй изменить группу мышц или запрос.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredExercises.map((ex) => (
                  <ExerciseCard key={ex.slug} ex={ex} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// ----- карточка программы тренировки -----

function WorkoutCard({
  workout,
  index,
}: {
  workout: WorkoutTemplate;
  index: number;
}) {
  const levelLabel =
    workout.level === "beginner"
      ? "Начальный уровень"
      : workout.level === "intermediate"
      ? "Средний уровень"
      : "Продвинутый";

  return (
    <Link href={`/workouts/${workout.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileTap={{ scale: 0.97 }}
        className="glass-card p-4 rounded-2xl border border-slate-700/70 hover:border-emerald-400/60 transition-colors flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-slate-50">{workout.title}</h2>
          </div>
          {workout.dayTag && (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 border border-emerald-400/50 text-emerald-200">
              {workout.dayTag}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2">
          {workout.description}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-400/40">
              {workout.focus}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-300" />
              {workout.duration} мин
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-300" />
              {levelLabel}
            </span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-400">
          Упражнений: {workout.exercises.length} — нажми, чтобы посмотреть план
        </div>
      </motion.div>
    </Link>
  );
}

// ----- карточка отдельного упражнения -----

function ExerciseCard({ ex }: { ex: ExerciseListItem }) {
  const groupLabel =
    ex.muscleGroup && MUSCLE_GROUP_LABELS[ex.muscleGroup]
      ? MUSCLE_GROUP_LABELS[ex.muscleGroup]
      : "Упражнение";

  const slug = ex.slug || ex.id;

  return (
    <Link href={`/workouts/exercises/${slug}`} className="block">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass-card p-4 rounded-2xl border border-slate-700/70 hover:border-emerald-400/60 transition-colors flex flex-col gap-2 h-full"
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-teal-300 uppercase">
                {groupLabel}
              </span>
              <span className="text-sm font-semibold text-slate-50">
                {ex.name}
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 flex items-center justify-between">
          <span>
            {ex.sets} подходов × {ex.reps} повт.
          </span>
          <span className="text-slate-400">
            из плана «{ex.planTitle}»
          </span>
        </div>

        {ex.note && (
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            {ex.note}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
