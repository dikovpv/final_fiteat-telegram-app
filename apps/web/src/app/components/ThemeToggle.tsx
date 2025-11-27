'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'cosmic' | 'luxury' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('cosmic');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fitEatTheme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('cosmic-theme', 'luxury-theme');
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('cosmic-theme');
      } else {
        root.classList.add('luxury-theme');
      }
    } else {
      root.classList.add(`${newTheme}-theme`);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitEatTheme', newTheme);
    }
    setIsOpen(false);
  };

  const themes = [
    {
      id: 'cosmic' as Theme,
      name: 'Космическая',
      icon: <Moon className="w-4 h-4" />,
      description: 'Темная тема с фиолетовыми акцентами'
    },
    {
      id: 'luxury' as Theme,
      name: 'Роскошная',
      icon: <Sun className="w-4 h-4" />,
      description: 'Светлая тема с золотыми акцентами'
    },
    {
      id: 'system' as Theme,
      name: 'Системная',
      icon: <Palette className="w-4 h-4" />,
      description: 'Использует настройки системы'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
      >
        {theme === 'cosmic' ? <Moon className="w-5 h-5" /> : 
         theme === 'luxury' ? <Sun className="w-5 h-5" /> : 
         <Palette className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50"
          >
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3">Выберите тему</h3>
              <div className="space-y-2">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      theme === themeOption.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {themeOption.icon}
                    <div>
                      <div className="font-medium">{themeOption.name}</div>
                      <div className="text-xs opacity-75">{themeOption.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}