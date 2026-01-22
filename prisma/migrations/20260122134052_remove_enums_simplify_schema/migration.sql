/*
  Warnings:

  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Pet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `frequency` on the `Donation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Donation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `species` on the `Pet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `age` on the `Pet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'REVIEW';

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "frequency",
ADD COLUMN     "frequency" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "species",
ADD COLUMN     "species" TEXT NOT NULL,
DROP COLUMN "age",
ADD COLUMN     "age" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADOPTER';

-- DropEnum
DROP TYPE "AgeGroup";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "DonationFrequency";

-- DropEnum
DROP TYPE "DonationType";

-- DropEnum
DROP TYPE "PetStatus";

-- DropEnum
DROP TYPE "Species";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Pet_species_idx" ON "Pet"("species");

-- CreateIndex
CREATE INDEX "Pet_status_idx" ON "Pet"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
