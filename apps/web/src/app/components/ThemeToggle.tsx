'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'dark' | 'light' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fitEatTheme');
      const savedTheme: Theme = stored === 'dark' || stored === 'system' ? stored : 'light';

      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    root.classList.remove('theme-dark', 'theme-light', 'cosmic-theme', 'luxury-theme');

    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('theme-dark');
      } else {
        root.classList.add('theme-light');
      }
    } else {
      root.classList.add(`theme-${newTheme}`);
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
      id: 'light' as Theme,
      name: 'Светлая',
      icon: <Sun className="w-4 h-4" />,
      description: 'Светлый фон, теплые карточки'
    },
    {
      id: 'dark' as Theme,
      name: 'Тёмная',
      icon: <Moon className="w-4 h-4" />,
      description: 'Глубокий фон, мягкие контуры'
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
        className="p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] transition-colors flex items-center justify-center"
      >
        {theme === 'dark' ? <Moon className="w-5 h-5" /> :
         theme === 'light' ? <Sun className="w-5 h-5" /> :
          <Palette className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-muted)] shadow-[var(--shadow-strong)] z-50"
          >
            <div className="p-4">
              <h3 className="text-[var(--text-primary)] font-semibold mb-3">Выберите тему</h3>
              <div className="space-y-2">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`w-full p-3 rounded-xl text-left transition-colors flex items-center gap-3 border ${
                      theme === themeOption.id
                        ? 'bg-[var(--surface-strong)] border-[var(--border-strong)] text-[var(--text-primary)]'
                        : 'bg-[var(--surface-muted)] border-[var(--border-soft)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {themeOption.icon}
                    <div>
                      <div className="font-medium">{themeOption.name}</div>
                      <div className="text-xs opacity-80 text-[var(--text-secondary)]">
                        {themeOption.description}
                      </div>
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