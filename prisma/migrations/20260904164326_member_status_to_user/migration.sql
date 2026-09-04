-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('NOT_JOINED', 'PENDING', 'APPROVED', 'DECLINED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "member_status" "MemberStatus" NOT NULL DEFAULT 'NOT_JOINED';
