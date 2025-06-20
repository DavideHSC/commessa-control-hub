// prisma/seed.ts (versione finale e robusta)

import { PrismaClient, TipoConto, TipoCampo, SezioneScrittura, FormulaImporto } from '@prisma/client';

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
      nome: 'causali',
      modelName: 'CausaleContabile',
      fields: { create: [ { nomeCampo: 'id', start: 0, length: 8 }, { nomeCampo: 'externalId', start: 0, length: 8 }, { nomeCampo: 'descrizione', start: 8, length: 40 } ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'condizioni_pagamento',
      modelName: 'CondizionePagamento',
      fields: { create: [ { nomeCampo: 'id', start: 0, length: 8 }, { nomeCampo: 'externalId', start: 0, length: 8 }, { nomeCampo: 'descrizione', start: 8, length: 40 } ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'codici_iva',
      modelName: 'CodiceIva',
      fields: { create: [ { nomeCampo: 'id', start: 0, length: 5 }, { nomeCampo: 'externalId', start: 0, length: 5 }, { nomeCampo: 'descrizione', start: 5, length: 45 } ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'clienti_fornitori',
      modelName: 'Cliente', // Gestirà entrambi tramite logica custom
      fields: { create: [ { nomeCampo: 'externalId', start: 11, length: 11 }, { nomeCampo: 'codiceFiscale', start: 22, length: 16 }, { nomeCampo: 'tipo', start: 38, length: 1 }, { nomeCampo: 'piva', start: 50, length: 16 }, { nomeCampo: 'nome', start: 66, length: 50 } ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'anagrafica_clifor',
      modelName: 'Cliente', // Gestirà entrambi tramite logica custom
      fields: { create: [ 
        { nomeCampo: 'id_interno', start: 16, length: 12 }, 
        { nomeCampo: 'codice_fiscale_piva', start: 28, length: 16 }, 
        { nomeCampo: 'tipo_soggetto', start: 44, length: 1 }, 
        { nomeCampo: 'conto_contabile', start: 57, length: 10 }, 
        { nomeCampo: 'codice_esterno', start: 67, length: 12 }, 
        { nomeCampo: 'codice_numerico', start: 79, length: 12 }, 
        { nomeCampo: 'ragione_sociale', start: 91, length: 50 }, 
        { nomeCampo: 'cognome', start: 141, length: 20 }, 
        { nomeCampo: 'nome', start: 161, length: 20 }, 
        { nomeCampo: 'sesso', start: 181, length: 1 }, 
        { nomeCampo: 'data_nascita', start: 182, length: 8, type: 'date' }, 
        { nomeCampo: 'comune_nascita', start: 190, length: 4 }, 
        { nomeCampo: 'cap', start: 194, length: 8 }, 
        { nomeCampo: 'indirizzo', start: 202, length: 50 } 
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'piano_dei_conti',
      modelName: 'Conto',
      fields: { create: [ 
        { nomeCampo: 'id', start: 45, length: 10 }, 
        { nomeCampo: 'nome', start: 91, length: 50 }, 
        { nomeCampo: 'tipo_soggetto', start: 44, length: 1 } // Usato per filtrare
      ] },
    }
  });

  const scrittureContabiliFields: any = [
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'id_registrazione', start: 20, length: 12 },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'data_registrazione', start: 33, length: 8, type: 'date' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'codice_causale', start: 41, length: 6 },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'data_documento', start: 56, length: 8, type: 'date' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'id_cliente_fornitore', start: 64, length: 16 },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'numero_documento', start: 96, length: 16 },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'id_registrazione_riga', start: 0, length: 15 },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'codice_conto', start: 32, length: 16 },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importo_dare', start: 48, length: 16, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importo_avere', start: 64, length: 16, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'descrizione_riga', start: 144, length: 81 },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'id_registrazione_riga', start: 0, length: 15 },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codice_iva', start: 15, length: 5 },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imponibile', start: 36, length: 16, type: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imposta', start: 52, length: 16, type: 'number' },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'id_registrazione_riga', start: 0, length: 15 },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'codice_commessa', start: 15, length: 12 },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'codice_voce_analitica', start: 27, length: 12 },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'importo_allocato', start: 39, length: 16, type: 'number' },
  ];

  await prisma.importTemplate.create({
    data: {
      nome: 'scritture_contabili',
      modelName: null,
      fields: { create: scrittureContabiliFields },
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
  const causaliContabili = [
    {
      id: 'FATT_ACQ',
      nome: 'Fattura Acquisto',
      descrizione: 'Registrazione fattura di acquisto',
      datiPrimari: [ { fieldId: 'fornitoreId', label: 'Fornitore', tipo: TipoCampo.select, riferimentoConto: TipoConto.Fornitore }, { fieldId: 'totaleDocumento', label: 'Totale Fattura', tipo: TipoCampo.number } ],
      templateScrittura: [ 
        { sezione: SezioneScrittura.Dare, contoId: '60100001', formulaImporto: FormulaImporto.imponibile }, 
        { sezione: SezioneScrittura.Dare, contoId: '45.01.001', formulaImporto: FormulaImporto.iva }, 
        { sezione: SezioneScrittura.Avere, contoRiferimentoDatiPrimari: 'fornitoreId', formulaImporto: FormulaImporto.totale } 
      ],
    },
    {
      id: 'FATT_VEN',
      nome: 'Fattura Vendita',
      descrizione: 'Registrazione fattura di vendita',
      datiPrimari: [ { fieldId: 'clienteId', label: 'Cliente', tipo: TipoCampo.select, riferimentoConto: TipoConto.Cliente }, { fieldId: 'totaleDocumento', label: 'Totale Fattura', tipo: TipoCampo.number } ],
      templateScrittura: [ 
        { sezione: SezioneScrittura.Dare, contoRiferimentoDatiPrimari: 'clienteId', formulaImporto: FormulaImporto.totale }, 
        { sezione: SezioneScrittura.Avere, contoId: '45.02.001', formulaImporto: FormulaImporto.iva }, 
        { sezione: SezioneScrittura.Avere, contoId: '5510001122', formulaImporto: FormulaImporto.imponibile } 
      ],
    },
    { id: 'MANUALE', nome: 'Manuale', descrizione: 'Registrazione manuale' },
  ];

  for (const causale of causaliContabili) {
    const { datiPrimari, templateScrittura, ...causaleData } = causale;
    await prisma.causaleContabile.upsert({
      where: { id: causaleData.id },
      update: {
        ...causaleData,
        datiPrimari: datiPrimari ? { deleteMany: {}, create: datiPrimari } : undefined,
        templateScrittura: templateScrittura ? { deleteMany: {}, create: templateScrittura } : undefined,
      },
      create: {
        ...causaleData,
        datiPrimari: datiPrimari ? { create: datiPrimari } : undefined,
        templateScrittura: templateScrittura ? { create: templateScrittura } : undefined,
      },
    });
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