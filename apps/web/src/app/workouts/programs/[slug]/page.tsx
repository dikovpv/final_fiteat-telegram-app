import { notFound } from "next/navigation";
import ProgramClient from "./program-client";
import { MULTI_DAY_PROGRAMS, type MultiDayProgram } from "../../workouts-data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function findProgram(slug: string): MultiDayProgram | undefined {
  return MULTI_DAY_PROGRAMS.find((p) => p.slug === slug);
}

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params;

  const program = findProgram(slug);
  if (!program) notFound();

  return <ProgramClient slug={slug} />;
}
