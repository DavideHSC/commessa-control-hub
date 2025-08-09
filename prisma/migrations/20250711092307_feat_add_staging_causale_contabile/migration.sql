-- CreateTable
CREATE TABLE "staging_causali_contabili" (
    "id" TEXT NOT NULL,
    "codice" TEXT,
    "descrizione" TEXT,
    "tipo" TEXT,
    "validitaInizio" TEXT,
    "validitaFine" TEXT,

    CONSTRAINT "staging_causali_contabili_pkey" PRIMARY KEY ("id")
);
