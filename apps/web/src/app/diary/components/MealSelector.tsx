"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Search, Filter, Clock, Zap } from "lucide-react";
import { MealData } from "../../../types/meal";

interface MealSelectorProps {
  onSelect: (meal: MealData) => void;
  onFavorite: (meal: MealData) => void;
  favorites: MealData[];
  showLikes?: boolean;
  disablePlus?: boolean;
}

export default function MealSelector({ 
  onSelect, 
  onFavorite, 
  favorites, 
  showLikes = false, 
  disablePlus = false 
}: MealSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMealType, setSelectedMealType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'calories' | 'protein' | 'name'>('name');

  // Категории блюд
  const categories = [
    { id: "all", name: "Все", icon: "🍽️", color: "text-gray-400" },
    { id: "breakfast", name: "Завтрак", icon: "🍳", color: "text-orange-400" },
    { id: "lunch", name: "Обед", icon: "🥗", color: "text-green-400" },
    { id: "dinner", name: "Ужин", icon: "🍲", color: "text-blue-400" },
    { id: "snack", name: "Перекус", icon: "🍎", color: "text-red-400" },
    { id: "protein", name: "Белковые", icon: "🥩", color: "text-purple-400" },
  ];

  // Типы блюд по времени
  const mealTypes = [
    { id: "all", name: "Любое время", icon: "⏰" },
    { id: "quick", name: "Быстрое", icon: "⚡" },
    { id: "prep", name: "Готовить заранее", icon: "🥘" },
  ];

  // База данных блюд с расширенной информацией
  const mealsDatabase: MealData[] = [
    // Завтраки
    { 
      title: "Овсянка с бананом и медом", 
      calories: 320, 
      protein: 12, 
      fat: 8, 
      carbs: 45, 
      category: "breakfast",
      time: "07:30"
    },
    { 
      title: "Яичница с тостами и авокадо", 
      calories: 380, 
      protein: 20, 
      fat: 18, 
      carbs: 35, 
      category: "breakfast",
      time: "08:00"
    },
    { 
      title: "Протеиновый коктейль с ягодами", 
      calories: 280, 
      protein: 25, 
      fat: 8, 
      carbs: 20, 
      category: "breakfast",
      time: "07:00"
    },
    { 
      title: "Греческий йогурт с гранолой", 
      calories: 250, 
      protein: 15, 
      fat: 10, 
      carbs: 25, 
      category: "breakfast",
      time: "08:15"
    },

    // Обеды
    { 
      title: "Курица гриль с овощами", 
      calories: 420, 
      protein: 35, 
      fat: 15, 
      carbs: 30, 
      category: "lunch",
      time: "13:00"
    },
    { 
      title: "Греческий салат с фетой", 
      calories: 320, 
      protein: 12, 
      fat: 22, 
      carbs: 15, 
      category: "lunch",
      time: "12:30"
    },
    { 
      title: "Суп с курицей и овощами", 
      calories: 280, 
      protein: 25, 
      fat: 8, 
      carbs: 30, 
      category: "lunch",
      time: "13:30"
    },
    { 
      title: "Тунец с рисом и овощами", 
      calories: 380, 
      protein: 30, 
      fat: 12, 
      carbs: 40, 
      category: "lunch",
      time: "14:00"
    },

    // Ужины
    { 
      title: "Лосось на гриле с брокколи", 
      calories: 450, 
      protein: 35, 
      fat: 20, 
      carbs: 15, 
      category: "dinner",
      time: "19:00"
    },
    { 
      title: "Куриная грудка с киноа", 
      calories: 380, 
      protein: 32, 
      fat: 12, 
      carbs: 35, 
      category: "dinner",
      time: "18:30"
    },
    { 
      title: "Овощной стир-фрай с тофу", 
      calories: 320, 
      protein: 18, 
      fat: 15, 
      carbs: 25, 
      category: "dinner",
      time: "19:30"
    },
    { 
      title: "Индейка с сладким картофелем", 
      calories: 400, 
      protein: 30, 
      fat: 15, 
      carbs: 30, 
      category: "dinner",
      time: "20:00"
    },

    // Перекусы
    { 
      title: "Творог с ягодами", 
      calories: 180, 
      protein: 20, 
      fat: 5, 
      carbs: 12, 
      category: "snack",
      time: "15:00"
    },
    { 
      title: "Яблоко с миндальным маслом", 
      calories: 200, 
      protein: 6, 
      fat: 12, 
      carbs: 18, 
      category: "snack",
      time: "16:00"
    },
    { 
      title: "Грецкие орехи", 
      calories: 160, 
      protein: 4, 
      fat: 16, 
      carbs: 4, 
      category: "snack",
      time: "11:00"
    },
    { 
      title: "Протеиновый батончик", 
      calories: 220, 
      protein: 15, 
      fat: 8, 
      carbs: 20, 
      category: "snack",
      time: "10:30"
    },

    // Белковые блюда
    { 
      title: "Стейк из говядины", 
      calories: 350, 
      protein: 40, 
      fat: 20, 
      carbs: 0, 
      category: "protein",
      time: "18:00"
    },
    { 
      title: "Креветки на гриле", 
      calories: 280, 
      protein: 35, 
      fat: 8, 
      carbs: 5, 
      category: "protein",
      time: "19:00"
    },
    { 
      title: "Яичный белковый омлет", 
      calories: 150, 
      protein: 25, 
      fat: 3, 
      carbs: 2, 
      category: "protein",
      time: "08:00"
    },
    { 
      title: "Куриная грудка запеченная", 
      calories: 300, 
      protein: 45, 
      fat: 10, 
      carbs: 0, 
      category: "protein",
      time: "14:00"
    },
  ];

  // Фильтрация блюд
  const filteredMeals = mealsDatabase.filter(meal => {
    const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || meal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Сортировка блюд
  const sortedMeals = [...filteredMeals].sort((a, b) => {
    switch (sortBy) {
      case 'calories':
        return (a.calories || 0) - (b.calories || 0);
      case 'protein':
        return (a.protein || 0) - (b.protein || 0);
      case 'name':
      default:
        return a.title.localeCompare(b.title);
    }
  });

  // Проверка, является ли блюдо избранным
  const isFavorite = (meal: MealData) => {
    return favorites.some(fav => fav.title === meal.title);
  };

  // Получение иконки категории
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || "🍽️";
  };

  // Получение цвета категории
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || "text-gray-400";
  };

  return (
    <div className="space-y-4">
      {/* Поиск и фильтры */}
      <div className="space-y-3">
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
        
        {/* Фильтры по категориям */}
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

        {/* Сортировка */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Сортировать:</span>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2 py-1 rounded ${sortBy === 'name' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400'}`}
          >
            по названию
          </button>
          <button
            onClick={() => setSortBy('calories')}
            className={`px-2 py-1 rounded ${sortBy === 'calories' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400'}`}
          >
            по калориям
          </button>
          <button
            onClick={() => setSortBy('protein')}
            className={`px-2 py-1 rounded ${sortBy === 'protein' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400'}`}
          >
            по белкам
          </button>
        </div>
      </div>

      {/* Список блюд */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedMeals.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">Блюда не найдены</p>
            <p className="text-sm text-gray-500 mt-1">Попробуйте изменить поиск или фильтр</p>
          </div>
        ) : (
          sortedMeals.map((meal, i) => (
            <MealCard
              key={`${meal.title}-${i}`}
              meal={meal}
              onSelect={() => onSelect(meal)}
              onFavorite={() => onFavorite(meal)}
              isFavorite={isFavorite(meal)}
              getCategoryIcon={getCategoryIcon}
              getCategoryColor={getCategoryColor}
              showLikes={showLikes}
              disablePlus={disablePlus}
            />
          ))
        )}
      </div>

      {/* Статистика */}
      {sortedMeals.length > 0 && (
        <div className="glass-card p-3 text-center">
          <p className="text-sm text-gray-400">
            Найдено {sortedMeals.length} блюд
          </p>
        </div>
      )}
    </div>
  );
}

// Компонент карточки блюда
function MealCard({ 
  meal, 
  onSelect, 
  onFavorite, 
  isFavorite, 
  getCategoryIcon, 
  getCategoryColor,
  showLikes,
  disablePlus
}: {
  meal: MealData;
  onSelect: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  getCategoryIcon: (categoryId: string) => string;
  getCategoryColor: (categoryId: string) => string;
  showLikes?: boolean;
  disablePlus?: boolean;
}) {
  // Расчет эффективности (белки на 100 ккал)
  const efficiency = meal.calories ? ((meal.protein || 0) / (meal.calories || 1) * 100) : 0;
  const isHighProtein = efficiency > 15;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="border border-gray-600 rounded-xl p-3 hover:border-teal-400 transition-all cursor-pointer bg-black/20 hover:bg-black/30"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${getCategoryColor(meal.category || 'all')}`}>
              {getCategoryIcon(meal.category || 'all')}
            </span>
            <h3 className="font-semibold text-white truncate">{meal.title}</h3>
            {isHighProtein && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                High Protein
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-400" />
              <span>{meal.calories || 0} ккал</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">Б</span>
              <span>{meal.protein || 0}г</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">Ж</span>
              <span>{meal.fat || 0}г</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">У</span>
              <span>{meal.carbs || 0}г</span>
            </div>
          </div>

          {meal.time && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Обычно в {meal.time}</span>
            </div>
          )}

          {showLikes && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Heart className="w-3 h-3" />
              <span>Популярное блюдо</span>
            </div>
          )}
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
                isFavorite
                  ? "text-red-500 fill-red-500"
                  : "hover:text-red-400"
              }`}
            />
          </button>
          
          {!disablePlus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="text-teal-400 hover:text-teal-300 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}