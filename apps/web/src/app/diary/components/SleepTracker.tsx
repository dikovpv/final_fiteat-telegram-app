"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Clock, Star, TrendingUp, Zap } from "lucide-react";

interface SleepData {
  start: string;   // "23:30"
  end: string;     // "07:10"
  quality?: number; // 1–10
}

interface SleepTrackerProps {
  value: SleepData;
  onChange: (value: SleepData) => void;
}

export default function SleepTracker({ value, onChange }: SleepTrackerProps) {
  const [showStats, setShowStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateDuration = () => {
    if (!value.start || !value.end) return 0;

    const [startHour, startMin] = value.start.split(":").map(Number);
    const [endHour, endMin] = value.end.split(":").map(Number);

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMin) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMin)
    ) {
      return 0;
    }

    let startTime = new Date();
    startTime.setHours(startHour, startMin, 0, 0);

    let endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return Math.max(0, duration);
  };

  const duration = calculateDuration();
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);

  const sleepRecommendations = {
    optimal: 8,
    min: 7,
    max: 9,
  };

  const getSleepQuality = () => {
    if (duration < 6) return { score: 3, text: "Недосып", color: "text-red-400" };
    if (duration < sleepRecommendations.min)
      return { score: 5, text: "Мало", color: "text-orange-400" };
    if (duration <= sleepRecommendations.max)
      return { score: 9, text: "Отлично", color: "text-green-400" };
    return { score: 6, text: "Много", color: "text-yellow-400" };
  };

  const qualityMeta = getSleepQuality();

  const sleepPhases = [
    { name: "Засыпание", duration: 0.5, color: "bg-blue-600" },
    { name: "Лёгкий сон", duration: 3, color: "bg-blue-500" },
    { name: "Глубокий сон", duration: 2, color: "bg-purple-600" },
    { name: "Быстрый сон (REM)", duration: 2.5, color: "bg-purple-500" },
  ];

  const sleepTips = [
    "Ложитесь спать и просыпайтесь в одно и то же время",
    "Избегайте кофеина за 6 часов до сна",
    "Создайте комфортную температуру в спальне (18–20°C)",
    "Избегайте экранов за 1 час до сна",
    "Используйте тёмные шторы или маску для сна",
    "Проветрите комнату перед сном",
    "Избегайте тяжёлой пищи перед сном",
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentTip((prev) => (prev + 1) % sleepTips.length),
      7000
    );
    return () => clearInterval(interval);
  }, []);

  const TimePicker = ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (time: string) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm text-gray-300 font-medium">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-400 focus:outline-none text-lg"
      />
    </div>
  );

  const QualitySelector = () => (
    <div className="space-y-3">
      <label className="block text-sm text-gray-300 font-medium">
        Как вы оцениваете качество сна?
      </label>
      <div className="flex justify-between">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => onChange({ ...value, quality: num })}
            className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${
              value.quality === num
                ? "bg-purple-500 text-white scale-110 shadow-lg"
                : "bg-black/30 text-gray-400 hover:bg-purple-500/20 hover:text-purple-400"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>😴 Плохо</span>
        <span>😐 Нормально</span>
        <span>😴 Отлично</span>
      </div>
    </div>
  );

  const totalPhaseDuration =
    sleepPhases.reduce((sum, p) => sum + p.duration, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Основной индикатор сна */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-400" />
            Анализ сна
          </h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-gray-400 hover:text-white transition"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>

        {/* Визуализация сна */}
        <div className="relative h-32 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 rounded-xl overflow-hidden border border-gray-700 mb-4">
          {duration > 0 && (
            <div className="absolute inset-0 flex items-center">
              {sleepPhases.map((phase, i) => (
                <motion.div
                  key={i}
                  className={`h-full ${phase.color} opacity-70`}
                  style={{
                    width: `${(phase.duration / totalPhaseDuration) * 100}%`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: i * 0.2 }}
                />
              ))}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              {duration > 0 ? (
                <>
                  <motion.div
                    className="text-3xl font-bold text-white mb-1"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    key={duration}
                  >
                    {hours}ч {minutes}м
                  </motion.div>
                  <div className={`text-sm ${qualityMeta.color} font-semibold`}>
                    {qualityMeta.text}
                  </div>
                </>
              ) : (
                <div className="text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Установите время сна</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Продолжительность</span>
            <span className="text-white font-semibold">
              {hours}ч {minutes}м / {sleepRecommendations.optimal}ч
            </span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  (duration / sleepRecommendations.optimal) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Время сна */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <TimePicker
            value={value.start}
            onChange={(time) => onChange({ ...value, start: time })}
            label="Время отхода ко сну"
          />
          <TimePicker
            value={value.end}
            onChange={(time) => onChange({ ...value, end: time })}
            label="Время пробуждения"
          />
        </div>

        <div className="text-center text-sm text-gray-400 mb-4">
          Текущее время:{" "}
          {currentTime.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {duration > 0 && <QualitySelector />}
      </div>

      {/* Анализ */}
      {duration > 0 && (
        <div className="glass-card p-4">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Анализ вашего сна
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Продолжительность:</span>
              <span className={`font-semibold ${qualityMeta.color}`}>
                {hours}ч {minutes}м ({qualityMeta.text})
              </span>
            </div>

            {value.quality && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Качество:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: value.quality }, (_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  {Array.from({ length: 10 - value.quality }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-gray-600" />
                  ))}
                  <span className="text-white ml-2">
                    {value.quality}/10
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Рекомендуется:</span>
              <span className="text-teal-400">
                {sleepRecommendations.min}-{sleepRecommendations.max} часов
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Советы */}
      <AnimatePresence mode="wait">
        <motion.div
          className="glass-card p-4"
          key={currentTip}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            Совет по сну
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {sleepTips[currentTip]}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Достижения */}
      {duration > 0 && (
        <div className="space-y-3">
          {duration >= sleepRecommendations.optimal && (
            <motion.div
              className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Star className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium text-green-400">Отличный сон!</div>
                <div className="text-sm text-gray-400">
                  Вы спали рекомендованное количество времени
                </div>
              </div>
            </motion.div>
          )}

          {value.quality && value.quality >= 8 && (
            <motion.div
              className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Zap className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-medium text-purple-400">
                  Качественный отдых!
                </div>
                <div className="text-sm text-gray-400">
                  Вы отлично выспались
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
