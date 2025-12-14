"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { TIPS, CATEGORY_LABELS, type TipItem } from "../tips-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

function renderTipContent(tip: TipItem) {
  const anyTip = tip as any;

  // 1) content: string
  if (typeof anyTip.content === "string" && anyTip.content.trim()) {
    return (
      <div className="prose prose-sm max-w-none prose-invert">
        {anyTip.content.split("\n").filter(Boolean).map((p: string, idx: number) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    );
  }

  // 2) content: string[]
  if (Array.isArray(anyTip.content) && anyTip.content.every((x: any) => typeof x === "string")) {
    return (
      <div className="space-y-3 text-sm text-[var(--text-primary)]">
        {anyTip.content.map((p: string, idx: number) => (
          <p key={idx} className="leading-relaxed">{p}</p>
        ))}
      </div>
    );
  }

  // 3) blocks: [{type, ...}]
  if (Array.isArray(anyTip.blocks)) {
    return (
      <div className="space-y-3 text-sm text-[var(--text-primary)]">
        {anyTip.blocks.map((b: any, idx: number) => {
          if (!b) return null;

          if (b.type === "h2") {
            return <h2 key={idx} className="text-base font-semibold mt-3">{b.text}</h2>;
          }

          if (b.type === "p") {
            return <p key={idx} className="leading-relaxed">{b.text}</p>;
          }

          if (b.type === "ul" && Array.isArray(b.items)) {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1">
                {b.items.map((it: string, i: number) => <li key={i}>{it}</li>)}
              </ul>
            );
          }

          if (b.type === "quote") {
            return (
              <div key={idx} className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] text-[var(--text-secondary)]">
                {b.text}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }

  // 4) fallback
  return (
    <div className="text-sm text-[var(--text-secondary)]">
      Текст совета будет добавлен чуть позже.
    </div>
  );
}

export default function TipsDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanType>("free");

  useEffect(() => {
    setPlan(getUserPlan());
  }, []);

  const tip = useMemo(() => TIPS.find((t) => t.slug === slug), [slug]);

  // если вдруг slug странный — вернем на список
  useEffect(() => {
    if (!tip) router.replace("/tips");
  }, [tip, router]);

  if (!tip) return null;

  const isPro = plan === "pro";
  const locked = !!tip.proOnly && !isPro;

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 flex flex-col">
        <PageHeader
          title="Советы"
          backHref="/tips"
          rightSlot={
            tip.proOnly ? (
              <span className="px-3 py-1 rounded-full bg-purple-600/90 text-[11px] font-medium text-white whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                PRO
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-white/16 text-[11px] font-medium text-white whitespace-nowrap">
                {CATEGORY_LABELS[tip.category]}
              </span>
            )
          }
        />

        <main className="px-3 sm:px-4 md:px-5 pt-3 flex flex-col gap-3">
          <motion.section
            className="glass-card p-4 space-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/tips"
              className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к списку
            </Link>

            <h1 className="text-lg font-semibold leading-snug">{tip.title}</h1>

            {tip.subtitle && (
              <p className="text-sm text-[var(--text-secondary)]">{tip.subtitle}</p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <span className="px-2 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border-soft)]">
                {CATEGORY_LABELS[tip.category]}
              </span>
              <span>~{tip.readingTime}</span>
              {tip.badge && <span>· {tip.badge}</span>}
            </div>
          </motion.section>

          <motion.section
            className="glass-card p-4 relative overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {renderTipContent(tip)}

            {locked && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center">
                <Lock className="w-6 h-6 text-purple-200" />
                <p className="text-[12px] text-gray-100">
                  Это PRO-материал. Оформи PRO-тариф, чтобы открыть полный текст.
                </p>
                <Link
                  href="/pro"
                  className="px-4 py-2 rounded-xl bg-[var(--accent-gold)] text-white text-sm font-semibold hover:brightness-105"
                >
                  Открыть PRO
                </Link>
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </>
  );
}
