// apps/web/src/lib/subscription.ts

export type PlanId = "free" | "pro";

export type FeatureKey =
  | "readyMeals"       // готовые блюда
  | "mealPlans"        // готовые наборы питания
  | "workoutPrograms"  // готовые программы тренировок
  | "exerciseDb";      // база упражнений

// какие фичи считаем платными
const paidFeatures: FeatureKey[] = [
  "readyMeals",
  "mealPlans",
  "workoutPrograms",
  "exerciseDb",
];

const STORAGE_KEY = "fitEatPlan";

/**
 * Текущий тариф пользователя.
 * По умолчанию — free.
 */
export function getCurrentPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "pro" ? "pro" : "free";
}

/**
 * Установить тариф (локально, через localStorage).
 * Потом сюда можно будет подвязать реальную оплату.
 */
export function setCurrentPlan(plan: PlanId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, plan);
}

/**
 * Проверка, доступна ли фича на данном тарифе.
 * Если plan не передали — берём из localStorage.
 */
export function isFeatureAvailable(
  feature: FeatureKey,
  plan?: PlanId
): boolean {
  const p = plan ?? getCurrentPlan();
  if (p === "pro") return true;
  return !paidFeatures.includes(feature);
}
