/*
  Warnings:

  - The primary key for the `Historical_Data` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Historical_Data" DROP CONSTRAINT "Historical_Data_pkey",
ALTER COLUMN "timestamp" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Historical_Data_pkey" PRIMARY KEY ("assetId", "resolution", "timestamp");
