/*
  Warnings:

  - Added the required column `promptId` to the `Animation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Animation" ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "promptId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Animation" ADD CONSTRAINT "Animation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animation" ADD CONSTRAINT "Animation_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
