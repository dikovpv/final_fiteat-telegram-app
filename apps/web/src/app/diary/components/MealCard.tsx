"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Trash2 } from "lucide-react";
import type { DiaryMeal } from "../diary-types";

interface MealCardProps {
  meal: DiaryMeal;
  onToggle: () => void;
  onDelete: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onToggle, onDelete }) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (!meal.slug) return;

    // если в дневнике есть калорийность — передаём её как target
    const hasCalories =
      typeof meal.calories === "number" && Number.isFinite(meal.calories);

    const url = hasCalories
      ? `/meals/${meal.slug}?target=${encodeURIComponent(
          String(Math.round(meal.calories)),
        )}`
      : `/meals/${meal.slug}`;

    router.push(url);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-all cursor-pointer ${
        meal.done
          ? "bg-[var(--success-soft)] border-[var(--success)]"
          : "bg-[var(--surface-muted)] border-[var(--border-soft)]"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p
            className={`font-medium text-sm ${
              meal.done
                ? "text-[var(--success-strong)] line-through"
                : "text-[var(--text-primary)]"
            }`}
          >
            {meal.title}
          </p>
          {meal.time && (
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {meal.time}
            </span>
          )}
        </div>

        <p className="text-[11px] text-[var(--text-secondary)]">
          {meal.calories} ккал • Б {meal.protein}г • Ж {meal.fat}г • У{" "}
          {meal.carbs}г
        </p>
      </div>
      <div className="flex items-center gap-3 pl-3">
        <button
          onClick={handleToggleClick}
          className="text-[var(--accent)] hover:text-[var(--accent-strong)] transition"
        >
          {meal.done ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5 border-2 border-[var(--border-soft)] rounded-full hover:border-[var(--accent)] transition" />
          )}
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-[var(--danger)] hover:opacity-80 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default MealCard;
