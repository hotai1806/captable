-- CreateEnum
CREATE TYPE "InvestorEntityTypeEnum" AS ENUM ('INDIVIDUAL', 'LLC', 'CORPORATION', 'PARTNERSHIP', 'TRUST', 'IRA');

-- CreateEnum
CREATE TYPE "KycStatusEnum" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AccreditationStatusEnum" AS ENUM ('NOT_ACCREDITED', 'SELF_REPORTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CampaignStatusEnum" AS ENUM ('DRAFT', 'IN_REVIEW', 'TESTING_THE_WATERS', 'LIVE', 'FUNDED', 'CLOSED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "RegulationTypeEnum" AS ENUM ('REG_CF', 'REG_D_506B', 'REG_D_506C', 'REG_A_PLUS');

-- CreateEnum
CREATE TYPE "CampaignSecurityTypeEnum" AS ENUM ('SAFE', 'PRICED_EQUITY', 'CONVERTIBLE_NOTE', 'REVENUE_SHARE', 'DEBT');

-- CreateEnum
CREATE TYPE "EscrowProviderEnum" AS ENUM ('BANK_TRUST', 'BROKER_DEALER', 'OTHER');

-- CreateEnum
CREATE TYPE "CommitmentStatusEnum" AS ENUM ('PENDING', 'PAYMENT_PROCESSING', 'ESCROWED', 'RECONFIRMATION_REQUIRED', 'CANCELLED', 'REFUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('ACH', 'WIRE', 'CARD', 'CHECK');

-- CreateEnum
CREATE TYPE "PaymentTransactionTypeEnum" AS ENUM ('CHARGE', 'REFUND', 'DISBURSEMENT', 'FEE');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatusEnum" AS ENUM ('INITIATED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "CampaignCloseStatusEnum" AS ENUM ('SCHEDULED', 'DISBURSING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "InvestorEntityTypeEnum" NOT NULL DEFAULT 'INDIVIDUAL',
    "entityName" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "taxIdToken" TEXT,
    "annualIncome" DECIMAL(15,2),
    "netWorth" DECIMAL(15,2),
    "kycStatus" "KycStatusEnum" NOT NULL DEFAULT 'NOT_STARTED',
    "kycVerifiedAt" TIMESTAMP(3),
    "kycProviderReference" TEXT,
    "accreditationStatus" "AccreditationStatusEnum" NOT NULL DEFAULT 'NOT_ACCREDITED',
    "accreditationVerifiedAt" TIMESTAMP(3),
    "accreditationExpiresAt" TIMESTAMP(3),
    "paymentCustomerReference" TEXT,
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "CampaignStatusEnum" NOT NULL DEFAULT 'DRAFT',
    "regulationType" "RegulationTypeEnum" NOT NULL DEFAULT 'REG_CF',
    "securityType" "CampaignSecurityTypeEnum" NOT NULL DEFAULT 'SAFE',
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "pitch" JSONB NOT NULL DEFAULT '{}',
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "risks" TEXT,
    "minimumGoal" DECIMAL(15,2) NOT NULL,
    "maximumGoal" DECIMAL(15,2) NOT NULL,
    "minInvestment" DECIMAL(15,2) NOT NULL DEFAULT 100,
    "maxInvestment" DECIMAL(15,2),
    "valuationCap" DECIMAL(18,2),
    "discountRate" DOUBLE PRECISION,
    "interestRate" DOUBLE PRECISION,
    "maturityDate" TIMESTAMP(3),
    "pricePerShare" DECIMAL(15,6),
    "preMoneyValuation" DECIMAL(18,2),
    "revenueSharePercent" DOUBLE PRECISION,
    "revenueShareCapMultiple" DOUBLE PRECISION,
    "amountCommitted" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountEscrowed" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountDisbursed" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "investorCount" INTEGER NOT NULL DEFAULT 0,
    "launchedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "formCFiledAt" TIMESTAMP(3),
    "secFileNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "CampaignCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignToCategory" (
    "campaignId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CampaignToCategory_pkey" PRIMARY KEY ("campaignId","categoryId")
);

-- CreateTable
CREATE TABLE "CampaignPerk" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minimumAmount" DECIMAL(15,2) NOT NULL,
    "quantityLimit" INTEGER,
    "claimedCount" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignPerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignFaq" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignUpdate" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "html" TEXT NOT NULL,
    "investorsOnly" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignComment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "isFounderResponse" BOOLEAN NOT NULL DEFAULT false,
    "isInvestor" BOOLEAN NOT NULL DEFAULT false,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignCommentLike" (
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignCommentLike_pkey" PRIMARY KEY ("commentId","userId")
);

-- CreateTable
CREATE TABLE "CampaignFollow" (
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "indicatedAmount" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignFollow_pkey" PRIMARY KEY ("campaignId","userId")
);

