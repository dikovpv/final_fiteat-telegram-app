"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  Plus,
  Search,
  X,
  UtensilsCrossed,
} from "lucide-react";

import {
  meals as BASE_MEALS,
  computeMealNutrition,
} from "../../meals/meals-data";
import type { MealData } from "../../../types/meal";

import {
  DEFAULT_ENTRY,
  DIARY_SELECTED_DATE_KEY,
  DIARY_STORAGE_PREFIX,
  type DiaryEntry,
} from "../diary-types";

interface AddMealModalProps {
  onClose: () => void;
  onSave: (meal: MealData) => void;
  // блюда из основной «Питания» / дневника
  readyMeals?: MealData[];
}

const ACCENT_GOLD = "var(--accent-gold)";

type AnyMeal = MealData & {
  slug?: string;
  type?: string;
  category?: string;
};

export default function AddMealModal({
  onClose,
  onSave,
  readyMeals = [],
}: AddMealModalProps) {
  // базовые блюда из книги рецептов
  const baseMeals = useMemo<AnyMeal[]>(
    () =>
      BASE_MEALS.map((recipe) => {
        const nutrition = computeMealNutrition(recipe);
        return {
          id: recipe.slug,
          slug: recipe.slug,
          title: recipe.title,
          calories: Math.round(nutrition.perPortionCalories),
          protein: Math.round(nutrition.perPortionProtein),
          fat: Math.round(nutrition.perPortionFat),
          carbs: Math.round(nutrition.perPortionCarbs),
          type: recipe.mealType,
          category: recipe.mealType,
        };
      }),
    []
  );

  const mergeMeals = (...lists: AnyMeal[][]): AnyMeal[] => {
    const map = new Map<string, AnyMeal>();

    lists.flat().forEach((meal) => {
      if (!meal) return;
      const id = (meal as any).id || (meal as any).slug || meal.title;
      if (id) map.set(id, meal);
    });

    return Array.from(map.values());
  };

  const [availableMeals, setAvailableMeals] = useState<AnyMeal[]>(() =>
    mergeMeals(baseMeals, readyMeals as AnyMeal[])
  );

  const hasReadyMeals = availableMeals.length > 0;

  const [tab, setTab] = useState<"ready" | "favorites" | "added" | "manual">(
    hasReadyMeals ? "ready" : "manual"
  );

  const [form, setForm] = useState<MealData>({
    title: "",
    calories: undefined,
    protein: undefined,
    fat: undefined,
    carbs: undefined,
  });

  const [favorites, setFavorites] = useState<AnyMeal[]>([]);
  const [addedMeals, setAddedMeals] = useState<AnyMeal[]>([]);
  const [isClosing, setIsClosing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "Все", icon: "🍽️" },
    { id: "breakfast", name: "Завтрак", icon: "🍳" },
    { id: "lunch", name: "Обед", icon: "🥗" },
    { id: "dinner", name: "Ужин", icon: "🍲" },
    { id: "snack", name: "Перекус", icon: "🍎" },
    { id: "dessert", name: "Десерт", icon: "🧁" },
  ];

  // фильтр блюд для вкладки «Рецепты»
  const filteredMeals = useMemo(
    () =>
      hasReadyMeals
        ? availableMeals.filter((meal) => {
            const title = (meal.title || "").toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = title.includes(query);

            const mealType =
              (meal as any).type ||
              (meal as any).mealType ||
              (meal as any).category ||
              "other";

            const matchesCategory =
              selectedCategory === "all" || mealType === selectedCategory;

            return matchesSearch && matchesCategory;
          })
        : [],
    [availableMeals, hasReadyMeals, searchQuery, selectedCategory]
  );

  // загружаем избранное и свои блюда
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const fav = localStorage.getItem("fitEatFavorites");
      const added = localStorage.getItem("fitEatAddedMeals");
      if (fav) setFavorites(JSON.parse(fav));
      if (added) setAddedMeals(JSON.parse(added));
    } catch {
      /* ignore */
    }
  }, []);

  // подмешиваем блюда из дневника по выбранной дате
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const selectedDate =
        localStorage.getItem(DIARY_SELECTED_DATE_KEY) ||
        new Date().toISOString().split("T")[0];
      const key = `${DIARY_STORAGE_PREFIX}${selectedDate}`;
      const saved = localStorage.getItem(key);
      if (!saved) return;

      const parsed: DiaryEntry = { ...DEFAULT_ENTRY, ...JSON.parse(saved) };
      const meals: AnyMeal[] = Array.isArray(parsed.meals)
        ? (parsed.meals as any)
        : [];

      setAvailableMeals((prev) =>
        mergeMeals(baseMeals, readyMeals as AnyMeal[], prev, meals)
      );
    } catch {
      /* ignore */
    }
  }, [baseMeals, readyMeals]);

  // следим за изменением readyMeals
  useEffect(() => {
    setAvailableMeals((prev) =>
      mergeMeals(baseMeals, readyMeals as AnyMeal[], prev)
    );
  }, [baseMeals, readyMeals]);

  // >>> ВАЖНО: убрали эффект, который насильно выкидывал с вкладки "Вручную"
  // useEffect(() => {
  //   if (hasReadyMeals && tab === "manual") {
  //     setTab("ready");
  //   }
  // }, [hasReadyMeals, tab]);

  const saveFavorites = (data: AnyMeal[]) => {
    try {
      localStorage.setItem("fitEatFavorites", JSON.stringify(data));
    } catch {
      /* ignore */
    }
  };

  const saveAddedMeals = (data: AnyMeal[]) => {
    try {
      localStorage.setItem("fitEatAddedMeals", JSON.stringify(data));
    } catch {
      /* ignore */
    }
  };

  const toggleFavorite = (meal: AnyMeal) => {
    const exists = favorites.find((f) => f.title === meal.title);
    const updated = exists
      ? favorites.filter((f) => f.title !== meal.title)
      : [...favorites, meal];
    setFavorites(updated);
    saveFavorites(updated);
  };

  const handleDeleteAdded = (meal: AnyMeal) => {
    const updated = addedMeals.filter((m) => m.title !== meal.title);
    setAddedMeals(updated);
    saveAddedMeals(updated);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number" && value !== ""
          ? parseFloat(value)
          : value === ""
          ? undefined
          : value,
    }));
  };

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 250);
  };

  const handleManualSave = () => {
    if (!form.title?.trim()) {
      alert("Введите название блюда");
      return;
    }

    const newMeal: MealData = {
      ...form,
      title: form.title.trim(),
    };

    const updated = [...addedMeals, newMeal];
    setAddedMeals(updated);
    saveAddedMeals(updated);
    onSave(newMeal);
    closeWithAnimation();
  };

  const tabs: { key: typeof tab; label: string }[] = [
    ...(hasReadyMeals ? [{ key: "ready" as const, label: "Рецепты" }] : []),
    { key: "favorites", label: "Избранное" },
    { key: "added", label: "Мои блюда" },
    { key: "manual", label: "Вручную" },
  ];

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeWithAnimation}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Золотая шапка */}
            <div
              className="px-5 py-4 flex items-center justify-between text-white"
              style={{ backgroundColor: ACCENT_GOLD }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    Добавить блюдо
                  </h2>
                  <p className="text-xs sm:text-[13px] text-white/85">
                    Выберите из рецептов или добавьте своё блюдо.
                  </p>
                </div>
              </div>
              <button
                onClick={closeWithAnimation}
                className="p-1 rounded-full hover:bg-black/10 transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Контент модалки */}
            <div className="px-5 pt-3 pb-5 max-h-[80vh] overflow-y-auto">
              {/* Вкладки — всегда видны */}
              <div className="flex border-b border-[var(--border-soft)] text-sm font-medium overflow-x-auto mb-3">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`relative px-3 py-2 whitespace-nowrap transition-colors ${
                      tab === t.key
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                    style={
                      tab === t.key
                        ? { color: ACCENT_GOLD }
                        : undefined
                    }
                  >
                    {t.label}
                    {tab === t.key && (
                      <span
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                        style={{ backgroundColor: ACCENT_GOLD }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Поиск + категории для «Рецептов» */}
              {tab === "ready" && hasReadyMeals && (
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Поиск блюд..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-transparent"
                      style={{
                        outlineColor: ACCENT_GOLD,
                        boxShadow: "0 0 0 1px transparent",
                      }}
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map((cat) => {
                      const active = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition ${
                            active
                              ? "text-white"
                              : "bg-[var(--surface)] border-[var(--border-soft)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                          }`}
                          style={
                            active
                              ? {
                                  backgroundColor: ACCENT_GOLD,
                                  borderColor: ACCENT_GOLD,
                                }
                              : undefined
                          }
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Рецепты */}
              {tab === "ready" && hasReadyMeals && (
                <div className="space-y-3">
                  {filteredMeals.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                      <Search className="w-10 h-10 mx-auto mb-2 text-[var(--border-soft)]" />
                      Блюда не найдены. Попробуйте изменить поиск или фильтр.
                    </div>
                  ) : (
                    filteredMeals.map((meal, i) => (
                      <MealItem
                        key={i}
                        meal={meal}
                        onSelect={() => {
                          onSave(meal);
                          setTimeout(() => closeWithAnimation(), 10);
                        }}
                        onFavorite={() => toggleFavorite(meal)}
                        isFavorite={favorites.some(
                          (f) => f.title === meal.title
                        )}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Избранное */}
              {tab === "favorites" && (
                <motion.div
                  key="fav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {favorites.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                      <Heart className="w-10 h-10 mx-auto mb-2 text-[var(--border-soft)]" />
                      Здесь появятся ваши любимые блюда.
                    </div>
                  ) : (
                    favorites.map((meal, i) => (
                      <MealItem
                        key={i}
                        meal={meal}
                        onSelect={() => {
                          onSave(meal);
                          setTimeout(() => closeWithAnimation(), 10);
                        }}
                        onFavorite={() => toggleFavorite(meal)}
                        isFavorite
                      />
                    ))
                  )}
                </motion.div>
              )}

              {/* Мои блюда */}
              {tab === "added" && (
                <motion.div
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {addedMeals.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                      <Plus className="w-10 h-10 mx-auto mb-2 text-[var(--border-soft)]" />
                      Здесь появятся блюда, которые вы добавите вручную.
                    </div>
                  ) : (
                    addedMeals.map((meal, i) => (
                      <MealItem
                        key={i}
                        meal={meal}
                        onSelect={() => {
                          onSave(meal);
                          setTimeout(() => closeWithAnimation(), 10);
                        }}
                        onFavorite={() => toggleFavorite(meal)}
                        isFavorite={favorites.some(
                          (f) => f.title === meal.title
                        )}
                        showDelete
                        onDelete={() => handleDeleteAdded(meal)}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {/* Вручную */}
              {tab === "manual" && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-[var(--text-secondary)]">
                    Добавьте своё блюдо с любыми КБЖУ. Его можно будет выбрать
                    в дневнике в разделах «Мои блюда» и «Избранное».
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-primary)]">
                      Название блюда *
                    </label>
                    <input
                      name="title"
                      type="text"
                      placeholder="Например: Курица с рисом"
                      value={form.title || ""}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                      style={{ outlineColor: ACCENT_GOLD }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-primary)]">
                      Калории (ккал)
                    </label>
                    <input
                      name="calories"
                      type="number"
                      placeholder="Например: 450"
                      value={form.calories ?? ""}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                      style={{ outlineColor: ACCENT_GOLD }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "protein", label: "Белки (г)" },
                      { key: "fat", label: "Жиры (г)" },
                      { key: "carbs", label: "Углеводы (г)" },
                    ].map((macro) => (
                      <div key={macro.key}>
                        <label className="block text-sm mb-1 text-[var(--text-primary)]">
                          {macro.label}
                        </label>
                        <input
                          name={macro.key}
                          type="number"
                          placeholder="0"
                          value={(form as any)[macro.key] ?? ""}
                          onChange={handleFormChange}
                          className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                          style={{ outlineColor: ACCENT_GOLD }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSave}
                    className="w-full mt-2 rounded-xl text-white text-sm font-semibold py-2.5 hover:brightness-105 transition"
                    style={{ backgroundColor: ACCENT_GOLD }}
                  >
                    Добавить в рацион
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// карточка блюда
function MealItem({
  meal,
  onSelect,
  onFavorite,
  isFavorite,
  showDelete = false,
  onDelete,
}: {
  meal: AnyMeal;
  onSelect: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className="border border-[var(--border-soft)] rounded-xl px-3.5 py-3 bg-[var(--surface)] hover:border-[var(--border-strong)] transition cursor-pointer"
      style={{ borderColor: "var(--border-soft)" }}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">
            {meal.title}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {meal.calories || 0} ккал • Б {meal.protein || 0}г • Ж{" "}
            {meal.fat || 0}г • У {meal.carbs || 0}г
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="p-1 rounded-full hover:bg-[var(--surface-muted)] transition"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite
                  ? "text-red-500 fill-red-500"
                  : "text-[var(--text-tertiary)]"
              }`}
            />
          </button>

          {showDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded-full hover:bg-[var(--surface-muted)] text-[var(--danger)] transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
