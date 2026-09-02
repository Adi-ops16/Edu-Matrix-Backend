-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "status" "InstitutionStatus" NOT NULL DEFAULT 'PENDING';
