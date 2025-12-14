// apps/web/src/app/tips/[slug]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpenText, Lock, Sparkles } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import {
  findTipBySlug,
  CATEGORY_LABELS,
  type TipItem,
  type TipSection,
} from "../tips-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

export default function TipPage({
  params,
}: {
  params: { slug: string };
}) {
  const [plan, setPlan] = useState<PlanType>("free");

  useEffect(() => {
    const current = getUserPlan();
    setPlan(current);
  }, []);

  const isPro = plan === "pro";

  const tip = useMemo<TipItem | undefined>(
    () => findTipBySlug(params.slug),
    [params.slug],
  );

  if (!tip) {
    return (
      <>
        <div className="cosmic-bg" />
        <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col">
          <PageHeader title="Совет" backHref="/tips" />
          <div className="px-3 sm:px-4 md:px-5 flex-1 flex items-center justify-center">
            <div className="glass-card p-5 max-w-md w-full text-center">
              <p className="mb-3 text-sm">Статья не найдена</p>
              <button
                onClick={() => (window.location.href = "/tips")}
                className="inline-flex items-center gap-2 text-sm text-[var(--accent)] underline underline-offset-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад к советам
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const locked = !!tip.proOnly && !isPro;

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        {/* та же шапка, что и в других разделах */}
        <PageHeader
          title="Совет"
          backHref="/tips"
          rightSlot={
            <div className="flex flex-col items-end gap-1 text-[10px] text-white/85">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/16">
                <BookOpenText className="w-3 h-3 text-emerald-300" />
                {CATEGORY_LABELS[tip.category]}
              </span>
              <span>~{tip.readingTime}</span>
            </div>
          }
        />

        <main className="max-w-xl mx-auto px-3 sm:px-4 md:px-0 pt-3 flex-1">
          <motion.article
            className="glass-card p-5 mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                  <BookOpenText className="w-4 h-4 text-emerald-500" />
                  <span>
                    Совет по{" "}
                    {CATEGORY_LABELS[tip.category].toLowerCase()}
                  </span>
                </span>
                {tip.badge && (
                  <span className="px-2 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border-soft)] text-[10px] text-[var(--text-secondary)] inline-block w-fit">
                    {tip.badge}
                  </span>
                )}
              </div>

              {tip.proOnly && (
                <span className="px-2 py-1 rounded-full text-[10px] bg-purple-600/90 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  PRO
                </span>
              )}
            </div>

            <h1 className="text-xl font-semibold mb-1">{tip.title}</h1>
            {tip.subtitle && (
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {tip.subtitle}
              </p>
            )}

            {locked ? (
              <div className="mt-4 p-4 rounded-xl bg-black/40 border border-purple-500/60 flex items-start gap-3 text-sm">
                <Lock className="w-5 h-5 text-purple-300 mt-0.5" />
                <div>
                  Это PRO-статья. Оформи PRO-тариф, чтобы прочитать её целиком
                  и открыть остальные закрытые материалы.
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-sm text-[var(--text-secondary)]">
                {tip.sections.map(
                  (section: TipSection, idx: number) => (
                    <div key={idx} className="space-y-1">
                      {section.heading && (
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                          {section.heading}
                        </h2>
                      )}
                      <p>{section.body}</p>
                    </div>
                  ),
                )}
              </div>
            )}
          </motion.article>
        </main>
      </div>
    </>
  );
}
