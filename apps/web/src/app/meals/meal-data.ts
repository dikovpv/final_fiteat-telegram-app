// apps/web/src/lib/meals-data.ts

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export type Ingredient = {
  name: string;
  amount: number; // базовое количество (обычно в граммах)
  unit?: string;  // "г", "шт", "мл" и т.п.
  note?: string;  // комментарий (например: "можно заменить на ...")
};

export type MealRecipe = {
  slug: string;
  title: string;
  subtitle?: string;
  mealType: MealType;
  proOnly?: boolean;

  // инфа по порции
  baseServings?: number;        // если хочешь хранить "на 2 порции" и т.п.
  caloriesPerPortion?: number;  // ккал на 1 порцию
  calories?: number;            // запасной вариант, если где-то уже использовалось

  proteinPerPortion?: number;
  fatPerPortion?: number;
  carbsPerPortion?: number;

  ingredients: Ingredient[];
  steps?: string[];
};

// ===== Примеры рецептов (замени/дополняй своими) =====

export const meals: MealRecipe[] = [
  {
    slug: "omlet-s-ovoshchami",
    title: "Омлет с овощами и сыром",
    subtitle: "Быстрый завтрак с высоким содержанием белка",
    mealType: "breakfast",
    proOnly: false,
    baseServings: 1,
    caloriesPerPortion: 420,
    proteinPerPortion: 30,
    fatPerPortion: 26,
    carbsPerPortion: 15,
    ingredients: [
      { name: "Яйца куриные", amount: 3, unit: "шт" },
      { name: "Молоко 2,5%", amount: 50, unit: "мл" },
      { name: "Сладкий перец", amount: 50, unit: "г" },
      { name: "Помидоры", amount: 50, unit: "г" },
      { name: "Сыр твёрдый", amount: 30, unit: "г" },
      { name: "Оливковое масло", amount: 5, unit: "г", note: "для жарки" },
      { name: "Соль, перец", amount: 1, unit: "по вкусу" },
    ],
    steps: [
      "Взбей яйца с молоком, добавь соль и перец.",
      "Нарежь овощи кубиками.",
      "Обжарь овощи 2–3 минуты на сковороде с маслом.",
      "Влей яичную смесь, готовь на слабом огне под крышкой.",
      "Посыпь тёртым сыром и доведи до готовности."
    ],
  },
  {
    slug: "kurica-s-risom-i-ovoshchami",
    title: "Курица с рисом и овощами",
    subtitle: "Сбалансированный обед на каждый день",
    mealType: "lunch",
    proOnly: false,
    baseServings: 1,
    caloriesPerPortion: 650,
    proteinPerPortion: 45,
    fatPerPortion: 20,
    carbsPerPortion: 70,
    ingredients: [
      { name: "Куриная грудка", amount: 150, unit: "г" },
      { name: "Рис басмати (сухой)", amount: 70, unit: "г" },
      { name: "Брокколи", amount: 80, unit: "г" },
      { name: "Морковь", amount: 50, unit: "г" },
      { name: "Оливковое масло", amount: 10, unit: "г" },
      { name: "Соль, специи", amount: 1, unit: "по вкусу" },
    ],
    steps: [
      "Отвари рис до готовности.",
      "Курицу нарежь кубиками, замаринуй в специях и обжарь до золотистой корочки.",
      "Овощи слегка потуши или обжарь на сковороде.",
      "Смешай всё вместе, добавь соль и специи по вкусу."
    ],
  },
  {
    slug: "tvorozhnyj-desert-s-yagodami",
    title: "Творожный десерт с ягодами",
    subtitle: "Лёгкий десерт с высоким содержанием белка",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    caloriesPerPortion: 280,
    proteinPerPortion: 25,
    fatPerPortion: 8,
    carbsPerPortion: 25,
    ingredients: [
      { name: "Творог 5%", amount: 150, unit: "г" },
      { name: "Греческий йогурт", amount: 50, unit: "г" },
      { name: "Ягоды (замороженные или свежие)", amount: 50, unit: "г" },
      { name: "Мёд или подсластитель", amount: 10, unit: "г", note: "по желанию" },
    ],
    steps: [
      "Смешай творог и йогурт до однородной массы.",
      "Добавь мёд или подсластитель и перемешай.",
      "Выложи в стакан слоями творожную массу и ягоды.",
      "Поставь в холодильник на 15–20 минут перед подачей."
    ],
  },
];
