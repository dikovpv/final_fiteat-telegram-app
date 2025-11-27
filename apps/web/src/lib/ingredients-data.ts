// apps/web/src/lib/ingredients-data.ts

export type IngredientBase = {
  id: string;
  name: string;
  defaultUnit: "g" | "ml" | "piece";
  // Либо на 100 г / 100 мл:
  caloriesPer100g?: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  carbsPer100g?: number;

  // Либо на 1 штуку:
  caloriesPerUnit?: number;
  proteinPerUnit?: number;
  fatPerUnit?: number;
  carbsPerUnit?: number;
};

export const INGREDIENTS: Record<string, IngredientBase> = {
  egg: {
    id: "egg",
    name: "Яйцо куриное",
    defaultUnit: "piece",
    caloriesPerUnit: 70,
    proteinPerUnit: 6,
    fatPerUnit: 5,
    carbsPerUnit: 0.5,
  },
  milk25: {
    id: "milk25",
    name: "Молоко 2,5%",
    defaultUnit: "ml",
    caloriesPer100g: 50,
    proteinPer100g: 3.2,
    fatPer100g: 2.5,
    carbsPer100g: 4.8,
  },
  bellPepper: {
    id: "bellPepper",
    name: "Перец сладкий",
    defaultUnit: "g",
    caloriesPer100g: 27,
    proteinPer100g: 1.3,
    fatPer100g: 0.3,
    carbsPer100g: 6,
  },
  tomato: {
    id: "tomato",
    name: "Помидор",
    defaultUnit: "g",
    caloriesPer100g: 20,
    proteinPer100g: 1,
    fatPer100g: 0.2,
    carbsPer100g: 4,
  },
  cheeseHard: {
    id: "cheeseHard",
    name: "Сыр твёрдый",
    defaultUnit: "g",
    caloriesPer100g: 350,
    proteinPer100g: 25,
    fatPer100g: 27,
    carbsPer100g: 2,
  },
  oliveOil: {
    id: "oliveOil",
    name: "Оливковое масло",
    defaultUnit: "g",
    caloriesPer100g: 900,
    proteinPer100g: 0,
    fatPer100g: 100,
    carbsPer100g: 0,
  },
  chickenBreast: {
    id: "chickenBreast",
    name: "Куриная грудка",
    defaultUnit: "g",
    caloriesPer100g: 165,
    proteinPer100g: 31,
    fatPer100g: 3.6,
    carbsPer100g: 0,
  },
  riceDry: {
    id: "riceDry",
    name: "Рис басмати (сухой)",
    defaultUnit: "g",
    caloriesPer100g: 350,
    proteinPer100g: 7,
    fatPer100g: 0.6,
    carbsPer100g: 76,
  },
  broccoli: {
    id: "broccoli",
    name: "Брокколи",
    defaultUnit: "g",
    caloriesPer100g: 34,
    proteinPer100g: 3,
    fatPer100g: 0.4,
    carbsPer100g: 7,
  },
  carrot: {
    id: "carrot",
    name: "Морковь",
    defaultUnit: "g",
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    fatPer100g: 0.2,
    carbsPer100g: 10,
  },
  cottageCheese5: {
    id: "cottageCheese5",
    name: "Творог 5%",
    defaultUnit: "g",
    caloriesPer100g: 120,
    proteinPer100g: 17,
    fatPer100g: 5,
    carbsPer100g: 3,
  },
  greekYogurt: {
    id: "greekYogurt",
    name: "Греческий йогурт",
    defaultUnit: "g",
    caloriesPer100g: 60,
    proteinPer100g: 10,
    fatPer100g: 0,
    carbsPer100g: 4,
  },
  berries: {
    id: "berries",
    name: "Ягоды",
    defaultUnit: "g",
    caloriesPer100g: 40,
    proteinPer100g: 1,
    fatPer100g: 0.5,
    carbsPer100g: 8,
  },
  honey: {
    id: "honey",
    name: "Мёд",
    defaultUnit: "g",
    caloriesPer100g: 300,
    proteinPer100g: 0.5,
    fatPer100g: 0,
    carbsPer100g: 75,
  },
};
