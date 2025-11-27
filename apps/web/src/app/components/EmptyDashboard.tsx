"use client";

import { motion } from "framer-motion";
import { Rocket, Sparkles, Users, Target, Zap } from "lucide-react";

export default function EmptyDashboard({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        className="glass-card p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 0.8 
        }}
      >
        {/* Анимация звезд */}
        <div className="relative mb-6">
          <motion.div
            className="absolute -top-4 -left-4 text-yellow-400"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-6 text-blue-400"
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1],
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="inline-block p-4 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full"
          >
            <Rocket className="w-16 h-16 text-teal-400" />
          </motion.div>
        </div>

        <motion.h2 
          className="text-2xl font-bold mb-4 neon-text-teal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Добро пожаловать в FitEat! 🚀
        </motion.h2>
        
        <motion.p 
          className="text-gray-300 mb-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Готов начать потрясающее путешествие к своей мечте? 
          Я помогу тебе рассчитать персональный план питания и тренировок!
        </motion.p>

        {/* Преимущества */}
        <motion.div 
          className="grid grid-cols-2 gap-4 mb-6 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-gray-300">
            <Target className="w-4 h-4 text-green-400" />
            <span>Персональный план</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Быстрый старт</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Реальные результаты</span>
          </div>
        </motion.div>

        <motion.button
          onClick={onStart}
          className="cosmic-button w-full flex items-center justify-center gap-2 group"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 20,
            delay: 0.6 
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 30px rgba(0, 212, 170, 0.5)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            Начать трансформацию
            <motion.span
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              →
            </motion.span>
          </span>
        </motion.button>

        <motion.p 
          className="text-xs text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Займет всего 2 минуты • Без спама и подписок
        </motion.p>
      </motion.div>
    </div>
  );
}