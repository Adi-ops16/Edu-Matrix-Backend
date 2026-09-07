/*
  Warnings:

  - A unique constraint covering the columns `[course_details_id,student_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payments_course_details_id_student_id_key" ON "payments"("course_details_id", "student_id");
