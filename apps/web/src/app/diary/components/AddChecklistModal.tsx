"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CalendarDays, ListChecks } from "lucide-react";

type RepeatMode = "once" | "weekdays";

export type ChecklistFormData = {
  title: string;
  repeatMode: RepeatMode;
  weekdays?: number[]; // 0 = вс, 1 = пн, ... 6 = сб
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

export default function AddChecklistModal({
  onClose,
  onSave,
}: AddChecklistModalProps) {
  const [title, setTitle] = useState("");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("once");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  const toggleWeekday = (value: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (repeatMode === "weekdays" && selectedWeekdays.length === 0) {
      // Ничего не выбрали — считаем как разовую задачу на сегодня
      onSave({ title: trimmed, repeatMode: "once" });
      onClose();
      return;
    }

    onSave({
      title: trimmed,
      repeatMode,
      weekdays: repeatMode === "weekdays" ? selectedWeekdays : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-2xl bg-[#05050a] border border-teal-500/30 shadow-2xl"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-300" />
            <h2 className="text-lg font-semibold text-white">
              Новая задача в чек-лист
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
          {/* Название задачи */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-300 font-medium">
              Задача
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: маска для лица, уборка, готовка..."
              className="w-full rounded-lg bg-black/40 border border-gray-600 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400"
              autoFocus
            />
          </div>

          {/* Режим повтора */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-300 font-medium">
              Повторение
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepeatMode("once")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition ${
                  repeatMode === "once"
                    ? "bg-teal-500/20 border-teal-400 text-teал-200"
                    : "bg-black/30 border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Один раз (на сегодня)
              </button>
              <button
                type="button"
                onClick={() => setRepeatMode("weekdays")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition ${
                  repeatMode === "weekdays"
                    ? "bg-purple-500/20 border-purple-400 text-purple-200"
                    : "bg-black/30 border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                По дням недели
              </button>
            </div>
          </div>

          {/* Выбор дней недели */}
          {repeatMode === "weekdays" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                Выберите дни недели, в которые задача должна появляться в
                чек-листе.
              </p>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => {
                  const active = selectedWeekdays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleWeekday(d.value)}
                      className={`h-8 text-xs rounded-lg border transition-all ${
                        active
                          ? "bg-teal-400 text-black border-teal-300 font-semibold"
                          : "bg-black/40 text-gray-300 border-gray-600 hover:border-teal-400 hover:text-teal-200"
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
          <div className="flex justify-between gap-3 pt-3 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-2 text-sm font-medium text-gray-300 hover:border-gray-400 hover:text-white transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-black hover:bg-teal-400 transition disabled:bg-gray-600 disabled:text-gray-300"
              disabled={!title.trim()}
            >
              Сохранить
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
