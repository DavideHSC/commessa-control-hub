// prisma/seed.ts (versione finale e robusta - CORRETTA)

import { PrismaClient, TipoConto, TipoCampo, SezioneScrittura, FormulaImporto, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_CUSTOMER_ID = 'system_customer_01';
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

async function main() {
  console.log('Inizio seeding...');

  // 1. Pulisce i dati esistenti per evitare duplicati (ordine importante!)
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

  // 1. Crea o aggiorna il cliente di sistema
  await prisma.cliente.upsert({
    where: { id: SYSTEM_CUSTOMER_ID },
    update: {},
    create: {
      id: SYSTEM_CUSTOMER_ID,
      externalId: 'SYS-CUST',
      nome: 'Cliente di Sistema (per importazioni)',
    }
  });

  await prisma.fornitore.upsert({
    where: { id: SYSTEM_SUPPLIER_ID },
    update: {},
    create: {
      id: SYSTEM_SUPPLIER_ID,
      externalId: 'SYS-SUPP',
      nome: 'Fornitore di Sistema (per importazioni)',
    }
  });

  console.log('Cliente e Fornitore di sistema assicurati.');

  // --- TEMPLATE DI IMPORTAZIONE ---
  console.log('Seeding Template di Importazione...');
  
  await prisma.importTemplate.create({
    data: {
      name: 'causali',
      modelName: 'CausaleContabile',
      fieldDefinitions: { create: [
        { fieldName: 'externalId', start: 4, end: 9, length: 6 },
        { fieldName: 'nome', start: 10, end: 49, length: 40 },
        { fieldName: 'tipoMovimento', start: 50, end: 50, length: 1 },
        { fieldName: 'tipoAggiornamento', start: 51, end: 51, length: 1 },
        { fieldName: 'dataInizio', start: 52, end: 59, length: 8 },
        { fieldName: 'dataFine', start: 60, end: 67, length: 8 },
        { fieldName: 'tipoRegistroIva', start: 68, end: 68, length: 1 },
        { fieldName: 'noteMovimento', start: 101, end: 160, length: 60 }
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      name: 'condizioni_pagamento',
      modelName: 'CondizionePagamento',
      fieldDefinitions: { create: [
        { fieldName: 'externalId', start: 4, end: 11, length: 8 },
        { fieldName: 'descrizione', start: 12, end: 51, length: 40 },
        { fieldName: 'contoIncassoPagamento', start: 52, end: 61, length: 10 },
        { fieldName: 'suddivisione', start: 64, end: 64, length: 1 },
        { fieldName: 'inizioScadenza', start: 65, end: 65, length: 1 },
        { fieldName: 'numeroRate', start: 66, end: 67, length: 2 }
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      name: 'codici_iva',
      modelName: 'CodiceIva',
      fieldDefinitions: { create: [
        { fieldName: 'externalId', start: 4, end: 7, length: 4 },
        { fieldName: 'descrizione', start: 8, end: 47, length: 40 },
        { fieldName: 'tipoCalcolo', start: 48, end: 48, length: 1 },
        { fieldName: 'aliquota', start: 49, end: 54, length: 6 },
        { fieldName: 'indetraibilita', start: 55, end: 57, length: 3 },
        { fieldName: 'note', start: 58, end: 97, length: 40 },
        { fieldName: 'dataInizio', start: 98, end: 105, length: 8 },
        { fieldName: 'dataFine', start: 106, end: 113, length: 8 }
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      name: 'anagrafica_clifor',
      modelName: null,
      fieldDefinitions: { create: [
        { fieldName: 'externalId', start: 20, end: 31, length: 12 },
        { fieldName: 'codiceFiscale', start: 32, end: 47, length: 16 },
        { fieldName: 'tipo', start: 49, end: 49, length: 1 },
        { fieldName: 'piva', start: 82, end: 92, length: 11 },
        { fieldName: 'nome', start: 94, end: 153, length: 60 }
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      name: 'piano_dei_conti',
      modelName: 'Conto',
      fieldDefinitions: { create: [
        { fieldName: 'livello', start: 4, end: 4, length: 1 },
        { fieldName: 'codice', start: 5, end: 14, length: 10 },
        { fieldName: 'nome', start: 15, end: 74, length: 60 },
        { fieldName: 'tipo', start: 75, end: 75, length: 1 },
        { fieldName: 'sigla', start: 76, end: 87, length: 12 },
        { fieldName: 'controlloSegno', start: 88, end: 88, length: 1 },
        { fieldName: 'gruppo', start: 256, end: 256, length: 1 }
      ] },
    }
  });

  const scrittureContabiliFields: Prisma.FieldDefinitionCreateWithoutTemplateInput[] = [
    // === PNTESTA.TXT (445 bytes) ===
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'externalId', start: 20, end: 31, length: 12 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'causaleId', start: 39, end: 44, length: 6 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'dataRegistrazione', start: 85, end: 92, length: 8 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'clienteFornitoreCodiceFiscale', start: 99, end: 114, length: 16 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'dataDocumento', start: 128, end: 135, length: 8 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'numeroDocumento', start: 136, end: 147, length: 12 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'totaleDocumento', start: 172, end: 183, length: 12 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'noteMovimento', start: 192, end: 251, length: 60 },

    // === PNRIGCON.TXT (312 bytes) ===
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'externalId', start: 3, end: 14, length: 12 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'progressivoRigo', start: 15, end: 17, length: 3 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'tipoConto', start: 18, end: 18, length: 1 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'clienteFornitoreCodiceFiscale', start: 19, end: 34, length: 16 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'conto', start: 48, end: 57, length: 10 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'importoDare', start: 58, end: 69, length: 12 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'importoAvere', start: 70, end: 81, length: 12 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'note', start: 82, end: 141, length: 60 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'movimentiAnalitici', start: 247, end: 247, length: 1 },

    // === PNRIGIVA.TXT (173 bytes) ===
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'externalId', start: 3, end: 14, length: 12 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'codiceIva', start: 15, end: 18, length: 4 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'contropartita', start: 19, end: 28, length: 10 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imponibile', start: 29, end: 40, length: 12 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imposta', start: 41, end: 52, length: 12 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'importoLordo', start: 89, end: 100, length: 12 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'note', start: 101, end: 160, length: 60 },

    // === MOVANAC.TXT (34 bytes) ===
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'externalId', start: 3, end: 14, length: 12 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'progressivoRigoContabile', start: 15, end: 17, length: 3 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'centroDiCosto', start: 18, end: 21, length: 4 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'parametro', start: 22, end: 33, length: 12 }
  ];

  await prisma.importTemplate.create({
    data: {
      name: 'scritture_contabili',
      modelName: null,
      fieldDefinitions: { create: scrittureContabiliFields },
    },
  });

  // --- ANAGRAFICHE DI BASE ---
  console.log('Seeding Clienti e Fornitori...');
  const clienteDefault = await prisma.cliente.create({
    data: { id: 'cl_rossi', nome: 'Mario Rossi SRL', piva: '01234567890', externalId: 'CLI-001' },
  });

  await prisma.fornitore.create({
    data: { id: 'for_bianchi', nome: 'Fratelli Bianchi SPA', piva: '09876543210', externalId: 'FOR-001' },
  });

  await prisma.fornitore.create({
    data: { id: 'for_carburanti', nome: 'Carburanti Express SRL', piva: '11223344556', externalId: 'FOR-002' },
  });

  // --- VOCI ANALITICHE ---
  console.log('Seeding Voci Analitiche...');
  const vociAnalitiche = [
    { id: '1', nome: 'Ricavi Vendite', descrizione: 'Ricavi derivanti dalla vendita di prodotti/servizi' },
    { id: '2', nome: 'Gestione Automezzi', descrizione: 'Costi per la manutenzione e gestione della flotta' },
    { id: '3', nome: 'Gestione Attrezzature' },
    { id: '4', nome: 'Sacchi e Bidoni' },
    { id: '5', nome: 'Servizi Esternalizzati' },
    { id: '6', nome: 'Pulizia Strade e Diserbo' },
    { id: '7', nome: 'Gestione Aree Operative' },
    { id: '8', nome: 'Amm. Automezzi' },
    { id: '9', nome: 'Amm. Attrezzature' },
    { id: '10', nome: 'Locazione Sedi e Aree' },
    { id: '11', nome: 'Trasporti Esternalizzati' },
    { id: '12', nome: 'Spese Generali e Amministrative' },
    { id: '13', nome: 'Selezione e Trattamento Rifiuti' },
    { id: '14', nome: 'Conferimento Organico e Sfalci' },
    { id: '15', nome: 'Fioriture e Verde Pubblico' },
  ];
  for (const voce of vociAnalitiche) {
    await prisma.voceAnalitica.upsert({ where: { id: voce.id }, update: voce, create: voce });
  }

  // --- PIANO DEI CONTI ---
  console.log('Seeding Piano dei Conti...');
  const pianoDeiConti = [
    // Costi
    { id: '60100001', codice: '60100001', nome: 'MERCE C/ACQUISTI', tipo: TipoConto.Costo, richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '12' },
    { id: '6005000150', codice: '6005000150', nome: 'ACQUISTI MATERIALE DI CONSUMO', tipo: TipoConto.Costo, richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '12' },
    { id: '6005000350', codice: '6005000350', nome: 'ACQUISTO FIORI E PIANTE', tipo: TipoConto.Costo, richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '15' },
    { id: '60100002', codice: '60100002', nome: 'ACQUISTI PRESTAZIONI DI SERVIZI', tipo: TipoConto.Costo, richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '5' },
    // Ricavi
    { id: '5510001122', codice: '5510001122', nome: 'RICAVI DA CONVENZIONE', tipo: TipoConto.Ricavo, richiedeVoceAnalitica: false },
    { id: '5510001121', codice: '5510001121', nome: 'RICAVI DA RACCOLTA DIFFERENZIATA', tipo: TipoConto.Ricavo, richiedeVoceAnalitica: true },
    // Patrimoniali
    { id: '45.01.001', codice: '45.01.001', nome: 'IVA NS/CREDITO', tipo: TipoConto.Patrimoniale, richiedeVoceAnalitica: false },
    { id: '45.02.001', codice: '45.02.001', nome: 'IVA NS/DEBITO', tipo: TipoConto.Patrimoniale, richiedeVoceAnalitica: false },
    { id: '10.01.001', codice: '10.01.001', nome: 'BANCA INTESA SANPAOLO', tipo: TipoConto.Patrimoniale, richiedeVoceAnalitica: false },
  ];
  for (const contoData of pianoDeiConti) {
    await prisma.conto.upsert({ 
        where: { id: contoData.id }, 
        update: { ...contoData, vociAnaliticheAbilitateIds: [], contropartiteSuggeriteIds: [] }, 
        create: { ...contoData, vociAnaliticheAbilitateIds: [], contropartiteSuggeriteIds: [] } 
    });
  }

  // --- CAUSALI CONTABILI ---
  console.log('Seeding Causali Contabili...');

  // Prima crea le causali base
  const causaliBase = [
    {
      id: 'FATT_ACQ',
      nome: 'Fattura Acquisto',
      descrizione: 'Registrazione fattura di acquisto da fornitore',
    },
    {
      id: 'FATT_VEND',
      nome: 'Fattura Vendita',
      descrizione: 'Registrazione fattura di vendita a cliente',
    },
  ];

  for (const causaleData of causaliBase) {
    await prisma.causaleContabile.upsert({
      where: { id: causaleData.id },
      update: causaleData,
      create: causaleData,
    });
  }

  // Poi aggiungi i dati primari separatamente
  const datiPrimariFattAcq = [
    { fieldId: 'fornitoreId', label: 'Fornitore', tipo: TipoCampo.select, riferimentoConto: 'Fornitore', causaleContabileId: 'FATT_ACQ' },
    { fieldId: 'totaleDocumento', label: 'Totale Documento', tipo: TipoCampo.number, causaleContabileId: 'FATT_ACQ' },
    { fieldId: 'aliquotaIva', label: 'Aliquota IVA', tipo: TipoCampo.number, causaleContabileId: 'FATT_ACQ' },
  ];

  const datiPrimariFattVend = [
    { fieldId: 'clienteId', label: 'Cliente', tipo: TipoCampo.select, riferimentoConto: 'Cliente', causaleContabileId: 'FATT_VEND' },
    { fieldId: 'totaleDocumento', label: 'Totale Documento', tipo: TipoCampo.number, causaleContabileId: 'FATT_VEND' },
    { fieldId: 'aliquotaIva', label: 'Aliquota IVA', tipo: TipoCampo.number, causaleContabileId: 'FATT_VEND' },
  ];

  // Cancella dati primari esistenti e crea i nuovi
  await prisma.campoDatiPrimari.deleteMany({ where: { causaleContabileId: 'FATT_ACQ' } });
  await prisma.campoDatiPrimari.deleteMany({ where: { causaleContabileId: 'FATT_VEND' } });

  for (const campo of datiPrimariFattAcq) {
    await prisma.campoDatiPrimari.create({ data: campo });
  }

  for (const campo of datiPrimariFattVend) {
    await prisma.campoDatiPrimari.create({ data: campo });
  }

  // Template scrittura per FATT_ACQ
  const templateFattAcq = [
    { sezione: SezioneScrittura.Dare, contoId: '60100002', formulaImporto: FormulaImporto.imponibile, causaleContabileId: 'FATT_ACQ' },
    { sezione: SezioneScrittura.Dare, contoId: '45.01.001', formulaImporto: FormulaImporto.iva, causaleContabileId: 'FATT_ACQ' },
    { sezione: SezioneScrittura.Avere, contoId: 'fornitoreId', formulaImporto: FormulaImporto.totale, causaleContabileId: 'FATT_ACQ' },
  ];

  // Template scrittura per FATT_VEND
  const templateFattVend = [
    { sezione: SezioneScrittura.Dare, contoId: 'clienteId', formulaImporto: FormulaImporto.totale, causaleContabileId: 'FATT_VEND' },
    { sezione: SezioneScrittura.Avere, contoId: '5510001122', formulaImporto: FormulaImporto.imponibile, causaleContabileId: 'FATT_VEND' },
    { sezione: SezioneScrittura.Avere, contoId: '45.02.001', formulaImporto: FormulaImporto.iva, causaleContabileId: 'FATT_VEND' },
  ];

  // Cancella template esistenti e crea i nuovi
  await prisma.voceTemplateScrittura.deleteMany({ where: { causaleContabileId: 'FATT_ACQ' } });
  await prisma.voceTemplateScrittura.deleteMany({ where: { causaleContabileId: 'FATT_VEND' } });

  for (const voce of templateFattAcq) {
    await prisma.voceTemplateScrittura.create({ data: voce });
  }

  for (const voce of templateFattVend) {
    await prisma.voceTemplateScrittura.create({ data: voce });
  }

  // --- COMMESSE E BUDGET ---
  console.log('Seeding Commesse e Budget...');
  const commesse = [
    { id: 'SORRENTO_2025', nome: 'Comune di Sorrento (2025)', clienteId: clienteDefault.id, budget: [ { voceAnaliticaId: '1', importo: 2274867 }, { voceAnaliticaId: '2', importo: 358625 }, { voceAnaliticaId: '12', importo: 307000 }] },
    { id: 'PIANO_SORR_2025', nome: 'Comune di Piano di Sorrento (2025)', clienteId: clienteDefault.id, budget: [ { voceAnaliticaId: '1', importo: 1000000 }, { voceAnaliticaId: '2', importo: 150000 }] },
  ];

  for (const commessa of commesse) {
    const { budget, ...commessaData } = commessa;
    const createdCommessa = await prisma.commessa.upsert({
      where: { id: commessaData.id },
      update: commessaData,
      create: commessaData,
    });
    if (budget && Array.isArray(budget)) {
      await prisma.budgetVoce.deleteMany({ where: { commessaId: createdCommessa.id }});
      for (const voce of budget) {
        if (voce.voceAnaliticaId && voce.importo) {
          await prisma.budgetVoce.create({
            data: { importo: voce.importo, commessaId: createdCommessa.id, voceAnaliticaId: voce.voceAnaliticaId },
          });
        }
      }
    }
  }

  console.log('Seeding completato.');
}

main()
  .catch((e) => {
    console.error('ERRORE DURANTE IL SEEDING:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });