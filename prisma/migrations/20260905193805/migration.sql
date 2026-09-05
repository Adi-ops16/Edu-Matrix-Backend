/*
  Warnings:

  - You are about to drop the column `endDate` on the `course_details` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `course_details` table. All the data in the column will be lost.
  - You are about to drop the column `d_description` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `d_established_year` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `payments` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `course_teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course_details" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "course_teachers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "d_description",
DROP COLUMN "d_established_year",
ADD COLUMN     "department_description" TEXT,
ADD COLUMN     "department_established_year" INTEGER;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
