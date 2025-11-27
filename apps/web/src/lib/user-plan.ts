// apps/web/src/lib/user-plan.ts
import { useEffect, useState } from "react";

export type PlanType = "free" | "pro";

const PLAN_STORAGE_KEY = "fitEatUserPlan";

export function getUserPlan(): PlanType {
  if (typeof window === "undefined") return "free";

  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return "free";

    if (raw === "free" || raw === "pro") return raw;

    const parsed = JSON.parse(raw);
    if (parsed && (parsed.plan === "free" || parsed.plan === "pro")) {
      return parsed.plan;
    }

    return "free";
  } catch {
    return "free";
  }
}

export function setUserPlan(plan: PlanType) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, plan);
  } catch {
    // игнорим
  }
}

export function isProUser(plan?: PlanType): boolean {
  const p = plan ?? getUserPlan();
  return p === "pro";
}

/**
 * Удобный хук, чтобы на любой странице получить:
 *   const { plan, isPro } = useUserPlan();
 */
export function useUserPlan() {
  const [plan, setPlan] = useState<PlanType>("free");

  useEffect(() => {
    setPlan(getUserPlan());
  }, []);

  return {
    plan,
    isPro: plan === "pro",
  };
}
