/*
  Warnings:

  - You are about to drop the column `cgpa` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `students` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JoiningStatus" AS ENUM ('PENDING', 'JOINED', 'DECLINED');

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "cgpa",
DROP COLUMN "semester",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "admission_year" INTEGER,
ADD COLUMN     "certificate" TEXT,
ADD COLUMN     "certificate_public_id" TEXT,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "graduation_year" INTEGER,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "certificate" TEXT,
ADD COLUMN     "certificate_public_id" TEXT,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "graduation_year" INTEGER,
ADD COLUMN     "joining_year" INTEGER,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specialization" TEXT,
ALTER COLUMN "designation" DROP NOT NULL,
ALTER COLUMN "degree" DROP NOT NULL,
ALTER COLUMN "graduated_from" DROP NOT NULL;

-- CreateTable
CREATE TABLE "student_departments" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "joining_status" "JoiningStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_departments" (
    "id" SERIAL NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "joining_status" "JoiningStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_departments_student_id_department_id_key" ON "student_departments"("student_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_departments_teacher_id_department_id_key" ON "teacher_departments"("teacher_id", "department_id");

-- AddForeignKey
ALTER TABLE "student_departments" ADD CONSTRAINT "student_departments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_departments" ADD CONSTRAINT "student_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_departments" ADD CONSTRAINT "teacher_departments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_departments" ADD CONSTRAINT "teacher_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
