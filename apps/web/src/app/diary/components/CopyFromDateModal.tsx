// apps/web/src/app/diary/components/CopyFromDateModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays } from "lucide-react";

export type CopyFromDateModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;

  // универсальное значение (для даты или числа)
  date: string;
  error?: string | null;
  onDateChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;

  // опциональная кастомизация инпута
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: string; // "date" | "number" | "text" и т.п.
};

export default function CopyFromDateModal({
  isOpen,
  title,
  description,
  date,
  error,
  onDateChange,
  onCancel,
  onConfirm,
  inputLabel,
  inputPlaceholder,
  inputType,
}: CopyFromDateModalProps) {
  const labelText =
    inputLabel ?? "Дата источника (ГГГГ-ММ-ДД)";
  const type = inputType ?? "date";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-2xl bg-[var(--surface)] border border-[var(--border-soft)] shadow-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent-gold)]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-full hover:bg-[var(--surface-muted)] text-[var(--text-tertiary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-[var(--text-secondary)]">
                {labelText}
              </label>
              <input
                type={type}
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
              />
              {error && (
                <p className="text-xs text-[var(--danger)] mt-1">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5 text-sm">
              <button
                onClick={onCancel}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent-gold)] text-white font-semibold hover:brightness-105"
              >
                ОК
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
