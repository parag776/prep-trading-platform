/*
  Warnings:

  - You are about to drop the column `img_url` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "img_url",
DROP COLUMN "password";
