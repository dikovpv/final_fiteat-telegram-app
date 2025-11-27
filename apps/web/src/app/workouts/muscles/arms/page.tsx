'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, 
  Play, 
  Heart, 
  Clock, 
  Repeat,
  Info,
  Plus,
  Check
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  equipment: string;
  instructions: string[];
  tips: string[];
  image: string;
  sets: string;
  reps: string;
  rest: string;
  description: string;
}

const exercises: Exercise[] = [
  {
    id: 'bicep-curls',
    name: 'Сгибания рук с гантелями',
    muscle: 'Бицепс',
    difficulty: 'easy',
    equipment: 'Гантели',
    image: '💪',
    sets: '3-4',
    reps: '10-12',
    rest: '60-90 сек',
    description: 'Базовое упражнение для развития бицепса',
    instructions: [
      'Возьмите гантели в руки, стойте прямо',
      'Локти прижаты к телу, ладони смотрят вперед',
      'Медленно сгибайте руки, поднимая гантели к плечам',
      'Задержитесь на секунду в верхней точке',
      'Медленно опустите гантели в исходное положение'
    ],
    tips: [
      'Не раскачивайте тело',
      'Держите локти неподвижными',
      'Контролируйте движение в обе стороны'
    ]
  },
  {
    id: 'tricep-dips',
    name: 'Отжимания на брусьях',
    muscle: 'Трицепс',
    difficulty: 'medium',
    equipment: 'Брусья',
    image: '🏋️',
    sets: '3-4',
    reps: '8-12',
    rest: '90-120 сек',
    description: 'Эффективное упражнение для трицепса',
    instructions: [
      'Возьмитесь за брусья, выпрямите руки',
      'Медленно опускайтесь вниз до угла 90° в локтях',
      'Не опускайтесь слишком низко',
      'Оттолкнитесь вверх, выпрямляя руки',
      'Слегка согните ноги для баланса'
    ],
    tips: [
      'Не опускайте плечи',
      'Держите корпус прямым',
      'Дышите правильно: вдох вниз, выдох вверх'
    ]
  },
  {
    id: 'hammer-curls',
    name: 'Молотковые сгибания',
    muscle: 'Бицепс, предплечья',
    difficulty: 'easy',
    equipment: 'Гантели',
    image: '🔨',
    sets: '3-4',
    reps: '10-15',
    rest: '60-90 сек',
    description: 'Развивает бицепс и предплечья',
    instructions: [
      'Возьмите гантели нейтральным хватом',
      'Ладони смотрят друг на друга',
      'Сгибайте руки, поднимая гантели',
      'Коснитесь плеч в верхней точке',
      'Медленно опустите гантели'
    ],
    tips: [
      'Держите запястья прямыми',
      'Не разворачивайте запястья',
      'Фокус на предплечьях'
    ]
  },
  {
    id: 'tricep-pushdown',
    name: 'Разгибания на блоке',
    muscle: 'Трицепс',
    difficulty: 'medium',
    equipment: 'Тренажер',
    image: '⚡',
    sets: '3-4',
    reps: '12-15',
    rest: '60-90 сек',
    description: 'Изолирующее упражнение для трицепса',
    instructions: [
      'Возьмитесь за рукоять верхнего блока',
      'Локти прижаты к телу',
      'Разгибайте руки вниз до полного выпрямления',
      'Задержитесь в нижней точке',
      'Медленно вернитесь в исходное положение'
    ],
    tips: [
      'Не разводите локти в стороны',
      'Контролируйте вес',
      'Фокус на сокращении трицепса'
    ]
  },
  {
    id: 'concentration-curls',
    name: 'Концентрированные сгибания',
    muscle: 'Бицепс',
    difficulty: 'easy',
    equipment: 'Гантель',
    image: '🎯',
    sets: '3-4',
    reps: '8-10',
    rest: '60 сек',
    description: 'Изолирующее упражнение для пиковой нагрузки',
    instructions: [
      'Сядьте на скамью, расставьте ноги',
      'Опирайтесь локтем о внутреннюю поверхность бедра',
      'Другой рукой выполняйте сгибание',
      'Медленно поднимайте гантель к плечу',
      'Контролируйте спуск'
    ],
    tips: [
      'Держите спину прямой',
      'Не помогайте телом',
      'Сконцентрируйтесь на бицепсе'
    ]
  },
  {
    id: 'close-grip-pushups',
    name: 'Отжимания узким хватом',
    muscle: 'Трицепс, грудь',
    difficulty: 'medium',
    equipment: 'Собственный вес',
    image: '🤲',
    sets: '3-4',
    reps: '10-15',
    rest: '60-90 сек',
    description: 'Универсальное упражнение с весом тела',
    instructions: [
      'Примите положение для отжиманий',
      'Руки на ширине плеч или уже',
      'Опускайтесь вниз, сгибая локти',
      'Коснитесь грудью пола',
      'Оттолкнитесь вверх'
    ],
    tips: [
      'Держите тело прямой',
      'Не поднимайте таз',
      'Чем уже хват, тем больше трицепс'
    ]
  }
];

