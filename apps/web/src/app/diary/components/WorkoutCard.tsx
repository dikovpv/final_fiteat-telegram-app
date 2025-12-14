"use client";

import { motion } from "framer-motion";
import { Dumbbell, Trash2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Workout } from "../diary-types";

type WorkoutCardProps = {
  workout: Workout;
  onToggle: () => void;
  onDelete: () => void;
  onEditWeight: () => void; // открыть модалку веса
};

export default function WorkoutCard({
  workout,
  onToggle,
  onDelete,
  onEditWeight,
}: WorkoutCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (workout.exerciseSlug) {
      router.push(`/workouts/exercises/${workout.exerciseSlug}`);
    } else if (workout.planSlug) {
      router.push(`/workouts/${workout.planSlug}`);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleWeightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditWeight();
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "strength":
        return "🏋️";
      case "cardio":
        return "🏃";
      case "flexibility":
        return "🧘";
      default:
        return "💪";
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "strength":
        return "text-orange-400";
      case "cardio":
        return "text-red-400";
      case "flexibility":
        return "text-purple-400";
      default:
        return "text-green-400";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className={`border border-[var(--border-soft)] rounded-xl p-3 sm:p-4 hover:border-[var(--accent-gold)] transition-all cursor-pointer bg-[var(--surface)]`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getTypeIcon(workout.type)}</span>
            <p className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
              {workout.name}
            </p>
          </div>

          {workout.planTitle && (
            <p className="text-[11px] text-[var(--text-tertiary)] mb-1">
              План: {workout.planTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-[var(--text-secondary)]">
            {workout.type && (
              <span className={getTypeColor(workout.type)}>
                {workout.type === "strength" && "Силовое"}
                {workout.type === "cardio" && "Кардио"}
                {workout.type === "flexibility" && "Растяжка"}
              </span>
            )}

            {workout.type === "strength" ? (
              <span>
                {workout.sets}×{workout.reps}
              </span>
            ) : workout.duration ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {workout.duration} мин
              </span>
            ) : null}

            {/* Чип "рабочий вес" */}
            <button
              type="button"
              onClick={handleWeightClick}
              className="px-2 py-0.5 rounded-full border border-[var(--border-soft)] text-[10px] sm:text-xs text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition"
            >
              {typeof workout.weight === "number"
                ? `Раб. вес: ${workout.weight} кг`
                : "Добавить вес"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-1">
          <button
            onClick={handleToggleClick}
            className="text-[var(--accent)] hover:text-[var(--accent-strong)] transition"
          >
            {workout.done ? (
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]" />
            ) : (
              <div className="w-5 h-5 border-2 border-[var(--border-soft)] rounded-full hover:border-[var(--accent)] transition" />
            )}
          </button>

          <button
            onClick={handleDeleteClick}
            className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Dumbbell className="w-5 h-5 text-[var(--accent-gold)]" />
        </div>
      </div>
    </motion.div>
  );
}
