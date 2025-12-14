// apps/web/src/app/diary/components/SectionHeader.tsx
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import type { JSX } from "react";

type SectionHeaderProps = {
  title: string;
  icon: JSX.Element;
  isOpen: boolean;
  onToggle: () => void;
  progress: number;
};

export default function SectionHeader({
  title,
  icon,
  isOpen,
  onToggle,
  progress,
}: SectionHeaderProps) {
  const clamped = Math.max(0, Math.min(progress, 100));
  const barColor = "var(--accent)";

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 text-left"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold text-[var(--text-primary)]">
          {title}
        </span>
        <div className="text-xs font-medium text-[var(--text-secondary)]">
          {Math.round(clamped)}%
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1 bg-[var(--surface-muted)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-tertiary)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
        )}
      </div>
    </button>
  );
}
