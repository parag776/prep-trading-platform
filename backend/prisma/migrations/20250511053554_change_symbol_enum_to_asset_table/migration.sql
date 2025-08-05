/*
  Warnings:

  - The primary key for the `Historical_Data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `symbol` on the `Historical_Data` table. All the data in the column will be lost.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Symbol` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `Symbol` on the `Position` table. All the data in the column will be lost.
  - The primary key for the `Trade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fromUserId` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Historical_Data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `side` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `assetId` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_toUserId_fkey";

-- DropIndex
DROP INDEX "Order_userId_status_Symbol_idx";

-- DropIndex
DROP INDEX "Position_userId_Symbol_idx";

-- AlterTable
ALTER TABLE "Historical_Data" DROP CONSTRAINT "Historical_Data_pkey",
DROP COLUMN "symbol",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD CONSTRAINT "Historical_Data_pkey" PRIMARY KEY ("assetId", "timeframe", "timestamp");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "Symbol",
ADD COLUMN     "assetId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "side",
ADD COLUMN     "side" "Side" NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Order_id_seq";

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "Symbol",
ADD COLUMN     "assetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_pkey",
DROP COLUMN "fromUserId",
DROP COLUMN "symbol",
DROP COLUMN "toUserId",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "buyerId" TEXT NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Trade_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Trade_id_seq";

-- DropEnum
DROP TYPE "Symbol";

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "img_url" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_userId_status_assetId_idx" ON "Order"("userId", "status", "assetId");

-- CreateIndex
CREATE INDEX "Position_userId_assetId_idx" ON "Position"("userId", "assetId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historical_Data" ADD CONSTRAINT "Historical_Data_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
