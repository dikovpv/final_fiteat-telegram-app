"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft } from "lucide-react";

import recipesData from "../../data/recipesData";
import type { MealRecipe } from "../meal-data";

const STORAGE_KEY = "favoriteRecipes"; // оставим твой ключ, но теперь храним slugs

function getRecipeSlug(r: MealRecipe): string {
  // slug у тебя используется в роутинге — делаем его главным идентификатором
  // (если вдруг в каких-то данных slug пустой — подстрахуемся)
  const anyR = r as any;
  return (anyR.slug ?? anyR.id ?? anyR.key ?? "") as string;
}

function getRecipeTitle(r: MealRecipe): string {
  const anyR = r as any;
  return (anyR.title ?? anyR.name ?? "Рецепт") as string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setFavoriteSlugs(Array.isArray(arr) ? arr.filter(Boolean) : []);
    } catch {
      setFavoriteSlugs([]);
    }
  }, []);

  const favoriteRecipes: MealRecipe[] = useMemo(() => {
    const set = new Set(favoriteSlugs);
    return (recipesData as MealRecipe[]).filter((r) => {
      const slug = getRecipeSlug(r);
      return slug && set.has(slug);
    });
  }, [favoriteSlugs]);

  const removeFavorite = (slug: string) => {
    const next = favoriteSlugs.filter((s) => s !== slug);
    setFavoriteSlugs(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="cosmic-bg" />

      <div className="relative z-10 p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <button
            onClick={() => router.push("/meals")}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>

          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-pink-400 fill-current" />
            <h1 className="text-xl font-semibold">Избранное</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {favoriteRecipes.length} рецептов
          </p>
        </motion.div>

        {favoriteRecipes.length === 0 ? (
          <div className="glass-card p-5 text-center">
            <div className="text-4xl mb-2">💔</div>
            <div className="text-sm font-semibold">Нет избранных рецептов</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              Добавляй блюда в избранное — они появятся здесь.
            </div>

            <button
              onClick={() => router.push("/meals")}
              className="cosmic-button mt-4 w-full"
            >
              Перейти к рецептам
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteRecipes.map((recipe, index) => {
              const slug = getRecipeSlug(recipe);
              const title = getRecipeTitle(recipe);

              return (
                <motion.div
                  key={slug || `${title}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="glass-card p-4 flex items-center justify-between gap-3"
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => slug && router.push(`/meals/${slug}`)}
                  >
                    <div className="text-sm font-semibold">{title}</div>
                    {(recipe as any).mealType && (
                      <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                        {(recipe as any).mealType}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => slug && removeFavorite(slug)}
                    className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border-soft)] text-pink-400 hover:opacity-80 transition"
                    title="Убрать из избранного"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
