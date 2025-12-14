"use client";

import React from "react";
import { Moon } from "lucide-react";
import type { SleepData } from "../diary-types";

interface SleepTrackerProps {
  value: SleepData;
  onChange: (value: SleepData) => void;
}

const SLEEP_GOAL_HOURS = 8;

function calcHoursFromTimes(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (
    Number.isNaN(sh) ||
    Number.isNaN(sm) ||
    Number.isNaN(eh) ||
    Number.isNaN(em)
  ) {
    return 0;
  }
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60; // переход через полночь
  return minutes / 60;
}

export default function SleepTracker({ value, onChange }: SleepTrackerProps) {
  const start = value?.start ?? "";
  const end = value?.end ?? "";
  const durationHours = value?.durationHours ?? undefined;

  const hoursFromTimes = calcHoursFromTimes(start, end);

  // приоритет: если есть время начала/конца — считаем по нему,
  // иначе используем durationHours
  const effectiveHours =
    hoursFromTimes > 0
      ? hoursFromTimes
      : typeof durationHours === "number" && durationHours > 0
      ? durationHours
      : 0;

  const progress = Math.min(
    (effectiveHours / SLEEP_GOAL_HOURS) * 100,
    100
  );

  const formattedHours = effectiveHours
    ? effectiveHours.toFixed(1).replace(".0", "")
    : "0";

  const handleStartChange = (newStart: string) => {
    onChange({
      ...value,
      start: newStart || "",
    });
  };

  const handleEndChange = (newEnd: string) => {
    onChange({
      ...value,
      end: newEnd || "",
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num =
      val === "" ? undefined : Math.max(0, Math.min(24, Number(val) || 0));

    onChange({
      ...value,
      durationHours: num,
    });
  };

  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-[var(--purple)]" />
          <div>
            <div className="font-semibold text-[var(--text-primary)]">
              Сон
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Цель: {SLEEP_GOAL_HOURS} ч
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[var(--text-secondary)]">
            {formattedHours} / {SLEEP_GOAL_HOURS} ч
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)]">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* прогресс-бар */}
      <div className="w-full h-1.5 rounded-full bg-[var(--surface)] overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-[var(--purple)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* время сна */}
      <div className="mb-3">
        <div className="text-[11px] text-[var(--text-secondary)] mb-1">
          Время сна (по желанию)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={start}
            onChange={(e) => handleStartChange(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
          <span className="text-[var(--text-tertiary)] text-xs">—</span>
          <input
            type="time"
            value={end}
            onChange={(e) => handleEndChange(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          По этим данным: ~{formattedHours} ч сна
        </div>
      </div>

      {/* количество часов без указания времени */}
      <div>
        <div className="text-[11px] text-[var(--text-secondary)] mb-1">
          Или укажи просто количество часов
        </div>
        <input
          type="number"
          min={0}
          max={24}
          step={0.5}
          value={
            durationHours !== undefined
              ? durationHours
              : hoursFromTimes || ""
          }
          onChange={handleDurationChange}
          className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          Можно не указывать время, только длительность.
        </div>
      </div>
    </div>
  );
}
