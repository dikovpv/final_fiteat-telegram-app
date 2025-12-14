// apps/web/src/app/diary/components/ProgressRing.tsx
"use client";

import { motion } from "framer-motion";
import type { JSX } from "react";

type ProgressRingProps = {
  icon: JSX.Element;
  progress: number;
  color: string;
  label: string;
};

export default function ProgressRing({
  icon,
  progress,
  color,
  label,
}: ProgressRingProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  const clamped = Math.max(0, Math.min(progress, 100));
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor = "var(--accent-gold)";
  const iconColor = color;
  const percentColor = "var(--text-primary)";

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-1">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="4"
            fill="none"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{ color: iconColor }}
          >
            {icon}
          </div>
        </div>
      </div>
      <div className="text-[11px] text-[var(--text-secondary)]">{label}</div>
      <div className="text-sm font-semibold" style={{ color: percentColor }}>
        {Math.round(clamped)}%
      </div>
    </div>
  );
}
