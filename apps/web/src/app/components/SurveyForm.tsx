"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Activity,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Ruler,
  Weight,
} from "lucide-react";

type SurveyFormProps = {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
};

type Step = 1 | 2 | 3 | 4;

// стартовые замеры (включая запястье — оно нужно как параметр профиля)
const initialBody = {
  neck: "",
  shoulders: "",
  chest: "",
  arms: "",
  forearm: "",
  wrist: "",
  waist: "",
  hips: "",
  thigh: "",
  calf: "",
};

// цели по замерам — БЕЗ запястья
const initialGoalBody = {
  neck: "",
  shoulders: "",
  chest: "",
  arms: "",
  forearm: "",
  waist: "",
  hips: "",
  thigh: "",
  calf: "",
};

export default function SurveyForm({
  onSubmit,
  initialData,
  onCancel,
}: SurveyFormProps) {
  const [step, setStep] = useState<Step>(1);

  // базовый профиль (то, что мы храним в userData.profile)
  const profile = initialData?.profile || initialData || {};

  // ==== Шаг 1 — базовые данные ====

  const [sex, setSex] = useState<"male" | "female">(
    profile.sex === "female" ? "female" : "male",
  );

  const [age, setAge] = useState<string>(
    profile.age != null ? String(profile.age) : "",
  );

  const [height, setHeight] = useState<string>(
    profile.heightCm != null
      ? String(profile.heightCm)
      : profile.height != null
      ? String(profile.height)
      : "",
  );

  // для стартовых вводных берём в первую очередь weightStart
  const initialWeight =
    initialData?.weightStart != null
      ? initialData.weightStart
      : initialData?.weight != null
      ? initialData.weight
      : profile.weightKg != null
      ? profile.weightKg
      : "";

  const [weight, setWeight] = useState<string>(
    initialWeight !== "" ? String(initialWeight) : "",
  );

  // ==== Шаг 2 — активность и цель ====

  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "light" | "moderate" | "active" | "athlete"
  >(profile.activityLevel ?? "moderate");

  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">(
    profile.goal ?? "lose",
  );

  // ==== Шаг 3 — стартовые замеры (current в момент старта) ====
  // здесь хотим видеть ИМЕННО bodyStart, а не текущие
  const sourceBody = initialData?.bodyStart || initialData?.body || {};

  const [body, setBody] = useState<{ [k: string]: string }>(() => ({
    ...initialBody,
    ...Object.fromEntries(
      Object.entries(sourceBody).map(([k, v]) => [
        k,
        v != null ? String(v) : "",
      ]),
    ),
  }));

  // ==== Шаг 4 — целевой вес и целевые замеры (без запястья) ====

  const [targetWeight, setTargetWeight] = useState<string>(
    initialData?.targetWeight != null ? String(initialData.targetWeight) : "",
  );

  const goalSource = initialData?.bodyGoal || initialData?.bodyTarget || {};

  const [bodyGoal, setBodyGoal] = useState<{ [k: string]: string }>(() => ({
    ...initialGoalBody,
    ...Object.fromEntries(
      Object.entries(goalSource)
        .filter(([k]) => k in initialGoalBody)
        .map(([k, v]) => [k, v != null ? String(v) : ""]),
    ),
  }));

  const [error, setError] = useState<string | null>(null);

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // ===== навигация по шагам =====

  const nextStep = () => {
    if (step === 1) {
      if (!age || !height || !weight) {
        setError("Заполни возраст, рост и вес, чтобы продолжить.");
        return;
      }
      if (Number(age) < 12 || Number(age) > 80) {
        setError("Укажи реальный возраст (12–80 лет).");
        return;
      }
      if (Number(height) < 120 || Number(height) > 230) {
        setError("Рост укажи в сантиметрах (примерно 150–210).");
        return;
      }
      if (Number(weight) < 30 || Number(weight) > 220) {
        setError("Вес кажется нереалистичным, проверь ещё раз.");
        return;
      }
    }
    if (step === 2) {
      if (!activityLevel || !goal) {
        setError("Выбери уровень активности и цель.");
        return;
      }
    }
    setError(null);
    setStep((prev) => (prev === 4 ? 4 : ((prev + 1) as Step)));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as Step)));
  };

  const handleBodyChange = (name: string, value: string) => {
    setBody((prev) => ({ ...prev, [name]: value }));
  };

  const handleBodyGoalChange = (name: string, value: string) => {
    setBodyGoal((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinish = () => {
    const normalizedBody = Object.fromEntries(
      Object.entries(body).map(([k, v]) => [
        k,
        v === "" || v == null || isNaN(Number(v)) ? null : Number(v),
      ]),
    );

    const normalizedBodyGoal = Object.fromEntries(
      Object.entries(bodyGoal).map(([k, v]) => [
        k,
        v === "" || v == null || isNaN(Number(v)) ? null : Number(v),
      ]),
    );

    const payload = {
      sex,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      activityLevel,
      goal,
      // это стартовые замеры (bodyStart)
      body: normalizedBody,
      // цели — всё опционально
      targetWeight: targetWeight ? Number(targetWeight) : undefined,
      bodyGoal: normalizedBodyGoal,
    };

    onSubmit(payload);
  };

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        className="glass-card p-6 sm:p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Верхушка / индикатор шагов */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-300/80 mb-1">
              Шаг {step} из 4
            </p>
            <h1 className="text-xl sm:text-2xl font-bold neon-text-teal">
              Настроим твой профиль
            </h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full ${
                  s <= step ? "bg-teal-400" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Шаг 1 — пол, возраст, рост, вес */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-gray-100">
                  Базовые данные
                </h2>
              </div>

              {/* Пол */}
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Пол</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSex("male")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border ${
                      sex === "male"
                        ? "border-teal-400 bg-teal-500/20 text-teal-100"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    Мужской
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex("female")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border ${
                      sex === "female"
                        ? "border-teal-400 bg-teal-500/20 text-teal-100"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    Женский
                  </button>
                </div>
              </div>

              {/* Возраст / рост / вес */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <FieldNumber
                  label="Возраст"
                  suffix="лет"
                  value={age}
                  onChange={setAge}
                />
                <FieldNumber
                  label="Рост"
                  suffix="см"
                  value={height}
                  onChange={setHeight}
                />
                <FieldNumber
                  label="Вес"
                  suffix="кг"
                  value={weight}
                  onChange={setWeight}
                />
              </div>
            </motion.div>
          )}

          {/* Шаг 2 — активность и цель */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-gray-100">
                  Тренировки и цель
                </h2>
              </div>

              {/* Активность */}
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Сколько тренировок и активности в неделю?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ChoiceCard
                    active={activityLevel === "sedentary"}
                    onClick={() => setActivityLevel("sedentary")}
                    title="Редко двигаюсь"
                    subtitle="0–1 тренировка"
                  />
                  <ChoiceCard
                    active={activityLevel === "light"}
                    onClick={() => setActivityLevel("light")}
                    title="Лёгкая активность"
                    subtitle="1–2 тренировки"
                  />
                  <ChoiceCard
                    active={activityLevel === "moderate"}
                    onClick={() => setActivityLevel("moderate")}
                    title="Умеренная активность"
                    subtitle="3–4 тренировки"
                  />
                  <ChoiceCard
                    active={activityLevel === "active"}
                    onClick={() => setActivityLevel("active")}
                    title="Высокая активность"
                    subtitle="5–6 тренировок"
                  />
                  <ChoiceCard
                    active={activityLevel === "athlete"}
                    onClick={() => setActivityLevel("athlete")}
                    title="Очень активный"
                    subtitle="Спорт почти каждый день"
                    full
                  />
                </div>
              </div>

              {/* Цель */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-400" />
                  <p className="text-sm text-gray-300">Твоя цель</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setGoal("lose")}
                    className={`rounded-xl px-3 py-2 text-sm font-medium border ${
                      goal === "lose"
                        ? "border-teal-400 bg-teal-500/20 text-teal-100"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    Похудение
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoal("maintain")}
                    className={`rounded-xl px-3 py-2 text-sm font-medium border ${
                      goal === "maintain"
                        ? "border-teal-400 bg-teal-500/20 text-teal-100"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    Баланс
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoal("gain")}
                    className={`rounded-xl px-3 py-2 text-sm font-medium border ${
                      goal === "gain"
                        ? "border-teal-400 bg-teal-500/20 text-teal-100"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    Набор
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Шаг 3 — стартовые замеры */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-gray-100">
                  Параметры тела на старте (опционально)
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Эти замеры станут точкой отсчёта. Запястье учитываем только
                для пропорций и формул, в динамической истории оно участвовать
                не будет.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                {Object.keys(initialBody).map((key) => (
                  <MeasurementField
                    key={key}
                    name={key}
                    label={translateName(key)}
                    value={body[key] ?? ""}
                    onChange={handleBodyChange}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Шаг 4 — цели по весу и замерам (БЕЗ запястья) */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-gray-100">
                  Цели по весу и замерам (опционально)
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Здесь можно зафиксировать, к каким значениям ты хочешь прийти.
                Это не влияет на расчёт калорий, но поможет отслеживать путь к форме.
              </p>

              {/* Целевой вес */}
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Желаемый вес</p>
                <div className="flex items-center gap-2 bg-black/30 border border-white/15 rounded-xl px-3 py-2 max-w-xs">
                  <input
                    type="number"
                    inputMode="decimal"
                    className="bg-transparent outline-none text-sm text-white w-full"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="Например, 76"
                  />
                  <span className="text-xs text-gray-400">кг</span>
                </div>
              </div>

              {/* Целевые замеры (без запястья) */}
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  Желаемые замеры (можно заполнить частично)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                  {Object.keys(initialGoalBody).map((key) => (
                    <MeasurementField
                      key={key}
                      name={key}
                      label={translateName(key)}
                      value={bodyGoal[key] ?? ""}
                      onChange={handleBodyGoalChange}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопки навигации */}
        <div className="mt-6 flex justify-between items-center gap-3">
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-sm text-gray-200 flex items-center gap-1 hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
            )}
            {onCancel && step === 1 && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-white/10 bg-transparent text-sm text-gray-400 hover:bg-white/5 transition"
              >
                Отмена
              </button>
            )}
          </div>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="cosmic-button flex items-center gap-2 px-5 py-2 rounded-xl text-sm"
            >
              Далее
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="cosmic-button flex items-center gap-2 px-5 py-2 rounded-xl text-sm"
            >
              Завершить
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===== Вспомогательные компоненты =====

function FieldNumber({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-300">{label}</p>
      <div className="flex items-center gap-2 bg-black/30 border border-white/15 rounded-xl px-3 py-2">
        <input
          type="number"
          inputMode="decimal"
          className="bg-transparent outline-none text-sm text-white w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}

function ChoiceCard({
  active,
  onClick,
  title,
  subtitle,
  full,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl px-4 py-3 border text-sm flex flex-col gap-1 ${
        full ? "sm:col-span-2" : ""
      } ${
        active
          ? "border-teal-400 bg-teal-500/15 text-teal-50"
          : "border-white/10 bg-white/5 text-gray-200"
      }`}
    >
      <span className="font-medium">{title}</span>
      <span className="text-xs text-gray-400">{subtitle}</span>
    </button>
  );
}

function MeasurementField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-300">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="bg-black/40 border border-teal-500/30 rounded-lg w-20 p-1 text-right text-xs text-white focus:border-teal-500 focus:outline-none"
          placeholder="0"
        />
        <span className="text-[10px] text-gray-500">см</span>
      </div>
    </div>
  );
}

function translateName(key: string) {
  const map: Record<string, string> = {
    neck: "Шея",
    shoulders: "Плечи",
    chest: "Грудь",
    arms: "Руки",
    forearm: "Предплечье",
    wrist: "Запястье",
    waist: "Талия",
    hips: "Бёдра",
    thigh: "Бедро",
    calf: "Икра",
  };
  return map[key] || key;
}
