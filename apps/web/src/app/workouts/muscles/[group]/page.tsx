import { notFound } from "next/navigation";
import GroupClient from "./group-client";
import { MUSCLE_GROUP_LABELS } from "../../workouts-data";

type PageProps = {
  params: Promise<{ group: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function isValidGroup(group: string) {
  return Object.prototype.hasOwnProperty.call(MUSCLE_GROUP_LABELS, group);
}

export default async function MuscleGroupPage({ params }: PageProps) {
  const { group } = await params;

  if (!isValidGroup(group)) notFound();

  return <GroupClient group={group} />;
}
