/*
  Warnings:

  - The values [ONE_WEEK] on the enum `Resolution` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Resolution_new" AS ENUM ('ONE_MINUTE', 'THREE_MINUTE', 'FIVE_MINUTE', 'FIFTEEN_MINUTE', 'THIRTY_MINUTE', 'ONE_HOUR', 'TWO_HOUR', 'FOUR_HOUR', 'SIX_HOUR', 'EIGHT_HOUR', 'TWELVE_HOUR', 'ONE_DAY');
ALTER TABLE "Historical_Data" ALTER COLUMN "resolution" TYPE "Resolution_new" USING ("resolution"::text::"Resolution_new");
ALTER TYPE "Resolution" RENAME TO "Resolution_old";
ALTER TYPE "Resolution_new" RENAME TO "Resolution";
DROP TYPE "Resolution_old";
COMMIT;
