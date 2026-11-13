-- CreateTable
CREATE TABLE "AiRecommendationRun" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT,
    "vacancyTitle" TEXT,
    "model" TEXT NOT NULL,
    "totalCandidates" INTEGER NOT NULL,
    "recommendedCount" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "selectionCriteria" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRecommendationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiRecommendationRun_vacancyId_createdAt_idx" ON "AiRecommendationRun"("vacancyId", "createdAt");
