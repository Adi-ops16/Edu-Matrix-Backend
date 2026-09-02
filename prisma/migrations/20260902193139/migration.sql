/*
  Warnings:

  - You are about to drop the column `institutionId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_institutionId_fkey";

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "reviewed_by" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "institutionId",
ADD COLUMN     "institution_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
