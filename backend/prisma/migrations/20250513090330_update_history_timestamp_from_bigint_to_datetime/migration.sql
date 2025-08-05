/*
  Warnings:

  - The primary key for the `Historical_Data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `timestamp` on the `Historical_Data` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Historical_Data" DROP CONSTRAINT "Historical_Data_pkey",
DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Historical_Data_pkey" PRIMARY KEY ("assetId", "resolution", "timestamp");
