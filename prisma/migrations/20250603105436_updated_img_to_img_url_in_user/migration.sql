/*
  Warnings:

  - You are about to drop the column `img` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "img",
ADD COLUMN     "img_url" TEXT;
