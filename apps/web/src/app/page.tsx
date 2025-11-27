"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import SurveyForm from "./components/SurveyForm";

import {
  Activity,
  Target,
  TrendingUp,
  Zap,
  Flame,
  Droplets,
  Wheat,
  Weight,
  User,
  Trophy,
  Sparkles,
} from "lucide-react";

import {
  calculateMacrosForUser,
  type ProfileInput,
  type Sex,
  type ActivityLevel,
  type GoalType,
} from "@/lib/nutrition";

import {
  DEFAULT_ENTRY,
  DIARY_STORAGE_PREFIX,
} from "./diary/diary-types";

// ================== ТИПЫ ДЛЯ НЕДЕЛЬНЫХ ПРИВЫЧЕК ==================

type DayStatus = "success" | "fail" | "rest" | null;

type WeeklyDayMeta = {
  date: string;
  weekday: string; // ПН, ВТ, …
  day: string; // 17, 18, …
};

type WeeklyStats = {
  days: WeeklyDayMeta[];
  nutrition: DayStatus[];
  workouts: DayStatus[];
  water: DayStatus[];
  sleep: DayStatus[];
};

type TodaySleepInfo = {
  start: string | null;
  end: string | null;
  hours: number;
};

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

// Локальная дата в формате YYYY-MM-DD (совпадает с value у <input type="date">)
function getLocalISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Прочитать дневник за день
function getDiaryFor(dateISO: string) {
  if (typeof window === "undefined") return null;
  const key = `${DIARY_STORAGE_PREFIX}${dateISO}`;
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

// Итоги по БЖУ за день (по отмеченным done)
function getDiaryTotalsFor(dateISO: string) {
  if (typeof window === "undefined") {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }
  const key = `${DIARY_STORAGE_PREFIX}${dateISO}`;
  const saved = localStorage.getItem(key);
  if (!saved) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  try {
    const data = JSON.parse(saved);
    const totals = (data?.meals || []).reduce(
      (acc: any, m: any) => {
        if (m?.done) {
          acc.calories += Number(m.calories) || 0;
          acc.protein += Number(m.protein) || 0;
          acc.fat += Number(m.fat) || 0;
          acc.carbs += Number(m.carbs) || 0;
        }
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    return totals;
  } catch {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }
}

// Собираем профиль пользователя из данных формы и/или прошлых данных
function buildProfileFromForm(data: any, prev?: any): ProfileInput | null {
  const pick = (keys: string[], fallback?: any) => {
    for (const k of keys) {
      if (data && data[k] != null && data[k] !== "") return data[k];
    }
    if (prev) {
      for (const k of keys) {
        if (prev && prev[k] != null && prev[k] !== "") return prev[k];
      }
    }
    return fallback;
  };

  const rawAge = Number(pick(["age", "ageYears", "userAge"], undefined));
  const rawHeight = Number(
    pick(["height", "heightCm", "height_cm"], undefined)
  );
  const rawWeight = Number(pick(["weight", "currentWeight"], undefined));

  let rawSex = pick(["sex", "gender"], "male");
  if (typeof rawSex === "string") {
    rawSex = rawSex.toLowerCase();
  }

  let sex: Sex = "male";
  if (
    rawSex === "female" ||
    rawSex === "f" ||
    rawSex === "woman" ||
    rawSex === "жен" ||
    rawSex === "ж" ||
    rawSex === "девушка"
  ) {
    sex = "female";
  }

  const rawAct = pick(["activityLevel", "activity", "lifestyle"], "moderate");
  let activityLevel: ActivityLevel = "moderate";
  const act = String(rawAct).toLowerCase();
  if (["sedentary", "сидячий", "низкая"].includes(act))
    activityLevel = "sedentary";
  else if (["light", "легкая", "легкая активность"].includes(act))
    activityLevel = "light";
  else if (["moderate", "умеренная", "средняя"].includes(act))
    activityLevel = "moderate";
  else if (["active", "высокая", "активная"].includes(act))
    activityLevel = "active";
  else if (["athlete", "очень высокая", "спорт"].includes(act))
    activityLevel = "athlete";

  const rawGoal = pick(["goal", "goalType", "targetMode"], "lose");
  let goal: GoalType = "lose";
  const g = String(rawGoal).toLowerCase();
  if (["lose", "fatloss", "снижение", "похудение"].includes(g)) goal = "lose";
  else if (["maintain", "держать", "поддержка"].includes(g))
    goal = "maintain";
  else if (["gain", "bulk", "набор"].includes(g)) goal = "gain";

  if (!rawAge || !rawHeight || !rawWeight) {
    return null;
  }

  return {
    age: rawAge,
    heightCm: rawHeight,
    weightKg: rawWeight,
    sex,
    activityLevel,
    goal,
  };
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
    weight: "Вес",
  };

  return map[key] || key;
}

// ---- формула Navy, авто-% жира ----
function computeBodyFatNavy(body: any, profile: any): number | null {
  if (!profile) return null;

  const height =
    Number(profile.heightCm ?? profile.height ?? profile.height_cm) || 0;
  const sex = (profile.sex ?? "male") as Sex;

  const waist = Number(body?.waist) || 0;
  const neck = Number(body?.neck) || 0;
  const hips = Number(body?.hips) || 0;

  if (!height || !waist || !neck) return null;
  let bf: number;

  if (sex === "male") {
    bf =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - neck) +
          0.15456 * Math.log10(height)) -
      450;
  } else {
    if (!hips) return null;
    bf =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist + hips - neck) +
          0.221 * Math.log10(height)) -
      450;
  }

  if (!isFinite(bf)) return null;
  return Math.round(bf * 10) / 10;
}

