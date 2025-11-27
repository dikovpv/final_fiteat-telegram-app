'use client';

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  ArrowLeft, 
  Target, 
  Zap, 
  Dumbbell, 
  Heart, 
  Clock,
  CheckCircle,
  Plus,
  Minus
} from "lucide-react";

export default function WorkoutPlansPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const plans = [
    {
      title: "Для выносливости",
      desc: "Подходит для повышения тонуса, работы на большое количество повторов и кардио-нагрузок.",
      id: "endurance",
      icon: <Heart className="w-8 h-8" />,
      color: "from-pink-400 to-rose-500",
      duration: "45-60 мин",
      difficulty: "Средний",
      days: [
        {
          name: "День 1 — Всё тело",
          exercises: [
            { name: "Приседания с собственным весом", reps: "4x20", time: 3 },
            { name: "Отжимания", reps: "4x15-20", time: 3 },
            { name: "Тяга резины к поясу", reps: "4x20", time: 3 },
            { name: "Планка", reps: "3x60 сек", time: 2 },
            { name: "Берпи", reps: "3x15", time: 4 },
          ],
        },
        {
          name: "День 2 — Кардио + кора",
          exercises: [
            { name: "Бег/Эллипс", reps: "25–30 мин", time: 30 },
            { name: "Подъёмы ног в висе", reps: "4x15", time: 3 },
            { name: "Скручивания на пресс", reps: "4x20", time: 3 },
            { name: "Планка с поворотом", reps: "3x45 сек", time: 2 },
            { name: "Велосипед", reps: "3x30 сек", time: 2 },
          ],
        },
        {
          name: "День 3 — Круговая",
          exercises: [
            { name: "Скакалка", reps: "1 мин", time: 1 },
            { name: "Присед + жим гантелей", reps: "15 раз", time: 3 },
            { name: "Тяга гантели в наклоне", reps: "15 раз", time: 3 },
            { name: "Отжимания", reps: "15 раз", time: 3 },
            { name: "Подъём корпуса", reps: "20 раз", time: 2 },
          ],
          note: "Повторить 3 круга без отдыха между упражнениями",
        },
      ],
    },
    {
      title: "Для силы",
      desc: "Развитие максимальной силы — базовые упражнения, малое количество повторов, большие веса.",
      id: "strength",
      icon: <Dumbbell className="w-8 h-8" />,
      color: "from-blue-400 to-indigo-500",
      duration: "60-75 мин",
      difficulty: "Высокий",
      days: [
        {
          name: "День 1 — Ноги и спина",
          exercises: [
            { name: "Присед со штангой", reps: "5x5", time: 5 },
            { name: "Тяга штанги в наклоне", reps: "5x5", time: 5 },
            { name: "Становая тяга", reps: "4x5", time: 5 },
            { name: "Гиперэкстензия с весом", reps: "3x10", time: 3 },
          ],
        },
        {
          name: "День 2 — Грудь и плечи",
          exercises: [
            { name: "Жим лёжа", reps: "5x5", time: 5 },
            { name: "Жим Арнольда", reps: "4x6", time: 4 },
            { name: "Разведение гантелей лёжа", reps: "3x10", time: 3 },
            { name: "Отжимания на брусьях", reps: "4x8", time: 4 },
          ],
        },
        {
          name: "День 3 — Руки и кора",
          exercises: [
            { name: "Подтягивания с весом", reps: "4x6", time: 4 },
            { name: "Жим узким хватом", reps: "4x6", time: 4 },
            { name: "Подъём штанги на бицепс", reps: "4x8", time: 3 },
            { name: "Планка с блином", reps: "3x45 сек", time: 2 },
          ],
        },
      ],
    },
    {
      title: "Для объема",
      desc: "Фокус на гипертрофию: средние веса, 8–12 повторов, постепенное увеличение нагрузки.",
      id: "hypertrophy",
      icon: <Zap className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      duration: "50-65 мин",
      difficulty: "Средний",
      days: [
        {
          name: "День 1 — Грудь + трицепс",
          exercises: [
            { name: "Жим лёжа", reps: "4x10", time: 4 },
            { name: "Разведения гантелей", reps: "4x12", time: 3 },
            { name: "Жим узким хватом", reps: "3x10", time: 3 },
            { name: "Отжимания", reps: "3x12-15", time: 3 },
          ],
        },
        {
          name: "День 2 — Спина + бицепс",
          exercises: [
            { name: "Подтягивания", reps: "4x10", time: 4 },
            { name: "Тяга Т-грифа", reps: "4x10", time: 4 },
            { name: "Тяга верхнего блока", reps: "3x12", time: 3 },
            { name: "Молотковые подъёмы", reps: "3x12", time: 3 },
          ],
        },
        {
          name: "День 3 — Ноги + плечи",
          exercises: [
            { name: "Жим ногами", reps: "4x12", time: 4 },
            { name: "Выпады", reps: "3x10 на ногу", time: 4 },
            { name: "Жим Арнольда", reps: "4x10", time: 4 },
            { name: "Махи в стороны", reps: "3x12", time: 3 },
            { name: "Икры сидя", reps: "3x15", time: 2 },
          ],
        },
      ],
    },
  ];

  const handleSelectPlan = (plan: any) => {
    setSelected(plan.id);

    // Сохраняем в localStorage как "выбранный план"
    localStorage.setItem("fitEat_selectedPlan", JSON.stringify(plan));

    // Автоматически добавляем в дневник
    const today = new Date().toISOString().split("T")[0];
    const key = `fitEatDiary_${today}`;
    const existing = JSON.parse(localStorage.getItem(key) || "{}");

    const newData = {
      ...existing,
      workoutPlan: plan.title,
      workouts: plan.days.map((d: any) => ({
        name: d.name,
        exercises: d.exercises.map((e: any) => ({ 
          title: typeof e === 'string' ? e : e.name, 
          done: false 
        })),
      })),
    };

    localStorage.setItem(key, JSON.stringify(newData));

    // Перенаправляем в дневник
    setTimeout(() => {
      router.push("/diary");
    }, 500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Средний': return 'text-yellow-400 bg-yellow-400/20';
      case 'Высокий': return 'text-red-400 bg-red-400/20';
      default: return 'text-green-400 bg-green-400/20';
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
          <Link
            href="/workouts"
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Назад
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Готовые планы тренировок
          </h1>
          <p className="text-gray-300">Выберите программу под свою цель</p>
        </motion.div>

        {/* Plans */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                selected === plan.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/20 bg-white/10 hover:border-purple-400/50"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Plan Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 bg-gradient-to-br ${plan.color} rounded-xl text-white`}>
                    {plan.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {plan.title}
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      {plan.desc}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-gray-300 text-sm">
                        <Clock className="w-4 h-4" />
                        {plan.duration}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                        {plan.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Days */}
                <div className="space-y-2 mb-4">
                  {plan.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedDay(expandedDay === `${plan.id}-${dayIndex}` ? null : `${plan.id}-${dayIndex}`)}
                        className="w-full p-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                      >
                        <span className="text-white font-medium">{day.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            {day.exercises.length} упражнений
                          </span>
                          {expandedDay === `${plan.id}-${dayIndex}` ? 
                            <Minus className="w-4 h-4 text-gray-400" /> : 
                            <Plus className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedDay === `${plan.id}-${dayIndex}` && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-0">
                              <div className="space-y-2">
                                {day.exercises.map((exercise, exIndex) => (
                                  <div key={exIndex} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <span className="text-gray-300 text-sm">
                                      {typeof exercise === 'string' ? exercise : exercise.name}
                                    </span>
                                    <span className="text-purple-300 text-sm font-medium">
                                      {typeof exercise === 'string' ? '' : exercise.reps}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {day.note && (
                                <p className="text-gray-400 text-xs mt-3 p-2 bg-white/5 rounded-lg">
                                  {day.note}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    selected === plan.id
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {selected === plan.id ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Добавлено в дневник
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Выбрать план
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-br from-green-600/30 to-emerald-600/30 backdrop-blur-md border border-green-500/30 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-3">💡 Советы по тренировкам</h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Начинайте с разминки 5-10 минут</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Следите за техникой выполнения упражнений</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Отдыхайте 1-2 минуты между подходами</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Заканчивайте заминкой и растяжкой</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}