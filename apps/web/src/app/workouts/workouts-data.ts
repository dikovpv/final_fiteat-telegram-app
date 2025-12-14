// apps/web/src/app/workouts/workouts-data.ts

export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

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
  slug: string;
  name: string;
  sets: number;
  reps: number;
  type: "strength" | "cardio" | "flexibility";
  note?: string;
  muscleGroup?: MuscleGroup;

  // описание для справочника упражнений
  description?: string;
  techniqueSteps?: string[];
  keyCues?: string[];
  commonMistakes?: string[];
  safetyNotes?: string[];

  // платное упражнение
  proOnly?: boolean;
}

export interface WorkoutTemplate {
  slug: string;
  title: string;
  dayTag?: string;
  level: WorkoutLevel;
  focus: string;
  duration: number; // мин
  description: string;
  exercises: WorkoutExerciseTemplate[];

  // категория программы
  category: "general" | "bodypart";

  // платная программа
  proOnly?: boolean;
}

/** Многодневная программа (например, сплит «тяни-толкай-ноги») */
export interface MultiDayProgram {
  slug: string; // используется в URL /workouts/programs/[slug]
  title: string;
  subtitle?: string;
  level: WorkoutLevel;
  focus: string;
  duration: number; // среднее время тренировки
  description: string;
  proOnly?: boolean;
  days: {
    slug: string; // slug обычной тренировки из WORKOUT_TEMPLATES
    tag: string; // "ДЕНЬ PUSH"
    title: string; // заголовок дня
    duration: number;
  }[];
}

/* ---------- ДЕНЬ 1 — ВЕРХ: ГРУДЬ / ПЛЕЧИ / ТРИЦЕПС (PUSH) ---------- */

const day1: WorkoutTemplate = {
  slug: "day1-grud-plechi-triceps",
  title: "Сплит верх — грудь / плечи / трицепс",
  dayTag: "День PUSH",
  level: "intermediate",
  focus: "Верх тела: грудь, плечи, трицепс (тяни-толкай сплит)",
  duration: 60,
  category: "general",
  proOnly: true,
  description:
    "Классический день PUSH: жимы и махи на грудь и плечи + изоляция трицепса. Можно использовать в сплите «тяни-толкай-ноги».",
  exercises: [
    {
      id: "bench-press",
      slug: "bench-press",
      name: "Жим штанги лёжа",
      sets: 4,
      reps: 8,
      type: "strength",
      note: "1–2 разминочных подхода, потом рабочие",
      muscleGroup: "chest",
      proOnly: true,
      description:
        "Базовое упражнение на грудные мышцы с подключением передних дельт и трицепса. Даёт рост силы и объёма верхней части тела.",
      techniqueSteps: [
        "Ляг на скамью, глаза примерно под грифом. Стопы плотно на полу.",
        "Сведи лопатки, слегка прогни поясницу, грудь направь вверх. Хват чуть шире плеч.",
        "Сними штангу, перенеси её над грудью.",
        "На вдохе опускай штангу к нижней части груди, контролируя движение.",
        "Коснувшись груди без отскока, на выдохе выжми штангу вверх.",
      ],
      keyCues: [
        "Лопатки всегда сведены и прижаты к скамье.",
        "Гриф идёт к нижней части груди, а не к шее.",
      ],
      commonMistakes: [
        "Локти под 90° — сильно грузит плечи.",
        "Отскок штанги от груди.",
      ],
      safetyNotes: [
        "Большой вес — только со страховкой.",
        "При дискомфорте в плечах сузь хват и сократи амплитуду.",
      ],
    },
    {
      id: "incline-db-press",
      slug: "incline-dumbbell-press",
      name: "Жим гантелей на наклонной скамье",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "chest",
      proOnly: true,
      description:
        "Жим под углом для верхней части груди и передних дельт. Часто комфортнее для плеч, чем штанга.",
      techniqueSteps: [
        "Наклон спинки ~30–45°.",
        "Гантели над грудью, ладони вперёд или чуть навстречу.",
        "На вдохе опускай гантели по дуге к бокам груди.",
        "На выдохе выжимай вверх, не сталкивая гантели.",
      ],
    },
    {
      id: "side-raises",
      slug: "lateral-raises",
      name: "Махи гантелями в стороны",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "shoulders",
      proOnly: true,
    },
    {
      id: "overhead-press",
      slug: "overhead-barbell-press",
      name: "Жим штанги стоя/сидя",
      sets: 3,
      reps: 8,
      type: "strength",
      muscleGroup: "shoulders",
      proOnly: true,
    },
    {
      id: "cable-pushdown",
      slug: "triceps-cable-pushdown",
      name: "Разгибания на блоке (трицепс)",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "triceps",
      proOnly: true,
    },
  ],
};

