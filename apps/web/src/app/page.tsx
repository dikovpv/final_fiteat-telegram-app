"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import SurveyForm from "./components/SurveyForm";
import PageHeader from "./components/PageHeader";

import {
  Activity,
  Target,
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

import { DEFAULT_ENTRY, DIARY_STORAGE_PREFIX } from "./diary/diary-types";

// ================== ТИПЫ ==================

type DayStatus = "success" | "fail" | "rest" | null;

type WeeklyDayMeta = {
  date: string;
  weekday: string;
  day: string;
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

function getLocalISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
    return totals;
  } catch {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }
}

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
    pick(["height", "heightCm", "height_cm"], undefined),
  );
  const rawWeight = Number(pick(["weight", "currentWeight"], undefined));

  let rawSex = pick(["sex", "gender"], "male");
  if (typeof rawSex === "string") rawSex = rawSex.toLowerCase();

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
  else if (["maintain", "держать", "поддержка"].includes(g)) goal = "maintain";
  else if (["gain", "bulk", "набор"].includes(g)) goal = "gain";

  if (!rawAge || !rawHeight || !rawWeight) return null;

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

// ================== UI-КОМПОНЕНТЫ / ПРОГРЕСС КБЖУ ==================

function MacroProgressRing({
  item,
}: {
  item: {
    shortLabel: string;
    current: number;
    goal: number;
    percent: number;
    color: string;
  };
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (item.percent / 100) * circumference;

  const isActive = item.percent > 0;

  return (
    <div className="flex flex-col items-center text-center text-xs">
      <div className="relative w-14 h-14 mb-1">
        <svg className="w-14 h-14 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="rgba(148, 163, 184, 0.25)"
            strokeWidth="4"
            fill="none"
          />
          {isActive && (
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke={item.color}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-semibold text-gray-900 dark:text-gray-100">
            {item.shortLabel}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 dark:text-gray-400">
        {Math.round(item.current)}/{Math.round(item.goal)}
      </div>
      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
        {item.percent}%
      </div>
    </div>
  );
}

function TodayNutritionProgressCard(props: {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  caloriesGoal: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
}) {
  const {
    calories,
    protein,
    fat,
    carbs,
    caloriesGoal,
    proteinGoal,
    fatGoal,
    carbsGoal,
  } = props;

  const getPercent = (current: number, goal: number) =>
    goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  const items = [
    {
      key: "calories",
      shortLabel: "К",
      current: calories,
      goal: caloriesGoal,
      color: "var(--accent-gold)",
    },
    {
      key: "protein",
      shortLabel: "Б",
      current: protein,
      goal: proteinGoal,
      color: "var(--accent-gold)",
    },
    {
      key: "fat",
      shortLabel: "Ж",
      current: fat,
      goal: fatGoal,
      color: "var(--accent-gold)",
    },
    {
      key: "carbs",
      shortLabel: "У",
      current: carbs,
      goal: carbsGoal,
      color: "var(--accent-gold)",
    },
  ].map((i) => ({
    ...i,
    percent: getPercent(i.current, i.goal),
  }));

  return (
    <section className="glass-card p-4">
      <h2 className="text-base font-semibold text-center text-gray-900 dark:text-gray-100 mb-3">
        Сегодняшний прогресс
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <MacroProgressRing key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
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

  // ---------- Обновление дневных данных ----------
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

  // ---------- Флаг открытия анкеты с профиля ----------
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

  // ---------- Недельные привычки ----------
  useEffect(() => {
    const today = new Date();

    const daysMeta: WeeklyDayMeta[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const dateISO = d.toISOString().split("T")[0];

      const weekdayIndex = d.getDay();
      const weekdayNames = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
      const weekday = weekdayNames[weekdayIndex] || "";

      daysMeta.push({
        date: dateISO,
        weekday,
        day: String(d.getDate()).padStart(2, "0"),
      });
    }

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

      // питание
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

      // тренировки
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

      // вода
      const waterVal =
        typeof diary.water === "number" && !isNaN(diary.water)
          ? diary.water
          : 0;
      if (!waterVal) {
        water.push(null);
      } else {
        const waterPct = waterVal / 2.5;
        water.push(waterPct >= 0.85 ? "success" : "fail");
      }

      // сон
      const sleepData = diary.sleep || {};
      if (!sleepData.start || !sleepData.end) {
        sleep.push(null);
      } else {
        const [sh, sm] = String(sleepData.start).split(":").map(Number);
        const [eh, em] = String(sleepData.end).split(":").map(Number);
        let minutes = eh * 60 + em - (sh * 60 + sm);
        if (minutes < 0) minutes += 1440;
        const hours = minutes / 60;
        sleep.push(hours >= 7 ? "success" : "fail");
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

  const handleFormSubmit = (data: any) => {
    setUserData((prev: any) => {
      const isFirstSetup = !prev;
      const hasHistory = !!prev?.measurementsHistory?.length || !!prev?.body;

      const profileSource = {
        ...data,
        weight: hasHistory && prev?.weight ? prev.weight : data.weight,
      };

      const profile = buildProfileFromForm(profileSource, prev);
      const macros = profile ? calculateMacrosForUser(profile) : null;

      const next: any = {
        ...prev,
        sex: data.sex,
        age: data.age,
        height: data.height,
        activityLevel: data.activityLevel,
        goal: data.goal,
        targetWeight:
          data.targetWeight !== undefined && data.targetWeight !== ""
            ? data.targetWeight
            : prev?.targetWeight,
        bodyGoal: data.bodyGoal || prev?.bodyGoal,
      };

      if (isFirstSetup || !hasHistory) {
        next.weightStart = data.weight;
        next.weight = data.weight;
        next.bodyStart = data.body || null;
        next.body = data.body || null;
      } else {
        next.weightStart =
          data.weight !== undefined && data.weight !== ""
            ? data.weight
            : prev?.weightStart ?? prev?.weight;
        next.bodyStart = data.body || prev?.bodyStart || null;
      }

      if (macros && profile) {
        next.calories = macros.calories;
        next.proteinGoal = macros.proteinGoal;
        next.fatGoal = macros.fatGoal;
        next.carbsGoal = macros.carbsGoal;

        next.profile = {
          ...(prev?.profile || {}),
          ...profile,
          weightKg: hasHistory && prev?.weight ? prev.weight : profile.weightKg,
        };
      }

      return next;
    });

    setShowForm(false);
  };

  const handleSaveMeasurements = (newData: any) => {
    const date = newData.date || new Date().toISOString();

    const newWeight =
      typeof newData.weight === "number" && !isNaN(newData.weight)
        ? newData.weight
        : userData?.weight ?? 0;

    let updatedProfile = userData?.profile;
    let macros: ReturnType<typeof calculateMacrosForUser> | null = null;

    if (updatedProfile && newWeight > 0) {
      updatedProfile = {
        ...updatedProfile,
        weightKg: newWeight,
      };
      macros = calculateMacrosForUser(updatedProfile);
    }

    const mergedBody = {
      ...(userData?.body || {}),
      ...newData,
    };

    const autoBodyFat = computeBodyFatNavy(mergedBody, userData?.profile);

    const hasHistory = (userData?.measurementsHistory || []).length > 0;
    const hasStart = !!userData?.bodyStart;

    let weightStart = userData?.weightStart ?? null;
    let bodyStart = userData?.bodyStart ?? null;
    let bodyFatStart = userData?.bodyFatStart ?? null;

    if (!hasHistory && !hasStart) {
      weightStart = newWeight;
      bodyStart = mergedBody;
      if (autoBodyFat != null) bodyFatStart = autoBodyFat;
    }

    const { wrist, ...historyBody } = mergedBody as any;

    const historyEntry: any = {
      date,
      weight: newWeight,
      ...historyBody,
    };
    if (autoBodyFat != null) historyEntry.bodyFat = autoBodyFat;

    const updatedHistory = [...(userData?.measurementsHistory || []), historyEntry];

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

  const bodyStart = userData?.bodyStart || {};
  const bodyCurrent = userData?.body || bodyStart;
  const bodyTarget = userData?.bodyGoal || userData?.bodyTarget || {};

  const bodyFatStartRaw =
    userData?.bodyFatStart ?? computeBodyFatNavy(bodyStart, userData?.profile);
  const bodyFatCurrentRaw = computeBodyFatNavy(bodyCurrent, userData?.profile);

  let bodyFatTargetRaw: number | null =
    userData?.bodyFatTarget ?? computeBodyFatNavy(bodyTarget, userData?.profile);

  if (!bodyFatTargetRaw && weightStart && weightTarget && bodyFatStartRaw != null) {
    const leanMass = weightStart * (1 - bodyFatStartRaw / 100);
    if (weightTarget > leanMass) {
      bodyFatTargetRaw = 100 * (1 - leanMass / weightTarget);
    }
  }

  const clampBF = (v: number | null) =>
    v != null ? Math.max(3, Math.min(v, 60)) : null;

  const bodyFatStart = clampBF(bodyFatStartRaw);
  const bodyFatCurrent = clampBF(bodyFatCurrentRaw ?? bodyFatStartRaw ?? null);
  const bodyFatTarget = clampBF(bodyFatTargetRaw);

  // прогресс по % жира
  let bodyFatProgress = 0;
  if (
    bodyFatStart != null &&
    bodyFatCurrent != null &&
    bodyFatTarget != null &&
    bodyFatStart !== bodyFatTarget
  ) {
    const totalDelta = bodyFatStart - bodyFatTarget;
    const currentDelta = bodyFatStart - bodyFatCurrent;

    if (totalDelta > 0) {
      bodyFatProgress = (currentDelta / totalDelta) * 100;
    } else {
      const totalUp = bodyFatTarget - bodyFatStart;
      const currentUp = bodyFatCurrent - bodyFatStart;
      bodyFatProgress = (currentUp / totalUp) * 100;
    }
  }
  bodyFatProgress = Math.max(0, Math.min(bodyFatProgress, 100));

  // ================== РЕНДЕР ==================

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-20">
      {/* Золотая шапка с логотипом и кнопкой профиля справа */}
      <PageHeader
        title=""
        centerSlot={
          <Image
            src="/img/avyra-logo.svg"
            alt="Avyra"
            width={120}
            height={32}
            className="h-7 w-auto"
            priority
          />
        }
        rightSlot={
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-medium backdrop-blur-sm hover:bg-white/25 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Профиль</span>
          </Link>
        }
      />

      <main className="relative z-10 max-w-3xl mx-auto flex flex-col px-3 sm:px-4 md:px-5 pt-4 gap-3">
        {/* Приветственный экран */}
        {!userData && !showForm ? (
          <motion.div
            className="flex flex-col items-center justify-center h-[70vh] px-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card p-6 max-w-sm w-full mx-auto">
              <Sparkles className="w-10 h-10 mx-auto mb-3" />
              <h1 className="text-xl font-semibold mb-3">
                Добро пожаловать в FitEat
              </h1>
              <p className="text-sm text-muted mb-4">
                Настроим план питания и замеры, чтобы ты видел прогресс, а не
                просто цифры.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="cosmic-button w-full"
              >
                Начать
              </button>
            </div>
          </motion.div>
        ) : showForm ? (
          <SurveyForm onSubmit={handleFormSubmit} initialData={userData} />
        ) : (
          <>
            {/* приветствие из Telegram */}
            {telegramUser?.firstName && (
              <motion.section
                className="glass-card p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-base font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Привет, {telegramUser.firstName}! 👋
                </h1>
                <p className="text-xs text-muted mt-1">
                  Сегодня тоже отмечаем КБЖУ, воду, сон и тренировки.
                </p>
              </motion.section>
            )}

            {/* Блок 1 — сегодняшний прогресс (кольца КБЖУ) */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <TodayNutritionProgressCard
                calories={caloriesActual}
                protein={proteinActual}
                fat={fatActual}
                carbs={carbsActual}
                caloriesGoal={caloriesGoal}
                proteinGoal={proteinGoal}
                fatGoal={fatGoal}
                carbsGoal={carbsGoal}
              />
            </motion.section>

            {/* Блок 2 — недельные привычки */}
            <motion.section
              className="glass-card p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-base font-semibold mb-4 text-center">
                Недельные привычки
              </h2>

              <div className="mt-1 w-full grid grid-cols-[auto,1fr] gap-y-2">
                {weeklyStats.days.length === 7 && (
                  <>
                    <span className="text-sm text-muted" />
                    <div className="flex justify-end gap-1">
                      {weeklyStats.days.map((d) => (
                        <div
                          key={d.date}
                          className="w-6 text-[10px] leading-tight text-center text-muted"
                        >
                          <div className="uppercase">{d.weekday}</div>
                          <div>{d.day}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <WeeklyHabitRow label="Питание" data={weeklyStats.nutrition} />
                <WeeklyHabitRow
                  label="Тренировки"
                  data={weeklyStats.workouts}
                />
                <WeeklyHabitRow label="Вода" data={weeklyStats.water} />
                <WeeklyHabitRow label="Сон" data={weeklyStats.sleep} />
              </div>
            </motion.section>

            {/* Блок 3 — контроль веса */}
            <motion.section
              className="glass-card p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-base font-semibold mb-4 text-center">
                Контроль веса
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div className="text-left">
                  <p className="text-[11px] text-muted mb-1">Старт</p>
                  <p className="text-lg font-semibold">
                    {userData?.weightStart ?? "—"} кг
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-muted mb-1">Текущий</p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {userData?.weight ?? "—"} кг
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-muted mb-1">Цель</p>
                  <p className="text-lg font-semibold">
                    {userData?.targetWeight ?? "—"} кг
                  </p>
                </div>
              </div>

              <ProgressBar
                label="Прогресс к цели"
                percent={Math.round(weightProgress)}
              />
            </motion.section>

            {/* Блок 4 — замеры тела */}
            {userData?.body && (
              <motion.section
                className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-base font-semibold mb-4 text-center">
                  Замеры тела
                </h2>

                {(() => {
                  const bodyCurrentLocal = userData.body || {};
                  const bodyStartLocal = userData.bodyStart || {};
                  const bodyTargetLocal =
                    userData.bodyGoal || userData.bodyTarget || {};

                  const showBodyFatBlock =
                    bodyFatStart != null ||
                    bodyFatCurrent != null ||
                    bodyFatTarget != null;

                  return (
                    <>
                      {showBodyFatBlock && (
                        <div className="mb-4">
                          <div className="grid grid-cols-3 text-[11px] text-muted mb-1">
                            <div className="text-left">Старт % жира</div>
                            <div className="text-center">Сейчас % жира</div>
                            <div className="text-right">Цель % жира</div>
                          </div>

                          <div className="grid grid-cols-3 text-base font-semibold">
                            <div className="text-left">
                              {bodyFatStart != null
                                ? `${bodyFatStart.toFixed(1)}%`
                                : "—"}
                            </div>
                            <div
                              className="text-center"
                              style={{ color: "var(--accent-gold)" }}
                            >
                              {bodyFatCurrent != null
                                ? `${bodyFatCurrent.toFixed(1)}%`
                                : "—"}
                            </div>
                            <div className="text-right">
                              {bodyFatTarget != null
                                ? `${bodyFatTarget.toFixed(1)}%`
                                : "—"}
                            </div>
                          </div>

                          <div className="mt-3">
                            <ProgressBar
                              label="Прогресс по % жира"
                              percent={Math.round(bodyFatProgress)}
                            />
                          </div>
                        </div>
                      )}

                      <BodyMeasurementsTable
                        bodyStart={bodyStartLocal}
                        bodyCurrent={bodyCurrentLocal}
                        bodyTarget={bodyTargetLocal}
                      />
                    </>
                  );
                })()}
              </motion.section>
            )}

            {/* кнопка замеров */}
            <motion.div
              className="flex flex-col gap-3 w-full mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={() => setShowMeasurements(true)}
                className="cosmic-button w-full flex items-center justify-center gap-2 text-sm"
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
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 w-full max-w-md"
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
      </main>
    </div>
  );
}

// ================== ПРОЧИЕ UI-КОМПОНЕНТЫ ==================

function ProgressBar({ label, percent }: { label: string; percent: number }) {
  const clamped = Math.max(0, Math.min(percent, 100));

  const barColor = "var(--accent-gold)";
  const percentColor = "var(--text-primary)";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted font-medium">{label}</span>
        <span className="font-semibold" style={{ color: percentColor }}>
          {clamped}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function WeeklyHabitRow({ label, data }: { label: string; data: DayStatus[] }) {
  return (
    <>
      <span className="text-sm text-muted">{label}</span>
      <div className="flex justify-end gap-1">
        {data.map((status, index) => {
          let colorClass = "bg-gray-200 border-gray-200";

          if (status === "success") {
            colorClass = "bg-[var(--accent-soft)] border-[var(--accent-soft)]";
          } else if (status === "fail") {
            colorClass = "bg-red-100 border-red-300";
          } else if (status === "rest") {
            colorClass =
              "bg-transparent border-[var(--accent-soft)] border-dashed";
          }

          return (
            <div
              key={index}
              className={`w-6 h-6 rounded-md border ${colorClass}`}
            />
          );
        })}
      </div>
    </>
  );
}

type BodyMap = Record<string, number | null | undefined>;

function BodyMeasurementsTable({
  bodyStart,
  bodyCurrent,
  bodyTarget,
}: {
  bodyStart: BodyMap;
  bodyCurrent: BodyMap;
  bodyTarget: BodyMap;
}) {
  const rows: { key: string; label: string; icon: string }[] = [
    { key: "neck", label: "Шея", icon: "🧑‍🦱" },
    { key: "shoulders", label: "Плечи", icon: "🏋️" },
    { key: "chest", label: "Грудь", icon: "🫁" },
    { key: "arms", label: "Руки", icon: "💪" },
    { key: "forearm", label: "Предплечье", icon: "✋" },
    { key: "waist", label: "Талия", icon: "🎯" },
    { key: "hips", label: "Бёдра", icon: "🩳" },
    { key: "thigh", label: "Бедро", icon: "🦵" },
    { key: "calf", label: "Икра", icon: "🦿" },
  ];

  const formatVal = (v: number | null | undefined) =>
    v != null ? `${v} см` : "—";

  const visibleRows = rows.filter((r) => {
    const s = bodyStart[r.key];
    const c = bodyCurrent[r.key];
    const t = bodyTarget[r.key];
    return s != null || c != null || t != null;
  });

  if (visibleRows.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]">
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 pt-3 pb-2 text-[11px] text-muted border-b border-[var(--border-soft)]">
        <div>Часть тела</div>
        <div className="text-right">Старт</div>
        <div className="text-right">Сейчас</div>
        <div className="text-right">Цель</div>
      </div>

      <div className="divide-y divide-[var(--border-soft)]">
        {visibleRows.map((row) => {
          const s = bodyStart[row.key];
          const c = bodyCurrent[row.key];
          const t = bodyTarget[row.key];

          return (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 py-2 items-center text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--text-primary)]">
                  {row.label}
                </span>
              </div>

              <div className="text-right text-[13px]">
                <div className="font-semibold text-[var(--text-primary)]">
                  {formatVal(s)}
                </div>
              </div>

              <div className="text-right text-[13px]">
                <div
                  className="font-semibold"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {formatVal(c)}
                </div>
              </div>

              <div className="text-right text-[13px]">
                <div className="font-semibold text-[var(--text-primary)]">
                  {formatVal(t)}
                </div>
              </div>
            </div>
          );
        })}
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
      <h2 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
        <Weight className="w-5 h-5" />
        Новые замеры и вес
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"
      >
        {Object.keys(form).map((key) => (
          <div
            key={key}
            className="flex justify-between items-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2"
          >
            <label className="text-sm">{translateName(key)}</label>
            <input
              type="number"
              step="0.1"
              name={key}
              placeholder="0"
              value={form[key as keyof typeof form] || ""}
              onChange={handleChange}
              className="ml-3 bg-[var(--surface)] border border-[var(--border-soft)] rounded-md w-24 p-2 text-right text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        ))}
        <div className="flex justify-between gap-4 mt-4 pt-4 border-t border-[var(--border-soft)]">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] text-sm hover:bg-[var(--surface-muted)] transition-colors"
          >
            Отмена
          </button>
          <button type="submit" className="w-full cosmic-button text-sm">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
