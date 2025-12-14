import { notFound } from "next/navigation";
import ExerciseClient from "./exercise-client";
import { WORKOUT_TEMPLATES } from "../../workouts-data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function existsExercise(slug: string) {
  for (const plan of WORKOUT_TEMPLATES) {
    for (const ex of plan.exercises) {
      const exSlug = (ex as any).slug ?? ex.id;
      if (exSlug === slug) return true;
    }
  }
  return false;
}

export default async function ExerciseSlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (!existsExercise(slug)) notFound();

  return <ExerciseClient slug={slug} />;
}
