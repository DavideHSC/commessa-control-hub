-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "codiceFiscale" TEXT;

-- AlterTable
ALTER TABLE "Fornitore" ADD COLUMN     "codiceFiscale" TEXT;

-- AlterTable
ALTER TABLE "ScritturaContabile" ADD COLUMN     "dataDocumento" TIMESTAMP(3),
ADD COLUMN     "numeroDocumento" TEXT;

-- CreateTable
CREATE TABLE "CodiceIva" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "descrizione" TEXT NOT NULL,
    "aliquota" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CodiceIva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondizionePagamento" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "descrizione" TEXT NOT NULL,

    CONSTRAINT "CondizionePagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigaIva" (
    "id" TEXT NOT NULL,
    "imponibile" DOUBLE PRECISION NOT NULL,
    "imposta" DOUBLE PRECISION NOT NULL,
    "codiceIvaId" TEXT NOT NULL,
    "rigaScritturaId" TEXT NOT NULL,

    CONSTRAINT "RigaIva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodiceIva_externalId_key" ON "CodiceIva"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CondizionePagamento_externalId_key" ON "CondizionePagamento"("externalId");

-- AddForeignKey
ALTER TABLE "RigaIva" ADD CONSTRAINT "RigaIva_codiceIvaId_fkey" FOREIGN KEY ("codiceIvaId") REFERENCES "CodiceIva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaIva" ADD CONSTRAINT "RigaIva_rigaScritturaId_fkey" FOREIGN KEY ("rigaScritturaId") REFERENCES "RigaScrittura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
