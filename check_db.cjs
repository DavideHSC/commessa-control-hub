const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const [
      clienti,
      fornitori,
      commesse,
      scritture,
      conti,
      vociAnalitiche,
      causali,
      codiciIva,
      condizioniPagamento
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.fornitore.count(),
      prisma.commessa.count(),
      prisma.scritturaContabile.count(),
      prisma.conto.count(),
      prisma.voceAnalitica.count(),
      prisma.causaleContabile.count(),
      prisma.codiceIva.count(),
      prisma.condizionePagamento.count()
    ]);

    console.log('=== CONTEGGIO TABELLE DATABASE ===');
    console.log(`Cliente: ${clienti}`);
    console.log(`Fornitore: ${fornitori}`);
    console.log(`Commessa: ${commesse}`);
    console.log(`ScritturaContabile: ${scritture}`);
    console.log(`Conto: ${conti}`);
    console.log(`VoceAnalitica: ${vociAnalitiche}`);
    console.log(`CausaleContabile: ${causali}`);
    console.log(`CodiceIva: ${codiciIva}`);
    console.log(`CondizionePagamento: ${condizioniPagamento}`);
    
    // Mostra anche alcuni esempi di dati
    console.log('\n=== ESEMPI DI DATI ===');
    
    const sampleClienti = await prisma.cliente.findMany({ take: 3 });
    console.log('Clienti (primi 3):', sampleClienti.map(c => ({ id: c.id, nome: c.nome })));
    
    const sampleCommesse = await prisma.commessa.findMany({ take: 3 });
    console.log('Commesse (primi 3):', sampleCommesse.map(c => ({ id: c.id, nome: c.nome })));
    
    const sampleScritture = await prisma.scritturaContabile.findMany({ take: 3 });
    console.log('Scritture (primi 3):', sampleScritture.map(s => ({ id: s.id, descrizione: s.descrizione })));

  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 