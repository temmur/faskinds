-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "CandidateDecision" (
    "id" TEXT NOT NULL,
    "type" "DecisionType" NOT NULL,
    "message" TEXT NOT NULL,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
    "telegramMessageId" TEXT,
    "deliveryError" TEXT,
    "decidedBy" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "CandidateDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateDecision_candidateId_key" ON "CandidateDecision"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateDecision_deliveryStatus_decidedAt_idx" ON "CandidateDecision"("deliveryStatus", "decidedAt");

-- AddForeignKey
ALTER TABLE "CandidateDecision" ADD CONSTRAINT "CandidateDecision_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
