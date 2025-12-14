"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CalendarDays, ListChecks } from "lucide-react";

type RepeatMode = "once" | "weekly";

export type ChecklistFormData = {
  title: string;
  repeatMode: RepeatMode;
  daysOfWeek?: number[]; // 0 = вс, 1 = пн, ... 6 = сб
};

interface AddChecklistModalProps {
  onClose: () => void;
  onSave: (data: ChecklistFormData) => void;
}

const WEEKDAYS = [
  { label: "ПН", value: 1 },
  { label: "ВТ", value: 2 },
  { label: "СР", value: 3 },
  { label: "ЧТ", value: 4 },
  { label: "ПТ", value: 5 },
  { label: "СБ", value: 6 },
  { label: "ВС", value: 0 },
];

export default function AddChecklistModal({ onClose, onSave }: AddChecklistModalProps) {
  const [title, setTitle] = useState("");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("once");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDay = (value: number) => {
    setSelectedDays(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (repeatMode === "weekly" && selectedDays.length === 0) {
      // ничего не выбрали — считаем как разовую задачу
      onSave({ title: trimmed, repeatMode: "once" });
      onClose();
      return;
    }

    onSave({
      title: trimmed,
      repeatMode,
      daysOfWeek: repeatMode === "weekly" ? selectedDays : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xl text-[var(--text-primary)]"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--surface-muted)] text-[var(--accent-gold)]">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Новая задача в чек-лист</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Чтобы не держать мелочи в голове.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
          {/* Название задачи */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Задача
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: маска для лица, уборка, готовка..."
              className="w-full rounded-lg bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-gold)]"
              autoFocus
            />
          </div>

          {/* Режим повтора */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Повторение
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepeatMode("once")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium border transition ${
                  repeatMode === "once"
                    ? "border-[var(--accent-gold)] bg-[var(--accent-soft)] text-[var(--accent-gold)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Один раз (на сегодня)
              </button>
              <button
                type="button"
                onClick={() => setRepeatMode("weekly")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium border transition ${
                  repeatMode === "weekly"
                    ? "border-[var(--accent-gold)] bg-[var(--accent-soft)] text-[var(--accent-gold)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                По дням недели
              </button>
            </div>
          </div>

          {/* Выбор дней недели */}
          {repeatMode === "weekly" && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">
                Выберите дни недели, когда задача будет появляться в чек-листе.
              </p>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map(d => {
                  const active = selectedDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`h-8 text-xs rounded-lg border transition-all ${
                        active
                          ? "bg-[var(--accent-gold)] text-black border-[var(--accent-gold)] font-semibold"
                          : "bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-between gap-3 pt-3 border-t border-[var(--border-soft)] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full rounded-lg bg-[var(--accent-gold)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Сохранить
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
