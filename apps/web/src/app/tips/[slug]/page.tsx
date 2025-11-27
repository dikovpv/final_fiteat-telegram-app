// apps/web/src/app/tips/[slug]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpenText, Lock, Sparkles } from "lucide-react";

import { TIPS, type TipItem } from "../../../lib/tips-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

export default function TipPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();

  const [plan, setPlan] = useState<PlanType>("free");

  useEffect(() => {
    const current = getUserPlan();
    setPlan(current);
  }, []);

  const isPro = plan === "pro";

  const tip = useMemo<TipItem | undefined>(
    () => TIPS.find((t: TipItem) => t.slug === params.slug),
    [params.slug]
  );

  if (!tip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <p className="mb-4">Статья не найдена</p>
        <Link href="/tips" className="cosmic-button">
          Назад к советам
        </Link>
      </div>
    );
  }

  const locked = tip.proOnly && !isPro;

  const contentBlocks = Array.isArray(tip.content)
    ? tip.content
    : [tip.content];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0b1020] to-[#050816] text-white pb-24">
      <div className="cosmic-bg"></div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-300 mb-4 hover:text-teal-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <motion.div
          className="glass-card p-5 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BookOpenText className="w-4 h-4 text-teal-300" />
              Совет
            </div>
            {tip.proOnly && (
              <div className="px-2 py-1 rounded-full text-[10px] bg-purple-600/90 text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                PRO
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-1">{tip.title}</h1>
          {tip.subtitle && (
            <p className="text-sm text-gray-400 mb-3">{tip.subtitle}</p>
          )}

          {locked ? (
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-purple-500/60 flex items-start gap-3 text-sm">
              <Lock className="w-5 h-5 text-purple-300 mt-0.5" />
              <div>
                Это PRO-статья. Оформи PRO-тариф, чтобы прочитать её целиком.
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-gray-200">
              {contentBlocks.map((block, idx) => (
                <p key={idx}>{block}</p>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
