"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Droplets, Wheat, Target, TrendingUp, Activity } from "lucide-react";

export default function Dashboard({ data }: { data: any }) {
  const { calories, protein, fat, carbs, weight } = data;

  // Анимированные счетчики
  const AnimatedCounter = ({ value, label, icon, color }: any) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = value / 50;
        let current = 0;
        const counter = setInterval(() => {
          current += increment;
          if (current >= value) {
            setDisplayValue(value);
            clearInterval(counter);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }, 20);
        return () => clearInterval(counter);
      }, 100);
      return () => clearTimeout(timer);
    }, [value]);

    return (
      <div className="text-center">
        <div className={`text-3xl font-bold mb-1`} style={{ color }}>
          {displayValue}
        </div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Главная карточка калорий */}
      <motion.div 
        className="glass-card p-6 text-center relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent"></div>
        <div className="relative z-10">
          <Flame className="w-8 h-8 mx-auto mb-3 text-teal-400 animate-pulse" />
          <p className="text-gray-400 text-sm mb-2">Рекомендуемый калораж</p>
          <motion.div 
            className="text-4xl font-bold text-teal-400 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {calories}
          </motion.div>
          <p className="text-gray-500 text-sm">ккал / день</p>
        </div>
      </motion.div>

      {/* Карточка БЖУ */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="font-semibold mb-4 text-center text-gray-300 flex items-center justify-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Баланс БЖУ
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center bg-black/20 rounded-lg p-3"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-xl font-bold text-green-400">{protein}</div>
            <div className="text-xs text-gray-400">г белков</div>
          </motion.div>
          <motion.div 
            className="text-center bg-black/20 rounded-lg p-3"
            whileHover={{ scale: 1.05 }}
          >
            <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-xl font-bold text-blue-400">{fat}</div>
            <div className="text-xs text-gray-400">г жиров</div>
          </motion.div>
          <motion.div 
            className="text-center bg-black/20 rounded-lg p-3"
            whileHover={{ scale: 1.05 }}
          >
            <Wheat className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <div className="text-xl font-bold text-orange-400">{carbs}</div>
            <div className="text-xs text-gray-400">г углеводов</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Контроль веса */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="font-semibold mb-4 text-center text-gray-300 flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Контроль веса
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="text-center bg-black/20 rounded-lg p-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-purple-400 mb-1">{weight}</div>
            <div className="text-sm text-gray-400">текущий вес</div>
          </motion.div>
          <motion.div 
            className="text-center bg-black/20 rounded-lg p-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-green-400 mb-1">80</div>
            <div className="text-sm text-gray-400">цель (кг)</div>
          </motion.div>
        </div>
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm text-gray-400 mb-2">Прогресс к цели</div>
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">65% достигнуто</div>
        </motion.div>
      </motion.div>

      {/* Мотивационная карточка */}
      <motion.div 
        className="glass-card p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-400 animate-bounce" />
        <h4 className="font-semibold text-green-400 mb-2">Отличный старт!</h4>
        <p className="text-sm text-gray-400">
          Твой персональный план готов. Следуй рекомендациям и достигни своих целей!
        </p>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";