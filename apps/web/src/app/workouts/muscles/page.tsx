'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Zap, Heart, Shield, Target, Power } from "lucide-react";

export default function MuscleGroupsPage() {
  const muscles = [
    { 
      name: "Руки", 
      link: "/workouts/muscles/arms", 
      icon: <Power className="w-8 h-8" />,
      color: "from-blue-400 to-cyan-500",
      exercises: "Бицепс, трицепс, предплечья",
      workouts: 15
    },
    { 
      name: "Плечи", 
      link: "/workouts/muscles/shoulders", 
      icon: <Shield className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
      exercises: "Дельты, трапеции",
      workouts: 12
    },
    { 
      name: "Спина", 
      link: "/workouts/muscles/back", 
      icon: <Target className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      exercises: "Латиссимус, ромбоиды, поясница",
      workouts: 18
    },
    { 
      name: "Грудь", 
      link: "/workouts/muscles/chest", 
      icon: <Heart className="w-8 h-8" />,
      color: "from-red-400 to-pink-500",
      exercises: "Большая, средняя, малая грудные",
      workouts: 14
    },
    { 
      name: "Торс", 
      link: "/workouts/muscles/core", 
      icon: <Zap className="w-8 h-8" />,
      color: "from-yellow-400 to-orange-500",
      exercises: "Пресс, косые, поясница",
      workouts: 20
    },
    { 
      name: "Ноги", 
      link: "/workouts/muscles/legs", 
      icon: <Dumbbell className="w-8 h-8" />,
      color: "from-indigo-400 to-purple-500",
      exercises: "Квадрицепсы, бицепсы бедра, икры",
      workouts: 22
    },
  ];

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
          <Link href="/workouts" className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Назад
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Упражнения по группам мышц
          </h1>
          <p className="text-gray-300">Выберите мышечную группу для тренировки</p>
        </motion.div>

        {/* Muscle Groups Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {muscles.map((muscle, index) => (
            <motion.div
              key={muscle.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative overflow-hidden"
            >
              <Link
                href={muscle.link}
                className="block p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-300 group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${muscle.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`p-4 bg-gradient-to-br ${muscle.color} rounded-xl text-white mb-4 inline-block`}>
                    {muscle.icon}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {muscle.name}
                  </h2>
                  
                  <p className="text-gray-300 text-sm mb-3">
                    {muscle.exercises}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 text-sm font-medium">
                      {muscle.workouts} упражнений
                    </span>
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <Dumbbell className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-md border border-purple-500/30 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">💡 Советы по тренировкам</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <span className="text-white font-medium">Правильная техника</span>
                <p className="text-gray-300">Качество важнее количества - следите за формой выполнения</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <span className="text-white font-medium">Прогрессивная нагрузка</span>
                <p className="text-gray-300">Постепенно увеличивайте веса и количество повторений</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <span className="text-white font-medium">Отдых и восстановление</span>
                <p className="text-gray-300">Дайте мышцам время на восстановление между тренировками</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Start Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 gap-4"
        >
          <Link
            href="/workouts/quick-start"
            className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">Быстрая тренировка</h3>
                <p className="text-gray-300 text-sm">Начните тренировку прямо сейчас</p>
              </div>
            </div>
          </Link>
          
          <Link
            href="/workouts/programs"
            className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-white font-semibold">Мои программы</h3>
                <p className="text-gray-300 text-sm">Просмотр сохраненных программ</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}