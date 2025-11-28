"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Plus, Search } from "lucide-react";
import { meals as BASE_MEALS, computeMealNutrition } from "../../meals/meals-data";
import { MealData } from "../../../types/meal";
import {
  DEFAULT_ENTRY,
  DIARY_SELECTED_DATE_KEY,
  DIARY_STORAGE_PREFIX,
  type DiaryEntry,
} from "../diary-types";

interface AddMealModalProps {
  onClose: () => void;
  onSave: (meal: MealData) => void;
  // список готовых блюд из основного раздела "Питание"
  // можно не передавать — тогда вкладка "Рецепты" не показывается
  readyMeals?: MealData[];
}

export default function AddMealModal({
  onClose,
  onSave,
  readyMeals = [],
}: AddMealModalProps) {

  const baseMeals = useMemo<MealData[]>(
    () =>
      BASE_MEALS.map((recipe) => {
        const nutrition = computeMealNutrition(recipe);

        return {
          id: recipe.slug,
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

  const mergeMeals = (...lists: MealData[][]) => {
    const map = new Map<string, MealData>();

    lists.flat().forEach((meal) => {
      const id = (meal as any)?.id || (meal as any)?.slug || meal.title;
      if (id) map.set(id, meal);
    });

    return Array.from(map.values());
  };

  const [availableMeals, setAvailableMeals] = useState<MealData[]>([]);


  const hasReadyMeals = availableMeals.length > 0;

  const [tab, setTab] = useState<"ready" | "favorites" | "added" | "manual">(
    hasReadyMeals ? "ready" : "favorites"
  );

  const [form, setForm] = useState<MealData>({
    title: "",
    calories: undefined,
    protein: undefined,
    fat: undefined,
    carbs: undefined,
  });

  const [favorites, setFavorites] = useState<MealData[]>([]);
  const [addedMeals, setAddedMeals] = useState<MealData[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Категории (по типу приема пищи)
  const categories = [
    { id: "all", name: "Все", icon: "🍽️" },
    { id: "breakfast", name: "Завтрак", icon: "🍳" },
    { id: "lunch", name: "Обед", icon: "🥗" },
    { id: "dinner", name: "Ужин", icon: "🍲" },
    { id: "snack", name: "Перекус", icon: "🍎" },
    { id: "dessert", name: "Десерт", icon: "🧁" },
  ];

  // Фильтрация готовых блюд из приложения
  const filteredMeals = useMemo(
    () =>
      hasReadyMeals
        ? availableMeals.filter((meal) => {
            const matchesSearch = (meal.title || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

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

  // Загрузка локальных избранных и своих блюд
  useEffect(() => {
    try {
      const fav = localStorage.getItem("fitEatFavorites");
      const added = localStorage.getItem("fitEatAddedMeals");
      if (fav) setFavorites(JSON.parse(fav));
      if (added) setAddedMeals(JSON.parse(added));
    } catch {
      // тихо игнорируем
    }
  }, []);

  // Загружаем блюда из дневника для выбранной даты, если модалка открыта отдельно
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
      const meals = Array.isArray(parsed.meals) ? parsed.meals : [];

      setAvailableMeals((prev) => mergeMeals(baseMeals, readyMeals, prev, meals));
    } catch {
      // игнорируем, чтобы не ломать модалку при проблемах с localStorage
    }
  }, [baseMeals, readyMeals]);

  // Следим за внешними изменениями, чтобы подхватывать актуальные блюда
  useEffect(() => {
    setAvailableMeals((prev) => mergeMeals(baseMeals, readyMeals, prev));
  }, [baseMeals, readyMeals]);


  // Если после загрузки появились готовые блюда — переключаем вкладку
  useEffect(() => {
    if (hasReadyMeals && tab !== "ready") {
      setTab("ready");
    }
  }, [hasReadyMeals, tab]);

  const saveFavorites = (data: MealData[]) => {
    try {
      localStorage.setItem("fitEatFavorites", JSON.stringify(data));
    } catch {
      // игнор
    }
  };

  const saveAddedMeals = (data: MealData[]) => {
    try {
      localStorage.setItem("fitEatAddedMeals", JSON.stringify(data));
    } catch {
      // игнор
    }
  };

  const toggleFavorite = (meal: MealData) => {
    const exists = favorites.find((f) => f.title === meal.title);
    const updated = exists
      ? favorites.filter((f) => f.title !== meal.title)
      : [...favorites, meal];
    setFavorites(updated);
    saveFavorites(updated);
  };

  const handleDeleteAdded = (meal: MealData) => {
    const updated = addedMeals.filter((m) => m.title !== meal.title);
    setAddedMeals(updated);
    saveAddedMeals(updated);
  };

  const handleChange = (e: any) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "number" && e.target.value !== ""
          ? parseFloat(e.target.value)
          : e.target.value === ""
          ? undefined
          : e.target.value,
    }));

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 350);
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

  // Вкладки динамически: скрываем "Рецепты", если нет readyMeals
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeWithAnimation}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-t-3xl shadow-2xl h-[90vh] flex flex-col border border-gray-700"
          >
            {/* Верхняя панель */}
            <div className="flex justify-center items-center relative border-b border-gray-700 py-4">
              <button
                onClick={closeWithAnimation}
                className="absolute left-6 text-gray-400 hover:text-white text-xl transition"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-white">Добавить блюдо</h2>
            </div>

            {/* Вкладки */}
            <div className="flex border-b border-gray-700 text-sm font-medium overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-3 px-2 transition whitespace-nowrap ${
                    tab === t.key
                      ? "border-b-2 border-teal-400 text-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Поиск и фильтры для вкладки "Рецепты" */}
              {tab === "ready" && hasReadyMeals && (
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск блюд..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
                          selectedCategory === cat.id
                            ? "bg-teal-500 text-black"
                            : "bg-black/30 text-gray-400 hover:bg-black/50"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Содержимое вкладок */}
              {tab === "ready" && hasReadyMeals && (
                <div className="space-y-3">
                  {filteredMeals.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">Блюда не найдены</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Попробуйте изменить поиск или фильтр
                      </p>
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

              {tab === "favorites" && (
                <motion.div
                  key="fav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {favorites.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 mb-2">
                        Здесь появятся ваши любимые блюда
                      </p>
                      <p className="text-sm text-gray-500">
                        ❤️ Добавляйте блюда в избранное для быстрого доступа
                      </p>
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
                        isFavorite={true}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {tab === "added" && (
                <motion.div
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {addedMeals.length === 0 ? (
                    <div className="text-center py-8">
                      <Plus className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 mb-2">
                        Здесь появятся ваши блюда
                      </p>
                      <p className="text-sm text-gray-500">
                        🍳 Добавляйте блюда вручную и они сохранятся здесь
                      </p>
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
                        onDelete={() => handleDeleteAdded(meal)}
                        isFavorite={favorites.some(
                          (f) => f.title === meal.title
                        )}
                        showDelete
                      />
                    ))
                  )}
                </motion.div>
              )}

              {tab === "manual" && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <Plus className="w-12 h-12 mx-auto mb-3 text-teal-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Добавить блюдо вручную
                    </h3>
                    <p className="text-sm text-gray-400">
                      Введите данные блюда и оно сохранится в вашем списке
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Название блюда *
                    </label>
                    <input
                      name="title"
                      type="text"
                      placeholder="Например: Курица с рисом"
                      value={form.title || ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Калории (ккал)
                    </label>
                    <input
                      name="calories"
                      type="number"
                      placeholder="Например: 450"
                      value={form.calories ?? ""}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "protein", name: "Белки (г)" },
                      { key: "fat", name: "Жиры (г)" },
                      { key: "carbs", name: "Углеводы (г)" },
                    ].map((macro) => (
                      <div key={macro.key}>
                        <label className="block text-sm text-gray-300 mb-2">
                          {macro.name}
                        </label>
                        <input
                          name={macro.key}
                          type="number"
                          placeholder="0"
                          value={(form as any)[macro.key] ?? ""}
                          onChange={handleChange}
                          className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleManualSave}
                    className="w-full mt-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 transition-all"
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

// Компонент элемента блюда
function MealItem({
  meal,
  onSelect,
  onFavorite,
  isFavorite,
  showDelete = false,
  onDelete,
}: {
  meal: MealData;
  onSelect: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="border border-gray-600 rounded-xl p-3 hover:border-teal-400 transition-all cursor-pointer bg-black/20 hover:bg-black/30"
    >
      <div className="flex justify-between items-start" onClick={onSelect}>
        <div className="flex-1">
          <p className="font-semibold text-white mb-1">{meal.title}</p>
          <p className="text-xs text-gray-400">
            {meal.calories || 0} ккал • Б {meal.protein || 0}г • Ж{" "}
            {meal.fat || 0}г • У {meal.carbs || 0}г
          </p>
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="text-gray-400 hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "text-red-500 fill-red-500" : "hover:text-red-400"
              }`}
            />
          </button>

          {showDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-gray-400 hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
