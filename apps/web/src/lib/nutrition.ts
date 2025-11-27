// apps/web/src/lib/nutrition.ts

export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'   // сидячий
  | 'light'       // лёгкая активность
  | 'moderate'    // умеренная
  | 'active'      // высокая
  | 'athlete';    // очень высокая

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface ProfileInput {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
}

export interface MacrosResult {
  calories: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
}

// BMR по Mifflin-St Jeor
export function calculateBMR(profile: ProfileInput): number {
  const { sex, weightKg, heightCm, age } = profile;

  const base =
    10 * weightKg +
    6.25 * heightCm -
    5 * age +
    (sex === 'male' ? 5 : -161);

  return Math.round(base);
}

export function getActivityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'athlete':
      return 1.9;
    default:
      return 1.55;
  }
}

export function calculateTDEE(profile: ProfileInput): number {
  const bmr = calculateBMR(profile);
  const multiplier = getActivityMultiplier(profile.activityLevel);
  return Math.round(bmr * multiplier);
}

export function applyGoalToCalories(tdee: number, goal: GoalType): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee * 0.8);  // -20%
    case 'maintain':
      return Math.round(tdee);
    case 'gain':
      return Math.round(tdee * 1.15); // +15%
    default:
      return Math.round(tdee);
  }
}

// Основной расчёт БЖУ
export function calculateMacrosForUser(profile: ProfileInput): MacrosResult {
  const tdee = calculateTDEE(profile);
  const calories = applyGoalToCalories(tdee, profile.goal);

  const proteinPerKg = 2.0;  // 2 г белка / кг
  const fatPerKg = 0.9;      // 0.9 г жира / кг

  const proteinGoal = Math.round(profile.weightKg * proteinPerKg);
  const fatGoal = Math.round(profile.weightKg * fatPerKg);

  const proteinCalories = proteinGoal * 4;
  const fatCalories = fatGoal * 9;

  const carbsCalories = Math.max(calories - proteinCalories - fatCalories, 0);
  const carbsGoal = Math.round(carbsCalories / 4);

  return {
    calories,
    proteinGoal,
    fatGoal,
    carbsGoal,
  };
}
