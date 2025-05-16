/*
  Warnings:

  - Made the column `filled_quantity` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `average_filled_price` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "filled_quantity" SET NOT NULL,
ALTER COLUMN "filled_quantity" SET DEFAULT 0,
ALTER COLUMN "average_filled_price" SET NOT NULL,
ALTER COLUMN "average_filled_price" SET DEFAULT 0;
