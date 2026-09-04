/*
  Warnings:

  - The values [JOINED] on the enum `JoiningStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JoiningStatus_new" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');
ALTER TABLE "public"."student_departments" ALTER COLUMN "joining_status" DROP DEFAULT;
ALTER TABLE "public"."teacher_departments" ALTER COLUMN "joining_status" DROP DEFAULT;
ALTER TABLE "student_departments" ALTER COLUMN "joining_status" TYPE "JoiningStatus_new" USING ("joining_status"::text::"JoiningStatus_new");
ALTER TABLE "teacher_departments" ALTER COLUMN "joining_status" TYPE "JoiningStatus_new" USING ("joining_status"::text::"JoiningStatus_new");
ALTER TYPE "JoiningStatus" RENAME TO "JoiningStatus_old";
ALTER TYPE "JoiningStatus_new" RENAME TO "JoiningStatus";
DROP TYPE "public"."JoiningStatus_old";
ALTER TABLE "student_departments" ALTER COLUMN "joining_status" SET DEFAULT 'PENDING';
ALTER TABLE "teacher_departments" ALTER COLUMN "joining_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "student_departments" ADD COLUMN     "reviewed_by" TEXT;

-- AlterTable
ALTER TABLE "teacher_departments" ADD COLUMN     "reviewed_by" TEXT;
