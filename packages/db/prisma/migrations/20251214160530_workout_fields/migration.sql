/*
  Warnings:

  - You are about to drop the column `type` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `name` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "reps" INTEGER,
ADD COLUMN     "sets" INTEGER,
ADD COLUMN     "weight" DOUBLE PRECISION;
