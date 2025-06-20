// prisma/seed_clean.ts - Solo dati essenziali per il funzionamento

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_CUSTOMER_ID = 'system_customer_01';
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

async function main() {
  console.log('Inizio seeding (solo dati essenziali)...');

  // 1. Pulisce i dati esistenti
  console.log('Pulizia tabelle...');
  await prisma.allocazione.deleteMany({});
  await prisma.rigaScrittura.deleteMany({});
  await prisma.scritturaContabile.deleteMany({});
  await prisma.budgetVoce.deleteMany({});
  await prisma.commessa.deleteMany({});
  await prisma.voceTemplateScrittura.deleteMany({});
  await prisma.campoDatiPrimari.deleteMany({});
  await prisma.causaleContabile.deleteMany({});
  await prisma.conto.deleteMany({});
  await prisma.voceAnalitica.deleteMany({});
  await prisma.fornitore.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.importTemplate.deleteMany({});
  await prisma.fieldDefinition.deleteMany({});
  await prisma.condizionePagamento.deleteMany({});
  await prisma.codiceIva.deleteMany({});

  // 2. SOLO Cliente e Fornitore di sistema (necessari per importazioni)
  await prisma.cliente.create({
    data: {
      id: SYSTEM_CUSTOMER_ID,
      externalId: 'SYS-CUST',
      nome: 'Cliente di Sistema (per importazioni)',
    }
  });

  await prisma.fornitore.create({
    data: {
      id: SYSTEM_SUPPLIER_ID,
      externalId: 'SYS-SUPP',
      nome: 'Fornitore di Sistema (per importazioni)',
    }
  });

  console.log('Cliente e Fornitore di sistema creati.');

  // 3. SOLO Template di Importazione (essenziali per funzionamento)
  console.log('Creazione Template di Importazione...');
  
  // Template Causali
  await prisma.importTemplate.create({
    data: {
      nome: 'causali',
      modelName: 'CausaleContabile',
      fields: { create: [
        { nomeCampo: 'externalId', start: 4, length: 6, type: 'string' },
        { nomeCampo: 'nome', start: 10, length: 40, type: 'string' },
        { nomeCampo: 'tipoMovimento', start: 50, length: 1, type: 'string' },
        { nomeCampo: 'tipoAggiornamento', start: 51, length: 1, type: 'string' },
        { nomeCampo: 'dataInizio', start: 52, length: 8, type: 'date' },
        { nomeCampo: 'dataFine', start: 60, length: 8, type: 'date' },
        { nomeCampo: 'tipoRegistroIva', start: 68, length: 1, type: 'string' },
        { nomeCampo: 'noteMovimento', start: 101, length: 60, type: 'string' }
      ] },
    }
  });

  // Template Condizioni Pagamento
  await prisma.importTemplate.create({
    data: {
      nome: 'condizioni_pagamento',
      modelName: 'CondizionePagamento',
      fields: { create: [
        { nomeCampo: 'externalId', start: 4, length: 8, type: 'string' },
        { nomeCampo: 'descrizione', start: 12, length: 40, type: 'string' },
        { nomeCampo: 'contoIncassoPagamento', start: 52, length: 10, type: 'string' },
        { nomeCampo: 'suddivisione', start: 64, length: 1, type: 'string' },
        { nomeCampo: 'inizioScadenza', start: 65, length: 1, type: 'string' },
        { nomeCampo: 'numeroRate', start: 66, length: 2, type: 'number' }
      ] },
    }
  });

  // Template Codici IVA
  await prisma.importTemplate.create({
    data: {
      nome: 'codici_iva',
      modelName: 'CodiceIva',
      fields: { create: [
        { nomeCampo: 'externalId', start: 4, length: 4, type: 'string' },
        { nomeCampo: 'descrizione', start: 8, length: 40, type: 'string' },
        { nomeCampo: 'tipoCalcolo', start: 48, length: 1, type: 'string' },
        { nomeCampo: 'aliquota', start: 49, length: 6, type: 'number' },
        { nomeCampo: 'indetraibilita', start: 55, length: 3, type: 'number' },
        { nomeCampo: 'note', start: 58, length: 40, type: 'string' },
        { nomeCampo: 'dataInizio', start: 98, length: 8, type: 'date' },
        { nomeCampo: 'dataFine', start: 106, length: 8, type: 'date' }
      ] },
    }
  });

  // Template Anagrafica Clienti/Fornitori (CORRETTO)
  await prisma.importTemplate.create({
    data: {
      nome: 'anagrafica_clifor',
      modelName: null,
      fields: { create: [
        { nomeCampo: 'externalId', start: 20, length: 12, type: 'string' },
        { nomeCampo: 'codiceFiscale', start: 32, length: 16, type: 'string' },
        { nomeCampo: 'tipo', start: 49, length: 1, type: 'string' },
        { nomeCampo: 'piva', start: 82, length: 11, type: 'string' },
        { nomeCampo: 'nome', start: 94, length: 60, type: 'string' }
      ] },
    }
  });

  // Template Piano dei Conti
  await prisma.importTemplate.create({
    data: {
      nome: 'piano_dei_conti',
      modelName: 'Conto',
      fields: { create: [
        { nomeCampo: 'livello', start: 4, length: 1, type: 'string' },
        { nomeCampo: 'codice', start: 5, length: 10, type: 'string' },
        { nomeCampo: 'nome', start: 15, length: 60, type: 'string' },
        { nomeCampo: 'tipo', start: 75, length: 1, type: 'string' },
        { nomeCampo: 'sigla', start: 76, length: 12, type: 'string' },
        { nomeCampo: 'controlloSegno', start: 88, length: 1, type: 'string' },
        { nomeCampo: 'gruppo', start: 256, length: 1, type: 'string' }
      ] },
    }
  });

  // Template Scritture Contabili
  const scrittureContabiliFields: any = [
    // PNTESTA.TXT
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'externalId', start: 20, length: 12, type: 'string' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'causaleId', start: 39, length: 6, type: 'string' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataRegistrazione', start: 85, length: 8, type: 'date' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'clienteFornitoreCodiceFiscale', start: 99, length: 16, type: 'string' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataDocumento', start: 128, length: 8, type: 'date' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'numeroDocumento', start: 136, length: 12, type: 'string' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'totaleDocumento', start: 172, length: 12, type: 'number' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'noteMovimento', start: 192, length: 60, type: 'string' },

    // PNRIGCON.TXT
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'progressivoRigo', start: 15, length: 3, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'tipoConto', start: 18, length: 1, type: 'string' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'clienteFornitoreCodiceFiscale', start: 19, length: 16, type: 'string' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'conto', start: 48, length: 10, type: 'string' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoDare', start: 58, length: 12, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoAvere', start: 70, length: 12, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'note', start: 82, length: 60, type: 'string' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'movimentiAnalitici', start: 247, length: 1, type: 'string' },

    // PNRIGIVA.TXT
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codiceIva', start: 15, length: 4, type: 'string' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'contropartita', start: 19, length: 10, type: 'string' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imponibile', start: 29, length: 12, type: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imposta', start: 41, length: 12, type: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'importoLordo', start: 89, length: 12, type: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'note', start: 101, length: 60, type: 'string' },

    // MOVANAC.TXT
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'progressivoRigoContabile', start: 15, length: 3, type: 'number' },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'centroDiCosto', start: 18, length: 4, type: 'string' },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'parametro', start: 22, length: 12, type: 'number' }
  ];

  await prisma.importTemplate.create({
    data: {
      nome: 'scritture_contabili',
      modelName: null,
      fields: { create: scrittureContabiliFields },
    },
  });

  console.log('Template di importazione creati.');
  console.log('Seeding completato - Database pulito e pronto per importazioni reali.');
}

main()
  .catch((e) => {
    console.error('ERRORE DURANTE IL SEEDING:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 