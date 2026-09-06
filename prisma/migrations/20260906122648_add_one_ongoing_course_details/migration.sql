/*
  Warnings:

  - You are about to alter the column `price` on the `course_details` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "course_details" ADD COLUMN     "currency" CHAR(3) NOT NULL DEFAULT 'BDT',
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- create a unique index to ensure that there is only one ongoing course detail per course
CREATE UNIQUE INDEX "course_details_one_ongoing_per_course"
ON "course_details" ("course_id")
WHERE "status" = 'ONGOING';