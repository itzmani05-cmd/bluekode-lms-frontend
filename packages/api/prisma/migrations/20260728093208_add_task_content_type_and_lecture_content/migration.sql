-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'TASK';

-- AlterTable
ALTER TABLE "lectures" ADD COLUMN "content" TEXT;