-- CreateTable
CREATE TABLE "LeadInvestor" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "memo" TEXT,
    "carryPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadInvestor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spv" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "ein" TEXT,
    "jurisdiction" TEXT NOT NULL DEFAULT 'DE',
    "managementFeePercent" DOUBLE PRECISION,
    "carryPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowAccount" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "provider" "EscrowProviderEnum" NOT NULL DEFAULT 'BANK_TRUST',
    "providerReference" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentCommitment" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "status" "CommitmentStatusEnum" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMethod" "PaymentMethodEnum" NOT NULL DEFAULT 'ACH',
    "perkId" TEXT,
    "termsSnapshot" JSONB NOT NULL DEFAULT '{}',
    "closeId" TEXT,
    "stakeholderId" TEXT,
    "educationalMaterialsAcceptedAt" TIMESTAMP(3),
    "cancellationTermsAcceptedAt" TIMESTAMP(3),
    "riskAcknowledgedAt" TIMESTAMP(3),
    "agreementTemplateId" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "escrowedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentCommitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "commitmentId" TEXT,
    "escrowAccountId" TEXT NOT NULL,
    "type" "PaymentTransactionTypeEnum" NOT NULL,
    "status" "PaymentTransactionStatusEnum" NOT NULL DEFAULT 'INITIATED',
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'usd',
    "provider" TEXT,
    "providerReference" TEXT,
    "failureReason" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignClose" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "CampaignCloseStatusEnum" NOT NULL DEFAULT 'SCHEDULED',
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "noticeSentAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "grossAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "disbursedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignClose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_publicId_key" ON "InvestorProfile"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_userId_idx" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_kycStatus_idx" ON "InvestorProfile"("kycStatus");

-- CreateIndex
CREATE INDEX "InvestorProfile_accreditationStatus_idx" ON "InvestorProfile"("accreditationStatus");

-- CreateIndex
CREATE INDEX "FounderProfile_companyId_idx" ON "FounderProfile"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_publicId_key" ON "Campaign"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE INDEX "Campaign_companyId_idx" ON "Campaign"("companyId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_status_launchedAt_idx" ON "Campaign"("status", "launchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCategory_name_key" ON "CampaignCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCategory_slug_key" ON "CampaignCategory"("slug");

-- CreateIndex
CREATE INDEX "CampaignToCategory_campaignId_idx" ON "CampaignToCategory"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignToCategory_categoryId_idx" ON "CampaignToCategory"("categoryId");

-- CreateIndex
CREATE INDEX "CampaignPerk_campaignId_idx" ON "CampaignPerk"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignFaq_campaignId_idx" ON "CampaignFaq"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignUpdate_publicId_key" ON "CampaignUpdate"("publicId");

-- CreateIndex
CREATE INDEX "CampaignUpdate_campaignId_idx" ON "CampaignUpdate"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignUpdate_campaignId_publishedAt_idx" ON "CampaignUpdate"("campaignId", "publishedAt");

-- CreateIndex
CREATE INDEX "CampaignComment_campaignId_createdAt_idx" ON "CampaignComment"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignComment_authorId_idx" ON "CampaignComment"("authorId");

-- CreateIndex
CREATE INDEX "CampaignComment_parentId_idx" ON "CampaignComment"("parentId");

-- CreateIndex
CREATE INDEX "CampaignCommentLike_commentId_idx" ON "CampaignCommentLike"("commentId");

-- CreateIndex
CREATE INDEX "CampaignCommentLike_userId_idx" ON "CampaignCommentLike"("userId");

-- CreateIndex
CREATE INDEX "CampaignFollow_campaignId_idx" ON "CampaignFollow"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignFollow_userId_idx" ON "CampaignFollow"("userId");

-- CreateIndex
CREATE INDEX "LeadInvestor_campaignId_idx" ON "LeadInvestor"("campaignId");

-- CreateIndex
CREATE INDEX "LeadInvestor_investorProfileId_idx" ON "LeadInvestor"("investorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadInvestor_campaignId_investorProfileId_key" ON "LeadInvestor"("campaignId", "investorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Spv_campaignId_key" ON "Spv"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowAccount_campaignId_key" ON "EscrowAccount"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCommitment_publicId_key" ON "InvestmentCommitment"("publicId");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_campaignId_idx" ON "InvestmentCommitment"("campaignId");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_campaignId_status_idx" ON "InvestmentCommitment"("campaignId", "status");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_investorProfileId_idx" ON "InvestmentCommitment"("investorProfileId");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_perkId_idx" ON "InvestmentCommitment"("perkId");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_closeId_idx" ON "InvestmentCommitment"("closeId");

-- CreateIndex
CREATE INDEX "InvestmentCommitment_stakeholderId_idx" ON "InvestmentCommitment"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_publicId_key" ON "PaymentTransaction"("publicId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_commitmentId_idx" ON "PaymentTransaction"("commitmentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_escrowAccountId_idx" ON "PaymentTransaction"("escrowAccountId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_providerReference_idx" ON "PaymentTransaction"("providerReference");

-- CreateIndex
CREATE INDEX "CampaignClose_campaignId_idx" ON "CampaignClose"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignClose_campaignId_status_idx" ON "CampaignClose"("campaignId", "status");
