"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  rightLabel?: string;
  backHref?: string; // если есть, показываем кнопку "Назад"
  backLabel?: string; // текст кнопки (по умолчанию "Назад")
  rightSlot?: ReactNode;
  centerSlot?: ReactNode; // центр: либо текст, либо кастомный слот (логотип и т.п.)
};

export default function PageHeader({
  title,
  rightLabel,
  rightSlot,
  backHref,
  backLabel = "Назад",
  centerSlot,
}: PageHeaderProps) {
  const showBack = !!backHref;

  return (
    <motion.header
      className="
        sticky top-0 z-40
        w-full
        bg-[var(--accent-gold)] text-white
        h-20 sm:h-24
        rounded-b-2xl
        px-4 sm:px-5
        flex items-end
        shadow-md
      "
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-end justify-between w-full pb-2">
        {/* Слева — кнопка назад (опционально) */}
        <div className="w-24 h-8 flex items-center justify-start">
          {showBack && (
            <Link
              href={backHref}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-white/60 text-xs text-white/90 bg-white/5 hover:bg-white/10 transition"
            >
              <span className="mr-1.5 text-sm">←</span>
              <span>{backLabel}</span>
            </Link>
          )}
        </div>

        {/* Центр — либо слот, либо текстовый заголовок */}
        <div className="flex-1 flex items-center justify-center text-sm sm:text-base font-semibold text-center">
          {centerSlot ?? title}
        </div>

        {/* Справа — слот (кнопки, бейджи и т.п.) */}
        <div className="w-24 h-8 flex items-center justify-end">
          {rightSlot && (
            <div className="ml-3 flex items-center gap-2">{rightSlot}</div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
