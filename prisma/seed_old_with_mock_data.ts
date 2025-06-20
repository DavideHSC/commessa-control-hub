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
      fields: { create: [
        { nomeCampo: 'externalId', start: 4, length: 6, type: 'string' },             // [5-10] Codice causale
        { nomeCampo: 'nome', start: 10, length: 40, type: 'string' },                 // [11-50] Descrizione
        { nomeCampo: 'tipoMovimento', start: 50, length: 1, type: 'string' },         // [51-51] C=Contabile, I=Contabile/Iva
        { nomeCampo: 'tipoAggiornamento', start: 51, length: 1, type: 'string' },     // [52-52] I/P/F
        { nomeCampo: 'dataInizio', start: 52, length: 8, type: 'date' },              // [53-60] GGMMAAAA
        { nomeCampo: 'dataFine', start: 60, length: 8, type: 'date' },                // [61-68] GGMMAAAA
        { nomeCampo: 'tipoRegistroIva', start: 68, length: 1, type: 'string' },       // [69-69] A/C/V
        { nomeCampo: 'noteMovimento', start: 101, length: 60, type: 'string' }        // [102-161]
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'condizioni_pagamento',
      modelName: 'CondizionePagamento',
      fields: { create: [
        { nomeCampo: 'externalId', start: 4, length: 8, type: 'string' },             // [5-12] Codice pagamento
        { nomeCampo: 'descrizione', start: 12, length: 40, type: 'string' },          // [13-52] Descrizione
        { nomeCampo: 'contoIncassoPagamento', start: 52, length: 10, type: 'string' }, // [53-62]
        { nomeCampo: 'suddivisione', start: 64, length: 1, type: 'string' },          // [65-65] D/T
        { nomeCampo: 'inizioScadenza', start: 65, length: 1, type: 'string' },        // [66-66] D/F/R/P/N
        { nomeCampo: 'numeroRate', start: 66, length: 2, type: 'number' }             // [67-68]
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'codici_iva',
      modelName: 'CodiceIva',
      fields: { create: [
        { nomeCampo: 'externalId', start: 4, length: 4, type: 'string' },             // [5-8] Codice IVA
        { nomeCampo: 'descrizione', start: 8, length: 40, type: 'string' },           // [9-48] Descrizione
        { nomeCampo: 'tipoCalcolo', start: 48, length: 1, type: 'string' },           // [49-49] N/O/A/I/S/T/E/V
        { nomeCampo: 'aliquota', start: 49, length: 6, type: 'number' },              // [50-55] 999.99
        { nomeCampo: 'indetraibilita', start: 55, length: 3, type: 'number' },        // [56-58] Percentuale
        { nomeCampo: 'note', start: 58, length: 40, type: 'string' },                 // [59-98]
        { nomeCampo: 'dataInizio', start: 98, length: 8, type: 'date' },              // [99-106] GGMMAAAA
        { nomeCampo: 'dataFine', start: 106, length: 8, type: 'date' }                // [107-114] GGMMAAAA
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'anagrafica_clifor',
      modelName: null,
      fields: { create: [
        { nomeCampo: 'externalId', start: 20, length: 12, type: 'string' },      // Posizione 21-32 del tracciato
        { nomeCampo: 'codiceFiscale', start: 32, length: 16, type: 'string' },   // Posizione 33-48 del tracciato
        { nomeCampo: 'tipo', start: 49, length: 1, type: 'string' },             // Posizione 50-50 del tracciato (C/F/E)
        { nomeCampo: 'piva', start: 82, length: 11, type: 'string' },             // Posizione 83-93 del tracciato
        { nomeCampo: 'nome', start: 94, length: 60, type: 'string' }              // Posizione 95-154 del tracciato
      ] },
    }
  });

  await prisma.importTemplate.create({
    data: {
      nome: 'piano_dei_conti',
      modelName: 'Conto',
      fields: { create: [
        { nomeCampo: 'livello', start: 4, length: 1, type: 'string' },                // [5-5] 1=Mastro, 2=Conto, 3=Sottoconto
        { nomeCampo: 'codice', start: 5, length: 10, type: 'string' },                // [6-15] MMCCSSSSSS
        { nomeCampo: 'nome', start: 15, length: 60, type: 'string' },                 // [16-75] Descrizione
        { nomeCampo: 'tipo', start: 75, length: 1, type: 'string' },                  // [76-76] P/E/O/C/F
        { nomeCampo: 'sigla', start: 76, length: 12, type: 'string' },                // [77-88]
        { nomeCampo: 'controlloSegno', start: 88, length: 1, type: 'string' },        // [89-89] A=Avere, D=Dare
        { nomeCampo: 'gruppo', start: 256, length: 1, type: 'string' }                // [257-257] A/C/N/P/R/V/Z
      ] },
    }
  });

  const scrittureContabiliFields: any = [
    // === PNTESTA.TXT (445 bytes) ===
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'externalId', start: 20, length: 12, type: 'string' },              // [21-32]
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'causaleId', start: 39, length: 6, type: 'string' },                // [40-45]
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataRegistrazione', start: 85, length: 8, type: 'date' },          // [86-93] GGMMAAAA
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'clienteFornitoreCodiceFiscale', start: 99, length: 16, type: 'string' }, // [100-115]
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataDocumento', start: 128, length: 8, type: 'date' },             // [129-136] GGMMAAAA
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'numeroDocumento', start: 136, length: 12, type: 'string' },        // [137-148]
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'totaleDocumento', start: 172, length: 12, type: 'number' },        // [173-184]
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'noteMovimento', start: 192, length: 60, type: 'string' },          // [193-252]

    // === PNRIGCON.TXT (312 bytes) ===
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },              // [4-15]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'progressivoRigo', start: 15, length: 3, type: 'number' },         // [16-18]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'tipoConto', start: 18, length: 1, type: 'string' },               // [19-19] C/F/spazio
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'clienteFornitoreCodiceFiscale', start: 19, length: 16, type: 'string' }, // [20-35]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'conto', start: 48, length: 10, type: 'string' },                  // [49-58]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoDare', start: 58, length: 12, type: 'number' },            // [59-70]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoAvere', start: 70, length: 12, type: 'number' },           // [71-82]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'note', start: 82, length: 60, type: 'string' },                   // [83-142]
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'movimentiAnalitici', start: 247, length: 1, type: 'string' },     // [248-248] 0/1

    // === PNRIGIVA.TXT (173 bytes) ===
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },              // [4-15]
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codiceIva', start: 15, length: 4, type: 'string' },               // [16-19]
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'contropartita', start: 19, length: 10, type: 'string' },          // [20-29]
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imponibile', start: 29, length: 12, type: 'number' },             // [30-41]
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imposta', start: 41, length: 12, type: 'number' },                // [42-53]
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'importoLordo', start: 89, length: 12, type: 'number' },           // [90-101]
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'note', start: 101, length: 60, type: 'string' },                  // [102-161]

    // === MOVANAC.TXT (34 bytes) ===
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },               // [4-15]
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'progressivoRigoContabile', start: 15, length: 3, type: 'number' }, // [16-18]
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'centroDiCosto', start: 18, length: 4, type: 'string' },            // [19-22]
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'parametro', start: 22, length: 12, type: 'number' }                // [23-34]
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
        { sezione: SezioneScrittura.Avere, contoId: null, contoRiferimentoDatiPrimari: 'fornitoreId', formulaImporto: FormulaImporto.totale } 
      ],
    },
    {
      id: 'FATT_VEN',
      nome: 'Fattura Vendita',
      descrizione: 'Registrazione fattura di vendita',
      datiPrimari: [ { fieldId: 'clienteId', label: 'Cliente', tipo: TipoCampo.select, riferimentoConto: TipoConto.Cliente }, { fieldId: 'totaleDocumento', label: 'Totale Fattura', tipo: TipoCampo.number } ],
      templateScrittura: [ 
        { sezione: SezioneScrittura.Dare, contoId: null, contoRiferimentoDatiPrimari: 'clienteId', formulaImporto: FormulaImporto.totale }, 
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