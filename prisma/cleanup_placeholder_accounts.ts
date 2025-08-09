import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('-- Script SQL per la pulizia dei dati placeholder\n');

  // 1. Pulizia Conti placeholder
  const contiDaCancellare = await prisma.conto.findMany({
    where: {
      nome: {
        startsWith: 'Conto importato - ',
      },
    },
    select: { id: true }
  });
  if(contiDaCancellare.length > 0){
    const ids = contiDaCancellare.map(c => `'${c.id}'`).join(', ');
    console.log(`-- Cancellazione Conti placeholder (${contiDaCancellare.length} record)`);
    console.log(`DELETE FROM "Conto" WHERE "id" IN (${ids});\n`);
  }

  // 2. Pulizia Fornitori placeholder
  const fornitoriDaCancellare = await prisma.fornitore.findMany({
    where: {
      nome: {
        startsWith: 'Fornitore importato - ',
      },
    },
     select: { id: true }
  });
   if(fornitoriDaCancellare.length > 0){
    const ids = fornitoriDaCancellare.map(c => `'${c.id}'`).join(', ');
    console.log(`-- Cancellazione Fornitori placeholder (${fornitoriDaCancellare.length} record)`);
    console.log(`DELETE FROM "Fornitore" WHERE "id" IN (${ids});\n`);
  }
  
  // 3. Pulizia Codici Iva placeholder
  const ivaDaCancellare = await prisma.codiceIva.findMany({
      where: {
          descrizione: {
              startsWith: 'IVA importata - '
          }
      },
       select: { id: true }
  });
  if(ivaDaCancellare.length > 0){
    const ids = ivaDaCancellare.map(c => `'${c.id}'`).join(', ');
    console.log(`-- Cancellazione Codici IVA placeholder (${ivaDaCancellare.length} record)`);
    console.log(`DELETE FROM "CodiceIva" WHERE "id" IN (${ids});\n`);
  }

  console.log('-- Pulizia completata.');
}

main()
  .catch((e) => {
    console.error('Errore durante la generazione dello script SQL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 