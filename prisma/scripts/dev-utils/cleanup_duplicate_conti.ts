import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Avvio della pulizia dei conti duplicati...');

  // Trova tutti i conti che sono stati generati erroneamente dalla vecchia logica
  const garbageConti = await prisma.conto.findMany({
    where: {
      nome: {
        startsWith: 'Conto importato - ',
      },
    },
    select: {
      id: true,
      codice: true,
      nome: true,
    }
  });

  if (garbageConti.length === 0) {
    console.log('Nessun conto "spazzatura" trovato. La tabella è pulita.');
    return;
  }

  console.log(`Trovati ${garbageConti.length} conti "spazzatura" da eliminare.`);
  console.table(garbageConti);

  const idsToDelete = garbageConti.map(c => c.id);

  // Prima di eliminare, verifichiamo se questi conti sono collegati a scritture.
  // Sebbene l'utente abbia detto di aver svuotato i movimenti, è una buona pratica di sicurezza.
  const relatedScritture = await prisma.rigaScrittura.count({
    where: {
      contoId: {
        in: idsToDelete,
      },
    },
  });

  if (relatedScritture > 0) {
    console.error(`ERRORE: Sono state trovate ${relatedScritture} righe di scrittura collegate ai conti da eliminare.`);
    console.error('Eliminazione interrotta per sicurezza. Risolvere le relazioni prima di eseguire di nuovo lo script.');
    process.exit(1);
  }

  console.log('Nessuna scrittura collegata trovata. Procedo con l\'eliminazione...');

  const deleteResult = await prisma.conto.deleteMany({
    where: {
      id: {
        in: idsToDelete,
      },
    },
  });

  console.log(`Cancellati con successo ${deleteResult.count} conti.`);
}

main()
  .catch((e) => {
    console.error('Si è verificato un errore durante l\'esecuzione dello script di pulizia:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Pulizia completata. Disconnessione dal database.');
  }); 