// apps/web/src/lib/meals-data.ts

import { INGREDIENTS, type IngredientBase } from "./ingredients-data";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export type MealIngredient = {
  ingredientId: string;
  amount: number; // в граммах, мл или штуках — согласно defaultUnit ингредиента
  unit?: string;  // для отображения (например, "г", "мл", "шт")
  note?: string;
};

export type MealRecipe = {
  slug: string;
  title: string;
  subtitle?: string;
  mealType: MealType;
  proOnly?: boolean;

  // На сколько порций рассчитаны все указанные граммовки:
  baseServings: number;

  ingredients: MealIngredient[];
  steps?: string[];
};

// ----------------- Расчёт КБЖУ -----------------

export type MealNutrition = {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  perPortionCalories: number;
  perPortionProtein: number;
  perPortionFat: number;
  perPortionCarbs: number;
};

function accumulateFromIngredient(
  ingRef: MealIngredient,
  base: IngredientBase
) {
  let cal = 0;
  let p = 0;
  let f = 0;
  let c = 0;

  // по 100 г / 100 мл
  if (
    base.caloriesPer100g != null ||
    base.proteinPer100g != null ||
    base.fatPer100g != null ||
    base.carbsPer100g != null
  ) {
    const ratio = ingRef.amount / 100;
    cal += (base.caloriesPer100g ?? 0) * ratio;
    p += (base.proteinPer100g ?? 0) * ratio;
    f += (base.fatPer100g ?? 0) * ratio;
    c += (base.carbsPer100g ?? 0) * ratio;
  }

  // по штуке
  if (
    base.caloriesPerUnit != null ||
    base.proteinPerUnit != null ||
    base.fatPerUnit != null ||
    base.carbsPerUnit != null
  ) {
    cal += (base.caloriesPerUnit ?? 0) * ingRef.amount;
    p += (base.proteinPerUnit ?? 0) * ingRef.amount;
    f += (base.fatPerUnit ?? 0) * ingRef.amount;
    c += (base.carbsPerUnit ?? 0) * ingRef.amount;
  }

  return { cal, p, f, c };
}

export function computeMealNutrition(meal: MealRecipe): MealNutrition {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  for (const ing of meal.ingredients) {
    const base = INGREDIENTS[ing.ingredientId];
    if (!base) continue;

    const { cal, p, f, c } = accumulateFromIngredient(ing, base);
    totalCalories += cal;
    totalProtein += p;
    totalFat += f;
    totalCarbs += c;
  }

  const servings = meal.baseServings || 1;
  const perPortionCalories = totalCalories / servings;
  const perPortionProtein = totalProtein / servings;
  const perPortionFat = totalFat / servings;
  const perPortionCarbs = totalCarbs / servings;

  return {
    totalCalories,
    totalProtein,
    totalFat,
    totalCarbs,
    perPortionCalories,
    perPortionProtein,
    perPortionFat,
    perPortionCarbs,
  };
}

// ----------------- Примеры рецептов -----------------

export const meals: MealRecipe[] = [
  {
    slug: "omlet-s-ovoshchami",
    title: "Омлет с овощами и сыром",
    subtitle: "Быстрый завтрак с высоким содержанием белка",
    mealType: "breakfast",
    proOnly: false,
    baseServings: 1,
    ingredients: [
      { ingredientId: "egg", amount: 3, unit: "шт" },
      { ingredientId: "milk25", amount: 50, unit: "мл" },
      { ingredientId: "bellPepper", amount: 50, unit: "г" },
      { ingredientId: "tomato", amount: 50, unit: "г" },
      { ingredientId: "cheeseHard", amount: 30, unit: "г" },
      {
        ingredientId: "oliveOil",
        amount: 5,
        unit: "г",
        note: "для жарки",
      },
    ],
    steps: [
      "Взбей яйца с молоком, добавь соль и перец.",
      "Нарежь овощи кубиками.",
      "Обжарь овощи 2–3 минуты на сковороде с маслом.",
      "Влей яичную смесь, готовь на слабом огне под крышкой.",
      "Посыпь тёртым сыром и доведи до готовности.",
    ],
  },
  {
    slug: "kurica-s-risom-i-ovoshchami",
    title: "Курица с рисом и овощами",
    subtitle: "Сбалансированный обед на каждый день",
    mealType: "lunch",
    proOnly: false,
    baseServings: 1,
    ingredients: [
      { ingredientId: "chickenBreast", amount: 150, unit: "г" },
      { ingredientId: "riceDry", amount: 70, unit: "г" },
      { ingredientId: "broccoli", amount: 80, unit: "г" },
      { ingredientId: "carrot", amount: 50, unit: "г" },
      { ingredientId: "oliveOil", amount: 10, unit: "г" },
    ],
    steps: [
      "Отвари рис до готовности.",
      "Курицу нарежь кубиками, замаринуй в специях и обжарь до золотистой корочки.",
      "Овощи слегка потуши или обжарь на сковороде.",
      "Смешай всё вместе, добавь соль и специи по вкусу.",
    ],
  },
  {
    slug: "tvorozhnyj-desert-s-yagodami",
    title: "Творожный десерт с ягодами",
    subtitle: "Лёгкий десерт с высоким содержанием белка",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    ingredients: [
      { ingredientId: "cottageCheese5", amount: 150, unit: "г" },
      { ingredientId: "greekYogurt", amount: 50, unit: "г" },
      { ingredientId: "berries", amount: 50, unit: "г" },
      {
        ingredientId: "honey",
        amount: 10,
        unit: "г",
        note: "по желанию",
      },
    ],
    steps: [
      "Смешай творог и йогурт до однородной массы.",
      "Добавь мёд или подсластитель и перемешай.",
      "Выложи в стакан слоями творожную массу и ягоды.",
      "Поставь в холодильник на 15–20 минут перед подачей.",
    ],
  },
];

export default meals;
