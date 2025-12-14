"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Search, Trash2, UtensilsCrossed } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import { meals, type MealRecipe, type MealType } from "../meal-data";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
  dessert: "Десерт",
};

// Основной ключ (мы будем писать сюда)
const FAVORITES_KEY = "fiteat_meals_favorites_v1";

// На всякий случай читаем ещё из возможных старых ключей
const LEGACY_KEYS = [
  "fit_eat_meals_favorites",
  "fiteat_favorites_meals",
  "favorites_meals",
  "meal_favorites",
  "meals_favorites",
];

function safeParseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function loadFavoriteSlugs(): string[] {
  if (typeof window === "undefined") return [];

  // 1) пробуем основной ключ
  const primary = safeParseStringArray(localStorage.getItem(FAVORITES_KEY));
  if (primary.length) return primary;

  // 2) пробуем старые ключи
  for (const k of LEGACY_KEYS) {
    const v = safeParseStringArray(localStorage.getItem(k));
    if (v.length) return v;
  }

  // 3) ничего не нашли
  return [];
}

function saveFavoriteSlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(slugs));
}

export default function FavoriteMealsPage() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFavoriteSlugs(loadFavoriteSlugs());
  }, []);

  const favoriteMeals: MealRecipe[] = useMemo(() => {
    const set = new Set(favoriteSlugs);
    const list = meals.filter((m) => set.has(m.slug));

    // сортировка: сначала как в избранном (по порядку сохранения)
    const order = new Map<string, number>();
    favoriteSlugs.forEach((s, idx) => order.set(s, idx));
    list.sort((a, b) => (order.get(a.slug) ?? 9999) - (order.get(b.slug) ?? 9999));

    return list;
  }, [favoriteSlugs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return favoriteMeals;

    return favoriteMeals.filter((m) => {
      const hay = `${m.title} ${m.subtitle ?? ""} ${MEAL_TYPE_LABELS[m.mealType]}`.toLowerCase();
      return hay.includes(q);
    });
  }, [favoriteMeals, search]);

  const clearFavorites = () => {
    setFavoriteSlugs([]);
    saveFavoriteSlugs([]);
  };

  const removeOne = (slug: string) => {
    const next = favoriteSlugs.filter((s) => s !== slug);
    setFavoriteSlugs(next);
    saveFavoriteSlugs(next);
  };

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24">
        <PageHeader
          title="Избранные рецепты"
          backHref="/meals"
          backLabel="К рецептам"
          rightSlot={
            <div className="inline-flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/16 text-[11px] font-medium text-white whitespace-nowrap flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {favoriteMeals.length}
              </span>

              {favoriteMeals.length > 0 && (
                <button
                  onClick={clearFavorites}
                  className="px-3 py-1 rounded-full bg-white/16 text-[11px] font-medium text-white whitespace-nowrap flex items-center gap-1 hover:bg-white/20"
                  title="Очистить избранное"
                >
                  <Trash2 className="w-3 h-3" />
                  Очистить
                </button>
              )}
            </div>
          }
        />

        <main className="px-3 sm:px-4 md:px-5 pt-3 flex flex-col gap-3">
          {/* Поиск */}
          <motion.section
            className="glass-card p-3 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border border-[var(--border-soft)] bg-[var(--surface)]">
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Поиск по избранным..."
                  className="bg-transparent outline-none text-xs flex-1 text-[var(--text-primary)]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)]">
              Здесь только те рецепты, которые ты добавил в избранное. Можно искать по названию и категории.
            </p>
          </motion.section>

          {/* Список */}
          {favoriteMeals.length === 0 ? (
            <section className="glass-card p-6 text-center">
              <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-[var(--text-secondary)]" />
              <h2 className="text-sm font-semibold mb-2">Пока пусто</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Открой любой рецепт и добавь в избранное — он появится здесь.
              </p>

              <Link
                href="/meals"
                className="inline-flex mt-4 text-xs font-semibold text-[var(--accent-gold)] underline underline-offset-4"
              >
                Перейти к рецептам
              </Link>
            </section>
          ) : filtered.length === 0 ? (
            <section className="glass-card p-6 text-center">
              <h2 className="text-sm font-semibold mb-2">Ничего не найдено</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Попробуй другой запрос.
              </p>
            </section>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-10">
              {filtered.map((m, idx) => {
                // Без "unknown" в JSX: всё строго string/number
                const kcal = m.baseCalories;
                const p = m.baseProtein;
                const f = m.baseFat;
                const c = m.baseCarbs;

                // imageUrl может появиться позже — безопасно достаём
                const imageUrl = typeof (m as any).imageUrl === "string" ? ((m as any).imageUrl as string) : "";

                return (
                  <motion.article
                    key={m.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card overflow-hidden border border-[var(--border-soft)] hover:border-[var(--accent)]/60 transition"
                  >
                    <Link href={`/meals/${m.slug}`} className="block">
                      <div className="h-36 bg-[var(--surface-muted)] border-b border-[var(--border-soft)] flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imageUrl} alt={m.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center px-4">
                            <UtensilsCrossed className="w-6 h-6 mx-auto mb-1 text-[var(--text-secondary)]" />
                            <p className="text-[11px] text-[var(--text-secondary)]">Фото появится позже</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase text-[var(--text-muted)]">
                              {MEAL_TYPE_LABELS[m.mealType]}
                            </div>
                            <h3 className="text-sm font-semibold truncate">{m.title}</h3>
                            {m.subtitle ? (
                              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                                {String(m.subtitle)}
                              </p>
                            ) : null}
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeOne(m.slug);
                            }}
                            className="shrink-0 px-2.5 py-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]"
                            title="Убрать из избранного"
                          >
                            <Heart className="w-4 h-4 text-[var(--accent-gold)]" />
                          </button>
                        </div>

                        <div className="rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
                          <div className="font-semibold text-[var(--text-primary)]">
                            ≈ {kcal} ккал
                          </div>
                          <div className="mt-1">
                            Б {p}г · Ж {f}г · У {c}г
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
