-- CreateTable
CREATE TABLE "staging_condizioni_pagamento" (
    "id" TEXT NOT NULL,
    "codice" TEXT,
    "descrizione" TEXT,
    "tipo" TEXT,
    "validitaInizio" TEXT,
    "validitaFine" TEXT,

    CONSTRAINT "staging_condizioni_pagamento_pkey" PRIMARY KEY ("id")
);