export default function ArmsExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (exerciseId: string) => {
    const newFavorites = favorites.includes(exerciseId)
      ? favorites.filter(id => id !== exerciseId)
      : [...favorites, exerciseId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteExercises', JSON.stringify(newFavorites));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
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
          <Link href="/workouts/muscles" className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Назад
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Упражнения для рук
          </h1>
          <p className="text-gray-300">Бицепс, трицепс и предплечья</p>
        </motion.div>

        {/* Exercise Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-4 mb-6"
        >
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{exercise.image}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{exercise.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(exercise.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.includes(exercise.id)
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(exercise.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty === 'easy' ? 'Легко' : exercise.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                    </span>
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                      {exercise.muscle}
                    </span>
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                      {exercise.equipment}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Repeat className="w-4 h-4" />
                      {exercise.sets} x {exercise.reps}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exercise.rest}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Start */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-md border border-purple-500/30 rounded-xl text-center"
        >
          <Play className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-white mb-2">Готовы начать?</h3>
          <p className="text-gray-300 mb-4">Создайте свою первую тренировку для рук</p>
          <button
            onClick={() => {
              // Create workout routine
              alert('Функция создания тренировки скоро будет доступна!');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
          >
            <Play className="w-5 h-5" />
            Начать тренировку
          </button>
        </motion.div>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Handle */}
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6"></div>

                {/* Exercise Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-6xl">{selectedExercise.image}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedExercise.name}</h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedExercise.difficulty)}`}>
                        {selectedExercise.difficulty === 'easy' ? 'Легко' : selectedExercise.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                        {selectedExercise.muscle}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                        {selectedExercise.equipment}
                      </span>
                    </div>
                    <p className="text-gray-300">{selectedExercise.description}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(selectedExercise.id)}
                    className={`p-3 rounded-full transition-colors ${
                      favorites.includes(selectedExercise.id)
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${favorites.includes(selectedExercise.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Exercise Parameters */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-lg font-bold text-white">{selectedExercise.sets}</div>
                    <div className="text-gray-400 text-sm">Подходов</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-lg font-bold text-white">{selectedExercise.reps}</div>
                    <div className="text-gray-400 text-sm">Повторений</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-lg font-bold text-white">{selectedExercise.rest}</div>
                    <div className="text-gray-400 text-sm">Отдых</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Техника выполнения</h3>
                  <div className="space-y-2">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {index + 1}
                        </div>
                        <p className="text-white leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Советы</h3>
                  <div className="space-y-2">
                    {selectedExercise.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <p className="text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Add to workout routine
                      alert('Упражнение добавлено в тренировку!');
                    }}
                    className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Добавить в тренировку
                  </button>
                  <button
                    onClick={() => {
                      // Start exercise timer
                      alert('Таймер упражнения запущен!');
                    }}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                  >
                    Начать упражнение
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}