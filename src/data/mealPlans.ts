import raw from "./mealPlans.json";

export type Lang = "uz" | "ru" | "en";
export type Goal = "lose" | "gain" | "maintain";
export type MealTime = "breakfast" | "lunch" | "dinner";
export type AgeGroup = "teen" | "young" | "senior";
export type Disease =
  | "none"
  | "diabetes"
  | "hypertension"
  | "gastritis"
  | "heart"
  | "obesity"
  | "thyroid";

export type LocalizedText = Record<Lang, string>;

export type MealPlan = {
  id: string;
  emoji: string;
  name: LocalizedText;
  goals: Goal[];
  mealTimes: MealTime[];
  ageGroups: AgeGroup[];
  avoidDiseases: Disease[];
  vegetarian: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: LocalizedText[];
  recipe: LocalizedText;
  tips: LocalizedText;
};

export const MEAL_PLANS: MealPlan[] = raw.meals as MealPlan[];

export type MealFilters = {
  goal: Goal;
  disease: Disease;
  mealTime: MealTime;
  ageGroup: AgeGroup;
  vegetarian: boolean;
};

export function findMatchingMeals(filters: MealFilters): MealPlan[] {
  return MEAL_PLANS.filter((m) => {
    if (!m.goals.includes(filters.goal)) return false;
    if (!m.mealTimes.includes(filters.mealTime)) return false;
    if (!m.ageGroups.includes(filters.ageGroup)) return false;
    if (filters.disease !== "none" && m.avoidDiseases.includes(filters.disease))
      return false;
    if (filters.vegetarian && !m.vegetarian) return false;
    return true;
  });
}

export function pickRandomMeal(filters: MealFilters): MealPlan | null {
  const pool = findMatchingMeals(filters);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