// ================== ГЛАВНАЯ СТРАНИЦА ==================

export default function HomePage() {
  const [userData, setUserData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [todayTotals, setTodayTotals] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  const [todayWater, setTodayWater] = useState(0);
  const [todaySleep, setTodaySleep] = useState<TodaySleepInfo>({
    start: null,
    end: null,
    hours: 0,
  });

  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    days: [],
    nutrition: Array(7).fill(null),
    workouts: Array(7).fill(null),
    water: Array(7).fill(null),
    sleep: Array(7).fill(null),
  });

  // ---------- Обновление дневных КБЖУ, воды и сна при фокусе окна ----------
  useEffect(() => {
    const updateFromDiary = () => {
      const todayISO = getLocalISODate();
      setTodayTotals(getDiaryTotalsFor(todayISO));

      const diary: any = getDiaryFor(todayISO) || {};

      const waterVal =
        typeof diary.water === "number" && !isNaN(diary.water)
          ? diary.water
          : 0;

      let start: string | null = null;
      let end: string | null = null;
      let hours = 0;

      if (diary.sleep?.start && diary.sleep?.end) {
        start = String(diary.sleep.start);
        end = String(diary.sleep.end);
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        let minutes = eh * 60 + em - (sh * 60 + sm);
        if (minutes < 0) minutes += 1440;
        hours = Math.round(minutes / 60);
      }

      setTodayWater(waterVal);
      setTodaySleep({ start, end, hours });
    };

    updateFromDiary();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", updateFromDiary);
      return () => window.removeEventListener("focus", updateFromDiary);
    }
  }, []);

  // ---------- Telegram WebApp ----------
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (!user) return;
    const telegramUserData = {
      id: user.id,
      firstName: user.first_name,
      username: user.username,
    };
    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramUserData),
    })
      .then((res) => res.json())
      .then((data) => setTelegramUser(data))
      .catch((err) => console.error("Ошибка Telegram sync:", err));
  }, []);

  // ---------- Загрузка профиля ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("fitEatUserData");
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  // ---------- Флаг "открыть анкету" из профиля ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = localStorage.getItem("fitEatOpenSurveyOnHome");
    if (flag === "1") {
      setShowForm(true);
      localStorage.removeItem("fitEatOpenSurveyOnHome");
    }
  }, []);

  // ---------- Сохранение профиля ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userData)
      localStorage.setItem("fitEatUserData", JSON.stringify(userData));
  }, [userData]);

  // ---------- Недельные привычки по дневнику ----------
  useEffect(() => {
    const today = new Date();

    // формируем массив метаданных по дням (подписи над квадратиками)
    const daysMeta: WeeklyDayMeta[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const dateISO = d.toISOString().split("T")[0];

      const weekdayIndex = d.getDay(); // 0..6
      const weekdayNames = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
      const weekday = weekdayNames[weekdayIndex] || "";

      daysMeta.push({
        date: dateISO,
        weekday,
        day: String(d.getDate()).padStart(2, "0"),
      });
    }

    // если профиля нет — просто показываем пустую статистику, но с датами
    if (!userData) {
      setWeeklyStats({
        days: daysMeta,
        nutrition: Array(7).fill(null),
        workouts: Array(7).fill(null),
        water: Array(7).fill(null),
        sleep: Array(7).fill(null),
      });
      return;
    }

    const caloriesGoal = userData.calories ?? 2400;
    const proteinGoal = userData.proteinGoal ?? 160;

    const nutrition: DayStatus[] = [];
    const workouts: DayStatus[] = [];
    const water: DayStatus[] = [];
    const sleep: DayStatus[] = [];

    for (let i = 0; i < daysMeta.length; i++) {
      const dateISO = daysMeta[i].date;
      const diary: any = getDiaryFor(dateISO) || {};

      // ---------- ПИТАНИЕ ----------
      const totals = getDiaryTotalsFor(dateISO);
      const cal = totals.calories || 0;
      const prot = totals.protein || 0;

      if (cal === 0 && prot === 0) {
        nutrition.push(null);
      } else {
        const calPct = caloriesGoal > 0 ? cal / caloriesGoal : 0;
        const protPct = proteinGoal > 0 ? prot / proteinGoal : 0;

        if (calPct >= 0.85 && calPct <= 1.15 && protPct >= 0.85) {
          nutrition.push("success");
        } else {
          nutrition.push("fail");
        }
      }

      // ---------- ТРЕНИРОВКИ ----------
      if (diary.isRestDay) {
        workouts.push("rest");
      } else if (!diary.workouts || diary.workouts.length === 0) {
        workouts.push(null);
      } else {
        const total = diary.workouts.length;
        const done = diary.workouts.filter((w: any) => w.done).length;
        if (done === 0) {
          workouts.push("fail");
        } else {
          const ratio = done / total;
          workouts.push(ratio >= 0.7 ? "success" : "fail");
        }
      }

      // ---------- ВОДА ----------
      const waterVal =
        typeof diary.water === "number" && !isNaN(diary.water)
          ? diary.water
          : 0;
      if (!waterVal) {
        water.push(null);
      } else {
        const waterPct = waterVal / 2.5; // цель 2.5л
        water.push(waterPct >= 0.85 ? "success" : "fail");
      }

      // ---------- СОН ----------
      const sleepData = diary.sleep || {};
      if (!sleepData.start || !sleepData.end) {
        sleep.push(null);
      } else {
        const [sh, sm] = String(sleepData.start).split(":").map(Number);
        const [eh, em] = String(sleepData.end).split(":").map(Number);
        let minutes = eh * 60 + em - (sh * 60 + sm);
        if (minutes < 0) minutes += 1440;
        const hours = minutes / 60;

        if (hours >= 7) {
          sleep.push("success");
        } else {
          sleep.push("fail");
        }
      }
    }

    setWeeklyStats({
      days: daysMeta,
      nutrition,
      workouts,
      water,
      sleep,
    });
  }, [userData, todayTotals, todayWater]);

  // ================== ОБРАБОТЧИКИ ФОРМ ==================

  // анкета (стартовые вводные / их изменение)
  // ================== ОБРАБОТЧИКИ ФОРМ ==================

