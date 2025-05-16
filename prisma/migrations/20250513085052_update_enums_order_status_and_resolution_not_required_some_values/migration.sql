/*
  Warnings:

  - The values [PARTIALLY_FILLED] on the enum `Order_Status` will be removed. If these variants are still used in the database, this will fail.
  - The values [ONE_MONTH] on the enum `Resolution` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Historical_Data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `timestamp` on the `Historical_Data` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Order_Status_new" AS ENUM ('OPEN', 'FILLED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "Order_Status_new" USING ("status"::text::"Order_Status_new");
ALTER TYPE "Order_Status" RENAME TO "Order_Status_old";
ALTER TYPE "Order_Status_new" RENAME TO "Order_Status";
DROP TYPE "Order_Status_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Resolution_new" AS ENUM ('ONE_MINUTE', 'THREE_MINUTE', 'FIVE_MINUTE', 'FIFTEEN_MINUTE', 'THIRTY_MINUTE', 'ONE_HOUR', 'TWO_HOUR', 'FOUR_HOUR', 'SIX_HOUR', 'EIGHT_HOUR', 'TWELVE_HOUR', 'ONE_DAY', 'ONE_WEEK');
ALTER TABLE "Historical_Data" ALTER COLUMN "resolution" TYPE "Resolution_new" USING ("resolution"::text::"Resolution_new");
ALTER TYPE "Resolution" RENAME TO "Resolution_old";
ALTER TYPE "Resolution_new" RENAME TO "Resolution";
DROP TYPE "Resolution_old";
COMMIT;

-- AlterTable
ALTER TABLE "Historical_Data" DROP CONSTRAINT "Historical_Data_pkey",
DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" INTEGER NOT NULL,
ADD CONSTRAINT "Historical_Data_pkey" PRIMARY KEY ("assetId", "resolution", "timestamp");
