"use client";
import { PLACEHOLDERS } from "@/lib/placeholders";

export default function WorkoutSelector({
  onSelect,
}: {
  onSelect: (workout: any) => void;
}) {
  const workouts = [
    { name: "Жим лёжа", sets: 4, reps: 8, image: PLACEHOLDERS.workout },
    { name: "Подтягивания", sets: 4, reps: 10, image: PLACEHOLDERS.workout },
    { name: "Приседания со штангой", sets: 4, reps: 12, image: PLACEHOLDERS.workout },
  ];

  return (
    <div className="max-h-80 overflow-y-auto space-y-3">
      {workouts.map((w) => (
        <button
          key={w.name}
          onClick={() => onSelect(w)}
          className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 w-full text-left hover:bg-gray-100"
        >
          <img
            src={w.image}
            alt={w.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-gray-800">{w.name}</p>
            <p className="text-xs text-gray-500">
              {w.sets} подхода × {w.reps} повторений
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