/* ---------- ДЕНЬ 2 — ТЯГА: СПИНА / БИЦЕПС (PULL) ---------- */

const day2: WorkoutTemplate = {
  slug: "day2-spina-biceps",
  title: "Сплит тяга — спина / бицепс",
  dayTag: "День PULL",
  level: "intermediate",
  focus: "Тяговые движения: ширина и толщина спины + бицепс",
  duration: 60,
  category: "general",
  proOnly: true,
  description:
    "Тяги и сгибания. Классический день PULL в сплите «тяни-толкай-ноги». Можно ставить вторым днём недели.",
  exercises: [
    {
      id: "lat-pulldown",
      slug: "lat-pulldown",
      name: "Тяга верхнего блока к груди",
      sets: 4,
      reps: 10,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "row",
      slug: "barbell-or-one-arm-row",
      name: "Тяга штанги в наклоне / гантели одной рукой",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "seated-row",
      slug: "seated-cable-row",
      name: "Тяга горизонтального блока",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "barbell-curl",
      slug: "barbell-biceps-curl",
      name: "Сгибания штанги стоя (бицепс)",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "biceps",
      proOnly: true,
    },
    {
      id: "incline-curl",
      slug: "incline-dumbbell-curl",
      name: "Сгибания гантелей сидя на наклонной скамье",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "biceps",
      proOnly: true,
    },
  ],
};

/* ---------- ДЕНЬ 3 — НИЗ: НОГИ / ЯГОДИЦЫ (LEGS) ---------- */

const day3: WorkoutTemplate = {
  slug: "day3-nogi-yagodicy",
  title: "Сплит низ — ноги / ягодицы",
  dayTag: "День LEGS",
  level: "intermediate",
  focus: "Бёдра, ягодицы, икры",
  duration: 65,
  category: "general",
  proOnly: true,
  description:
    "Сильные ноги и ягодицы поддерживают осанку, спину и общую силовую выносливость. Хорошо сочетается с шагами/кардио.",
  exercises: [
    {
      id: "squat",
      slug: "barbell-squat",
      name: "Приседания со штангой / в Смите",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "legs",
      proOnly: true,
    },
    {
      id: "leg-press",
      slug: "leg-press",
      name: "Жим ногами",
      sets: 4,
      reps: 10,
      type: "strength",
      muscleGroup: "legs",
      proOnly: true,
    },
    {
      id: "romanian-deadlift",
      slug: "romanian-deadlift",
      name: "Румынская тяга",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "glutes",
      proOnly: true,
    },
    {
      id: "lunges",
      slug: "dumbbell-lunges",
      name: "Выпады с гантелями",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "glutes",
      proOnly: true,
    },
    {
      id: "calf-raises",
      slug: "standing-calf-raises",
      name: "Подъёмы на носки стоя/сидя (икры)",
      sets: 4,
      reps: 15,
      type: "strength",
      muscleGroup: "legs",
      proOnly: true,
    },
  ],
};

/* ---------- FULL BODY 3x WEEK (БЕСПЛАТНАЯ) ---------- */

const fullBody: WorkoutTemplate = {
  slug: "fullbody-3x-week",
  title: "Фуллбади — 3 раза в неделю",
  level: "beginner",
  focus: "Полное тело, базовые упражнения",
  duration: 45,
  category: "general",
  proOnly: false,
  description:
    "Универсальная тренировка для всего тела. Делай её 3 раза в неделю (например, Пн/Ср/Пт), увеличивая веса по самочувствию.",
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
      reps: 30,
      type: "flexibility",
      note: "Задержка 30 секунд",
      muscleGroup: "core",
    },
  ],
};

