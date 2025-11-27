"use client";
import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { workoutsData } from "@/lib/workoutsData";

export default function MuscleGroupPage({ params }: { params: { group: string } }) {
  const { group } = params;
  const data = workoutsData[group as keyof typeof workoutsData];

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>⚠️ Упражнения не найдены.</p>
        <Link href="/workouts/muscles" className="text-[#B37C3E] underline mt-2">
          Назад к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-6 py-6">
      <Link href="/workouts/muscles" className="flex items-center gap-2 text-gray-600 hover:text-[#B37C3E] mb-4">
        <ArrowLeft className="w-5 h-5" /> Назад
      </Link>

      <h1 className="text-2xl font-bold text-[#B37C3E] mb-6">{data.title}</h1>

      <div className="flex flex-col gap-4">
        {data.exercises.map((ex) => (
          <Link
            key={ex.id}
            href={`/workouts/muscles/${group}/${ex.id}`}
            className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-[#B37C3E] text-lg mb-1">{ex.name}</h3>
              <p className="text-sm text-gray-600">
                {ex.duration} · {ex.kcal} ккал
              </p>
            </div>
            <Dumbbell className="w-6 h-6 text-[#B37C3E]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
