import { notFound } from "next/navigation";
import { meals } from "../meal-data";
import MealDetailClient from "./MealDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = (searchParams ? await searchParams : {}) ?? {};

  const targetRaw =
    (sp.target as string | undefined) ??
    (sp.targetCalories as string | undefined);

  const targetFromQuery = targetRaw ? Number(targetRaw) : undefined;

  const meal = meals.find((m) => m.slug === slug);
  if (!meal) notFound();

  return <MealDetailClient meal={meal} targetFromQuery={targetFromQuery} />;
}
