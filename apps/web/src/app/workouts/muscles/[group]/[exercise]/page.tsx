import { notFound } from "next/navigation";
import ExerciseClient from "./exercise-client";
import { WORKOUT_TEMPLATES } from "../../../workouts-data";

type PageProps = {
  params: Promise<{ group: string; exercise: string }>;
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

export default async function MuscleExercisePage({ params }: PageProps) {
  const { group, exercise } = await params;

  if (!existsExercise(exercise)) notFound();

  return <ExerciseClient group={group} exercise={exercise} />;
}
