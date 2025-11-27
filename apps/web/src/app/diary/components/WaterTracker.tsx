"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, Target, TrendingUp } from "lucide-react";

interface WaterTrackerProps {
  /** значение в литрах, хранится в дневнике, например 1.75 */
  value: number;
  /** вызывается при изменении воды — сюда в дневник пишем новое значение в литрах */
  onChange: (value: number) => void;
  /** цель по воде в литрах, по умолчанию 2.5 */
  goal?: number;
}

export default function WaterTracker({
  value,
  onChange,
  goal = 2.5,
}: WaterTrackerProps) {
  const [showStats, setShowStats] = useState(false);

  // размеры стаканов в литрах
  const glassSizes = [
    { size: 0.2, label: "200мл", icon: "🥤" },
    { size: 0.25, label: "250мл", icon: "🥛" },
    { size: 0.33, label: "330мл", icon: "🍺" },
    { size: 0.5, label: "500мл", icon: "🍶" },
  ];
  const [selectedSize, setSelectedSize] = useState(glassSizes[1]); // 250 мл

  // стаканы считаем напрямую из value
  const glasses = Math.floor(value / 0.25);

  // прогресс
  const progress = Math.min((value / goal) * 100, 100);
  const remaining = Math.max(goal - value, 0);
  const percentage = Math.round(progress);

  const getFillHeight = () => Math.min(progress, 100);

  const getWaterColor = () => {
    if (progress < 30) return "from-blue-600 to-blue-800";
    if (progress < 60) return "from-blue-500 to-blue-700";
    if (progress < 90) return "from-teal-500 to-blue-600";
    return "from-teal-400 to-blue-500";
  };

  // история: добавляем только когда вода УВЕЛИЧИЛАСЬ
  const [history, setHistory] = useState<
    Array<{ amount: number; time: string }>
  >([]);
  const prevValueRef = useRef<number>(value);
  const initializedRef = useRef(false);

  useEffect(() => {
    const prev = prevValueRef.current;

    // первый рендер: просто запоминаем значение
    if (!initializedRef.current) {
      prevValueRef.current = value;
      initializedRef.current = true;
      return;
    }

    // если стало больше — пишем разницу в историю
    if (value > prev) {
      const diff = Number((value - prev).toFixed(2));
      if (diff > 0) {
        const now = new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setHistory((prevHistory) =>
          [...prevHistory, { amount: diff, time: now }].slice(-10)
        );
      }
    }

    prevValueRef.current = value;
  }, [value]);

  // добавление / убавление

  const clampValue = (v: number) => Math.max(0, Math.min(v, 5)); // 0–5 литров

  const addWater = (amount: number) => {
    const newValue = clampValue(value + amount);
    onChange(Number(newValue.toFixed(2)));
  };

  const removeWater = (amount: number) => {
    const newValue = clampValue(value - amount);
    onChange(Number(newValue.toFixed(2)));
  };

  const quickAdd = () => addWater(selectedSize.size);

  // советы по воде
  const hydrationTips = [
    "Пейте воду маленькими порциями в течение дня",
    "Начинайте день со стакана воды",
    "Пейте воду до, во время и после тренировки",
    "Следите за цветом мочи — она должна быть светло-жёлтой",
    "Ешьте больше фруктов и овощей с высоким содержанием воды",
  ];
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % hydrationTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Основной индикатор */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            Водный баланс
          </h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-gray-400 hover:text-white transition"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>

        {/* Визуальный индикатор */}
        <div className="relative h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700">
          {/* Вода */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getWaterColor()} transition-all duration-1000`}
            initial={{ height: 0 }}
            animate={{ height: `${getFillHeight()}%` }}
            style={{
              boxShadow:
                progress > 50 ? "0 0 20px rgba(0, 212, 170, 0.3)" : "none",
            }}
          >
            {progress > 10 && (
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </motion.div>

          {/* Цифры */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.div
              className="text-4xl font-bold text-white mb-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              key={value}
            >
              {value.toFixed(1)}л
            </motion.div>

            <div className="text-sm text-gray-300 mb-1">
              {percentage}% от нормы
            </div>

            <div className="text-xs text-gray-400">{glasses} стаканов</div>
          </div>

          {/* Целевая отметка */}
          <div
            className="absolute right-2 w-8 h-0.5 bg-yellow-400 rounded-full"
            style={{ bottom: `${(goal / 5) * 100}%` }}
          >
            <div className="absolute -right-12 -top-2 text-xs text-yellow-400">
              Цель: {goal}л
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Прогресс</span>
            <span className="text-white font-semibold">{percentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-1000"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Выбор размера стакана */}
      <div className="glass-card p-4">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-teal-400" />
          Размер порции
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {glassSizes.map((size) => (
            <button
              key={size.size}
              onClick={() => setSelectedSize(size)}
              className={`p-3 rounded-lg border transition-all ${
                selectedSize.size === size.size
                  ? "border-teал-400 bg-teal-500/10"
                  : "border-gray-600 bg-black/20 hover:border-gray-500"
              }`}
            >
              <div className="text-2xl mb-1">{size.icon}</div>
              <div className="text-sm font-medium text-white">
                {size.label}
              </div>
              <div className="text-xs text-gray-400">
                {size.size * 1000}мл
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Управление */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => removeWater(selectedSize.size)}
            className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 py-3 rounded-lg hover:bg-red-500/30 transition-all"
          >
            <Minus className="w-4 h-4" />
            <span className="font-medium">Убрать</span>
          </button>

          <button
            onClick={quickAdd}
            className="flex items-center justify-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-400 py-3 rounded-lg hover:bg-teal-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Добавить</span>
          </button>
        </div>
      </div>

   

      {/* Достижение цели */}
      {progress >= 100 && (
        <motion.div
          className="glass-card p-4 text-center border-2 border-teal-400/50 bg-gradient-to-r from-teal-500/10 to-blue-500/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-bold text-teal-400 mb-2">
            Цель достигнута!
          </h3>
          <p className="text-gray-300">
            Отличная работа! Вы выпили норму воды на сегодня
          </p>
        </motion.div>
      )}

      {/* История */}
      {history.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="font-semibold text-white mb-3">История сегодня</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {history.map((entry, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-300">
                  +{entry.amount.toFixed(2)}л
                </span>
                <span className="text-gray-500">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Советы */}
      {/* <AnimatePresence mode="wait">
        <motion.div
          className="glass-card p-4"
          key={currentTip}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            Совет по гидратации
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {hydrationTips[currentTip]}
          </p>
        </motion.div>
      </AnimatePresence> */}

      {/* Статистика (опционально) */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-card p-4"
          >
            <h4 className="font-semibold text-white mb-3">Статистика</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Норма:</span>
                <span className="text-white ml-2">{goal}л</span>
              </div>
              <div>
                <span className="text-gray-400">Выполнено:</span>
                <span className="text-teal-400 ml-2">{percentage}%</span>
              </div>
              <div>
                <span className="text-gray-400">Всего приёмов:</span>
                <span className="text-white ml-2">{history.length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
