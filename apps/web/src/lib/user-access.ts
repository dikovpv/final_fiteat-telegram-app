// apps/web/src/lib/user-access.ts

export type UserAccess = {
  isPro: boolean;
};

export function getUserAccessFromLocalStorage(): UserAccess {
  if (typeof window === "undefined") return { isPro: false };

  try {
    const raw = localStorage.getItem("fitEatUserData");
    if (!raw) return { isPro: false };

    const data = JSON.parse(raw) || {};

    const stringCandidates = [
      data.plan,
      data.tariff,
      data.tariffType,
      data.subscription,
      data.subscriptionType,
      data.currentPlan,
    ];

    const fromStrings = stringCandidates.some(
      (v: unknown) => typeof v === "string" && v.toLowerCase() === "pro",
    );

    const isPro = Boolean(data.isPro || fromStrings);

    // Нормализуем, чтобы дальше везде хватало data.isPro
    if (isPro && !data.isPro) {
      localStorage.setItem(
        "fitEatUserData",
        JSON.stringify({ ...data, isPro: true }),
      );
    }

    return { isPro };
  } catch {
    return { isPro: false };
  }
}
