/*
  Warnings:

  - You are about to drop the column `available_margin` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "available_margin",
ADD COLUMN     "fee_unpaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "funding_unpaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
