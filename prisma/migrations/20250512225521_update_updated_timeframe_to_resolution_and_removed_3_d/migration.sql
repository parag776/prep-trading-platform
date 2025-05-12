/*
  Warnings:

  - The primary key for the `Historical_Data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `timeframe` on the `Historical_Data` table. All the data in the column will be lost.
  - Added the required column `resolution` to the `Historical_Data` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Resolution" AS ENUM ('ONE_MINUTE', 'THREE_MINUTE', 'FIVE_MINUTE', 'FIFTEEN_MINUTE', 'THIRTY_MINUTE', 'ONE_HOUR', 'TWO_HOUR', 'FOUR_HOUR', 'SIX_HOUR', 'EIGHT_HOUR', 'TWELVE_HOUR', 'ONE_DAY', 'ONE_WEEK', 'ONE_MONTH');

-- AlterTable
ALTER TABLE "Historical_Data" DROP CONSTRAINT "Historical_Data_pkey",
DROP COLUMN "timeframe",
ADD COLUMN     "resolution" "Resolution" NOT NULL,
ADD CONSTRAINT "Historical_Data_pkey" PRIMARY KEY ("assetId", "resolution", "timestamp");

-- DropEnum
DROP TYPE "Timeframe";
