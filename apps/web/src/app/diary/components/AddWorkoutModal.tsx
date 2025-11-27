"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Trash2,
  Plus,
  Search,
  Clock,
  Flame,
} from "lucide-react";
import {
  DEFAULT_ENTRY,
  DIARY_SELECTED_DATE_KEY,
  DIARY_STORAGE_PREFIX,
  type DiaryEntry,
  type DiaryWorkout,
} from "../diary-types";

export interface WorkoutData {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  type?: "strength" | "cardio" | "flexibility";
  calories?: number;
  planSlug?: string;
  planTitle?: string;
  exerciseSlug?: string;
}

interface AddWorkoutModalProps {
  onClose: () => void;
  onSave: (workout: WorkoutData) => void;
  // список готовых упражнений из раздела "Тренировки"
  // можно не передавать — тогда вкладка "Готовые" не показывается
  readyWorkouts?: WorkoutData[];
}

export default function AddWorkoutModal({
  onClose,
  onSave,
  readyWorkouts = [],
}: AddWorkoutModalProps) {
  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutData[]>(
    readyWorkouts
  );
  const hasReadyWorkouts = availableWorkouts.length > 0;

  const [tab, setTab] = useState<"ready" | "added" | "manual">(
    hasReadyWorkouts ? "ready" : "added"
  );

  const [form, setForm] = useState<WorkoutData>({
    name: "",
    sets: 3,
    reps: 10,
    weight: undefined,
    duration: undefined,
    type: "strength",
    calories: undefined,
  });

  const [addedWorkouts, setAddedWorkouts] = useState<WorkoutData[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Типы тренировок для фильтра
  const workoutTypes = [
    { id: "all", name: "Все", icon: "💪" },
    { id: "strength", name: "Силовые", icon: "🏋️" },
    { id: "cardio", name: "Кардио", icon: "🏃" },
    { id: "flexibility", name: "Растяжка", icon: "🧘" },
  ];

  // Фильтрация упражнений из приложения
  const filteredWorkouts = useMemo(
    () =>
      hasReadyWorkouts
        ? availableWorkouts.filter((workout) => {
            const matchesSearch = [
              workout.name || "",
              workout.planTitle || "",
            ]
              .join(" ")

              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const matchesType =
              selectedType === "all" || workout.type === selectedType;
            return matchesSearch && matchesType;
          })
        : [],
    [availableWorkouts, hasReadyWorkouts, searchQuery, selectedType]
  );

  // Загрузка "моих упражнений" из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fitEatAddedWorkouts");
      if (saved) setAddedWorkouts(JSON.parse(saved));
    } catch {
      // игнор
    }
  }, []);

  // Подтягиваем упражнения из дневника для выбранной даты
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const selectedDate =
        localStorage.getItem(DIARY_SELECTED_DATE_KEY) ||
        new Date().toISOString().split("T")[0];
      const key = `${DIARY_STORAGE_PREFIX}${selectedDate}`;
      const saved = localStorage.getItem(key);
      if (!saved) return;

      const parsed: DiaryEntry = { ...DEFAULT_ENTRY, ...JSON.parse(saved) };
      const workouts: DiaryWorkout[] = Array.isArray(parsed.workouts)
        ? parsed.workouts
        : [];

      setAvailableWorkouts((prev) => {
        const map = new Map<string, WorkoutData>();
        [...prev, ...workouts].forEach((workout) => {
          const id = workout.id || workout.name;
          if (id) map.set(id, workout);
        });
        return Array.from(map.values());
      });
    } catch {
      // просто пропускаем ошибку
    }
  }, []);

  useEffect(() => {
    setAvailableWorkouts(readyWorkouts);
  }, [readyWorkouts]);

  useEffect(() => {
    if (hasReadyWorkouts && tab !== "ready") {
      setTab("ready");
    }
  }, [hasReadyWorkouts, tab]);

  const saveAdded = (data: WorkoutData[]) => {
    try {
      localStorage.setItem("fitEatAddedWorkouts", JSON.stringify(data));
    } catch {
      // игнор
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "name") {
      setForm((prev) => ({ ...prev, name: value }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : parseFloat(value) || 0,
    }));
  };

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 350);
  };

  const handleManualSave = () => {
    if (!form.name.trim()) {
      alert("Введите название упражнения");
      return;
    }

    // Расчет калорий на основе типа тренировки (грубая оценка, но лучше чем ничего)
    let calories = form.calories ?? 0;

    if (!calories) {
      if (form.type === "strength") {
        calories = form.sets * form.reps * (form.weight || 1) * 0.1;
      } else if (form.type === "cardio" && form.duration) {
        calories = form.duration * 0.8;
      } else if (form.type === "flexibility" && form.duration) {
        calories = form.duration * 0.2;
      }
    }

    const workoutWithCalories: WorkoutData = {
      ...form,
      name: form.name.trim(),
      calories: Math.round(calories || 0),
    };

    const updated = [...addedWorkouts, workoutWithCalories];
    setAddedWorkouts(updated);
    saveAdded(updated);
    onSave(workoutWithCalories);
    closeWithAnimation();
  };

  const removeAdded = (index: number) => {
    const updated = [...addedWorkouts];
    updated.splice(index, 1);
    setAddedWorkouts(updated);
    saveAdded(updated);
  };

  // Вкладки динамически: скрываем "Готовые", если нет readyWorkouts
  const tabs: { key: typeof tab; label: string }[] = [
    ...(hasReadyWorkouts ? [{ key: "ready" as const, label: "Готовые" }] : []),
    { key: "added", label: "Мои упражнения" },
    { key: "manual", label: "Создать" },
  ];

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeWithAnimation}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-t-3xl shadow-2xl h-[90vh] flex flex-col border border-gray-700"
          >
            {/* Верхняя панель */}
            <div className="flex justify-center items-center relative border-b border-gray-700 py-4">
              <button
                onClick={closeWithAnimation}
                className="absolute left-6 text-gray-400 hover:text-white text-xl transition"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-white">
                Добавить упражнение
              </h2>
            </div>

            {/* Вкладки */}
            <div className="flex border-b border-gray-700 text-sm font-medium overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-3 px-2 transition whitespace-nowrap ${
                    tab === t.key
                      ? "border-b-2 border-teal-400 text-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Поиск и фильтры для вкладки "Готовые" */}
              {tab === "ready" && hasReadyWorkouts && (
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск упражнений..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {workoutTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
                          selectedType === type.id
                            ? "bg-teal-500 text-black"
                            : "bg-black/30 text-gray-400 hover:bg-black/50"
                        }`}
                      >
                        <span>{type.icon}</span>
                        <span>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Содержимое вкладок */}
              {tab === "ready" && hasReadyWorkouts && (
                <div className="space-y-3">
                  {filteredWorkouts.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">Упражнения не найдены</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Попробуйте изменить поиск или фильтр
                      </p>
                    </div>
                  ) : (
                    filteredWorkouts.map((workout, i) => (
                      <WorkoutItem
                        key={i}
                        workout={workout}
                        onSelect={() => {
                          onSave(workout);
                          setTimeout(() => closeWithAnimation(), 10);
                        }}
                      />
                    ))
                  )}
                </div>
              )}

              {tab === "added" && (
                <motion.div
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {addedWorkouts.length === 0 ? (
                    <div className="text-center py-8">
                      <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 mb-2">
                        Здесь появятся ваши упражнения
                      </p>
                      <p className="text-sm text-gray-500">
                        💪 Создавайте упражнения и они сохранятся здесь
                      </p>
                    </div>
                  ) : (
                    addedWorkouts.map((workout, i) => (
                      <WorkoutItem
                        key={i}
                        workout={workout}
                        onSelect={() => {
                          onSave(workout);
                          setTimeout(() => closeWithAnimation(), 10);
                        }}
                        onDelete={() => removeAdded(i)}
                        showDelete
                      />
                    ))
                  )}
                </motion.div>
              )}

              {tab === "manual" && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <Plus className="w-12 h-12 mx-auto mb-3 text-teal-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Создать упражнение
                    </h3>
                    <p className="text-sm text-gray-400">
                      Введите параметры упражнения и оно сохранится в вашем
                      списке
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Название упражнения *
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Например: Тяга к поясу"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Тип упражнения
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          type: e.target.value as WorkoutData["type"],
                        }))
                      }
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                    >
                      <option value="strength">Силовое</option>
                      <option value="cardio">Кардио</option>
                      <option value="flexibility">Растяжка</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "sets", name: "Подходы" },
                      { key: "reps", name: "Повторы" },
                      { key: "weight", name: "Вес (кг)" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm text-gray-300 mb-2">
                          {field.name}
                        </label>
                        <input
                          name={field.key}
                          type="number"
                          placeholder={
                            field.key === "weight" ? "необязательно" : "0"
                          }
                          value={(form as any)[field.key] ?? ""}
                          onChange={handleChange}
                          className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {form.type !== "strength" && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Длительность (минуты)
                      </label>
                      <input
                        name="duration"
                        type="number"
                        placeholder="15"
                        value={form.duration ?? ""}
                        onChange={handleChange}
                        className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleManualSave}
                    className="w-full mt-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 transition-all"
                  >
                    Добавить упражнение
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Компонент элемента упражнения
function WorkoutItem({
  workout,
  onSelect,
  onDelete,
  showDelete = false,
}: {
  workout: WorkoutData;
  onSelect: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}) {
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "strength":
        return "🏋️";
      case "cardio":
        return "🏃";
      case "flexibility":
        return "🧘";
      default:
        return "💪";
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "strength":
        return "text-orange-400";
      case "cardio":
        return "text-red-400";
      case "flexibility":
        return "text-purple-400";
      default:
        return "text-green-400";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="border border-gray-600 rounded-xl p-3 hover:border-teal-400 transition-all cursor-pointer bg-black/20 hover:bg-black/30"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getTypeIcon(workout.type)}</span>
            <p className="font-semibold text-white">{workout.name}</p>
          </div>

          {workout.planTitle && (
            <p className="text-[11px] text-gray-500 mb-1">
              План: {workout.planTitle}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400">
            {workout.type && (
              <span className={getTypeColor(workout.type)}>
                {workout.type === "strength" && "Силовое"}
                {workout.type === "cardio" && "Кардио"}
                {workout.type === "flexibility" && "Растяжка"}
              </span>
            )}

            {workout.type === "strength" ? (
              <span>
                {workout.sets}×{workout.reps}{" "}
                {workout.weight ? `• ${workout.weight}кг` : ""}
              </span>
            ) : workout.duration ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {workout.duration} мин
              </span>
            ) : null}

            {typeof workout.calories === "number" && workout.calories > 0 && (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                {workout.calories} ккал
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          {showDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-gray-400 hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <Dumbbell className="w-5 h-5 text-teal-400" />
        </div>
      </div>
    </motion.div>
  );
}
