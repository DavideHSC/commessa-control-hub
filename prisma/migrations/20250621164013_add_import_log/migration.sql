-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);
