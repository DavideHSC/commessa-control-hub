const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseCounts() {
  console.log('Verifica diretta del contenuto del database...');
  try {
    const counts = await prisma.$transaction([
      prisma.causaleContabile.count(),
      prisma.codiceIva.count(),
      prisma.condizionePagamento.count(),
      prisma.conto.count(),
      prisma.cliente.count(),
      prisma.fornitore.count(),
      prisma.scritturaContabile.count(),
      prisma.commessa.count(),
      prisma.voceAnalitica.count()
    ]);

    const [
      causaliCount,
      codiciIvaCount,
      condizioniPagamentoCount,
      contiCount,
      clientiCount,
      fornitoriCount,
      scrittureCount,
      commesseCount,
      vociAnaliticheCount
    ] = counts;

    console.log('--- Conteggio Record Attuale ---');
    console.log(`- Scritture Contabili: ${scrittureCount}`);
    console.log(`- Clienti: ${clientiCount}`);
    console.log(`- Fornitori: ${fornitoriCount}`);
    console.log('--------------------------------');
    console.log(`- Causali Contabili: ${causaliCount}`);
    console.log(`- Codici IVA: ${codiciIvaCount}`);
    console.log(`- Condizioni Pagamento: ${condizioniPagamentoCount}`);
    console.log(`- Piano dei Conti: ${contiCount}`);
    console.log(`- Voci Analitiche: ${vociAnaliticheCount}`);
    console.log(`- Commesse: ${commesseCount}`);
    console.log('--------------------------------');

  } catch (error) {
    console.error('Errore durante la verifica del database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function resetAllData() {
  console.log('Resetting all data...');
  // L'ordine è importante per via dei vincoli di chiave esterna
  await prisma.$transaction(async (tx) => {
    // Modelli che dipendono da altri
    await tx.budgetVoce.deleteMany({});
    await tx.allocazione.deleteMany({});
    await tx.rigaIva.deleteMany({});
    await tx.rigaScrittura.deleteMany({});
    
    // Modelli che dipendono da anagrafiche di base
    await tx.commessa.deleteMany({});
    await tx.scritturaContabile.deleteMany({});
    
    // Anagrafiche di base
    await tx.cliente.deleteMany({});
    await tx.fornitore.deleteMany({});
    await tx.conto.deleteMany({});
    await tx.voceAnalitica.deleteMany({});
    await tx.causaleContabile.deleteMany({});
    await tx.codiceIva.deleteMany({});
    await tx.condizionePagamento.deleteMany({});

    // Modelli di importazione e log
    await tx.importTemplate.deleteMany({}); // Include VoceTemplateScrittura e FieldDefinition per via del cascade
    await tx.importLog.deleteMany({});
    await tx.wizardState.deleteMany({});
  });
  console.log('Database reset successfully.');
}

async function resetCliFor() {
  console.log('Resetting Cliente and Fornitore tables...');
  await prisma.$transaction(async (tx) => {
    // Le commesse dipendono dai clienti, quindi vanno eliminate prima
    await tx.commessa.deleteMany({});
    console.log('- Commesse deleted.');
    
    // Ora possiamo eliminare clienti e fornitori
    await tx.cliente.deleteMany({});
    console.log('- Clienti deleted.');
    await tx.fornitore.deleteMany({});
    console.log('- Fornitori deleted.');
  });
  console.log('Cliente and Fornitore tables reset successfully.');
}

async function main() {
  const command = process.argv[2];

  if (command === 'check') {
    await checkDatabaseConnection();
    await checkDatabaseCounts();
  } else if (command === 'reset-all') {
    await resetAllData();
  } else if (command === 'reset-clifor') {
    await resetCliFor();
  } else {
    console.log('Usage: node check_db.cjs <command>');
    console.log('Available commands:');
    console.log('  check               - Checks the database connection and counts');
    console.log('  reset-all           - Resets all data in the database');
    console.log('  reset-clifor        - Resets only Cliente, Fornitore and related tables');
  }

  console.log('Script finished.');
}

main(); 