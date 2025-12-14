// apps/web/src/app/diary/components/AchievementCard.tsx
"use client";

import type { JSX } from "react";

type AchievementCardProps = {
  icon: JSX.Element;
  title: string;
  description: string;
  color: string;
};

export default function AchievementCard({
  icon,
  title,
  description,
  color,
}: AchievementCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg p-3 border"
      style={{
        borderColor: color,
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.06))",
      }}
    >
      <div style={{ color }}>{icon}</div>
      <div>
        <div className="font-medium text-sm" style={{ color }}>
          {title}
        </div>
        <div className="text-xs text-[var(--text-secondary)]">
          {description}
        </div>
      </div>
    </div>
  );
}
