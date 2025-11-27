"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { workoutsData } from "@/lib/workoutsData";
import { PLACEHOLDERS } from "@/lib/placeholders";

export default function ExercisePage({ params }: { params: { group: string; exercise: string } }) {
  const { group, exercise } = params;
  const data = workoutsData[group as keyof typeof workoutsData];
  const exerciseData = data?.exercises.find((e) => e.id === exercise);

  if (!exerciseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>⚠️ Упражнение не найдено.</p>
        <Link href={`/workouts/muscles/${group}`} className="text-[#B37C3E] underline mt-2">
          Назад
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-6 py-6">
      {/* Назад */}
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/workouts/muscles/${group}`} className="flex items-center text-gray-600 hover:text-[#B37C3E] transition">
          <ArrowLeft className="w-5 h-5" /> Назад
        </Link>
      </div>

      {/* Заголовок */}
      <h1 className="text-xl font-bold text-[#B37C3E] mb-1">{exerciseData.name}</h1>
      <p className="text-gray-500 mb-4">{data.title}</p>

      {/* Карточка */}
      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <img
          src={PLACEHOLDERS.workout}
          alt={exerciseData.name}
          className="w-full h-56 object-contain rounded-xl"
        />

        <div>
          <h3 className="font-semibold mb-2 text-[#B37C3E]">Как выполнять:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed">
            {exerciseData.technique.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-[#B37C3E]">Советы:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed">
            {exerciseData.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-gray-200 text-sm text-gray-600">
          <p>Подходы и повторы: <span className="font-semibold">{exerciseData.duration}</span></p>
          <p>Энергозатраты: <span className="font-semibold">{exerciseData.kcal} ккал</span></p>
        </div>
      </div>
    </div>
  );
}
