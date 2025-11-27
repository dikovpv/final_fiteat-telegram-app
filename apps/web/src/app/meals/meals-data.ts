// apps/web/src/app/meals/meals-data.ts

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export interface Ingredient {
  id: string;
  name: string;
  amount: number; // в единицах unit
  unit: string; // г, мл, шт и т.п.
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealRecipe {
  slug: string;
  title: string;
  subtitle?: string;
  mealType: MealType;
  baseServings: number;
  time: string; // "15 мин"
  // КБЖУ на одну порцию (упрощённо)
  kkal: number;
  protein: number;
  fat: number;
  carbs: number;
  description: string;
  instructions: string[];
  ingredients: Ingredient[];
  // PRO-рецепт (для платного доступа)
  proOnly?: boolean;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
  dessert: "Десерт",
};

// ——— ЗАВТРАКИ ———
const breakfasts: MealRecipe[] = [
  {
    slug: "omlet-s-ovoshchami",
    title: "Омлет с овощами и сыром",
    mealType: "breakfast",
    baseServings: 1,
    time: "15 мин",
    kkal: 400,
    protein: 30,
    fat: 25,
    carbs: 10,
    description: "Быстрый белковый завтрак для продуктивного утра.",
    instructions: [
      "Взбей яйца с молоком и щепоткой соли.",
      "Обжарь нарезанные овощи на сковороде 2–3 минуты.",
      "Влей яйца, накрой крышкой и готовь до готовности.",
      "Посыпь тёртым сыром и дай ему расплавиться.",
    ],
    ingredients: [
      {
        id: "eggs",
        name: "Яйца куриные",
        amount: 2,
        unit: "шт",
        calories: 160,
        protein: 14,
        fat: 11,
        carbs: 1,
      },
      {
        id: "milk",
        name: "Молоко 2,5%",
        amount: 50,
        unit: "мл",
        calories: 30,
        protein: 1.7,
        fat: 1.3,
        carbs: 3,
      },
      {
        id: "veggies",
        name: "Овощи (перец, помидор)",
        amount: 80,
        unit: "г",
        calories: 20,
        protein: 1,
        fat: 0.2,
        carbs: 4,
      },
      {
        id: "cheese",
        name: "Сыр твёрдый",
        amount: 20,
        unit: "г",
        calories: 70,
        protein: 5,
        fat: 6,
        carbs: 0.5,
      },
      {
        id: "oil",
        name: "Оливковое масло",
        amount: 5,
        unit: "г",
        calories: 45,
        protein: 0,
        fat: 5,
        carbs: 0,
      },
    ],
  },
  {
    slug: "ovsyanka-s-yablokom-i-orekhamy",
    title: "Овсянка с яблоком и орехами",
    mealType: "breakfast",
    baseServings: 1,
    time: "10 мин",
    kkal: 420,
    protein: 16,
    fat: 14,
    carbs: 55,
    description: "Углеводный заряд с клетчаткой и полезными жирами.",
    instructions: [
      "Свари овсянку на воде или молоке до нужной консистенции.",
      "Добавь нарезанное яблоко и орехи.",
      "По желанию добавь корицу или подсластитель.",
    ],
    ingredients: [
      {
        id: "oats",
        name: "Овсяные хлопья",
        amount: 60,
        unit: "г",
        calories: 230,
        protein: 8,
        fat: 4,
        carbs: 40,
      },
      {
        id: "water",
        name: "Вода или молоко",
        amount: 200,
        unit: "мл",
        calories: 30,
        protein: 1.5,
        fat: 1,
        carbs: 3,
      },
      {
        id: "apple",
        name: "Яблоко",
        amount: 100,
        unit: "г",
        calories: 50,
        protein: 0.5,
        fat: 0.2,
        carbs: 12,
      },
      {
        id: "nuts",
        name: "Грецкие орехи",
        amount: 15,
        unit: "г",
        calories: 110,
        protein: 3,
        fat: 10,
        carbs: 2,
      },
    ],
    proOnly: true, // пример PRO-завтрака
  },
];

// ——— ОБЕДЫ ———
const lunches: MealRecipe[] = [
  {
    slug: "kuritsa-s-risom-i-ovoshchami",
    title: "Курица с рисом и овощами",
    mealType: "lunch",
    baseServings: 1,
    time: "25 мин",
    kkal: 550,
    protein: 40,
    fat: 15,
    carbs: 60,
    description: "Классический фитнес-обед: белок + сложные углеводы.",
    instructions: [
      "Отвари рис до готовности.",
      "Куриное филе обжарь или запеки до готовности.",
      "Овощи обжарь или потуши на сковороде.",
      "Подавай вместе, можно добавить соевый соус по вкусу.",
    ],
    ingredients: [
      {
        id: "chicken",
        name: "Куриное филе",
        amount: 150,
        unit: "г",
        calories: 165,
        protein: 31,
        fat: 3.6,
        carbs: 0,
      },
      {
        id: "rice",
        name: "Рис басмати (сухой)",
        amount: 70,
        unit: "г",
        calories: 240,
        protein: 5,
        fat: 1,
        carbs: 51,
      },
      {
        id: "veg-mix",
        name: "Овощи (брокколи, морковь)",
        amount: 100,
        unit: "г",
        calories: 40,
        protein: 3,
        fat: 0.3,
        carbs: 7,
      },
      {
        id: "oil-lunch",
        name: "Оливковое масло",
        amount: 7,
        unit: "г",
        calories: 63,
        protein: 0,
        fat: 7,
        carbs: 0,
      },
    ],
  },
  {
    slug: "grechka-s-govyadinoi",
    title: "Гречка с говядиной и овощами",
    mealType: "lunch",
    baseServings: 1,
    time: "30 мин",
    kkal: 580,
    protein: 38,
    fat: 20,
    carbs: 55,
    description: "Сытный вариант обеда с железом и сложными углеводами.",
    instructions: [
      "Отвари гречку до готовности.",
      "Говядину нарежь и потуши с луком.",
      "Добавь овощи и туши ещё 5–7 минут.",
      "Смешай или подавай рядом с гречкой.",
    ],
    ingredients: [
      {
        id: "beef",
        name: "Говядина постная",
        amount: 130,
        unit: "г",
        calories: 220,
        protein: 28,
        fat: 12,
        carbs: 0,
      },
      {
        id: "buckwheat",
        name: "Гречка (сухая)",
        amount: 70,
        unit: "г",
        calories: 240,
        protein: 9,
        fat: 2.5,
        carbs: 48,
      },
      {
        id: "onion",
        name: "Лук репчатый",
        amount: 40,
        unit: "г",
        calories: 15,
        protein: 0.4,
        fat: 0,
        carbs: 3,
      },
      {
        id: "pepper",
        name: "Перец болгарский",
        amount: 60,
        unit: "г",
        calories: 20,
        protein: 0.7,
        fat: 0.2,
        carbs: 4,
      },
      {
        id: "oil-beef",
        name: "Растительное масло",
        amount: 7,
        unit: "г",
        calories: 63,
        protein: 0,
        fat: 7,
        carbs: 0,
      },
    ],
    proOnly: true,
  },
];

// ——— УЖИНЫ ———
const dinners: MealRecipe[] = [
  {
    slug: "ryba-s-ovoshchami",
    title: "Запечённая рыба с овощами",
    mealType: "dinner",
    baseServings: 1,
    time: "25 мин",
    kkal: 450,
    protein: 35,
    fat: 20,
    carbs: 20,
    description: "Лёгкий белковый ужин с омега-3.",
    instructions: [
      "Рыбу посоли, поперчи и сбрызни лимоном.",
      "Выложи рыбу и овощи в форму для запекания.",
      "Запекай 20–25 минут при 180–190°C.",
    ],
    ingredients: [
      {
        id: "fish",
        name: "Филе красной рыбы",
        amount: 140,
        unit: "г",
        calories: 260,
        protein: 28,
        fat: 16,
        carbs: 0,
      },
      {
        id: "veg-dinner",
        name: "Овощи для запекания",
        amount: 150,
        unit: "г",
        calories: 50,
        protein: 2,
        fat: 0.5,
        carbs: 10,
      },
      {
        id: "oil-dinner",
        name: "Оливковое масло",
        amount: 7,
        unit: "г",
        calories: 63,
        protein: 0,
        fat: 7,
        carbs: 0,
      },
      {
        id: "lemon",
        name: "Лимонный сок",
        amount: 10,
        unit: "г",
        calories: 3,
        protein: 0.1,
        fat: 0,
        carbs: 0.8,
      },
    ],
  },
  {
    slug: "tvorozhnaya-zapekanka",
    title: "Творожная запеканка",
    mealType: "dinner",
    baseServings: 2,
    time: "35 мин",
    kkal: 300,
    protein: 24,
    fat: 9,
    carbs: 28,
    description:
      "Высокобелковый десерт/ужин, который не выбивается из плана.",
    instructions: [
      "Смешай творог, яйцо, подсластитель и манку/муку.",
      "Выложи массу в форму.",
      "Запекай 25–30 минут при 180°C.",
      "Дай слегка остыть и порежь на порции.",
    ],
    ingredients: [
      {
        id: "cottage",
        name: "Творог 5%",
        amount: 250,
        unit: "г",
        calories: 210,
        protein: 30,
        fat: 10,
        carbs: 5,
      },
      {
        id: "egg-zap",
        name: "Яйцо",
        amount: 1,
        unit: "шт",
        calories: 80,
        protein: 7,
        fat: 5,
        carbs: 0.7,
      },
      {
        id: "semolina",
        name: "Мука/манка",
        amount: 30,
        unit: "г",
        calories: 105,
        protein: 3,
        fat: 0.5,
        carbs: 22,
      },
      {
        id: "sweetener",
        name: "Подсластитель",
        amount: 2,
        unit: "г",
        calories: 5,
        protein: 0,
        fat: 0,
        carbs: 1,
      },
    ],
  },
];

// ——— ПЕРЕКУСЫ ———
const snacks: MealRecipe[] = [
  {
    slug: "yogurt-s-yagodami",
    title: "Греческий йогурт с ягодами и орехами",
    mealType: "snack",
    baseServings: 1,
    time: "5 мин",
    kkal: 250,
    protein: 18,
    fat: 9,
    carbs: 22,
    description: "Быстрый перекус, который не проваливает сахар вниз.",
    instructions: [
      "Смешай йогурт с ягодами.",
      "Добавь сверху орехи.",
      "По желанию — немного мёда или подсластителя.",
    ],
    ingredients: [
      {
        id: "yogurt",
        name: "Греческий йогурт 2%",
        amount: 150,
        unit: "г",
        calories: 110,
        protein: 12,
        fat: 3,
        carbs: 7,
      },
      {
        id: "berries",
        name: "Ягоды (замороженные/свежие)",
        amount: 70,
        unit: "г",
        calories: 35,
        protein: 0.5,
        fat: 0.3,
        carbs: 8,
      },
      {
        id: "nuts-snack",
        name: "Орехи",
        amount: 10,
        unit: "г",
        calories: 70,
        protein: 2,
        fat: 6.5,
        carbs: 1.5,
      },
      {
        id: "honey",
        name: "Мёд (по желанию)",
        amount: 5,
        unit: "г",
        calories: 35,
        protein: 0,
        fat: 0,
        carbs: 9,
      },
    ],
  },
  {
    slug: "proteinovyi-batonchik-doma",
    title: "Домашний протеиновый батончик",
    mealType: "snack",
    baseServings: 2,
    time: "20 мин",
    kkal: 220,
    protein: 18,
    fat: 7,
    carbs: 20,
    description: "Перекус с хорошей дозой белка, без лишнего мусора.",
    instructions: [
      "Смешай протеин, овсянку и ореховую пасту.",
      "Добавь немного воды/молока до плотной массы.",
      "Сформируй батончики и убери в холодильник.",
    ],
    ingredients: [
      {
        id: "protein",
        name: "Сывороточный протеин",
        amount: 30,
        unit: "г",
        calories: 110,
        protein: 24,
        fat: 1.5,
        carbs: 2,
      },
      {
        id: "oats-bar",
        name: "Овсяные хлопья",
        amount: 30,
        unit: "г",
        calories: 115,
        protein: 4,
        fat: 2,
        carbs: 20,
      },
      {
        id: "pb",
        name: "Ореховая паста",
        amount: 15,
        unit: "г",
        calories: 90,
        protein: 3,
        fat: 8,
        carbs: 2,
      },
    ],
    proOnly: true,
  },
];

// ——— ДЕСЕРТЫ ———
const desserts: MealRecipe[] = [
  {
    slug: "bananovoe-morozhenoe",
    title: "Банановое «мороженое» с протеином",
    mealType: "dessert",
    baseServings: 1,
    time: "10 мин",
    kkal: 280,
    protein: 20,
    fat: 4,
    carbs: 45,
    description: "Холодный десерт без сахара, но с белком.",
    instructions: [
      "Заморозь нарезанный банан.",
      "Взбей банан блендером с протеином и небольшим количеством молока.",
      "Подай в миске, можно украсить ягодами.",
    ],
    ingredients: [
      {
        id: "banana",
        name: "Банан",
        amount: 100,
        unit: "г",
        calories: 90,
        protein: 1,
        fat: 0.3,
        carbs: 21,
      },
      {
        id: "protein-ice",
        name: "Протеин",
        amount: 25,
        unit: "г",
        calories: 95,
        protein: 20,
        fat: 1.3,
        carbs: 1.5,
      },
      {
        id: "milk-ice",
        name: "Молоко/вода",
        amount: 50,
        unit: "мл",
        calories: 20,
        protein: 1,
        fat: 0.8,
        carbs: 2,
      },
      {
        id: "berries-ice",
        name: "Ягоды (для подачи)",
        amount: 30,
        unit: "г",
        calories: 15,
        protein: 0.3,
        fat: 0.1,
        carbs: 3,
      },
    ],
    proOnly: true,
  },
];

// общий список
export const MEALS: MealRecipe[] = [
  ...breakfasts,
  ...lunches,
  ...dinners,
  ...snacks,
  ...desserts,
];

// алиас для удобства (то, что ты импортируешь в page.tsx)
export const meals = MEALS;

export const MEALS_BY_TYPE: Record<MealType, MealRecipe[]> = {
  breakfast: breakfasts,
  lunch: lunches,
  dinner: dinners,
  snack: snacks,
  dessert: desserts,
};

export function findMealBySlug(slug: string): MealRecipe | undefined {
  return MEALS.find((m) => m.slug === slug);
}

// Пока без заморочек с пересчётом порций — берём КБЖУ как есть
export function computeMealNutrition(meal: MealRecipe) {
  return {
    perPortionCalories: meal.kkal,
    perPortionProtein: meal.protein,
    perPortionFat: meal.fat,
    perPortionCarbs: meal.carbs,
  };
}