const handleFormSubmit = (data: any) => {
  setUserData((prev: any) => {
    const isFirstSetup = !prev; // первый запуск, истории ещё нет
    const hasHistory =
      !!prev?.measurementsHistory?.length || !!prev?.body; // уже есть текущие замеры

    // --- профиль для расчёта КБЖУ ---

    // ВАЖНО: при изменении стартовых
    // используем для профиля ТЕКУЩИЙ вес, а не новый стартовый
    const profileSource = {
      ...data,
      weight: hasHistory && prev?.weight ? prev.weight : data.weight,
    };

    const profile = buildProfileFromForm(profileSource, prev);
    const macros = profile ? calculateMacrosForUser(profile) : null;

    // --- базовый объект, который будем наполнять ---

    const next: any = {
      ...prev,

      // дубли наверху (чтобы не потерять старое поведение)
      sex: data.sex,
      age: data.age,
      height: data.height,
      activityLevel: data.activityLevel,
      goal: data.goal,

      // цели (можно не трогать, если в анкете пусто)
      targetWeight:
        data.targetWeight !== undefined && data.targetWeight !== ""
          ? data.targetWeight
          : prev?.targetWeight,
      bodyGoal: data.bodyGoal || prev?.bodyGoal,
    };

    // --- стартовые и текущие замеры / вес ---

    if (isFirstSetup || !hasHistory) {
      // Нет истории — старт = текущие
      next.weightStart = data.weight;
      next.weight = data.weight;

      next.bodyStart = data.body || null;
      next.body = data.body || null;
    } else {
      // История уже есть — меняем только старт
      next.weightStart =
        data.weight !== undefined && data.weight !== ""
          ? data.weight
          : prev?.weightStart ?? prev?.weight;

      next.bodyStart = data.body || prev?.bodyStart || null;

      // ТЕКУЩИЕ значения специально НЕ трогаем:
      // next.weight = prev.weight;
      // next.body   = prev.body;
    }

    // --- КБЖУ и профиль ---

    if (macros && profile) {
      next.calories = macros.calories;
      next.proteinGoal = macros.proteinGoal;
      next.fatGoal = macros.fatGoal;
      next.carbsGoal = macros.carbsGoal;

      next.profile = {
        ...(prev?.profile || {}),
        ...profile,
        // В профиле вес = текущий, если он уже есть
        weightKg:
          hasHistory && prev?.weight
            ? prev.weight
            : profile.weightKg,
      };
    }

    return next;
  });

  setShowForm(false);
};


  // новые замеры (текущие)
  const handleSaveMeasurements = (newData: any) => {
    const date = newData.date || new Date().toISOString();

    // 1. Новый актуальный вес
    const newWeight =
      typeof newData.weight === "number" && !isNaN(newData.weight)
        ? newData.weight
        : userData?.weight ?? 0;

    // 2. Пересчёт КБЖУ по текущему весу (если есть профиль)
    let updatedProfile = userData?.profile;
    let macros: ReturnType<typeof calculateMacrosForUser> | null = null;

    if (updatedProfile && newWeight > 0) {
      updatedProfile = {
        ...updatedProfile,
        weightKg: newWeight,
      };
      macros = calculateMacrosForUser(updatedProfile);
    }

    // собираем новое "текущее" тело
    const mergedBody = {
      ...(userData?.body || {}),
      ...newData,
    };

    // авто % жира по Navy
    const autoBodyFat = computeBodyFatNavy(mergedBody, userData?.profile);

    const hasHistory = (userData?.measurementsHistory || []).length > 0;
    const hasStart = !!userData?.bodyStart;

    let weightStart = userData?.weightStart ?? null;
    let bodyStart = userData?.bodyStart ?? null;
    let bodyFatStart = userData?.bodyFatStart ?? null;

    // если старт ещё не задан и истории нет — первый замер становится стартом
    if (!hasHistory && !hasStart) {
      weightStart = newWeight;
      bodyStart = mergedBody;
      if (autoBodyFat != null) {
        bodyFatStart = autoBodyFat;
      }
    }

    // в историю не кладём запястье, только остальные окружности + вес + % жира
    const { wrist, ...historyBody } = mergedBody as any;

    const historyEntry: any = {
      date,
      weight: newWeight,
      ...historyBody,
    };
    if (autoBodyFat != null) {
      historyEntry.bodyFat = autoBodyFat;
    }

    const updatedHistory = [
      ...(userData?.measurementsHistory || []),
      historyEntry,
    ];

    const updated: any = {
      ...userData,
      weight: newWeight,
      body: mergedBody,
      measurementsHistory: updatedHistory,
    };

    if (weightStart != null) updated.weightStart = weightStart;
    if (bodyStart) updated.bodyStart = bodyStart;
    if (bodyFatStart != null) updated.bodyFatStart = bodyFatStart;
    if (autoBodyFat != null) updated.bodyFatCurrent = autoBodyFat;

    // 4. Если пересчитали макросы — обновляем цели КБЖУ
    if (macros && updatedProfile) {
      updated.calories = macros.calories;
      updated.proteinGoal = macros.proteinGoal;
      updated.fatGoal = macros.fatGoal;
      updated.carbsGoal = macros.carbsGoal;
      updated.profile = updatedProfile;
    }

    setUserData(updated);
    setShowMeasurements(false);
  };

  const handleAddWater = (amount: number) => {
    if (typeof window === "undefined") return;
    const todayISO = getLocalISODate();
    const key = `${DIARY_STORAGE_PREFIX}${todayISO}`;
    const saved = localStorage.getItem(key);
    let entry: any;

    if (saved) {
      try {
        entry = JSON.parse(saved);
      } catch {
        entry = null;
      }
    }

    if (!entry) {
      entry = { ...DEFAULT_ENTRY, date: todayISO };
    }

    const currentWater =
      typeof entry.water === "number" && !isNaN(entry.water)
        ? entry.water
        : 0;

    entry.water = Math.max(0, currentWater + amount);

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.error("Ошибка сохранения воды с главной:", e);
    }

    setTodayWater(entry.water);
  };

  // ================== ЦЕЛИ И ПРОГРЕСС ==================

  const caloriesGoal = userData?.calories ?? 2400;
  const proteinGoal = userData?.proteinGoal ?? 160;
  const fatGoal = userData?.fatGoal ?? 80;
  const carbsGoal = userData?.carbsGoal ?? 300;

  const caloriesActual = todayTotals.calories;
  const proteinActual = todayTotals.protein;
  const fatActual = todayTotals.fat;
  const carbsActual = todayTotals.carbs;

  const weightStart = parseFloat(userData?.weightStart) || 0;
  const weightCurrent = parseFloat(userData?.weight) || 0;
  const weightTarget = parseFloat(userData?.targetWeight) || weightStart;
  let weightProgress = 0;
  const totalToLose = weightStart - weightTarget;
  const totalLost = weightStart - weightCurrent;
  if (totalToLose > 0) {
    weightProgress = (totalLost / totalToLose) * 100;
  } else if (totalToLose < 0) {
    const totalToGain = weightTarget - weightStart;
    const totalGained = weightCurrent - weightStart;
    weightProgress = (totalGained / totalToGain) * 100;
  }
  weightProgress = Math.max(0, Math.min(weightProgress, 100));

  // ----- % жира: старт / сейчас / цель -----

  const bodyStart = userData?.bodyStart || {};
  const bodyCurrent = userData?.body || bodyStart;
  const bodyTarget = userData?.bodyGoal || userData?.bodyTarget || {};

  const bodyFatStartRaw =
    userData?.bodyFatStart ?? computeBodyFatNavy(bodyStart, userData?.profile);
  const bodyFatCurrentRaw = computeBodyFatNavy(bodyCurrent, userData?.profile);

  let bodyFatTargetRaw: number | null =
    userData?.bodyFatTarget ?? computeBodyFatNavy(bodyTarget, userData?.profile);

  if (
    !bodyFatTargetRaw &&
    weightStart &&
    weightTarget &&
    bodyFatStartRaw != null
  ) {
    const leanMass = weightStart * (1 - bodyFatStartRaw / 100);
    if (weightTarget > leanMass) {
      bodyFatTargetRaw = 100 * (1 - leanMass / weightTarget);
    }
  }

  const bodyFatStart =
    bodyFatStartRaw != null ? Math.max(3, Math.min(bodyFatStartRaw, 60)) : null;
  const bodyFatCurrent =
    bodyFatCurrentRaw != null
      ? Math.max(3, Math.min(bodyFatCurrentRaw, 60))
      : bodyFatStart;
  const bodyFatTarget =
    bodyFatTargetRaw != null
      ? Math.max(3, Math.min(bodyFatTargetRaw, 60))
      : null;

  // ================== РЕНДЕР ==================

  return (
    <>
      <div className="cosmic-bg" />

      <div className="relative z-10 flex flex-col gap-6 px-4 sm:px-6 md:px-8 pt-6 pb-24">
        {/* верхняя панель с кнопкой профиля */}
        <div className="flex justify-end mb-2">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 border border-white/15 hover:bg-black/50 transition-all text-sm text-gray-200"
          >
            <User className="w-4 h-4" />
            <span>Профиль</span>
          </Link>
        </div>

        {/* Приветственный экран, если нет данных */}
        {!userData && !showForm ? (
          <motion.div
            className="flex flex-col items-center justify-center h-[80vh] px-6 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card p-8 max-w-sm">
              <Sparkles className="w-16 h-16 mx-auto mb-4 neon-text-teal" />
              <h1 className="text-2xl font-bold mb-4 neon-text-teal">
                Добро пожаловать в FitEat
              </h1>
              <p className="text-gray-300 mb-6">
                Твой персональный фитнес-коуч в Telegram. Давай начнем
                путешествие к идеальному телу!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="cosmic-button w-full"
              >
                Начать трансформацию
              </button>
            </div>
          </motion.div>
        ) : showForm ? (
          <SurveyForm onSubmit={handleFormSubmit} initialData={userData} />
        ) : (
          <>
            {/* приветствие из Telegram */}
            {telegramUser?.firstName && (
              <motion.div
                className="glass-card p-4 animate-slide-up"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-xl font-bold neon-text-teal flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Привет, {telegramUser.firstName}! 👋
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Готов к новым достижениям сегодня?
                </p>
              </motion.div>
            )}

            {/* Блок 1 — ежедневные КБЖУ */}
            <motion.section
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-lg font-bold mb-4 neon-text-green flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Сегодняшний прогресс
              </h2>
              <div className="flex items-center gap-6">
                <div className="w-[180px] h-[180px] flex-shrink-0">
                  <MultiRingProgress
                    calories={caloriesActual}
                    caloriesGoal={caloriesGoal}
                    protein={proteinActual}
                    proteinGoal={proteinGoal}
                    fat={fatActual}
                    fatGoal={fatGoal}
                    carbs={carbsActual}
                    carbsGoal={carbsGoal}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <StatsRow
                    label="Калории"
                    value={caloriesActual}
                    goal={caloriesGoal}
                    color="#00d4aa"
                    icon={<Flame className="w-4 h-4" />}
                  />
                  <StatsRow
                    label="Белки"
                    value={proteinActual}
                    goal={proteinGoal}
                    color="#39ff14"
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <StatsRow
                    label="Жиры"
                    value={fatActual}
                    goal={fatGoal}
                    color="#00f3ff"
                    icon={<Droplets className="w-4 h-4" />}
                  />
                  <StatsRow
                    label="Углеводы"
                    value={carbsActual}
                    goal={carbsGoal}
                    color="#ff6b6b"
                    icon={<Wheat className="w-4 h-4" />}
                  />
                </div>
              </div>
            </motion.section>

            {/* Блок 2 — недельные привычки */}
            <motion.section
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h2 className="text-lg font-bold mb-4 neon-text-blue flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Недельные привычки
              </h2>

              {/* подписи над квадратиками */}
              {weeklyStats.days.length === 7 && (
                <div className="flex justify-end mb-2 pr-1 gap-1">
                  {weeklyStats.days.map((d) => (
                    <div
                      key={d.date}
                      className="w-6 text-[10px] leading-tight text-center text-gray-500"
                    >
                      <div className="uppercase">{d.weekday}</div>
                      <div>{d.day}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <WeeklyHabitRow label="Питание" data={weeklyStats.nutrition} />
                <WeeklyHabitRow label="Тренировки" data={weeklyStats.workouts} />
                <WeeklyHabitRow label="Вода" data={weeklyStats.water} />
                <WeeklyHabitRow label="Сон" data={weeklyStats.sleep} />
              </div>
            </motion.section>

            {/* Блок 3 — контроль веса */}
            <motion.section
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="text-lg font-bold mb-4 neon-text-teal flex items-center gap-2">
                <Target className="w-5 h-5" />
                Контроль веса
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Старт</p>
                  <p className="text-2xl font-bold text-gray-300">
                    {userData?.weightStart ?? "—"} кг
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Текущий</p>
                  <p className="text-2xl font-bold neon-text-teal">
                    {userData?.weight ?? "—"} кг
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Цель</p>
                  <p className="text-2xl font-bold neon-text-green">
                    {userData?.targetWeight ?? "—"} кг
                  </p>
                </div>
              </div>
              <ProgressBar
                label="Прогресс к цели"
                percent={Math.round(weightProgress)}
                color="#00d4aa"
              />
            </motion.section>

            {/* Блок 4 — замеры тела */}
            {userData?.body && (
              <motion.section
                className="glass-card p-6 animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <h2 className="text-lg font-bold mb-4 neon-text-green flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Замеры тела
                </h2>

                {(() => {
                  const bodyCurrentLocal = userData.body || {};
                  const bodyStartLocal = userData.bodyStart || {};
                  const bodyTargetLocal =
                    userData.bodyGoal || userData.bodyTarget || {};

                  const keys = [
                    "neck",
                    "shoulders",
                    "chest",
                    "arms",
                    "forearm",
                    "waist",
                    "hips",
                    "thigh",
                    "calf",
                  ];

                  const showBodyFatBlock =
                    bodyFatStart != null ||
                    bodyFatCurrent != null ||
                    bodyFatTarget != null;

                  return (
                    <>
                      {/* Верхний блок: % жира старт / сейчас / цель */}
                      {showBodyFatBlock && (
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <p className="text-sm text-gray-400">
                              Старт % жира
                            </p>
                            <p className="text-2xl font-bold text-gray-100">
                              {bodyFatStart != null
                                ? `${bodyFatStart.toFixed(1)}%`
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Сейчас % жира
                            </p>
                            <p className="text-2xl font-bold neon-text-teal">
                              {bodyFatCurrent != null
                                ? `${bodyFatCurrent.toFixed(1)}%`
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Цель % жира
                            </p>
                            <p className="text-2xl font-bold neon-text-green">
                              {bodyFatTarget != null
                                ? `${bodyFatTarget.toFixed(1)}%`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {keys
                          .filter(
                            (key) =>
                              bodyCurrentLocal[key] != null ||
                              bodyStartLocal[key] != null ||
                              bodyTargetLocal[key] != null
                          )
                          .map((key) => {
                            const startVal = bodyStartLocal[key] ?? null;
                            const currentVal = bodyCurrentLocal[key] ?? null;
                            const targetVal = bodyTargetLocal[key] ?? null;

                            return (
                              <div
                                key={key}
                                className="bg-black/20 rounded-lg p-3 flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300 font-medium">
                                    {translateName(key)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">
                                      Старт
                                    </span>
                                    <span className="font-semibold text-gray-200">
                                      {startVal != null
                                        ? `${startVal} см`
                                        : "—"}
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-gray-500">
                                      Сейчас
                                    </span>
                                    <span className="font-semibold neon-text-teal">
                                      {currentVal != null
                                        ? `${currentVal} см`
                                        : "—"}
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-gray-500">
                                      Цель
                                    </span>
                                    <span className="font-semibold text-emerald-300">
                                      {targetVal != null
                                        ? `${targetVal} см`
                                        : "—"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  );
                })()}
              </motion.section>
            )}

            {/* Блок 5 — кнопка замеров */}
            <motion.div
              className="flex flex-col gap-3 w-full mt-2 animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <button
                onClick={() => setShowMeasurements(true)}
                className="cosmic-button w-full flex items-center justify-center gap-2"
              >
                <Weight className="w-5 h-5" />
                Ввести замеры и вес
              </button>
            </motion.div>
          </>
        )}

        {/* Модалка замеров */}
        <AnimatePresence>
          {showMeasurements && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-teal-500/30"
              >
                <MeasurementsForm
                  onSave={handleSaveMeasurements}
                  onCancel={() => setShowMeasurements(false)}
                  initialData={userData}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ================== UI-КОМПОНЕНТЫ ==================

function StatsRow({
  label,
  value,
  goal,
  color,
  icon,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  icon: JSX.Element;
}) {
  return (
    <div className="flex justify-between items-center text-base bg-black/20 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div style={{ color }} className="animate-pulse-glow">
          {icon}
        </div>
        <span className="font-bold text-gray-300">{label}</span>
      </div>
      <span className="font-semibold text-white">
        <span className="animate-count">{value}</span>
        <span className="text-sm text-gray-500">/{goal}</span>
      </span>
    </div>
  );
}

function ProgressBar({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">{percent}%</span>
      </div>
      <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full progress-ring"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function WeeklyHabitRow({ label, data }: { label: string; data: DayStatus[] }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-300 w-28">{label}</span>
      <div className="flex gap-1 flex-1 justify-end">
        {data.map((status, index) => {
          let colorClass = "bg-black/40 border-white/15";

          if (status === "success") {
            colorClass = "bg-emerald-500/80 border-emerald-300/80";
          } else if (status === "fail") {
            colorClass = "bg-red-500/80 border-red-300/80";
          } else if (status === "rest") {
            colorClass = "bg-yellow-400/80 border-yellow-200/80";
          }

          return (
            <div
              key={index}
              className={`w-6 h-6 rounded-md border ${colorClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function MultiRingProgress({
  calories,
  caloriesGoal,
  protein,
  proteinGoal,
  fat,
  fatGoal,
  carbs,
  carbsGoal,
}: {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  fat: number;
  fatGoal: number;
  carbs: number;
  carbsGoal: number;
}) {
  const ringSize = 180;
  const strokeWidth = 16;
  const gap = 5;
  const r1 = ringSize / 2 - strokeWidth / 2;
  const r2 = r1 - strokeWidth - gap;
  const r3 = r2 - strokeWidth - gap;
  const r4 = r3 - strokeWidth - gap;

  const rings = [
    {
      key: "K",
      value: calories,
      goal: caloriesGoal,
      color: "#00d4aa",
      radius: r1,
    },
    {
      key: "Б",
      value: protein,
      goal: proteinGoal,
      color: "#39ff14",
      radius: r2,
    },
    {
      key: "Ж",
      value: fat,
      goal: fatGoal,
      color: "#00f3ff",
      radius: r3,
    },
    {
      key: "У",
      value: carbs,
      goal: carbsGoal,
      color: "#ff6b6b",
      radius: r4,
    },
  ];

  return (
    <div className="relative">
      <svg width={ringSize} height={ringSize} className="-rotate-90 shrink-0">
        {rings.map((r) => (
          <circle
            key={`bg-${r.key}`}
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r.radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
        ))}
        {rings.map((r) => {
          const progress =
            r.goal > 0 ? Math.max(0, Math.min(r.value / r.goal, 1)) : 0;
          const circumference = 2 * Math.PI * r.radius;
          const offset = circumference - progress * circumference;
          return (
            <motion.circle
              key={`fg-${r.key}`}
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r.radius}
              stroke={r.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="progress-ring"
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold neon-text-teal">
            {caloriesGoal > 0
              ? Math.round((calories / caloriesGoal) * 100)
              : 0}
            %
          </div>
          <div className="text-xs text-gray-400">цели</div>
        </div>
      </div>
    </div>
  );
}

function MeasurementsForm({
  onSave,
  onCancel,
  initialData,
}: {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}) {
  const body = initialData?.body || initialData?.bodyStart || {};

  // запястье здесь больше не трогаем: только динамические окружности
  const [form, setForm] = useState({
    weight: initialData?.weight != null ? String(initialData.weight) : "",
    neck: body.neck != null ? String(body.neck) : "",
    shoulders: body.shoulders != null ? String(body.shoulders) : "",
    chest: body.chest != null ? String(body.chest) : "",
    arms: body.arms != null ? String(body.arms) : "",
    forearm: body.forearm != null ? String(body.forearm) : "",
    waist: body.waist != null ? String(body.waist) : "",
    hips: body.hips != null ? String(body.hips) : "",
    thigh: body.thigh != null ? String(body.thigh) : "",
    calf: body.calf != null ? String(body.calf) : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      date: new Date().toISOString(),
    };

    Object.entries(form).forEach(([k, v]) => {
      if (v === "") {
        payload[k] = null;
      } else {
        const num = parseFloat(v as string);
        payload[k] = isNaN(num) ? null : num;
      }
    });

    onSave(payload);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center neon-text-teal flex items-center justify-center gap-2">
        <Weight className="w-6 h-6" />
        Новые замеры и вес
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"
      >
        {Object.keys(form).map((key) => (
          <div
            key={key}
            className="flex justify-between items-center bg-black/20 rounded-lg p-3"
          >
            <label className="capitalize text-gray-300">
              {translateName(key)}
            </label>
            <input
              type="number"
              step="0.1"
              name={key}
              placeholder="0"
              value={form[key as keyof typeof form] || ""}
              onChange={handleChange}
              className="bg-black/30 border border-teal-500/30 rounded-lg w-28 p-2 text-right text-white focus:border-teal-500 focus:outline-none"
            />
          </div>
        ))}
        <div className="flex justify-between gap-4 mt-6 pt-4 border-t border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
          >
            Отмена
          </button>
          <button type="submit" className="w-full cosmic-button">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
