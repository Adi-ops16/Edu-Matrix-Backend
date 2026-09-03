-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'KINDER', 'OTHER');

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "semester" SET DEFAULT 1,
ALTER COLUMN "cgpa" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "d_description" TEXT NOT NULL,
    "d_established_year" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_institution_id_code_key" ON "departments"("institution_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_institution_id_name_key" ON "departments"("institution_id", "name");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
