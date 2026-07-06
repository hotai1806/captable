-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConvertibleStatusEnum" ADD VALUE 'CONVERTED';
ALTER TYPE "ConvertibleStatusEnum" ADD VALUE 'MATURED';

-- AlterEnum
ALTER TYPE "SafeStatusEnum" ADD VALUE 'CONVERTED';

-- AlterTable
ALTER TABLE "ConvertibleNote" ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "convertedToShareId" TEXT,
ADD COLUMN     "maturityDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InvestmentCommitment" ADD COLUMN     "issuedConvertibleNoteId" TEXT,
ADD COLUMN     "issuedSafeId" TEXT,
ADD COLUMN     "issuedShareId" TEXT;

-- AlterTable
ALTER TABLE "Safe" ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "convertedToShareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConvertibleNote_convertedToShareId_key" ON "ConvertibleNote"("convertedToShareId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCommitment_issuedSafeId_key" ON "InvestmentCommitment"("issuedSafeId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCommitment_issuedConvertibleNoteId_key" ON "InvestmentCommitment"("issuedConvertibleNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCommitment_issuedShareId_key" ON "InvestmentCommitment"("issuedShareId");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_agreementTemplateId_idx" ON "InvestmentCommitment"("agreementTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "Safe_convertedToShareId_key" ON "Safe"("convertedToShareId");

