// apps/web/src/lib/meals-data.ts

import { INGREDIENTS, type IngredientBase } from "./ingredients-data";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export type MealIngredient = {
  ingredientId: string;
  amount: number; // в граммах, мл или штуках — согласно defaultUnit ингредиента
  unit?: string; // для отображения (например, "г", "мл", "шт")
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

function accumulateFromIngredient(ingRef: MealIngredient, base: IngredientBase) {
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

// ----------------- Каталог рецептов -----------------

export const meals: MealRecipe[] = [
  // Завтраки
  {
    slug: "omlet-s-ovoshchami",
    title: "Омлет с овощами и сыром",
    subtitle: "Быстрый завтрак с высоким содержанием белка",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "egg", amount: 3, unit: "шт" },
      { ingredientId: "milk25", amount: 50, unit: "мл" },
      { ingredientId: "bellPepper", amount: 50, unit: "г" },
      { ingredientId: "tomato", amount: 50, unit: "г" },
      { ingredientId: "cheeseHard", amount: 25, unit: "г" },
      { ingredientId: "oliveOil", amount: 5, unit: "г", note: "для жарки" },
    ],
    steps: [
      "Взбей яйца с молоком и щепоткой соли.",
      "Обжарь перец и помидор 2–3 минуты.",
      "Влей яйца, готовь под крышкой, посыпь сыром.",
    ],
  },
  {
    slug: "ovsyanka-s-bananom-i-pastoi",
    title: "Овсянка с бананом и арахисовой пастой",
    subtitle: "Сытная каша на утро",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "oats", amount: 60, unit: "г" },
      { ingredientId: "milk25", amount: 200, unit: "мл" },
      { ingredientId: "banana", amount: 100, unit: "г" },
      { ingredientId: "peanutButter", amount: 10, unit: "г" },
      { ingredientId: "chiaSeeds", amount: 10, unit: "г" },
    ],
    steps: [
      "Свари овсянку на молоке до мягкости.",
      "Добавь ломтики банана и арахисовую пасту.",
      "Посыпь семенами чиа перед подачей.",
    ],
  },
  {
    slug: "avokado-tost-s-yajcom",
    title: "Авокадо-тост с яйцом",
    subtitle: "Быстрый тост с полезными жирами",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "wholegrainBread", amount: 2, unit: "шт" },
      { ingredientId: "avocado", amount: 70, unit: "г" },
      { ingredientId: "egg", amount: 1, unit: "шт" },
      { ingredientId: "tomato", amount: 60, unit: "г" },
      { ingredientId: "lemon", amount: 5, unit: "г" },
    ],
    steps: [
      "Подрумянь хлеб в тостере.",
      "Разомни авокадо с лимонным соком и солью.",
      "Обжарь яйцо и собери тост с томатами.",
    ],
  },
  {
    slug: "tvorog-s-yagodami-i-semenami",
    title: "Творог с ягодами и семенами",
    subtitle: "Белковый завтрак без готовки",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "cottageCheese5", amount: 200, unit: "г" },
      { ingredientId: "greekYogurt", amount: 50, unit: "г" },
      { ingredientId: "berries", amount: 80, unit: "г" },
      { ingredientId: "chiaSeeds", amount: 10, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай творог и йогурт до кремовой текстуры.",
      "Добавь мёд и перемешай.",
      "Выложи ягоды и присыпь семенами чиа.",
    ],
  },
  {
    slug: "proteinovy-smuzi-s-arahisom",
    title: "Протеиновый смузи с арахисом",
    subtitle: "Напиток после тренировки",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "milk25", amount: 250, unit: "мл" },
      { ingredientId: "banana", amount: 120, unit: "г" },
      { ingredientId: "peanutButter", amount: 15, unit: "г" },
      { ingredientId: "oats", amount: 30, unit: "г" },
    ],
    steps: [
      "Соедини все ингредиенты в блендере.",
      "Взбей до однородной текстуры.",
      "Подавай сразу, пока смузи холодный.",
    ],
  },
  {
    slug: "yablochnaya-ovsyanaya-zapekanka",
    title: "Яблочно-овсяная запеканка",
    subtitle: "Можно приготовить с вечера",
    mealType: "breakfast",
    baseServings: 2,
    ingredients: [
      { ingredientId: "oats", amount: 70, unit: "г" },
      { ingredientId: "apple", amount: 120, unit: "г" },
      { ingredientId: "egg", amount: 1, unit: "шт" },
      { ingredientId: "milk25", amount: 120, unit: "мл" },
      { ingredientId: "raisins", amount: 20, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай хлопья, молоко, яйцо и мёд.",
      "Добавь кубики яблока и изюм.",
      "Выпекай 20–25 минут при 180°C до румяной корочки.",
    ],
  },
  {
    slug: "tofu-skrembl-so-shpinatom",
    title: "Тофу-скрэмбл со шпинатом",
    subtitle: "Без яиц, но с белком",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "tofu", amount: 150, unit: "г" },
      { ingredientId: "spinach", amount: 80, unit: "г" },
      { ingredientId: "mushrooms", amount: 70, unit: "г" },
      { ingredientId: "oliveOil", amount: 5, unit: "г" },
      { ingredientId: "soySauce", amount: 10, unit: "г" },
    ],
    steps: [
      "Разомни тофу вилкой до крошки.",
      "Обжарь грибы и шпинат на масле.",
      "Добавь тофу и соевый соус, прогрей 3–4 минуты.",
    ],
  },
  {
    slug: "yogurt-granola-yabloko",
    title: "Йогурт, гранола и яблоко",
    subtitle: "Хрустящий завтрак за 2 минуты",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "greekYogurt", amount: 180, unit: "г" },
      { ingredientId: "oats", amount: 30, unit: "г" },
      { ingredientId: "apple", amount: 80, unit: "г" },
      { ingredientId: "almonds", amount: 10, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Собери слоями йогурт, хлопья и нарезанное яблоко.",
      "Посыпь миндалём и полей мёдом.",
    ],
  },
  {
    slug: "bananovye-oladi-na-ovsyanke",
    title: "Банановые оладьи на овсянке",
    subtitle: "Без сахара и муки",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "oats", amount: 60, unit: "г" },
      { ingredientId: "banana", amount: 120, unit: "г" },
      { ingredientId: "egg", amount: 1, unit: "шт" },
      { ingredientId: "greekYogurt", amount: 50, unit: "г" },
      { ingredientId: "oliveOil", amount: 5, unit: "г" },
    ],
    steps: [
      "Взбей банан, яйцо и хлопья в блендере.",
      "Жарь небольшие оладьи на капле масла.",
      "Подавай с ложкой йогурта.",
    ],
  },
  {
    slug: "kasha-s-grushey-i-orehami",
    title: "Овсяная каша с грушей и орехами",
    subtitle: "Мягкий сладкий завтрак",
    mealType: "breakfast",
    baseServings: 1,
    ingredients: [
      { ingredientId: "oats", amount: 60, unit: "г" },
      { ingredientId: "milk25", amount: 200, unit: "мл" },
      { ingredientId: "pear", amount: 100, unit: "г" },
      { ingredientId: "walnuts", amount: 10, unit: "г" },
      { ingredientId: "chiaSeeds", amount: 8, unit: "г" },
    ],
    steps: [
      "Свари овсянку на молоке.",
      "Добавь кубики груши за минуту до готовности.",
      "Посыпь орехами и семенами чиа.",
    ],
  },

  // Обеды
  {
    slug: "kurica-s-risom-i-ovoshchami",
    title: "Курица с рисом и овощами",
    subtitle: "Сбалансированный обед на каждый день",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "chickenBreast", amount: 150, unit: "г" },
      { ingredientId: "riceDry", amount: 70, unit: "г" },
      { ingredientId: "broccoli", amount: 80, unit: "г" },
      { ingredientId: "carrot", amount: 50, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
    ],
    steps: [
      "Отвари рис до готовности.",
      "Обжарь курицу со специями.",
      "Быстро потуши овощи и смешай всё вместе.",
    ],
  },
  {
    slug: "indeyka-s-bulgurom",
    title: "Индейка с булгуром и овощами",
    subtitle: "Тёплый и сытный боул",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "turkeyFillet", amount: 160, unit: "г" },
      { ingredientId: "bulgurDry", amount: 70, unit: "г" },
      { ingredientId: "zucchini", amount: 80, unit: "г" },
      { ingredientId: "bellPepper", amount: 70, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
    ],
    steps: [
      "Отвари булгур по инструкции.",
      "Обжарь индейку до золотистой корочки.",
      "Добавь порезанные овощи и доведи до готовности.",
    ],
  },
  {
    slug: "losos-s-kinoa",
    title: "Лосось с киноа и шпинатом",
    subtitle: "Омега-3 и сложные углеводы",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "salmonFillet", amount: 150, unit: "г" },
      { ingredientId: "quinoaDry", amount: 60, unit: "г" },
      { ingredientId: "spinach", amount: 80, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
    ],
    steps: [
      "Отвари киноа до готовности.",
      "Запеки лосось с лимоном и солью.",
      "Шпинат быстро припусти на сковороде с маслом и собери боул.",
    ],
  },
  {
    slug: "govyadina-s-kartofelem-i-gribami",
    title: "Говядина с картофелем и грибами",
    subtitle: "Домашний сытный обед",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "beefLean", amount: 150, unit: "г" },
      { ingredientId: "potato", amount: 200, unit: "г" },
      { ingredientId: "mushrooms", amount: 80, unit: "г" },
      { ingredientId: "onion", amount: 50, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
    ],
    steps: [
      "Обжарь говядину до румяности.",
      "Добавь лук и грибы, туши 5 минут.",
      "Положи кубики картофеля, немного воды и туши до мягкости.",
    ],
  },
  {
    slug: "treska-s-ovoshchami-i-risom",
    title: "Треска с овощами и рисом",
    subtitle: "Лёгкий рыбный обед",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "codFillet", amount: 170, unit: "г" },
      { ingredientId: "riceDry", amount: 70, unit: "г" },
      { ingredientId: "broccoli", amount: 80, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
      { ingredientId: "oliveOil", amount: 6, unit: "г" },
    ],
    steps: [
      "Отвари рис.",
      "Запеки треску с лимоном и солью 15 минут.",
      "Брокколи припусти на пару и подай вместе.",
    ],
  },
  {
    slug: "fasol-tushenaya-s-ovoshchami",
    title: "Фасоль тушёная с овощами",
    subtitle: "Вегетарианский вариант обеда",
    mealType: "lunch",
    baseServings: 2,
    ingredients: [
      { ingredientId: "redBeansCooked", amount: 200, unit: "г" },
      { ingredientId: "bellPepper", amount: 80, unit: "г" },
      { ingredientId: "zucchini", amount: 80, unit: "г" },
      { ingredientId: "onion", amount: 50, unit: "г" },
      { ingredientId: "garlic", amount: 5, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
    ],
    steps: [
      "Обжарь лук и чеснок до аромата.",
      "Добавь нарезанные овощи, туши 5–6 минут.",
      "Вмешай фасоль и прогрей ещё пару минут.",
    ],
  },
  {
    slug: "kuriiny-wrap-s-ovoshchami",
    title: "Куриный врап с овощами",
    subtitle: "Удобно взять с собой",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "tortillaWholegrain", amount: 1, unit: "шт" },
      { ingredientId: "chickenBreast", amount: 120, unit: "г" },
      { ingredientId: "cucumber", amount: 60, unit: "г" },
      { ingredientId: "tomato", amount: 60, unit: "г" },
      { ingredientId: "spinach", amount: 30, unit: "г" },
      { ingredientId: "greekYogurt", amount: 40, unit: "г" },
    ],
    steps: [
      "Обжарь курицу полосками до готовности.",
      "Намажь тортилью йогуртом, выложи шпинат и овощи.",
      "Добавь курицу, сверни плотный ролл и прогрей на сухой сковороде.",
    ],
  },
  {
    slug: "poke-s-krevetkami-i-kinoa",
    title: "Поке с креветками и киноа",
    subtitle: "Лёгкий боул в азиатском стиле",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "shrimp", amount: 150, unit: "г" },
      { ingredientId: "quinoaDry", amount: 60, unit: "г" },
      { ingredientId: "cucumber", amount: 70, unit: "г" },
      { ingredientId: "avocado", amount: 60, unit: "г" },
      { ingredientId: "soySauce", amount: 10, unit: "г" },
      { ingredientId: "pumpkinSeeds", amount: 8, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
    ],
    steps: [
      "Свари киноа и остуди.",
      "Отвари или обжарь креветки 2–3 минуты.",
      "Собери боул с авокадо, огурцом и заправь соевым соусом с лимоном.",
    ],
  },
  {
    slug: "pasta-s-govyadinoi-i-tomatami",
    title: "Паста с говядиной и томатами",
    subtitle: "Сытный вариант с цельнозерновой пастой",
    mealType: "lunch",
    baseServings: 1,
    ingredients: [
      { ingredientId: "pastaWholegrainDry", amount: 80, unit: "г" },
      { ingredientId: "beefLean", amount: 130, unit: "г" },
      { ingredientId: "tomato", amount: 120, unit: "г" },
      { ingredientId: "onion", amount: 50, unit: "г" },
      { ingredientId: "garlic", amount: 5, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
    ],
    steps: [
      "Свари пасту до аль денте.",
      "Обжарь лук и чеснок, добавь говядину и прожарь до готовности.",
      "Введи томаты и туши 5 минут, смешай с пастой.",
    ],
  },
  {
    slug: "plov-ovoshchnoy-s-nutom",
    title: "Овощной плов с нутом",
    subtitle: "Без мяса, но с белком",
    mealType: "lunch",
    baseServings: 2,
    ingredients: [
      { ingredientId: "chickpeasCooked", amount: 200, unit: "г" },
      { ingredientId: "riceDry", amount: 70, unit: "г" },
      { ingredientId: "carrot", amount: 70, unit: "г" },
      { ingredientId: "onion", amount: 50, unit: "г" },
      { ingredientId: "bellPepper", amount: 50, unit: "г" },
      { ingredientId: "garlic", amount: 5, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
    ],
    steps: [
      "Обжарь овощи с маслом и специями.",
      "Добавь нут и рис, перемешай.",
      "Залей водой и туши до готовности риса.",
    ],
  },

  // Ужины
  {
    slug: "zapechennaya-ryba-s-ovoshchami",
    title: "Запечённая рыба с овощами",
    subtitle: "Лёгкий ужин с омега-3",
    mealType: "dinner",
    baseServings: 1,
    ingredients: [
      { ingredientId: "salmonFillet", amount: 140, unit: "г" },
      { ingredientId: "zucchini", amount: 120, unit: "г" },
      { ingredientId: "bellPepper", amount: 80, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
    ],
    steps: [
      "Приправь рыбу солью и лимоном.",
      "Выложи вместе с овощами в форму и сбрызни маслом.",
      "Запекай 20–25 минут при 180°C.",
    ],
  },
  {
    slug: "tvorozhnaya-zapekanka",
    title: "Творожная запеканка",
    subtitle: "Подходит и как лёгкий ужин, и как десерт",
    mealType: "dinner",
    baseServings: 2,
    ingredients: [
      { ingredientId: "cottageCheese5", amount: 250, unit: "г" },
      { ingredientId: "egg", amount: 1, unit: "шт" },
      { ingredientId: "oats", amount: 30, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
      { ingredientId: "berries", amount: 60, unit: "г" },
    ],
    steps: [
      "Смешай творог, яйцо, мёд и овсянку.",
      "Выложи в форму, добавь ягоды сверху.",
      "Запекай 25–30 минут при 180°C.",
    ],
  },
  {
    slug: "kurica-s-batatom",
    title: "Курица с бататом и брокколи",
    subtitle: "Сытно и без тяжести",
    mealType: "dinner",
    baseServings: 1,
    ingredients: [
      { ingredientId: "chickenBreast", amount: 150, unit: "г" },
      { ingredientId: "sweetPotato", amount: 200, unit: "г" },
      { ingredientId: "broccoli", amount: 80, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
    ],
    steps: [
      "Запеки кубики батата с маслом до мягкости.",
      "Обжарь курицу полосками до готовности.",
      "Брокколи припусти на пару и подай вместе.",
    ],
  },
  {
    slug: "salat-s-indeikoy-i-ovoshchami",
    title: "Салат с индейкой и овощами",
    subtitle: "Высокий белок, минимум жира",
    mealType: "dinner",
    baseServings: 1,
    ingredients: [
      { ingredientId: "turkeyFillet", amount: 140, unit: "г" },
      { ingredientId: "spinach", amount: 80, unit: "г" },
      { ingredientId: "cucumber", amount: 80, unit: "г" },
      { ingredientId: "tomato", amount: 80, unit: "г" },
      { ingredientId: "oliveOil", amount: 6, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
    ],
    steps: [
      "Обжарь индейку до готовности и нарежь ломтиками.",
      "Собери салат из шпината и свежих овощей.",
      "Заправь смесью масла и лимонного сока.",
    ],
  },
  {
    slug: "ovoshchnoe-ragu-s-tofu",
    title: "Овощное рагу с тофу",
    subtitle: "Полноценный растительный ужин",
    mealType: "dinner",
    baseServings: 2,
    ingredients: [
      { ingredientId: "tofu", amount: 180, unit: "г" },
      { ingredientId: "eggplant", amount: 120, unit: "г" },
      { ingredientId: "zucchini", amount: 100, unit: "г" },
      { ingredientId: "bellPepper", amount: 70, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
      { ingredientId: "soySauce", amount: 10, unit: "г" },
    ],
    steps: [
      "Обжарь кубики тофу до золотистой корочки.",
      "Добавь овощи и туши под крышкой 10 минут.",
      "Полей соевым соусом перед подачей.",
    ],
  },
  {
    slug: "pasta-s-treskoy-i-shpinatom",
    title: "Паста с треской и шпинатом",
    subtitle: "Лёгкая сливочная текстура без сливок",
    mealType: "dinner",
    baseServings: 1,
    ingredients: [
      { ingredientId: "pastaWholegrainDry", amount: 70, unit: "г" },
      { ingredientId: "codFillet", amount: 150, unit: "г" },
      { ingredientId: "spinach", amount: 80, unit: "г" },
      { ingredientId: "garlic", amount: 5, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
    ],
    steps: [
      "Свари пасту.",
      "Обжарь чеснок на масле, добавь кусочки трески и готовь 4–5 минут.",
      "Вмешай шпинат и пасту, прогрей ещё минуту.",
    ],
  },
  {
    slug: "bulgur-s-nutom-i-ovoshchami",
    title: "Булгур с нутом и свежими овощами",
    subtitle: "Тёплый салат на вечер",
    mealType: "dinner",
    baseServings: 2,
    ingredients: [
      { ingredientId: "bulgurDry", amount: 70, unit: "г" },
      { ingredientId: "chickpeasCooked", amount: 150, unit: "г" },
      { ingredientId: "tomato", amount: 80, unit: "г" },
      { ingredientId: "cucumber", amount: 80, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
    ],
    steps: [
      "Отвари булгур и дай ему немного остыть.",
      "Смешай с нутом и порезанными овощами.",
      "Заправь маслом и лимонным соком.",
    ],
  },
  {
    slug: "zapekanka-kurica-brokkoli",
    title: "Запеканка из курицы и брокколи",
    subtitle: "Бюджетный белковый ужин",
    mealType: "dinner",
    baseServings: 2,
    ingredients: [
      { ingredientId: "chickenBreast", amount: 180, unit: "г" },
      { ingredientId: "broccoli", amount: 150, unit: "г" },
      { ingredientId: "cheeseHard", amount: 40, unit: "г" },
      { ingredientId: "milk25", amount: 80, unit: "мл" },
      { ingredientId: "egg", amount: 1, unit: "шт" },
      { ingredientId: "garlic", amount: 5, unit: "г" },
    ],
    steps: [
      "Смешай яйца с молоком и тёртым сыром.",
      "В форму выложи курицу и брокколи, залей смесью.",
      "Запекай 25 минут при 180°C до румяности.",
    ],
  },
  {
    slug: "krevetki-s-kabachkom",
    title: "Креветки с кабачками и чесноком",
    subtitle: "Ужин за 10 минут",
    mealType: "dinner",
    baseServings: 1,
    ingredients: [
      { ingredientId: "shrimp", amount: 160, unit: "г" },
      { ingredientId: "zucchini", amount: 160, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
      { ingredientId: "garlic", amount: 5, unit: "г" },
      { ingredientId: "lemon", amount: 10, unit: "г" },
    ],
    steps: [
      "Обжарь чеснок в масле до аромата.",
      "Добавь кабачок ломтиками и готовь 3–4 минуты.",
      "Введи креветки, лимонный сок и обжарь ещё 2 минуты.",
    ],
  },
  {
    slug: "ris-s-gribami-i-shpinatom",
    title: "Рис с грибами и шпинатом",
    subtitle: "Постный тёплый ужин",
    mealType: "dinner",
    baseServings: 2,
    ingredients: [
      { ingredientId: "riceDry", amount: 70, unit: "г" },
      { ingredientId: "mushrooms", amount: 120, unit: "г" },
      { ingredientId: "spinach", amount: 80, unit: "г" },
      { ingredientId: "onion", amount: 40, unit: "г" },
      { ingredientId: "oliveOil", amount: 7, unit: "г" },
    ],
    steps: [
      "Отвари рис.",
      "Обжарь лук и грибы до мягкости.",
      "Добавь шпинат, вмешай рис и прогрей вместе.",
    ],
  },

  // Перекусы
  {
    slug: "yogurt-s-yagodami",
    title: "Греческий йогурт с ягодами и орехами",
    subtitle: "Быстрый перекус без скачков сахара",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "greekYogurt", amount: 150, unit: "г" },
      { ingredientId: "berries", amount: 70, unit: "г" },
      { ingredientId: "walnuts", amount: 10, unit: "г" },
      { ingredientId: "honey", amount: 5, unit: "г" },
    ],
    steps: [
      "Смешай йогурт с ягодами.",
      "Посыпь орехами и добавь немного мёда.",
    ],
  },
  {
    slug: "proteinovyi-batonchik-doma",
    title: "Домашний протеиновый батончик",
    subtitle: "Нарежь и убери в холодильник",
    mealType: "snack",
    baseServings: 2,
    ingredients: [
      { ingredientId: "oats", amount: 40, unit: "г" },
      { ingredientId: "peanutButter", amount: 20, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
      { ingredientId: "almonds", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай все ингредиенты до липкой массы.",
      "Сформируй плитку и охлади 30 минут.",
      "Нарежь на две порции.",
    ],
  },
  {
    slug: "tvorog-med-orehi",
    title: "Творог, мёд и орехи",
    subtitle: "Белковый перекус",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "cottageCheese5", amount: 150, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
      { ingredientId: "walnuts", amount: 12, unit: "г" },
    ],
    steps: [
      "Смешай творог с мёдом.",
      "Посыпь измельчёнными орехами.",
    ],
  },
  {
    slug: "yabloko-s-pastoi",
    title: "Яблоко с арахисовой пастой",
    subtitle: "Хрустящий и сладкий вариант",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "apple", amount: 150, unit: "г" },
      { ingredientId: "peanutButter", amount: 20, unit: "г" },
      { ingredientId: "chiaSeeds", amount: 5, unit: "г" },
    ],
    steps: [
      "Нарежь яблоко дольками.",
      "Намажь пасту и посыпь семенами чиа.",
    ],
  },
  {
    slug: "avokado-tost-perekus",
    title: "Авокадо-тост",
    subtitle: "Мини-версия для перекуса",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "wholegrainBread", amount: 1, unit: "шт" },
      { ingredientId: "avocado", amount: 60, unit: "г" },
      { ingredientId: "lemon", amount: 5, unit: "г" },
    ],
    steps: [
      "Подрумянь хлеб.",
      "Разомни авокадо с лимонным соком и солью.",
      "Намажь на тост и подай сразу.",
    ],
  },
  {
    slug: "zelenyi-smuzi",
    title: "Зелёный смузи",
    subtitle: "Свежий перекус после тренировки",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "spinach", amount: 60, unit: "г" },
      { ingredientId: "banana", amount: 80, unit: "г" },
      { ingredientId: "greekYogurt", amount: 120, unit: "г" },
      { ingredientId: "chiaSeeds", amount: 8, unit: "г" },
    ],
    steps: [
      "Взбей все ингредиенты в блендере до однородности.",
      "Подавай холодным.",
    ],
  },
  {
    slug: "proteinovyi-kokteyl-shokolad",
    title: "Протеиновый коктейль с какао",
    subtitle: "Быстрый вариант на молоке",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "milk25", amount: 250, unit: "мл" },
      { ingredientId: "oats", amount: 30, unit: "г" },
      { ingredientId: "cocoaPowder", amount: 10, unit: "г" },
      { ingredientId: "honey", amount: 5, unit: "г" },
    ],
    steps: [
      "Взбей молоко с овсянкой и какао в блендере.",
      "Добавь мёд по вкусу и сразу подавай.",
    ],
  },
  {
    slug: "morkov-i-dip-iz-nuta",
    title: "Морковь с нутовым дипом",
    subtitle: "Хрустящий растительный перекус",
    mealType: "snack",
    baseServings: 2,
    ingredients: [
      { ingredientId: "carrot", amount: 120, unit: "г" },
      { ingredientId: "chickpeasCooked", amount: 120, unit: "г" },
      { ingredientId: "oliveOil", amount: 8, unit: "г" },
      { ingredientId: "lemon", amount: 8, unit: "г" },
      { ingredientId: "garlic", amount: 4, unit: "г" },
    ],
    steps: [
      "Пробей нут с маслом, лимоном и чесноком до пасты.",
      "Нарежь морковь брусочками и подавай с дипом.",
    ],
  },
  {
    slug: "snek-miks",
    title: "Орехово-сухофруктовый микс",
    subtitle: "Карманный перекус",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "almonds", amount: 15, unit: "г" },
      { ingredientId: "raisins", amount: 15, unit: "г" },
      { ingredientId: "pumpkinSeeds", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай все ингредиенты и возьми с собой.",
    ],
  },
  {
    slug: "grusha-s-tvorogom",
    title: "Груша с творожным кремом",
    subtitle: "Лёгкий сладкий перекус",
    mealType: "snack",
    baseServings: 1,
    ingredients: [
      { ingredientId: "pear", amount: 150, unit: "г" },
      { ingredientId: "cottageCheese5", amount: 120, unit: "г" },
      { ingredientId: "honey", amount: 8, unit: "г" },
      { ingredientId: "walnuts", amount: 10, unit: "г" },
    ],
    steps: [
      "Нарежь грушу ломтиками.",
      "Смешай творог с мёдом до крема.",
      "Подавай с орехами.",
    ],
  },

  // Десерты
  {
    slug: "bananovoe-morozhenoe",
    title: "Банановое «мороженое» с протеином",
    subtitle: "Холодный десерт без сахара",
    mealType: "dessert",
    proOnly: true,
    baseServings: 1,
    ingredients: [
      { ingredientId: "banana", amount: 120, unit: "г" },
      { ingredientId: "milk25", amount: 50, unit: "мл" },
      { ingredientId: "wheyProtein", amount: 25, unit: "г" },
      { ingredientId: "berries", amount: 30, unit: "г" },
    ],
    steps: [
      "Заморозь банан, затем взбей с молоком и протеином.",
      "Подавай с ягодами сверху.",
    ],
  },
  {
    slug: "chia-puding-shokolad",
    title: "Шоколадный чиа-пудинг",
    subtitle: "Настаивается сам за ночь",
    mealType: "dessert",
    baseServings: 1,
    ingredients: [
      { ingredientId: "chiaSeeds", amount: 25, unit: "г" },
      { ingredientId: "milk25", amount: 180, unit: "мл" },
      { ingredientId: "cocoaPowder", amount: 10, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай молоко, какао и мёд.",
      "Добавь семена чиа, хорошо перемешай и убери в холодильник на 4–6 часов.",
    ],
  },
  {
    slug: "pechyonoe-yabloko-s-orehami",
    title: "Печёное яблоко с орехами",
    subtitle: "Ароматный тёплый десерт",
    mealType: "dessert",
    baseServings: 1,
    ingredients: [
      { ingredientId: "apple", amount: 200, unit: "г" },
      { ingredientId: "walnuts", amount: 15, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
      { ingredientId: "raisins", amount: 10, unit: "г" },
    ],
    steps: [
      "Вырежи сердцевину яблока.",
      "Заполни орехами и изюмом, полей мёдом.",
      "Запекай 20 минут при 180°C.",
    ],
  },
  {
    slug: "protein-brauni",
    title: "Протеиновые брауни",
    subtitle: "Без сахара и пшеничной муки",
    mealType: "dessert",
    baseServings: 4,
    ingredients: [
      { ingredientId: "oats", amount: 60, unit: "г" },
      { ingredientId: "cocoaPowder", amount: 15, unit: "г" },
      { ingredientId: "peanutButter", amount: 20, unit: "г" },
      { ingredientId: "egg", amount: 1, unit: "шт" },
      { ingredientId: "honey", amount: 15, unit: "г" },
    ],
    steps: [
      "Смешай все ингредиенты до теста.",
      "Выложи в форму и выпекай 15 минут при 180°C.",
      "Охлади и нарежь на квадраты.",
    ],
  },
  {
    slug: "cheesecake-kubiki",
    title: "Чизкейк-кубики",
    subtitle: "Мини-порции без выпечки",
    mealType: "dessert",
    baseServings: 4,
    ingredients: [
      { ingredientId: "cottageCheese5", amount: 200, unit: "г" },
      { ingredientId: "greekYogurt", amount: 80, unit: "г" },
      { ingredientId: "honey", amount: 15, unit: "г" },
      { ingredientId: "berries", amount: 60, unit: "г" },
      { ingredientId: "butter", amount: 10, unit: "г" },
    ],
    steps: [
      "Взбей творог, йогурт и мёд до крема.",
      "Распредели по формочкам, укрась ягодами.",
      "Охлади минимум 30 минут.",
    ],
  },
  {
    slug: "risovy-puding-s-izyumom",
    title: "Рисовый пудинг с изюмом",
    subtitle: "Нежный молочный десерт",
    mealType: "dessert",
    baseServings: 2,
    ingredients: [
      { ingredientId: "riceDry", amount: 60, unit: "г" },
      { ingredientId: "milk25", amount: 250, unit: "мл" },
      { ingredientId: "raisins", amount: 20, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Вари рис в молоке на медленном огне до кремовой консистенции.",
      "Добавь изюм и мёд, прогрей ещё минуту.",
    ],
  },
  {
    slug: "parfe-s-yogurtom-i-yagodami",
    title: "Парфе с йогуртом и ягодами",
    subtitle: "Слоёный стакан без выпечки",
    mealType: "dessert",
    baseServings: 1,
    ingredients: [
      { ingredientId: "greekYogurt", amount: 180, unit: "г" },
      { ingredientId: "berries", amount: 100, unit: "г" },
      { ingredientId: "oats", amount: 30, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Собери в стакане слои йогурта, ягод и овсяных хлопьев.",
      "Полей мёдом перед подачей.",
    ],
  },
  {
    slug: "avokadovy-shokoladnyi-muss",
    title: "Шоколадный мусс из авокадо",
    subtitle: "Кремовая текстура без сливок",
    mealType: "dessert",
    baseServings: 2,
    ingredients: [
      { ingredientId: "avocado", amount: 120, unit: "г" },
      { ingredientId: "banana", amount: 80, unit: "г" },
      { ingredientId: "cocoaPowder", amount: 12, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
    ],
    steps: [
      "Пробей все ингредиенты в блендере до кремовой массы.",
      "Охлади 20 минут перед подачей.",
    ],
  },
  {
    slug: "tvorozhnye-batonchiki",
    title: "Творожные батончики",
    subtitle: "Замораживаются за час",
    mealType: "dessert",
    baseServings: 3,
    ingredients: [
      { ingredientId: "cottageCheese5", amount: 180, unit: "г" },
      { ingredientId: "peanutButter", amount: 15, unit: "г" },
      { ingredientId: "cocoaPowder", amount: 10, unit: "г" },
      { ingredientId: "honey", amount: 10, unit: "г" },
      { ingredientId: "walnuts", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай творог, пасту, какао и мёд.",
      "Добавь орехи, выложи массу в форму.",
      "Охлади в морозилке 45–60 минут и нарежь батончиками.",
    ],
  },
  {
    slug: "granola-batonchiki-yagodnye",
    title: "Ягодные гранола-батончики",
    subtitle: "Удобно взять с собой",
    mealType: "dessert",
    baseServings: 4,
    ingredients: [
      { ingredientId: "oats", amount: 80, unit: "г" },
      { ingredientId: "berries", amount: 60, unit: "г" },
      { ingredientId: "honey", amount: 20, unit: "г" },
      { ingredientId: "almonds", amount: 20, unit: "г" },
      { ingredientId: "butter", amount: 10, unit: "г" },
    ],
    steps: [
      "Смешай все ингредиенты до липкой массы.",
      "Утрамбуй в форму и выпекай 15 минут при 170°C.",
      "Охлади и нарежь брусками.",
    ],
  },
];

export default meals;
