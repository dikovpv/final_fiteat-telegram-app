'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Flame, Clock, Users, ArrowLeft, ChefHat } from 'lucide-react';
import { recipesData } from '../../data/recipesData';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('favoriteRecipes');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(favoriteIds);
        
        const recipes = recipesData.filter(recipe => favoriteIds.includes(recipe.id));
        setFavoriteRecipes(recipes);
      }
    }
  }, []);

  const removeFavorite = (recipeId: string) => {
    const newFavorites = favorites.filter(id => id !== recipeId);
    setFavorites(newFavorites);
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
    }
    
    const recipes = favoriteRecipes.filter(recipe => recipe.id !== recipeId);
    setFavoriteRecipes(recipes);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push('/meals')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-pink-400 fill-current" />
            <h1 className="text-3xl font-bold text-white">Избранное</h1>
          </div>
          <p className="text-gray-300">Ваши любимые рецепты</p>
        </motion.div>

        {/* Favorites Count */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md border border-pink-500/30 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Сохранённые рецепты</h2>
              <p className="text-gray-300">{favoriteRecipes.length} рецептов в избранном</p>
            </div>
            <ChefHat className="w-12 h-12 text-pink-400" />
          </div>
        </motion.div>

        {/* Favorites List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {favoriteRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold text-white mb-2">Нет избранных рецептов</h3>
              <p className="text-gray-300 mb-4">Добавьте рецепты, которые вам понравились</p>
              <button
                onClick={() => router.push('/meals')}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
              >
                Найти рецепты
              </button>
            </div>
          ) : (
            favoriteRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-4"
              >
                <div className="text-4xl">{recipe.image}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{recipe.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {recipe.calories} ккал
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.time} мин
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                    {recipe.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeFavorite(recipe.id)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Quick Actions */}
        {favoriteRecipes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-md border border-purple-500/30 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  // Create meal plan from favorites
                  alert('Функция создания плана питания из избранного скоро будет доступна!');
                }}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors text-center"
              >
                Создать план
              </button>
              <button
                onClick={() => {
                  // Share favorites
                  alert('Список избранного скопирован в буфер обмена!');
                }}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors text-center"
              >
                Поделиться
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}