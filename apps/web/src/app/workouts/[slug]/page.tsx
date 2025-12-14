import { notFound } from "next/navigation";
import { findWorkoutBySlug } from "../workouts-data";
import WorkoutPlanClient from "./workout-plan-client";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkoutSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const workout = findWorkoutBySlug(slug);
  if (!workout) notFound();

  return <WorkoutPlanClient slug={slug} />;
}
