// prisma/seed.ts
import { PrismaClient, TipoConto } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_CUSTOMER_ID = 'system_customer_01';
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

async function main() {
  console.log('Inizio seeding completo...');

  // --- 1. PULIZIA DEL DATABASE ---
  console.log('Pulizia delle tabelle di staging e produzione...');
  await prisma.importAllocazione.deleteMany({});
  await prisma.importScritturaRigaContabile.deleteMany({});
  await prisma.importScritturaRigaIva.deleteMany({});
  await prisma.importScritturaTestata.deleteMany({});
  await prisma.allocazione.deleteMany({});
  await prisma.rigaIva.deleteMany({});
  await prisma.rigaScrittura.deleteMany({});
  await prisma.scritturaContabile.deleteMany({});
  
  // Pulizia anagrafiche collegate
  await prisma.commessa.deleteMany({});
  await prisma.fornitore.deleteMany({});
  await prisma.cliente.deleteMany({});
  
  // Pulizia anagrafiche di base (solo se necessario, altrimenti si può usare upsert)
  await prisma.causaleContabile.deleteMany({});
  await prisma.codiceIva.deleteMany({});
  await prisma.conto.deleteMany({});
  await prisma.voceAnalitica.deleteMany({});
  await prisma.condizionePagamento.deleteMany({});
  console.log('Pulizia completata.');
  

  // --- 2. CREAZIONE ANAGRAFICHE DI BASE ---
  console.log('Creazione anagrafiche di base...');

  await prisma.voceAnalitica.createMany({
    data: [
        { id: 'costo_personale', nome: 'Costo del personale' },
        { id: 'servizi_esterni', nome: 'Servizi esterni' },
    ],
    skipDuplicates: true
  });

  await prisma.causaleContabile.createMany({
      data: [{ id: 'FRS', descrizione: 'Fattura ricevuta split payment' }],
      skipDuplicates: true
  });

  await prisma.codiceIva.createMany({
      data: [{ id: '22', descrizione: 'IVA 22%', aliquota: 22 }],
      skipDuplicates: true
  });

  await prisma.condizionePagamento.createMany({
    data: [{id: '30GG', descrizione: '30 giorni data fattura'}],
    skipDuplicates: true,
  });

  await prisma.conto.createMany({
    data: [
      { id: '201000048', codice: '201000048', nome: 'FORNITORI DIVERSI', tipo: TipoConto.Fornitore },
      { id: '6015009701', codice: '6015009701', nome: 'CONSULENZE TECNICHE', tipo: TipoConto.Costo },
      { id: '6015000751', codice: '6015000751', nome: 'MANUTENZIONE FABBRICATI', tipo: TipoConto.Costo },
      { id: '1880000300', codice: '1880000300', nome: 'IVA A CREDITO', tipo: TipoConto.Patrimoniale },
    ],
    skipDuplicates: true
  });
  console.log('Anagrafiche di base create.');

  // --- 3. CREAZIONE ANAGRAFICHE COLLEGATE (CLIENTI, FORNITORI, COMMESSE) ---
  console.log('Creazione cliente, fornitore e commesse...');
  const clientePenisolaVerde = await prisma.cliente.create({
    data: {
      id: 'penisola_verde_spa',
      nome: 'PENISOLAVERDE SPA',
      externalId: 'PENISOLAVERDE_SPA',
    },
  });

  const fornitoreGenerico = await prisma.fornitore.create({
      data: {
          id: 'fornitore_generico_01',
          externalId: 'FORN-GEN-01',
          nome: 'FORNITORE GENERICO SPA'
      }
  })

  const commessaServiziGenerali = await prisma.commessa.create({
      data: {
          id: 'comm_serv_gen',
          nome: 'Commessa Servizi Generali',
          clienteId: clientePenisolaVerde.id
      }
  });

  const commessaManutenzione = await prisma.commessa.create({
    data: {
        id: 'comm_manutenzione',
        nome: 'Commessa Manutenzione',
        clienteId: clientePenisolaVerde.id
    }
  });
  console.log('Cliente, fornitore e commesse create.');


  // --- 4. POPOLAMENTO TABELLE DI STAGING (SIMULAZIONE IMPORTAZIONE) ---
  console.log('Popolamento tabelle di staging...');
  const testataScrittura = await prisma.importScritturaTestata.create({
    data: {
      codiceUnivocoScaricamento: 'SCR-001',
      codiceCausale: 'FRS',
      dataRegistrazione: new Date('2025-01-04'),
      dataDocumento: new Date('2024-12-31'),
      numeroDocumento: '1338/00',
      codiceFornitore: 'FORN-GEN-01',
    },
  });

  // Righe contabili collegate
  const rigaContabileCosto1 = await prisma.importScritturaRigaContabile.create({
    data: {
        riga: 1,
        codiceConto: '6015009701', // Consulenze
        importoDare: 143.35,
        importoAvere: 0,
        codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
    }
  });

  await prisma.importScritturaRigaContabile.createMany({
      data:[
        {
            riga: 2,
            codiceConto: '6015000751', // Manutenzione
            importoDare: 398.50,
            importoAvere: 0,
            codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
        },
        {
            riga: 3,
            codiceConto: '1880000300', // IVA
            importoDare: 119.21,
            importoAvere: 0,
            codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
        },
        {
            riga: 4,
            codiceConto: '201000048', // Fornitore
            importoDare: 0,
            importoAvere: 661.06,
            codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
        },
      ]
  });

  // Allocazione di esempio
  await prisma.importAllocazione.create({
      data: {
        importScritturaRigaContabileId: rigaContabileCosto1.id,
        commessaId: commessaServiziGenerali.id,
        importo: 143.35,
        suggerimentoAutomatico: true,
      }
  });
  console.log('Tabelle di staging popolate.');

  console.log('Seeding completo eseguito con successo.');
}

main()
  .catch((e) => {
    console.error('ERRORE DURANTE IL SEEDING:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 