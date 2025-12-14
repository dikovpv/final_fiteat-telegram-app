// apps/web/src/app/diary/components/WaterTracker.tsx
"use client";

import { motion } from "framer-motion";
import { Droplets, Plus } from "lucide-react";

type Props = {
  value: number; // литры
  onChange: (val: number) => void;
  goal: number; // литры
};

export default function WaterTracker({ value, onChange, goal }: Props) {
  const currentMl = Math.round(value * 1000);
  const goalMl = Math.round(goal * 1000);

  const addMl = (ml: number) => {
    const nextLiters = value + ml / 1000;
    onChange(Number(nextLiters.toFixed(3)));
  };

  const progress =
    goalMl > 0 ? Math.min((currentMl / goalMl) * 100, 120) : 0; // можно чуть перелить

  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
            <Droplets className="w-4 h-4 text-[var(--info)]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              Вода за день
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Цель: {goalMl} мл
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">
            {currentMl} / {goalMl} мл
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-[var(--surface)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.4 }}
          style={{ backgroundColor: "var(--info)" }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addMl(250)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-primary)] hover:border-[var(--info)] hover:text-[var(--info)] transition"
          >
            <Plus className="w-3 h-3" />
            +250 мл
          </button>
          <button
            type="button"
            onClick={() => addMl(100)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-secondary)] hover:border-[var(--info)] hover:text-[var(--info)] transition"
          >
            <Plus className="w-3 h-3" />
            +100 мл
          </button>
        </div>
        <button
          type="button"
          onClick={() => onChange(0)}
          className="text-[11px] text-[var(--danger)] hover:underline underline-offset-4"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
