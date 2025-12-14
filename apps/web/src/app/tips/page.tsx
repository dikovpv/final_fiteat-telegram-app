"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import {
  TIPS,
  CATEGORY_LABELS,
  type TipItem,
  type TipCategory,
} from "./tips-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

type FilterCategory = "all" | TipCategory;

const CATEGORIES: { id: FilterCategory; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "nutrition", label: "Питание" },
  { id: "training", label: "Тренировки" },
  { id: "health", label: "Здоровье" },
  { id: "general", label: "Общее" },
];

export default function TipsPage() {
  const [plan, setPlan] = useState<PlanType>("free");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPlan(getUserPlan());
  }, []);

  const isPro = plan === "pro";
  const planLabel = isPro ? "FitEat PRO" : "Базовый тариф";

  const filteredTips = useMemo(() => {
    return TIPS.filter((t: TipItem) => {
      if (activeCategory !== "all" && t.category !== activeCategory) return false;

      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const haystack = `${t.title} ${t.subtitle ?? ""} ${CATEGORY_LABELS[t.category]}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, search]);

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title="Советы"
          backHref="/"
          rightSlot={
            <div className="inline-flex items-center justify-end">
              <span className="px-3 py-1 rounded-full bg-white/16 text-[11px] font-medium text-white whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {planLabel}
              </span>
            </div>
          }
        />

        <main className="px-3 sm:px-4 md:px-5 pt-3 flex flex-col gap-3">
          <motion.section
            className="glass-card p-3 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-[var(--text-secondary)]">
                Питание, тренировки, здоровье и голова — без воды и магии.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Поиск по советам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="mt-1 flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={
                      isActive
                        ? "px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-[var(--accent-gold)] text-[var(--accent-contrast)] font-semibold shadow-sm"
                        : "px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--text-secondary)]"
                    }
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </motion.section>

          <section className="space-y-3 pb-10">
            {filteredTips.map((tip: TipItem) => {
              const locked = !!tip.proOnly && !isPro;
              const href = locked ? "/pro" : `/tips/${tip.slug}`;

              return (
                <Link key={tip.slug} href={href} className="block">
                  <article className="glass-card p-4 border border-[var(--border-soft)] relative overflow-hidden hover:border-[var(--accent)]/70 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h2 className="text-sm font-semibold mb-1">{tip.title}</h2>
                        {tip.subtitle && (
                          <p className="text-xs text-[var(--text-secondary)]">{tip.subtitle}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border-soft)] text-[var(--text-secondary)]">
                          {CATEGORY_LABELS[tip.category]}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ~{tip.readingTime}
                        </span>
                      </div>
                    </div>

                    {tip.badge && (
                      <div className="mt-2 text-[10px] text-[var(--text-muted)]">{tip.badge}</div>
                    )}

                    {tip.proOnly && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] bg-purple-600/90 text-white flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        PRO
                      </div>
                    )}

                    {locked && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-2">
                        <Lock className="w-5 h-5 text-purple-200" />
                        <p className="text-[11px] text-gray-100 px-4 text-center">
                          Это PRO-материал. Оформи PRO-тариф, чтобы открыть полный текст.
                        </p>
                      </div>
                    )}
                  </article>
                </Link>
              );
            })}

            {filteredTips.length === 0 && (
              <div className="glass-card p-4 text-center text-sm text-[var(--text-secondary)] mt-6">
                Ничего не нашлось под этот фильтр. Попробуй другую категорию или запрос.
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
