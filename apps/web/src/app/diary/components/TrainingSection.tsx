"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Moon, Plus } from "lucide-react";

import SectionHeader from "./SectionHeader";
import WorkoutCard from "./WorkoutCard";
import CopyFromDateModal from "./CopyFromDateModal";

import {
  DEFAULT_ENTRY,
  type DiaryEntry,
  type Workout,
} from "../diary-types";

type TrainingSectionProps = {
  entry: DiaryEntry;
  open: boolean;
  progress: number;

  onToggle: () => void;
  onCopyClick: () => void;
  onAddWorkout: () => void;
  onToggleWorkout: (id: string) => void;
  onDeleteWorkout: (id: string) => void;

  setDiaryData: React.Dispatch<React.SetStateAction<DiaryEntry | null>>;
};

export default function TrainingSection({
  entry,
  open,
  progress,
  onToggle,
  onCopyClick,
  onAddWorkout,
  onToggleWorkout,
  onDeleteWorkout,
  setDiaryData,
}: TrainingSectionProps) {
  // состояние модалки рабочего веса
  const [weightModalState, setWeightModalState] = useState<{
    workoutId: string | null;
    value: string;
    error: string | null;
  }>({
    workoutId: null,
    value: "",
    error: null,
  });

  const openWeightModal = (workout: Workout) => {
    setWeightModalState({
      workoutId: workout.id,
      value:
        typeof workout.weight === "number" && !isNaN(workout.weight)
          ? String(workout.weight)
          : "",
      error: null,
    });
  };

  const closeWeightModal = () => {
    setWeightModalState({
      workoutId: null,
      value: "",
      error: null,
    });
  };

  const updateWorkoutWeight = (id: string, weight?: number) => {
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        workouts: base.workouts.map((w) =>
          w.id === id ? { ...w, weight } : w
        ),
      };
    });
  };

  const handleWeightConfirm = () => {
    if (!weightModalState.workoutId) {
      closeWeightModal();
      return;
    }

    const raw = weightModalState.value.trim().replace(",", ".");
    if (raw === "") {
      // пусто — считаем, что пользователь хочет очистить вес
      updateWorkoutWeight(weightModalState.workoutId, undefined);
      closeWeightModal();
      return;
    }

    const num = Number(raw);
    if (!isFinite(num) || num < 0) {
      setWeightModalState((prev) => ({
        ...prev,
        error: "Введите корректный вес (неотрицательное число)",
      }));
      return;
    }

    updateWorkoutWeight(weightModalState.workoutId, num);
    closeWeightModal();
  };

  const toggleRestDay = () => {
    setDiaryData((prev) => {
      const base = prev ?? DEFAULT_ENTRY;
      return {
        ...base,
        isRestDay: !base.isRestDay,
        workouts: !base.isRestDay ? [] : base.workouts,
      };
    });
  };

  return (
    <>
      <motion.div
        className="glass-card p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SectionHeader
          title={entry.isRestDay ? "Выходной" : "Тренировки"}
          icon={<Dumbbell className="w-5 h-5 text-[var(--success)]" />}
          isOpen={open}
          onToggle={onToggle}
          progress={progress}
        />

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4"
            >
              {entry.isRestDay ? (
                <div className="text-center py-8">
                  <Moon className="w-12 h-12 mx-auto mb-3 text-[var(--purple)]" />
                  <p className="text-[var(--purple)] font-semibold mb-2">
                    Сегодня выходной
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Восстановление важно для прогресса!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={onCopyClick}
                      className="text-xs text-[var(--success)] hover:text-[var(--success-strong)] underline underline-offset-4"
                    >
                      Скопировать тренировки с другой даты
                    </button>
                  </div>

                  {entry.workouts.length === 0 ? (
                    <div className="text-center py-8">
                      <Dumbbell className="w-12 h-12 mx-auto mb-3 text-[var(--border-soft)]" />
                      <p className="text-[var(--text-secondary)] mb-4">
                        Нет упражнений на сегодня
                      </p>
                      <button
                        onClick={onAddWorkout}
                        className="cosmic-button flex items-center justify-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Добавить упражнение
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entry.workouts.map((workout) => (
                        <WorkoutCard
                          key={workout.id}
                          workout={workout}
                          onToggle={() => onToggleWorkout(workout.id)}
                          onDelete={() => onDeleteWorkout(workout.id)}
                          onEditWeight={() => openWeightModal(workout)}
                        />
                      ))}

                      <button
                        onClick={onAddWorkout}
                        className="w-full mt-3 text-[var(--success)] text-sm font-medium py-2 hover:text-[var(--success-strong)] transition"
                      >
                        + Добавить еще упражнение
                      </button>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border-soft)]">
                <button
                  onClick={toggleRestDay}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                    entry.isRestDay
                      ? "bg-[var(--purple)] text-white hover:opacity-90"
                      : "border border-[var(--purple)] text-[var(--purple)] hover:bg-[var(--purple-soft)]"
                  }`}
                >
                  {entry.isRestDay ? "Отменить выходной" : "Сделать выходной"}
                </button>

                {!entry.isRestDay && (
                  <button
                    onClick={onAddWorkout}
                    className="cosmic-button text-sm"
                  >
                    Добавить упражнение
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Модалка рабочего веса (дизайн как у «Скопировать с даты») */}
      <CopyFromDateModal
        isOpen={!!weightModalState.workoutId}
        title="Рабочий вес"
        description="Укажите рабочий вес для этого упражнения."
        date={weightModalState.value}
        error={weightModalState.error}
        onDateChange={(val) =>
          setWeightModalState((prev) => ({ ...prev, value: val, error: null }))
        }
        onCancel={closeWeightModal}
        onConfirm={handleWeightConfirm}
        inputLabel="Введите рабочий вес (кг):"
        inputPlaceholder="Например: 60"
        inputType="number"
      />
    </>
  );
}
