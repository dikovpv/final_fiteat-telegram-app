export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  equipment: string;
  instructions: string[];
  tips: string[];
  image: string;
  sets: string;
  reps: string;
  rest: string;
  description: string;
  isFavorite?: boolean;
}