// apps/web/src/app/meals/meal-data.ts

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export type Ingredient = {
  name: string;
  amount: number; // базовое количество (в граммах/мл/шт)
  unit?: string;
  note?: string;
};

export type MealPortionVariant = {
  /** строковый id варианта – обычно просто целевое количество ккал */
  id: string; // "300" | "400" | ... | "800"
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type MealRecipe = {
  /** slug – уникальный идентификатор рецепта */
  slug: string;
  title: string;
  subtitle?: string;
  mealType: MealType;

  /** true = платное блюдо (PRO), false/undefined = бесплатное */
  proOnly?: boolean;

  /** базовая порция, если нужно (для инфо, можно не использовать) */
  baseServings?: number;

  /** КБЖУ базовой порции */
  baseCalories: number;
  baseProtein: number;
  baseFat: number;
  baseCarbs: number;

  /** заранее просчитанные варианты под целевые ккал */
  variants?: MealPortionVariant[];

  ingredients: Ingredient[];
  steps?: string[];
};

// ======================
// ВСПОМОГАТЕЛЬНАЕ ФУНКЦИИ
// ======================

/** строим варианты порций под 300–800 ккал */
function buildVariants(
  baseCalories: number,
  protein: number,
  fat: number,
  carbs: number,
  targets: number[] = [300, 400, 500, 600, 700, 800],
): MealPortionVariant[] {
  return targets.map((target) => {
    const factor = target / baseCalories;

    return {
      id: String(target),
      calories: Math.round(target),
      protein: Math.round(protein * factor),
      fat: Math.round(fat * factor),
      carbs: Math.round(carbs * factor),
    };
  });
}

/**
 * Главная утилита:
 * - если передан targetCalories, выбирает ближайший вариант по ккал
 * - иначе берёт «среднюю» порцию (или 400 ккал, если есть)
 */
export function computeMealNutrition(
  meal: MealRecipe,
  targetCalories?: number | null,
) {
  const variants =
    meal.variants && meal.variants.length > 0
      ? meal.variants
      : buildVariants(
          meal.baseCalories,
          meal.baseProtein,
          meal.baseFat,
          meal.baseCarbs,
        );

  let chosen: MealPortionVariant;

  if (targetCalories && isFinite(targetCalories) && targetCalories > 0) {
    chosen = variants.reduce((best, current) => {
      const bestDiff = Math.abs(best.calories - targetCalories);
      const currentDiff = Math.abs(current.calories - targetCalories);
      return currentDiff < bestDiff ? current : best;
    }, variants[0]);
  } else {
    chosen =
      variants.find((v) => v.id === "400") ??
      variants[Math.floor(variants.length / 2)] ??
      variants[0];
  }

  return {
    perPortionCalories: chosen.calories,
    perPortionProtein: chosen.protein,
    perPortionFat: chosen.fat,
    perPortionCarbs: chosen.carbs,
    variant: chosen,
  };
}

// ======================
// РЕЦЕПТЫ
// В каждом разделе:
//   – первые 2 рецепта proOnly: false  (бесплатные)
//   – остальные 8 рецептов proOnly: true (PRO)
// ======================

export const meals: MealRecipe[] = [
  // ===================================
  // ЗАВТРАКИ (10 штук, 2 free + 8 PRO)
  // ===================================

  {
    slug: "omlet-ovoshchi-syr",
    title: "Омлет с овощами и сыром",
    subtitle: "Классический белковый завтрак",
    mealType: "breakfast",
    proOnly: false,
    baseServings: 1,
    baseCalories: 420,
    baseProtein: 30,
    baseFat: 26,
    baseCarbs: 15,
    variants: buildVariants(420, 30, 26, 15),
    ingredients: [
      { name: "Яйца куриные", amount: 3, unit: "шт" },
      { name: "Молоко 2,5%", amount: 50, unit: "мл" },
      { name: "Сладкий перец", amount: 50, unit: "г" },
      { name: "Помидор", amount: 50, unit: "г" },
      { name: "Сыр твёрдый", amount: 30, unit: "г" },
      { name: "Оливковое масло", amount: 5, unit: "г", note: "для жарки" },
      { name: "Соль, перец", amount: 1, unit: "по вкусу" },
    ],
    steps: [
      "Взбей яйца с молоком, добавь соль и перец.",
      "Обжарь овощи на масле 2–3 минуты.",
      "Влей яйца, доведи до готовности под крышкой, посыпь сыром.",
    ],
  },
  {
    slug: "ovsyanka-tvorog-banan",
    title: "Овсянка с творогом и бананом",
    subtitle: "Сытный завтрак до обеда",
    mealType: "breakfast",
    proOnly: false,
    baseServings: 1,
    baseCalories: 430,
    baseProtein: 24,
    baseFat: 10,
    baseCarbs: 58,
    variants: buildVariants(430, 24, 10, 58),
    ingredients: [
      { name: "Овсяные хлопья", amount: 60, unit: "г" },
      { name: "Молоко 2,5% или вода", amount: 200, unit: "мл" },
      { name: "Творог 5%", amount: 80, unit: "г" },
      { name: "Банан", amount: 70, unit: "г" },
      { name: "Мёд или подсластитель", amount: 5, unit: "г" },
    ],
    steps: [
      "Свари овсянку.",
      "Добавь творог, перемешай.",
      "Сверху выложи банан и мёд.",
    ],
  },
  {
    slug: "tosty-yayco-avokado",
    title: "Тосты с яйцом и авокадо",
    subtitle: "Хрустящие тосты с полезными жирами",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 450,
    baseProtein: 20,
    baseFat: 24,
    baseCarbs: 35,
    variants: buildVariants(450, 20, 24, 35),
    ingredients: [
      { name: "Хлеб цельнозерновой", amount: 60, unit: "г" },
      { name: "Авокадо", amount: 50, unit: "г" },
      { name: "Яйцо куриное", amount: 1, unit: "шт" },
      { name: "Лимонный сок", amount: 5, unit: "г" },
      { name: "Соль, перец", amount: 1, unit: "по вкусу" },
    ],
    steps: [
      "Поджарь хлеб.",
      "Разомни авокадо с лимоном и специями.",
      "Обжарь яйцо и выложи сверху.",
    ],
  },
  {
    slug: "proteinyj-blin",
    title: "Протеиновый блин",
    subtitle: "Быстрый завтрак для тренировки",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 410,
    baseProtein: 32,
    baseFat: 10,
    baseCarbs: 40,
    variants: buildVariants(410, 32, 10, 40),
    ingredients: [
      { name: "Яйцо", amount: 1, unit: "шт" },
      { name: "Белок яичный", amount: 80, unit: "г" },
      { name: "Протеиновый порошок", amount: 25, unit: "г" },
      { name: "Овсяная мука", amount: 20, unit: "г" },
      { name: "Молоко/вода", amount: 50, unit: "мл" },
    ],
    steps: [
      "Смешай все ингредиенты до однородности.",
      "Обжарь на антипригарной сковороде с двух сторон.",
    ],
  },
  {
    slug: "shakshuka",
    title: "Шакшука",
    subtitle: "Яйца, тушёные в томатах",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 430,
    baseProtein: 25,
    baseFat: 24,
    baseCarbs: 30,
    variants: buildVariants(430, 25, 24, 30),
    ingredients: [
      { name: "Яйца", amount: 2, unit: "шт" },
      { name: "Томаты в собственном соку", amount: 150, unit: "г" },
      { name: "Лук, чеснок", amount: 30, unit: "г" },
      { name: "Оливковое масло", amount: 8, unit: "г" },
      { name: "Специи", amount: 1, unit: "по вкусу" },
    ],
    steps: [
      "Обжарь лук и чеснок, добавь томаты и специи.",
      "Сделай лунки и вбей яйца, готовь до желаемой степени.",
    ],
  },
  {
    slug: "smoothie-bowl-yagody",
    title: "Смузи-боул с ягодами",
    subtitle: "Холодный завтрак/брекфаст-бранч",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 390,
    baseProtein: 20,
    baseFat: 9,
    baseCarbs: 55,
    variants: buildVariants(390, 20, 9, 55),
    ingredients: [
      { name: "Греческий йогурт", amount: 150, unit: "г" },
      { name: "Замороженные ягоды", amount: 80, unit: "г" },
      { name: "Банан", amount: 60, unit: "г" },
      { name: "Овсяные хлопья", amount: 20, unit: "г" },
    ],
    steps: [
      "Взбей йогурт, ягоды и банан до смузи.",
      "Перелей в миску, посыпь овсянкой.",
    ],
  },
  {
    slug: "tvorozhnaya-zapekanka-utro",
    title: "Творожная запеканка",
    subtitle: "Классика детства, но по КБЖУ",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 420,
    baseProtein: 28,
    baseFat: 12,
    baseCarbs: 45,
    variants: buildVariants(420, 28, 12, 45),
    ingredients: [
      { name: "Творог 5%", amount: 200, unit: "г" },
      { name: "Яйцо", amount: 1, unit: "шт" },
      { name: "Манка/овсяная мука", amount: 20, unit: "г" },
      { name: "Подсластитель", amount: 5, unit: "г" },
      { name: "Изюм (по желанию)", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай ингредиенты, вылей в форму.",
      "Запеки до румяной корочки.",
    ],
  },
  {
    slug: "sandwich-kurica-syr",
    title: "Сэндвич с курицей и сыром",
    subtitle: "Быстрый белковый завтрак",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 440,
    baseProtein: 30,
    baseFat: 14,
    baseCarbs: 45,
    variants: buildVariants(440, 30, 14, 45),
    ingredients: [
      { name: "Хлеб цельнозерновой", amount: 70, unit: "г" },
      { name: "Куриная грудка отварная", amount: 70, unit: "г" },
      { name: "Сыр", amount: 20, unit: "г" },
      { name: "Овощи (лист салата, огурец)", amount: 40, unit: "г" },
    ],
    steps: [
      "Собери сэндвич из ингредиентов.",
      "Можно поджарить на гриле.",
    ],
  },
  {
    slug: "granola-molochnoe",
    title: "Гранола с молоком",
    subtitle: "Хрустящий завтрак",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 410,
    baseProtein: 16,
    baseFat: 12,
    baseCarbs: 60,
    variants: buildVariants(410, 16, 12, 60),
    ingredients: [
      { name: "Гранола", amount: 60, unit: "г" },
      { name: "Молоко 2,5%", amount: 200, unit: "мл" },
    ],
    steps: ["Залей гранолу молоком, дай немного размякнуть."],
  },
  {
    slug: "omlet-belochnyj-s-shinkoy",
    title: "Белковый омлет с ветчиной",
    subtitle: "Для контроля жиров",
    mealType: "breakfast",
    proOnly: true,
    baseServings: 1,
    baseCalories: 360,
    baseProtein: 32,
    baseFat: 10,
    baseCarbs: 12,
    variants: buildVariants(360, 32, 10, 12),
    ingredients: [
      { name: "Белок яичный", amount: 160, unit: "г" },
      { name: "Нежирная ветчина", amount: 40, unit: "г" },
      { name: "Овощи по вкусу", amount: 40, unit: "г" },
    ],
    steps: [
      "Обжарь ветчину и овощи.",
      "Залей белком и приготовь под крышкой.",
    ],
  },

  // ===================================
  // ОБЕДЫ (10 штук, 2 free + 8 PRO)
  // ===================================

  {
    slug: "kurica-ris-ovoshchi",
    title: "Курица с рисом и овощами",
    subtitle: "Базовый обед на каждый день",
    mealType: "lunch",
    proOnly: false,
    baseServings: 1,
    baseCalories: 650,
    baseProtein: 45,
    baseFat: 20,
    baseCarbs: 70,
    variants: buildVariants(650, 45, 20, 70),
    ingredients: [
      { name: "Куриная грудка", amount: 150, unit: "г" },
      { name: "Рис басмати (сухой)", amount: 70, unit: "г" },
      { name: "Брокколи", amount: 80, unit: "г" },
      { name: "Морковь", amount: 50, unit: "г" },
      { name: "Оливковое масло", amount: 10, unit: "г" },
    ],
    steps: [
      "Отвари рис.",
      "Обжарь курицу со специями.",
      "Приготовь овощи на пару или обжарь.",
      "Собери всё в одну тарелку.",
    ],
  },
  {
    slug: "grechka-govyadina-ovoshchi",
    title: "Гречка с говядиной и овощами",
    subtitle: "Плотный мясной обед",
    mealType: "lunch",
    proOnly: false,
    baseServings: 1,
    baseCalories: 700,
    baseProtein: 40,
    baseFat: 24,
    baseCarbs: 75,
    variants: buildVariants(700, 40, 24, 75),
    ingredients: [
      { name: "Гречка (сухая)", amount: 70, unit: "г" },
      { name: "Говядина постная", amount: 130, unit: "г" },
      { name: "Лук", amount: 30, unit: "г" },
      { name: "Морковь", amount: 40, unit: "г" },
      { name: "Растительное масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Отвари гречку.",
      "Потуши говядину с луком и морковью до мягкости.",
      "Смешай с гречкой.",
    ],
  },
  {
    slug: "losos-kartofel-salat",
    title: "Лосось с картофелем и салатом",
    subtitle: "Жирная рыба + сложные углеводы",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 720,
    baseProtein: 38,
    baseFat: 32,
    baseCarbs: 70,
    variants: buildVariants(720, 38, 32, 70),
    ingredients: [
      { name: "Стейк лосося", amount: 150, unit: "г" },
      { name: "Картофель", amount: 160, unit: "г" },
      { name: "Оливковое масло", amount: 10, unit: "г" },
      { name: "Салатные листья, овощи", amount: 80, unit: "г" },
    ],
    steps: [
      "Запеки картофель дольками.",
      "Приготовь лосось на сковороде или в духовке.",
      "Собери салат, добавь масло и лимон.",
    ],
  },
  {
    slug: "pasta-indeyka",
    title: "Паста с индейкой и томатами",
    subtitle: "Обед в итальянском стиле",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 680,
    baseProtein: 38,
    baseFat: 18,
    baseCarbs: 90,
    variants: buildVariants(680, 38, 18, 90),
    ingredients: [
      { name: "Паста из твердых сортов", amount: 80, unit: "г" },
      { name: "Филе индейки", amount: 120, unit: "г" },
      { name: "Томаты в собственном соку", amount: 120, unit: "г" },
      { name: "Оливковое масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Свари пасту.",
      "Обжарь индейку, добавь томаты и потуши.",
      "Смешай с пастой.",
    ],
  },
  {
    slug: "ris-krevetki-ovoshchi",
    title: "Рис с креветками и овощами",
    subtitle: "Лёгкий морской обед",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 640,
    baseProtein: 35,
    baseFat: 16,
    baseCarbs: 80,
    variants: buildVariants(640, 35, 16, 80),
    ingredients: [
      { name: "Рис жасмин", amount: 70, unit: "г" },
      { name: "Креветки очищенные", amount: 120, unit: "г" },
      { name: "Овощная смесь", amount: 80, unit: "г" },
      { name: "Растительное масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Отвари рис.",
      "Быстро обжарь креветки с овощами.",
      "Смешай с рисом.",
    ],
  },
  {
    slug: "chili-indejka-fasoly",
    title: "Чили с индейкой и фасолью",
    subtitle: "Сытный обед в одном блюде",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 690,
    baseProtein: 42,
    baseFat: 20,
    baseCarbs: 75,
    variants: buildVariants(690, 42, 20, 75),
    ingredients: [
      { name: "Фарш индейки", amount: 150, unit: "г" },
      { name: "Красная фасоль консервированная", amount: 80, unit: "г" },
      { name: "Томаты", amount: 120, unit: "г" },
      { name: "Лук, специи", amount: 30, unit: "г" },
    ],
    steps: [
      "Обжарь фарш с луком и специями.",
      "Добавь фасоль и томаты, потуши.",
    ],
  },
  {
    slug: "kurica-kuskus-ovoshchi",
    title: "Курица с кускусом и овощами",
    subtitle: "Восточный акцент",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 660,
    baseProtein: 40,
    baseFat: 18,
    baseCarbs: 80,
    variants: buildVariants(660, 40, 18, 80),
    ingredients: [
      { name: "Кускус (сухой)", amount: 70, unit: "г" },
      { name: "Куриное филе", amount: 130, unit: "г" },
      { name: "Овощи (перец, кабачок)", amount: 80, unit: "г" },
      { name: "Оливковое масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Залей кускус кипятком по инструкции.",
      "Обжарь курицу и овощи, смешай с кускусом.",
    ],
  },
  {
    slug: "sveklovyj-salat-kurica",
    title: "Свекольный салат с курицей",
    subtitle: "Обед полегче",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 580,
    baseProtein: 35,
    baseFat: 18,
    baseCarbs: 60,
    variants: buildVariants(580, 35, 18, 60),
    ingredients: [
      { name: "Запечённая свёкла", amount: 120, unit: "г" },
      { name: "Куриное филе", amount: 100, unit: "г" },
      { name: "Фета/брынза", amount: 25, unit: "г" },
      { name: "Орехи", amount: 10, unit: "г" },
      { name: "Оливковое масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Нарежь свёклу и курицу, добавь фету и орехи.",
      "Заправь маслом.",
    ],
  },
  {
    slug: "sup-pure-ovoshchnoj-kurica",
    title: "Овощной суп-пюре с курицей",
    subtitle: "Тарелка тепла",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 560,
    baseProtein: 35,
    baseFat: 16,
    baseCarbs: 55,
    variants: buildVariants(560, 35, 16, 55),
    ingredients: [
      { name: "Овощи для супа", amount: 200, unit: "г" },
      { name: "Куриное филе", amount: 120, unit: "г" },
      { name: "Сливки 10%", amount: 20, unit: "мл" },
    ],
    steps: [
      "Свари овощи и курицу, взбей овощи блендером.",
      "Добавь сливки, подай с курицей.",
    ],
  },
  {
    slug: "lapsha-soba-govyadina",
    title: "Лапша соба с говядиной",
    subtitle: "Азиатский обед",
    mealType: "lunch",
    proOnly: true,
    baseServings: 1,
    baseCalories: 710,
    baseProtein: 38,
    baseFat: 22,
    baseCarbs: 85,
    variants: buildVariants(710, 38, 22, 85),
    ingredients: [
      { name: "Лапша соба (сухая)", amount: 80, unit: "г" },
      { name: "Говядина", amount: 120, unit: "г" },
      { name: "Овощи (перец, морковь)", amount: 80, unit: "г" },
      { name: "Соевый соус, масло", amount: 12, unit: "г" },
    ],
    steps: [
      "Свари лапшу.",
      "Обжарь говядину и овощи, добавь соус.",
      "Смешай с лапшой.",
    ],
  },

  // ===================================
  // УЖИНЫ (10 штук, 2 free + 8 PRO)
  // ===================================

  {
    slug: "indejka-kinoa-ovoshchi",
    title: "Индейка с киноа и овощами",
    subtitle: "Лёгкий белковый ужин",
    mealType: "dinner",
    proOnly: false,
    baseServings: 1,
    baseCalories: 500,
    baseProtein: 40,
    baseFat: 14,
    baseCarbs: 50,
    variants: buildVariants(500, 40, 14, 50),
    ingredients: [
      { name: "Филе индейки", amount: 140, unit: "г" },
      { name: "Киноа (сухая)", amount: 60, unit: "г" },
      { name: "Цукини/кабачок", amount: 80, unit: "г" },
      { name: "Оливковое масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Отвари киноа.",
      "Обжарь индейку и кабачки, смешай с киноа.",
    ],
  },
  {
    slug: "tvorog-orekhi-yagody",
    title: "Творог с орехами и ягодами",
    subtitle: "Белковый ужин без тяжёлых углеводов",
    mealType: "dinner",
    proOnly: false,
    baseServings: 1,
    baseCalories: 400,
    baseProtein: 32,
    baseFat: 14,
    baseCarbs: 25,
    variants: buildVariants(400, 32, 14, 25),
    ingredients: [
      { name: "Творог 5%", amount: 200, unit: "г" },
      { name: "Греческий йогурт", amount: 50, unit: "г" },
      { name: "Ягоды", amount: 50, unit: "г" },
      { name: "Орехи", amount: 15, unit: "г" },
    ],
    steps: [
      "Смешай творог с йогуртом.",
      "Добавь ягоды и орехи сверху.",
    ],
  },
  {
    slug: "ryba-ovoshchi-gril",
    title: "Белая рыба и овощи-гриль",
    subtitle: "Очень лёгкий вечерний вариант",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 380,
    baseProtein: 32,
    baseFat: 10,
    baseCarbs: 30,
    variants: buildVariants(380, 32, 10, 30),
    ingredients: [
      { name: "Филе белой рыбы", amount: 150, unit: "г" },
      { name: "Перец болгарский", amount: 60, unit: "г" },
      { name: "Кабачок", amount: 60, unit: "г" },
      { name: "Оливковое масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Замаринуй рыбу и овощи, приготовь на гриле или в духовке.",
    ],
  },
  {
    slug: "kurinyj-salat-legkij",
    title: "Лёгкий куриный салат",
    subtitle: "Когда ужинать поздно",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 360,
    baseProtein: 34,
    baseFat: 12,
    baseCarbs: 15,
    variants: buildVariants(360, 34, 12, 15),
    ingredients: [
      { name: "Куриная грудка", amount: 120, unit: "г" },
      { name: "Салатный микс", amount: 80, unit: "г" },
      { name: "Овощи", amount: 60, unit: "г" },
      { name: "Оливковое масло", amount: 6, unit: "г" },
    ],
    steps: [
      "Нарежь курицу и овощи, смешай с салатом, заправь маслом.",
    ],
  },
  {
    slug: "yajca-v-meshochek-s-ovoshchami",
    title: "Яйца-пашот с овощами",
    subtitle: "Мини-ужин для лёгкого дня",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 340,
    baseProtein: 24,
    baseFat: 20,
    baseCarbs: 10,
    variants: buildVariants(340, 24, 20, 10),
    ingredients: [
      { name: "Яйца", amount: 2, unit: "шт" },
      { name: "Овощи (томаты, шпинат)", amount: 80, unit: "г" },
      { name: "Сыр", amount: 15, unit: "г" },
    ],
    steps: [
      "Сделай яйца-пашот, обжарь овощи.",
      "Подавай вместе, посыпав сыром.",
    ],
  },
  {
    slug: "kotlety-indejka-ovoshchi",
    title: "Котлеты из индейки с овощами",
    subtitle: "Тёплый белковый ужин",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 430,
    baseProtein: 36,
    baseFat: 16,
    baseCarbs: 25,
    variants: buildVariants(430, 36, 16, 25),
    ingredients: [
      { name: "Фарш индейки", amount: 130, unit: "г" },
      { name: "Овощи (смесь)", amount: 100, unit: "г" },
      { name: "Яйцо", amount: 0.5, unit: "шт" },
      { name: "Сухари/мука", amount: 10, unit: "г" },
    ],
    steps: [
      "Сформируй котлеты и запеки/обжарь.",
      "Подавай с гарниром из овощей.",
    ],
  },
  {
    slug: "sup-krem-iz-tykvy",
    title: "Тыквенный суп-крем",
    subtitle: "Тёплый и лёгкий",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 390,
    baseProtein: 14,
    baseFat: 16,
    baseCarbs: 50,
    variants: buildVariants(390, 14, 16, 50),
    ingredients: [
      { name: "Тыква", amount: 200, unit: "г" },
      { name: "Морковь, лук", amount: 60, unit: "г" },
      { name: "Сливки 10%", amount: 25, unit: "мл" },
    ],
    steps: [
      "Отвари овощи, измельчи блендером, добавь сливки.",
    ],
  },
  {
    slug: "kurica-tushenaya-s-ovoshchami",
    title: "Курица тушёная с овощами",
    subtitle: "Ещё один простой ужин",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 430,
    baseProtein: 36,
    baseFat: 14,
    baseCarbs: 30,
    variants: buildVariants(430, 36, 14, 30),
    ingredients: [
      { name: "Куриное филе", amount: 130, unit: "г" },
      { name: "Овощи (смешанные)", amount: 120, unit: "г" },
      { name: "Масло", amount: 8, unit: "г" },
    ],
    steps: ["Потуши всё вместе до готовности."],
  },
  {
    slug: "ryba-zapechennaya-s-ovoshchami",
    title: "Рыба, запечённая с овощами",
    subtitle: "Противень – лучший друг",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 410,
    baseProtein: 32,
    baseFat: 14,
    baseCarbs: 28,
    variants: buildVariants(410, 32, 14, 28),
    ingredients: [
      { name: "Филе рыбы", amount: 140, unit: "г" },
      { name: "Овощи", amount: 120, unit: "г" },
      { name: "Масло", amount: 8, unit: "г" },
    ],
    steps: [
      "Выложи рыбу и овощи на противень, сбрызни маслом и запеки.",
    ],
  },
  {
    slug: "salat-syr-yajco-ovoshchi",
    title: "Салат с яйцом и сыром",
    subtitle: "Когда хочется минимализма",
    mealType: "dinner",
    proOnly: true,
    baseServings: 1,
    baseCalories: 360,
    baseProtein: 24,
    baseFat: 22,
    baseCarbs: 10,
    variants: buildVariants(360, 24, 22, 10),
    ingredients: [
      { name: "Яйца варёные", amount: 2, unit: "шт" },
      { name: "Сыр", amount: 25, unit: "г" },
      { name: "Овощи", amount: 80, unit: "г" },
      { name: "Йогуртовая заправка", amount: 20, unit: "г" },
    ],
    steps: ["Нарежь всё и смешай с заправкой."],
  },

  // ===================================
  // ПЕРЕКУСЫ (10 штук, 2 free + 8 PRO)
  // ===================================

  {
    slug: "yogurt-granola-yagody",
    title: "Греческий йогурт с гранолой и ягодами",
    subtitle: "Быстрый перекус",
    mealType: "snack",
    proOnly: false,
    baseServings: 1,
    baseCalories: 300,
    baseProtein: 18,
    baseFat: 8,
    baseCarbs: 35,
    variants: buildVariants(300, 18, 8, 35),
    ingredients: [
      { name: "Греческий йогурт", amount: 150, unit: "г" },
      { name: "Гранола", amount: 25, unit: "г" },
      { name: "Ягоды", amount: 40, unit: "г" },
    ],
    steps: ["Выложи йогурт, сверху – гранолу и ягоды."],
  },
  {
    slug: "syrniki-iz-tvoroga",
    title: "Сырники из творога",
    subtitle: "Мини-порция сырников",
    mealType: "snack",
    proOnly: false,
    baseServings: 1,
    baseCalories: 350,
    baseProtein: 20,
    baseFat: 12,
    baseCarbs: 40,
    variants: buildVariants(350, 20, 12, 40),
    ingredients: [
      { name: "Творог 5%", amount: 120, unit: "г" },
      { name: "Яйцо", amount: 0.5, unit: "шт" },
      { name: "Мука/овсяная мука", amount: 20, unit: "г" },
      { name: "Подсластитель", amount: 5, unit: "г" },
      { name: "Растительное масло", amount: 5, unit: "г" },
    ],
    steps: [
      "Смешай ингредиенты, сформируй сырники, обжарь до готовности.",
    ],
  },
  {
    slug: "proteиновyij-batonchik-domashnij",
    title: "Домашний протеиновый батончик",
    subtitle: "Перекус «с собой»",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 320,
    baseProtein: 22,
    baseFat: 10,
    baseCarbs: 30,
    variants: buildVariants(320, 22, 10, 30),
    ingredients: [
      { name: "Протеиновый порошок", amount: 25, unit: "г" },
      { name: "Овсяные хлопья", amount: 25, unit: "г" },
      { name: "Ореховая паста", amount: 15, unit: "г" },
      { name: "Мёд/сироп", amount: 10, unit: "г" },
      { name: "Молоко/вода", amount: 20, unit: "мл" },
    ],
    steps: [
      "Смешай до густой массы, сформируй батончик, охлади.",
    ],
  },
  {
    slug: "orehi-suhofrukty",
    title: "Орехово-сухофруктовый микс",
    subtitle: "Очень быстрый перекус",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 320,
    baseProtein: 7,
    baseFat: 18,
    baseCarbs: 35,
    variants: buildVariants(320, 7, 18, 35),
    ingredients: [
      { name: "Орехи смесь", amount: 20, unit: "г" },
      { name: "Сухофрукты", amount: 25, unit: "г" },
    ],
    steps: ["Просто смешай орехи и сухофрукты."],
  },
  {
    slug: "toast-arahis-pasta-banan",
    title: "Тост с арахисовой пастой и бананом",
    subtitle: "Сладкий перекус с белком",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 330,
    baseProtein: 11,
    baseFat: 13,
    baseCarbs: 42,
    variants: buildVariants(330, 11, 13, 42),
    ingredients: [
      { name: "Цельнозерновой хлеб", amount: 40, unit: "г" },
      { name: "Арахисовая паста", amount: 15, unit: "г" },
      { name: "Банан", amount: 50, unit: "г" },
    ],
    steps: [
      "Поджарь хлеб, намажь пастой, сверху выложи банан.",
    ],
  },
  {
    slug: "tvorog-med-yagody-perekus",
    title: "Творог с мёдом и ягодами",
    subtitle: "Мини-версия творожного ужина",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 280,
    baseProtein: 20,
    baseFat: 7,
    baseCarbs: 30,
    variants: buildVariants(280, 20, 7, 30),
    ingredients: [
      { name: "Творог 5%", amount: 120, unit: "г" },
      { name: "Ягоды", amount: 40, unit: "г" },
      { name: "Мёд", amount: 8, unit: "г" },
    ],
    steps: ["Смешай всё в одной миске."],
  },
  {
    slug: "ovochnye-palochki-humus",
    title: "Овощные палочки с хумусом",
    subtitle: "Хрустящий перекус",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 260,
    baseProtein: 9,
    baseFat: 12,
    baseCarbs: 26,
    variants: buildVariants(260, 9, 12, 26),
    ingredients: [
      { name: "Морковь, огурец, сельдерей", amount: 100, unit: "г" },
      { name: "Хумус", amount: 50, unit: "г" },
    ],
    steps: ["Нарежь овощи, подай с хумусом."],
  },
  {
    slug: "yablochno-tvorozhnyj-dip",
    title: "Яблоко с творожным дипом",
    subtitle: "Фруктовый перекус",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 270,
    baseProtein: 13,
    baseFat: 5,
    baseCarbs: 48,
    variants: buildVariants(270, 13, 5, 48),
    ingredients: [
      { name: "Яблоко", amount: 1, unit: "шт" },
      { name: "Творог 5%", amount: 80, unit: "г" },
      { name: "Йогурт", amount: 20, unit: "г" },
    ],
    steps: [
      "Нарежь яблоко дольками, смешай творог и йогурт для дипа.",
    ],
  },
  {
    slug: "kefir-semyachki",
    title: "Кефир с семечками/льном",
    subtitle: "Лёгкий кисломолочный перекус",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 230,
    baseProtein: 10,
    baseFat: 9,
    baseCarbs: 23,
    variants: buildVariants(230, 10, 9, 23),
    ingredients: [
      { name: "Кефир 1%", amount: 250, unit: "мл" },
      { name: "Семена льна/чиа", amount: 10, unit: "г" },
    ],
    steps: ["Смешай семена с кефиром, дай им чуть набухнуть."],
  },
  {
    slug: "mini-buter-syr-kurka",
    title: "Мини-бутерброд с сыром и курицей",
    subtitle: "Когда хочется «что-то пожевать»",
    mealType: "snack",
    proOnly: true,
    baseServings: 1,
    baseCalories: 290,
    baseProtein: 18,
    baseFat: 11,
    baseCarbs: 28,
    variants: buildVariants(290, 18, 11, 28),
    ingredients: [
      { name: "Хлеб цельнозерновой", amount: 30, unit: "г" },
      { name: "Курица отварная", amount: 40, unit: "г" },
      { name: "Сыр", amount: 15, unit: "г" },
      { name: "Огурец/помидор", amount: 30, unit: "г" },
    ],
    steps: ["Собери мини-бутерброд из ингредиентов."],
  },

  // ===================================
  // ДЕСЕРТЫ (10 штук, 2 free + 8 PRO)
  // ===================================

  {
    slug: "tvorozhnyj-desert-yagody",
    title: "Творожный десерт с ягодами",
    subtitle: "Лёгкий белковый десерт",
    mealType: "dessert",
    proOnly: false,
    baseServings: 1,
    baseCalories: 280,
    baseProtein: 25,
    baseFat: 8,
    baseCarbs: 25,
    variants: buildVariants(280, 25, 8, 25),
    ingredients: [
      { name: "Творог 5%", amount: 150, unit: "г" },
      { name: "Греческий йогурт", amount: 50, unit: "г" },
      { name: "Ягоды", amount: 50, unit: "г" },
      { name: "Мёд/подсластитель", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай творог и йогурт, добавь мёд.",
      "Сверху выложи ягоды.",
    ],
  },
  {
    slug: "shokoladnyj-mus-na-grecheskom-yogurte",
    title: "Шоколадный мусс на греческом йогурте",
    subtitle: "Десерт, который не убивает КБЖУ",
    mealType: "dessert",
    proOnly: false,
    baseServings: 1,
    baseCalories: 320,
    baseProtein: 20,
    baseFat: 12,
    baseCarbs: 30,
    variants: buildVariants(320, 20, 12, 30),
    ingredients: [
      { name: "Греческий йогурт", amount: 150, unit: "г" },
      { name: "Какао-порошок", amount: 8, unit: "г" },
      { name: "Подсластитель", amount: 5, unit: "г" },
      { name: "Тёртый тёмный шоколад", amount: 5, unit: "г" },
    ],
    steps: [
      "Смешай йогурт, какао и подсластитель.",
      "Взбей и посыпь тёртым шоколадом.",
    ],
  },
  {
    slug: "zapechennye-yabloki-s-tvorogom",
    title: "Запечённые яблоки с творогом",
    subtitle: "Тёплый вечерний десерт",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 340,
    baseProtein: 18,
    baseFat: 8,
    baseCarbs: 55,
    variants: buildVariants(340, 18, 8, 55),
    ingredients: [
      { name: "Яблоко крупное", amount: 1, unit: "шт" },
      { name: "Творог 5%", amount: 80, unit: "г" },
      { name: "Изюм/сухофрукты", amount: 10, unit: "г" },
      { name: "Мёд", amount: 5, unit: "г" },
    ],
    steps: [
      "Начини яблоко творогом с изюмом и мёдом, запеки до мягкости.",
    ],
  },
  {
    slug: "chia-puding-kakao",
    title: "Чиа-пудинг с какао",
    subtitle: "Модный, но полезный",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 300,
    baseProtein: 13,
    baseFat: 12,
    baseCarbs: 32,
    variants: buildVariants(300, 13, 12, 32),
    ingredients: [
      { name: "Семена чиа", amount: 20, unit: "г" },
      { name: "Молоко/растительное молоко", amount: 180, unit: "мл" },
      { name: "Какао", amount: 6, unit: "г" },
      { name: "Подсластитель", amount: 5, unit: "г" },
    ],
    steps: [
      "Смешай всё и оставь в холодильнике минимум на 3 часа.",
    ],
  },
  {
    slug: "bananovyj-led",
    title: "Банановое мороженое",
    subtitle: "Мороженое без сахара",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 310,
    baseProtein: 7,
    baseFat: 9,
    baseCarbs: 55,
    variants: buildVariants(310, 7, 9, 55),
    ingredients: [
      { name: "Замороженный банан", amount: 120, unit: "г" },
      { name: "Йогурт", amount: 60, unit: "г" },
      { name: "Какао/ягоды", amount: 10, unit: "г" },
    ],
    steps: [
      "Взбей банан с йогуртом и добавками до консистенции мороженого.",
    ],
  },
  {
    slug: "proteinyj-desert-tiramisu",
    title: "Протеиновый «тирамису»",
    subtitle: "Версия без сахара и с белком",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 350,
    baseProtein: 24,
    baseFat: 10,
    baseCarbs: 40,
    variants: buildVariants(350, 24, 10, 40),
    ingredients: [
      { name: "Творог мягкий/маскарпоне light", amount: 120, unit: "г" },
      { name: "Протеин ванильный", amount: 20, unit: "г" },
      { name: "Печенье савоярди/фитнес-печенье", amount: 25, unit: "г" },
      { name: "Кофе", amount: 30, unit: "мл" },
    ],
    steps: [
      "Смешай творог с протеином.",
      "Слоёно выложи крем и печенье, пропитанное кофе.",
    ],
  },
  {
    slug: "zernovoj-batonchik-desert",
    title: "Зерновой десертный батончик",
    subtitle: "Когда нужен сладкий перекус",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 330,
    baseProtein: 10,
    baseFat: 12,
    baseCarbs: 45,
    variants: buildVariants(330, 10, 12, 45),
    ingredients: [
      { name: "Овсяные хлопья", amount: 30, unit: "г" },
      { name: "Ореховая паста", amount: 15, unit: "г" },
      { name: "Мёд", amount: 10, unit: "г" },
      { name: "Семечки/орехи", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай, спрессуй в форму, охлади и нарежь батончиками.",
    ],
  },
  {
    slug: "zapechennaya-grusha-orekhi",
    title: "Запечённая груша с орехами",
    subtitle: "Тёплый десерт к чаю",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 300,
    baseProtein: 5,
    baseFat: 10,
    baseCarbs: 50,
    variants: buildVariants(300, 5, 10, 50),
    ingredients: [
      { name: "Груша", amount: 1, unit: "шт" },
      { name: "Орехи", amount: 12, unit: "г" },
      { name: "Мёд/сироп", amount: 8, unit: "г" },
    ],
    steps: [
      "Разрежь грушу, посыпь орехами и мёдом, запеки до мягкости.",
    ],
  },
  {
    slug: "yogurt-zhele",
    title: "Йогуртовое желе",
    subtitle: "Холодный десерт",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 260,
    baseProtein: 18,
    baseFat: 5,
    baseCarbs: 35,
    variants: buildVariants(260, 18, 5, 35),
    ingredients: [
      { name: "Йогурт", amount: 150, unit: "г" },
      { name: "Желатин", amount: 5, unit: "г" },
      { name: "Подсластитель/сироп", amount: 8, unit: "г" },
    ],
    steps: [
      "Раствори желатин, смешай с йогуртом и подсластителем, охлади.",
    ],
  },
  {
    slug: "fruktovyj-salat-legkij",
    title: "Фруктовый салат с йогуртом",
    subtitle: "Очень простой десерт",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    baseCalories: 290,
    baseProtein: 8,
    baseFat: 5,
    baseCarbs: 55,
    variants: buildVariants(290, 8, 5, 55),
    ingredients: [
      { name: "Фрукты ассорти", amount: 150, unit: "г" },
      { name: "Йогурт", amount: 60, unit: "г" },
    ],
    steps: ["Нарежь фрукты и заправь йогуртом."],
  },
];
