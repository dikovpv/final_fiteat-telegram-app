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
  X,
} from "lucide-react";
import {
  DEFAULT_ENTRY,
  DIARY_SELECTED_DATE_KEY,
  DIARY_STORAGE_PREFIX,
  type DiaryEntry,
  type DiaryWorkout,
} from "../diary-types";

import { WORKOUT_TEMPLATES } from "../../workouts/workouts-data";

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
  readyWorkouts?: WorkoutData[];
}

const ACCENT_GOLD = "var(--accent-gold)";

export default function AddWorkoutModal({
  onClose,
  onSave,
  readyWorkouts = [],
}: AddWorkoutModalProps) {
  // базовые упражнения из шаблонов программ
  const baseWorkouts = useMemo<WorkoutData[]>(
    () =>
      WORKOUT_TEMPLATES.flatMap((plan) =>
        plan.exercises.map((exercise) => ({
          id: exercise.id || exercise.slug,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          type: exercise.type,
          planSlug: plan.slug,
          exerciseSlug: exercise.slug,
          planTitle: plan.title,
        }))
      ),
    []
  );

  const mergeWorkouts = (...lists: WorkoutData[][]): WorkoutData[] => {
    const map = new Map<string, WorkoutData>();

    lists.flat().forEach((workout) => {
      if (!workout) return;
      const id = workout.id || workout.exerciseSlug || workout.name;
      if (id) map.set(id, workout);
    });

    return Array.from(map.values());
  };

  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutData[]>(() =>
    mergeWorkouts(baseWorkouts, readyWorkouts)
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

  // Фильтрация упражнений
  const filteredWorkouts = useMemo(
    () =>
      hasReadyWorkouts
        ? availableWorkouts.filter((workout) => {
            const text = [workout.name || "", workout.planTitle || ""]
              .join(" ")
              .toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = text.includes(query);
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
      // ignore
    }
  }, []);

  // Подмешиваем упражнения из дневника для выбранной даты
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

      setAvailableWorkouts((prev) =>
        mergeWorkouts(baseWorkouts, readyWorkouts, prev, workouts)
      );
    } catch {
      // ignore
    }
  }, [baseWorkouts, readyWorkouts]);

  // следим за изменением readyWorkouts
  useEffect(() => {
    setAvailableWorkouts((prev) =>
      mergeWorkouts(baseWorkouts, readyWorkouts, prev)
    );
  }, [baseWorkouts, readyWorkouts]);

  // ВАЖНО: не форсим таб "ready", чтобы можно было пользоваться вкладками
  // (как мы уже исправили в модалке блюд)

  const saveAdded = (data: WorkoutData[]) => {
    try {
      localStorage.setItem("fitEatAddedWorkouts", JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }, 250);
  };

  const handleManualSave = () => {
    if (!form.name.trim()) {
      alert("Введите название упражнения");
      return;
    }

    // Грубая оценка калорий, если не указали вручную
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

  // Вкладки: визуально такие же, как в AddMealModal
  const tabs: { key: typeof tab; label: string }[] = [
    ...(hasReadyWorkouts ? [{ key: "ready" as const, label: "Упражнения" }] : []),
    { key: "added", label: "Мои упражнения" },
    { key: "manual", label: "Вручную" },
  ];

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeWithAnimation}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Золотая шапка как в модалке блюд */}
            <div
              className="px-5 py-4 flex items-center justify-between text-white"
              style={{ backgroundColor: ACCENT_GOLD }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    Добавить упражнение
                  </h2>
                  <p className="text-xs sm:text-[13px] text-white/85">
                    Выберите готовое или добавьте своё упражнение.
                  </p>
                </div>
              </div>
              <button
                onClick={closeWithAnimation}
                className="p-1 rounded-full hover:bg-black/10 transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Контент модалки */}
            <div className="px-5 pt-3 pb-5 max-h-[80vh] overflow-y-auto bg-[var(--bg)]/40">
              {/* Вкладки */}
              <div className="flex border-b border-[var(--border-soft)] text-sm font-medium overflow-x-auto mb-3">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`relative px-3 py-2 whitespace-nowrap transition-colors ${
                      tab === t.key
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                    style={
                      tab === t.key
                        ? { color: ACCENT_GOLD }
                        : undefined
                    }
                  >
                    {t.label}
                    {tab === t.key && (
                      <span
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                        style={{ backgroundColor: ACCENT_GOLD }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Поиск и фильтр для "Упражнений" */}
              {tab === "ready" && hasReadyWorkouts && (
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Поиск упражнений..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-transparent"
                      style={{
                        outlineColor: ACCENT_GOLD,
                        boxShadow: "0 0 0 1px transparent",
                      }}
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {workoutTypes.map((type) => {
                      const active = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition ${
                            active
                              ? "text-white"
                              : "bg-[var(--surface)] border-[var(--border-soft)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                          }`}
                          style={
                            active
                              ? {
                                  backgroundColor: ACCENT_GOLD,
                                  borderColor: ACCENT_GOLD,
                                }
                              : undefined
                          }
                        >
                          <span>{type.icon}</span>
                          <span>{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Вкладка "Упражнения" */}
              {tab === "ready" && hasReadyWorkouts && (
                <div className="space-y-3">
                  {filteredWorkouts.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                      <Search className="w-10 h-10 mx-auto mb-2 text-[var(--border-soft)]" />
                      Упражнения не найдены. Попробуйте изменить поиск или
                      фильтр.
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

              {/* Вкладка "Мои упражнения" */}
              {tab === "added" && (
                <motion.div
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {addedWorkouts.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                      <Dumbbell className="w-10 h-10 mx-auto mb-2 text-[var(--border-soft)]" />
                      Здесь появятся упражнения, которые вы создадите вручную.
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

              {/* Вкладка "Вручную" */}
              {tab === "manual" && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-[var(--text-secondary)]">
                    Создайте своё упражнение с любыми параметрами. Оно появится
                    в разделе «Мои упражнения».
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-primary)]">
                      Название упражнения *
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Например: Тяга к поясу"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                      style={{ outlineColor: ACCENT_GOLD }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-primary)]">
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
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                      style={{ outlineColor: ACCENT_GOLD }}
                    >
                      <option value="strength">Силовое</option>
                      <option value="cardio">Кардио</option>
                      <option value="flexibility">Растяжка</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "sets", label: "Подходы" },
                      { key: "reps", label: "Повторы" },
                      { key: "weight", label: "Вес (кг)" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm mb-1 text-[var(--text-primary)]">
                          {field.label}
                        </label>
                        <input
                          name={field.key}
                          type="number"
                          placeholder={
                            field.key === "weight" ? "необязательно" : "0"
                          }
                          value={(form as any)[field.key] ?? ""}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                          style={{ outlineColor: ACCENT_GOLD }}
                        />
                      </div>
                    ))}
                  </div>

                  {form.type !== "strength" && (
                    <div>
                      <label className="block text-sm mb-1 text-[var(--text-primary)]">
                        Длительность (мин)
                      </label>
                      <input
                        name="duration"
                        type="number"
                        placeholder="15"
                        value={form.duration ?? ""}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-soft)]"
                        style={{ outlineColor: ACCENT_GOLD }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleManualSave}
                    className="w-full mt-2 rounded-xl text-white text-sm font-semibold py-2.5 hover:brightness-105 transition"
                    style={{ backgroundColor: ACCENT_GOLD }}
                  >
                    Добавить в тренировку
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

// Элемент упражнения
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className="border border-[var(--border-soft)] rounded-xl px-3.5 py-3 bg-[var(--surface)] hover:border-[var(--border-strong)] transition cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getTypeIcon(workout.type)}</span>
            <p className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
              {workout.name}
            </p>
          </div>

          {workout.planTitle && (
            <p className="text-[11px] text-[var(--text-tertiary)] mb-1">
              План: {workout.planTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-[var(--text-secondary)]">
            {workout.type && (
              <span>
                {workout.type === "strength" && "Силовое"}
                {workout.type === "cardio" && "Кардио"}
                {workout.type === "flexibility" && "Растяжка"}
              </span>
            )}

            {workout.type === "strength" ? (
              <span>
                {workout.sets}×{workout.reps}{" "}
                {workout.weight ? `• ${workout.weight} кг` : ""}
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

        <div className="flex items-center gap-2 ml-1">
          {showDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded-full hover:bg-[var(--surface-muted)] text-[var(--danger)] transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <Dumbbell className="w-5 h-5 text-[var(--accent-gold)]" />
        </div>
      </div>
    </motion.div>
  );
}
