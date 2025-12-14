// apps/web/src/app/diary/components/ChecklistCard.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, Trash2 } from "lucide-react";
import type { ChecklistItem } from "../diary-types";

export type ChecklistItemExt = ChecklistItem & {
  templateId?: string;
};

type ChecklistCardProps = {
  item: ChecklistItemExt;
  onToggle: () => void;
  onDelete: () => void;
};

export default function ChecklistCard({
  item,
  onToggle,
  onDelete,
}: ChecklistCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-all ${
        item.done
          ? "bg-[var(--success-soft)] border-[var(--success)]"
          : "bg-[var(--surface-muted)] border-[var(--border-soft)]"
      }`}
    >
      <div className="flex-1">
        <p
          className={`font-medium text-sm ${
            item.done
              ? "text-[var(--success-strong)] line-through"
              : "text-[var(--text-primary)]"
          }`}
        >
          {item.title}
        </p>
        {item.repeatMode === "weekly" && item.daysOfWeek?.length ? (
          <p className="text-[11px] text-[var(--success-strong)] mt-1">
            Повтор каждую неделю ({item.daysOfWeek.length}× в неделю)
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="text-[var(--success)] hover:text-[var(--success-strong)] transition"
        >
          {item.done ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5 border-2 border-[var(--border-soft)] rounded-full hover:border-[var(--success)] transition" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="text-[var(--danger)] hover:opacity-80 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
