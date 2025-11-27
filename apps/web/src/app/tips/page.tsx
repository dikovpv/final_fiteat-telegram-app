"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpenText, Lock, Sparkles } from "lucide-react";

import { TIPS, type TipItem } from "../../lib/tips-data";
import { getUserPlan, type PlanType } from "@/lib/user-plan";

type TipCategory = "all" | "nutrition" | "training" | "health" | "mindset";

const CATEGORIES: { id: TipCategory; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "nutrition", label: "Питание" },
  { id: "training", label: "Тренировки" },
  { id: "health", label: "Здоровье" },
  { id: "mindset", label: "Общее" },
];

export default function TipsPage() {
  const [plan, setPlan] = useState<PlanType>("free");
  const [activeCategory, setActiveCategory] = useState<TipCategory>("all");
  const [search, setSearch] = useState("");

  // читаем текущий план через единую систему планов
  useEffect(() => {
    const current = getUserPlan();
    setPlan(current);
  }, []);

  const isPro = plan === "pro";

  const filteredTips = useMemo(() => {
    return TIPS.filter((t: TipItem) => {
      if (activeCategory !== "all" && t.category !== activeCategory) {
        return false;
      }

      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const haystack = `${t.title} ${t.subtitle ?? ""} ${t.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0b1020] to-[#050816] text-white pb-24 px-4 pt-6">
      <div className="cosmic-bg"></div>

      {/* Хедер */}
      <motion.div
        className="glass-card p-4 mb-4 sticky top-0 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold neon-text-teal flex items-center gap-2 mb-2">
          <BookOpenText className="w-6 h-6" />
          Советы
        </h1>
        <p className="text-sm text-gray-400 mb-2">
          Статьи про питание, тренировки, здоровье и голову — коротко и по делу.
        </p>
        <p className="text-xs text-gray-500 mb-2">
          Твой тариф:{" "}
          <span
            className={
              isPro ? "text-emerald-400 font-semibold" : "text-gray-300"
            }
          >
            {isPro ? "FitEat PRO" : "Бесплатный"}
          </span>
        </p>

        {/* поиск */}
        <div className="mt-2">
          <input
            type="text"
            placeholder="Поиск по советам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* навигация по категориям */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
                  isActive
                    ? "bg-teal-500/90 border-teal-300 text-black font-semibold"
                    : "bg-black/30 border-gray-600 text-gray-300 hover:border-teal-400 hover:text-teal-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* список статей */}
      <div className="space-y-3">
        {filteredTips.map((tip: TipItem) => {
          const locked = tip.proOnly && !isPro;

          const card = (
            <div className="glass-card p-4 border border-gray-700 hover:border-teal-400/60 transition-all relative cursor-pointer">
              <h2 className="text-base font-semibold mb-1">{tip.title}</h2>

              {tip.subtitle && (
                <p className="text-xs text-gray-400 mb-2">{tip.subtitle}</p>
              )}

              <p className="text-[11px] text-gray-500">
                {(() => {
                  switch (tip.category) {
                    case "nutrition":
                      return "Питание";
                    case "training":
                      return "Тренировки";
                    case "health":
                      return "Здоровье";
                    case "mindset":
                      return "Общее";
                    default:
                      return "";
                  }
                })()}
              </p>

              {tip.proOnly && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] bg-purple-600/90 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  PRO
                </div>
              )}

              {locked && (
                <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Lock className="w-6 h-6 text-purple-200" />
                  <p className="text-xs text-gray-200 px-4 text-center">
                    Это PRO-статья. Оформи PRO-тариф, чтобы открыть.
                  </p>
                </div>
              )}
            </div>
          );

          // если статья заблокирована — ведём на страницу PRO-плана
          const href = locked ? "/pro" : `/tips/${tip.slug}`;

          return (
            <Link key={tip.slug} href={href} className="block">
              {card}
            </Link>
          );
        })}

        {filteredTips.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-8">
            Ничего не нашлось под этот фильтр. Попробуй другую категорию или
            запрос.
          </div>
        )}
      </div>
    </div>
  );
}