/* ---------- ДОМАШНЯЯ ТРЕНИРОВКА БЕЗ ЖЕЛЕЗА (PRO) ---------- */

const home: WorkoutTemplate = {
  slug: "home-no-equipment",
  title: "Домашняя тренировка без железа",
  level: "beginner",
  focus: "Всё тело дома, без оборудования",
  duration: 35,
  category: "general",
  proOnly: true,
  description:
    "Когда нет зала — делаешь эту тренировку дома. Только собственный вес, можно выполнять в комнате.",
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

/* ---------- ДЕНЬ НА РУКИ (БИЦЕПС / ТРИЦЕПС) ---------- */

const armsFocus: WorkoutTemplate = {
  slug: "arms-biceps-triceps",
  title: "Фокус на руки — бицепс и трицепс",
  dayTag: "Руки",
  level: "intermediate",
  focus: "Объём рук: бицепс + трицепс",
  duration: 45,
  category: "bodypart",
  proOnly: true,
  description:
    "Отдельный день для рук. Можно добавить четвёртым днём к фуллбади или к сплиту.",
  exercises: [
    {
      id: "arms-barbell-curl",
      slug: "arms-barbell-biceps-curl",
      name: "Сгибания штанги стоя",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "biceps",
      proOnly: true,
    },
    {
      id: "arms-incline-curl",
      slug: "arms-incline-dumbbell-curl",
      name: "Сгибания гантелей на наклонной скамье",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "biceps",
      proOnly: true,
    },
    {
      id: "arms-hammer-curl",
      slug: "arms-hammer-curl",
      name: "Подъёмы гантелей молотком",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "biceps",
      proOnly: true,
    },
    {
      id: "arms-cable-pushdown",
      slug: "arms-triceps-cable-pushdown",
      name: "Разгибания на блоке (трицепс)",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "triceps",
      proOnly: true,
    },
    {
      id: "arms-overhead-extension",
      slug: "arms-overhead-dumbbell-extension",
      name: "Разгибания гантели из-за головы сидя",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "triceps",
      proOnly: true,
    },
  ],
};

/* ---------- ДЕНЬ НА СПИНУ ---------- */

const backFocus: WorkoutTemplate = {
  slug: "back-thickness-width",
  title: "Фокус на спину — ширина и толщина",
  dayTag: "Спина",
  level: "intermediate",
  focus: "Широчайшие, середина спины, задние дельты",
  duration: 55,
  category: "bodypart",
  proOnly: true,
  description:
    "День фокуса на спине: много тяг под разными углами для ширины и плотности.",
  exercises: [
    {
      id: "bf-lat-pulldown",
      slug: "bf-lat-pulldown",
      name: "Тяга верхнего блока к груди (широкий хват)",
      sets: 4,
      reps: 10,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "bf-closegrip-pulldown",
      slug: "bf-closegrip-pulldown",
      name: "Тяга верхнего блока узким хватом",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "bf-row",
      slug: "bf-barbell-row",
      name: "Тяга штанги в наклоне",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "bf-seated-row",
      slug: "bf-seated-row",
      name: "Тяга горизонтального блока",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
    {
      id: "bf-rear-delt-fly",
      slug: "bf-rear-delt-fly",
      name: "Разведения гантелей в наклоне",
      sets: 3,
      reps: 15,
      type: "strength",
      muscleGroup: "back",
      proOnly: true,
    },
  ],
};

/* ---------- ПРОГРАММА: ДРОПСЕТЫ В ЗАЛЕ (ВЕРХ ТЕЛА) ---------- */

const dropsetUpperBody: WorkoutTemplate = {
  slug: "dropset-upper-body-gym",
  title: "Дропсеты в зале — верх тела",
  level: "intermediate",
  focus: "Грудь, плечи и руки с акцентом на дропсеты",
  duration: 55,
  category: "general",
  proOnly: true,
  description:
    "Программа для зала, где в ключевых упражнениях используется дропсет: снимаешь вес и продолжаешь подход без отдыха. Отлично подходит для плато по силе и объёму.",
  exercises: [
    {
      id: "ds-bench-press",
      slug: "ds-bench-press",
      name: "Жим штанги лёжа (дропсет)",
      sets: 4,
      reps: 8,
      type: "strength",
      muscleGroup: "chest",
      proOnly: true,
      note: "Последний (4-й) подход — дропсет: выполняешь 8 повторений, снимаешь ~30% веса и сразу делаешь ещё 6–8 повторений."
    },
    {
      id: "ds-incline-db-press",
      slug: "ds-incline-db-press",
      name: "Жим гантелей на наклонной скамье (дропсет)",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "chest",
      proOnly: true,
      note: "В каждом подходе: 10 повторений, затем уменьшаешь вес гантелей и делаешь ещё 6–8 повторений без отдыха."
    },
    {
      id: "ds-lateral-raises",
      slug: "ds-lateral-raises",
      name: "Махи гантелями в стороны (дропсет)",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "shoulders",
      proOnly: true,
      note: "12 повторений с рабочим весом, затем сразу берёшь более лёгкий вес и делаешь ещё 10–12 повторений."
    },
    {
      id: "ds-barbell-curl",
      slug: "ds-barbell-curl",
      name: "Сгибания штанги стоя (дропсет)",
      sets: 3,
      reps: 10,
      type: "strength",
      muscleGroup: "biceps",
      proOnly: true,
      note: "Последний подход: 10 повторений, снимаешь вес и добиваешь ещё 8–10 повторений."
    },
    {
      id: "ds-cable-pushdown",
      slug: "ds-cable-pushdown",
      name: "Разгибания на блоке (трицепс, дропсет)",
      sets: 3,
      reps: 12,
      type: "strength",
      muscleGroup: "triceps",
      proOnly: true,
      note: "Все подходы в формате дропсета: 12 повторений + уменьшение веса + ещё 8–10 повторений."
    },
  ],
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  day1,
  day2,
  day3,
  fullBody,
  home,
  armsFocus,
  backFocus,
  dropsetUpperBody,
];



/* ---------- МНОГОДНЕВНЫЕ ПРОГРАММЫ (СПЛИТЫ) ---------- */

export const MULTI_DAY_PROGRAMS: MultiDayProgram[] = [
  {
    slug: "split-push-pull-legs",
    title: "Сплит «тяни-толкай-ноги» (3 дня)",
    subtitle: "Классический сплит в зале 3 раза в неделю",
    level: "intermediate",
    focus:
      "PUSH (грудь/плечи/трицепс), PULL (спина/бицепс) и LEGS (ноги/ягодицы).",
    duration: 60,
    proOnly: true,
    description:
      "Подходит, когда тренируешься в зале 3 раза в неделю. Выбираешь день PUSH, PULL или LEGS и выполняешь их по очереди в течение недели.",
    days: [
      {
        slug: day1.slug,
        tag: "ДЕНЬ PUSH",
        title: day1.title,
        duration: day1.duration,
      },
      {
        slug: day2.slug,
        tag: "ДЕНЬ PULL",
        title: day2.title,
        duration: day2.duration,
      },
      {
        slug: day3.slug,
        tag: "ДЕНЬ LEGS",
        title: day3.title,
        duration: day3.duration,
      },
    ],
  },
];

// удобные типы/хелперы

export type MultiDayProgramSlug =
  (typeof MULTI_DAY_PROGRAMS)[number]["slug"];

export function findWorkoutBySlug(slug: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((w) => w.slug === slug);
}

export function findExerciseBySlug(slug: string) {
  for (const plan of WORKOUT_TEMPLATES) {
    const ex = (plan.exercises as WorkoutExerciseTemplate[]).find(
      (e) => e.slug === slug,
    );
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

export function findProgramBySlug(
  slug: string,
): MultiDayProgram | undefined {
  return MULTI_DAY_PROGRAMS.find((p) => p.slug === slug);
}
