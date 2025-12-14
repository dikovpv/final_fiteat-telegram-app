"use client";

import SectionHeader from "./SectionHeader";
import ChecklistCard, { type ChecklistItemExt } from "./ChecklistCard";
import { ListTodo, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  progress: number;
  checklist: ChecklistItemExt[];
  onToggle: () => void;
  onToggleItem: (item: ChecklistItemExt) => void;
  onDeleteItem: (item: ChecklistItemExt) => void;
  onAddClick: () => void;
};

export default function ChecklistSection({
  open,
  progress,
  checklist,
  onToggle,
  onToggleItem,
  onDeleteItem,
  onAddClick,
}: Props) {
  return (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75 }}
    >
      <SectionHeader
        title="Чек-лист"
        icon={<ListTodo className="w-5 h-5 text-[var(--success)]" />}
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
            {checklist.length === 0 ? (
              <div className="text-center py-6">
                <ListTodo className="w-10 h-10 mx-auto mb-3 text-[var(--border-soft)]" />
                <p className="text-[var(--text-secondary)] mb-3">
                  Пока нет задач на этот день
                </p>
                <button
                  onClick={onAddClick}
                  className="cosmic-button flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Добавить задачу
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {checklist.map((item) => (
                  <ChecklistCard
                    key={item.templateId ?? item.id}
                    item={item}
                    onToggle={() => onToggleItem(item)}
                    onDelete={() => onDeleteItem(item)}
                  />
                ))}

                <button
                  onClick={onAddClick}
                  className="w-full mt-3 text-[var(--success)] text-sm font-medium py-2 hover:text-[var(--success-strong)] transition"
                >
                  + Добавить задачу
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
