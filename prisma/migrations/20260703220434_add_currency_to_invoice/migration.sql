-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'CREDITS');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
