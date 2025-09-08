-- CreateTable
CREATE TABLE "staging_centri_costo" (
    "id" TEXT NOT NULL,
    "filler" TEXT,
    "codiceFiscaleAzienda" TEXT,
    "subcodeAzienda" TEXT,
    "codice" TEXT,
    "descrizione" TEXT,
    "responsabile" TEXT,
    "livello" TEXT,
    "note" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importJobId" TEXT,

    CONSTRAINT "staging_centri_costo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staging_centri_costo_codiceFiscaleAzienda_subcodeAzienda_co_key" ON "staging_centri_costo"("codiceFiscaleAzienda", "subcodeAzienda", "codice");
