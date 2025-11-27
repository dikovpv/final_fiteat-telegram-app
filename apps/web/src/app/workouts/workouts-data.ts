// apps/web/src/app/workouts/workouts-data.ts

export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

// Группа мышц для фильтрации упражнений
export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "glutes"
  | "core"
  | "fullbody"
  | "cardio"
  | "other";

// ВАЖНО: теперь это экспортируется и доступно в любых файлах
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Грудь",
  back: "Спина",
  legs: "Ноги",
  shoulders: "Плечи",
  biceps: "Бицепс",
  triceps: "Трицепс",
  glutes: "Ягодицы/бёдра",
  core: "Пресс",
  fullbody: "Всё тело",
  cardio: "Кардио",
  other: "Другое",
};

export interface WorkoutExerciseTemplate {
  id: string;
  slug: string; // slug для отдельной страницы упражнения
  name: string;
  sets: number;
  reps: number; // целевое количество повторений (или секунд для планки и т.п.)
  type: "strength" | "cardio" | "flexibility";
  note?: string;

  // Новое: основная группа мышц (для фильтра "Грудь / Ноги / Плечи...")
  muscleGroup?: MuscleGroup;
}

export interface WorkoutTemplate {
  slug: string;
  title: string;
  dayTag?: string; // «День 1», «День 2» и т.п.
  level: WorkoutLevel;
  focus: string; // «Грудь / плечи / трицепс»
  duration: number; // мин
  description: string;
  exercises: WorkoutExerciseTemplate[];
}

// ——— ДЕНЬ 1 — ГРУДЬ / ПЛЕЧИ / ТРИЦЕПС ———
const day1: WorkoutTemplate = {
  slug: "day1-grud-plechi-triceps",
  title: "День 1 — Грудь / плечи / трицепс",
  dayTag: "День 1",
  level: "intermediate",
  focus: "Верх тела: грудь, плечи, трицепс",
  duration: 60,
  description:
    "Классический тренировочный день на верх тела. Подходит для набора мышц и сохранения силы во время похудения.",
  exercises: [
    {
      id: "bench-press",
      slug: "bench-press",
      name: "Жим штанги лёжа",
      sets: 4,
      reps: 8,
      type: "strength",
      note: "Рабочий вес, 1–2 подхода разминочные",
      muscleGroup: "chest",
    },
    {
      id: "incline-db-press",
      slug: "incline-dumbbell-press",
      name: "Жим гантелей на наклонной скамье",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "chest",
    },
    {
      id: "side-raises",
      slug: "lateral-raises",
      name: "Махи гантелями в стороны",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "shoulders",
    },
    {
      id: "overhead-press",
      slug: "overhead-barbell-press",
      name: "Жим штанги стоя/сидя",
      sets: 3,
      reps: 8,
      type: "strength",
      muscleGroup: "shoulders",
    },
    {
      id: "cable-pushdown",
      slug: "triceps-cable-pushdown",
      name: "Разгибания на блоке (трицепс)",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "triceps",
    },
  ],
};

// ——— ДЕНЬ 2 — СПИНА / БИЦЕПС ———
const day2: WorkoutTemplate = {
  slug: "day2-spina-biceps",
  title: "День 2 — Спина / бицепс",
  dayTag: "День 2",
  level: "intermediate",
  focus: "Спина + бицепс для ширины и толщины",
  duration: 60,
  description:
    "Тяговые упражнения для спины и сгибания для бицепса. Можно использовать как вторую тренировку в сплите.",
  exercises: [
    {
      id: "lat-pulldown",
      slug: "lat-pulldown",
      name: "Тяга верхнего блока к груди",
      sets: 4,
      reps: 10,
      type: "strength",
      muscleGroup: "back",
    },
    {
      id: "row",
      slug: "barbell-or-one-arm-row",
      name: "Тяга штанги в наклоне / Тяга гантели одной рукой",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "back",
    },
    {
      id: "seated-row",
      slug: "seated-cable-row",
      name: "Тяга горизонтального блока",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "back",
    },
    {
      id: "barbell-curl",
      slug: "barbell-biceps-curl",
      name: "Сгибания штанги стоя (бицепс)",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "biceps",
    },
    {
      id: "incline-curl",
      slug: "incline-dumbbell-curl",
      name: "Сгибания гантелей сидя на наклонной скамье",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "biceps",
    },
  ],
};

