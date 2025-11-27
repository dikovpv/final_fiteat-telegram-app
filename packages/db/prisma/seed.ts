import { PrismaClient } from "@prisma/client";
import 'dotenv/config';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({
    where: { telegramId: '12345' },
    update: {},
    create: { telegramId: '12345', name: 'Test User', username: 'testuser', age: 30, gender:'male', heightCm:176, weightKg:80, goal:'maintain', activity:'medium' }
  });
  await prisma.meal.create({ data: { userId: user.id, name: 'Овсянка', calories: 400, protein: 30, fat: 10, carbs: 50 } });
  await prisma.workout.create({ data: { userId: user.id, name: 'Жим лёжа', sets: 4, reps: 8, weight: 60 } });
  console.log("Seed done.");
}
main().finally(async () => await prisma.$disconnect());
