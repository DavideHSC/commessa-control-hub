-- CreateTable
CREATE TABLE "WizardStep" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepTitle" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileName" TEXT,
    "recordCount" INTEGER,
    "completedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WizardStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WizardStep_stepId_key" ON "WizardStep"("stepId");