// ——— ДЕНЬ 3 — НОГИ / ЯГОДИЦЫ ———
const day3: WorkoutTemplate = {
  slug: "day3-nogi-yagodicy",
  title: "День 3 — Ноги / ягодицы",
  dayTag: "День 3",
  level: "intermediate",
  focus: "Бёдра, ягодицы, икры",
  duration: 65,
  description:
    "Сильные ноги и ягодицы поддерживают осанку и общую силовую выносливость. Хорошо сочетается с ходьбой/кардио.",
  exercises: [
    {
      id: "squat",
      slug: "barbell-squat",
      name: "Приседания со штангой / в Смитте",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "legs",
    },
    {
      id: "leg-press",
      slug: "leg-press",
      name: "Жим ногами",
      sets: 4,
      reps: 10,
      type: "strength",
      muscleGroup: "legs",
    },
    {
      id: "romanian-deadlift",
      slug: "romanian-deadlift",
      name: "Румынская тяга",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "glutes",
    },
    {
      id: "lunges",
      slug: "dumbbell-lunges",
      name: "Выпады с гантелями",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "glutes",
    },
    {
      id: "calf-raises",
      slug: "standing-calf-raises",
      name: "Подъёмы на носки стоя/сидя (икры)",
      sets: 4,
      reps: 15,
      type: "strength",
      muscleGroup: "legs",
    },
  ],
};

// ——— Full body ———
const fullBody: WorkoutTemplate = {
  slug: "fullbody-3x-week",
  title: "Full body — 3 раза в неделю",
  level: "beginner",
  focus: "Полное тело, базовые упражнения",
  duration: 50,
  description:
    "Универсальная тренировка для всего тела. Подходит для старта или лёгкого режима при дефиците калорий.",
  exercises: [
    {
      id: "fb-squat",
      slug: "fb-bodyweight-squat",
      name: "Приседания с собственным весом / лёгкий вес",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "legs",
    },
    {
      id: "fb-pushup",
      slug: "fb-pushup",
      name: "Отжимания от пола / с колен",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "chest",
    },
    {
      id: "fb-row",
      slug: "fb-dumbbell-row",
      name: "Тяга гантели в наклоне",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "back",
    },
    {
      id: "fb-glute-bridge",
      slug: "fb-glute-bridge",
      name: "Ягодичный мост",
      sets: 3,
      reps: 15,
      type: "strength",
      muscleGroup: "glutes",
    },
    {
      id: "fb-plank",
      slug: "fb-plank",
      name: "Планка",
      sets: 3,
      reps: 30, // секунды, просто как число
      type: "flexibility",
      note: "Задержка 30 секунд",
      muscleGroup: "core",
    },
  ],
};

// ——— Домашняя тренировка без оборудования ———
const home: WorkoutTemplate = {
  slug: "home-no-equipment",
  title: "Домашняя тренировка без оборудования",
  level: "beginner",
  focus: "Всё тело, можно делать дома",
  duration: 35,
  description:
    "Подходит для дней, когда нет возможности попасть в зал. Работает всё тело за счёт собственного веса.",
  exercises: [
    {
      id: "home-squat",
      slug: "home-squat",
      name: "Приседания с собственным весом",
      sets: 3,
      reps: 15,
      type: "strength",
      muscleGroup: "legs",
    },
    {
      id: "home-pushup",
      slug: "home-pushup",
      name: "Отжимания от пола / от стула",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "chest",
    },
    {
      id: "home-hip-bridge",
      slug: "home-hip-bridge",
      name: "Ягодичный мост",
      sets: 3,
      reps: 20,
      type: "strength",
      muscleGroup: "glutes",
    },
    {
      id: "home-crunch",
      slug: "home-crunch",
      name: "Скручивания на пресс",
      sets: 3,
      reps: 20,
      type: "strength",
      muscleGroup: "core",
    },
    {
      id: "home-jumping-jacks",
      slug: "home-jumping-jacks",
      name: "Прыжки «звёздочка»",
      sets: 3,
      reps: 30,
      type: "cardio",
      muscleGroup: "cardio",
    },
  ],
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  day1,
  day2,
  day3,
  fullBody,
  home,
];

export function findWorkoutBySlug(slug: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((w) => w.slug === slug);
}

// поиск конкретного упражнения по slug (с инфой о плане)
export function findExerciseBySlug(slug: string) {
  for (const plan of WORKOUT_TEMPLATES) {
    const ex = (plan.exercises as any[]).find((e) => e.slug === slug);
    if (ex) {
      return {
        ...ex,
        planSlug: plan.slug,
        planTitle: plan.title,
      };
    }
  }
  return undefined;
}
