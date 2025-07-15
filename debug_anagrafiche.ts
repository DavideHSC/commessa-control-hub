import { PrismaClient } from '@prisma/client';
import { finalizeAnagrafiche } from './server/lib/finalization.js';

const prisma = new PrismaClient();

async function debugAnagrafiche() {
  console.log('=== DEBUG ANAGRAFICHE ===');
  
  // Controlla i dati in staging
  const stagingCount = await prisma.stagingAnagrafica.count();
  console.log('Anagrafiche in staging:', stagingCount);
  
  // Sample dei dati staging
  const stagingData = await prisma.stagingAnagrafica.findMany({
    take: 5,
    select: {
      codiceUnivoco: true,
      tipoSoggetto: true,
      denominazione: true,
      partitaIva: true,
      codiceFiscaleClifor: true,
      nome: true,
      cognome: true
    }
  });
  
  console.log('Sample staging data:', JSON.stringify(stagingData, null, 2));
  
  // Controlla i dati nelle tabelle operative
  const clientiCount = await prisma.cliente.count();
  const fornitoriCount = await prisma.fornitore.count();
  console.log('Clienti attuali:', clientiCount);
  console.log('Fornitori attuali:', fornitoriCount);
  
  // Prova la finalizzazione
  console.log('--- Avvio finalizzazione ---');
  try {
    const result = await finalizeAnagrafiche(prisma);
    console.log('Finalization result:', result);
  } catch (error) {
    console.error('Errore durante finalizzazione:', error);
  }
  
  // Controlla dopo la finalizzazione
  const clientiCountAfter = await prisma.cliente.count();
  const fornitoriCountAfter = await prisma.fornitore.count();
  console.log('Clienti dopo finalizzazione:', clientiCountAfter);
  console.log('Fornitori dopo finalizzazione:', fornitoriCountAfter);
  
  await prisma.$disconnect();
}

debugAnagrafiche().catch(console.error);