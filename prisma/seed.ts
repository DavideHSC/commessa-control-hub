// prisma/seed_clean.ts - Solo dati essenziali per il funzionamento

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_CUSTOMER_ID = 'system_customer_01';
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

async function main() {
  console.log('Inizio seeding (dati cliente e di sistema)...');

  // 1. Pulisce SOLO le commesse per poterle ricreare in modo pulito.
  console.log('Pulizia tabella Commesse...');
  await prisma.commessa.deleteMany({});

  // 2. Cliente e Fornitore di sistema (necessari per importazioni) - UPSERT
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
  console.log('Cliente e Fornitore di sistema creati/verificati.');

  // 3. Prepara l'utilizzo del Cliente di Sistema per le commesse di default
  console.log('Preparazione commesse di default con Cliente di Sistema...');

  // Commesse Principali (Comuni) - con dati completi
  const dataInizioCommesse = new Date(); // Data corrente
  
  const commessaSorrento = await prisma.commessa.create({
    data: {
      id: 'sorrento',
      externalId: '1',
      nome: 'Comune di Sorrento',
      descrizione: 'Commessa principale per il comune di Sorrento',
      clienteId: SYSTEM_CUSTOMER_ID,
      dataInizio: dataInizioCommesse,
      stato: 'In Corso',
      priorita: 'media',
      isAttiva: true,
    },
  });

  const commessaMassa = await prisma.commessa.create({
    data: {
      id: 'massa_lubrense',
      externalId: '2',
      nome: 'Comune di Massa Lubrense',
      descrizione: 'Commessa principale per il comune di Massa Lubrense',
      clienteId: SYSTEM_CUSTOMER_ID,
      dataInizio: dataInizioCommesse,
      stato: 'In Corso',
      priorita: 'media',
      isAttiva: true,
    },
  });

  const commessaPiano = await prisma.commessa.create({
    data: {
      id: 'piano_di_sorrento',
      externalId: '3',
      nome: 'Comune di Piano di Sorrento',
      descrizione: 'Commessa principale per il comune di Piano di Sorrento',
      clienteId: SYSTEM_CUSTOMER_ID,
      dataInizio: dataInizioCommesse,
      stato: 'In Corso',
      priorita: 'media',
      isAttiva: true,
    },
  });
  console.log('Commesse principali (Comuni) create.');

  // Commesse Figlie (Attività / Centri di Costo) - con relazioni gerarchiche e dati completi
  await prisma.commessa.create({
    data: {
      id: "sorrento_igiene_urbana",
      externalId: "4",
      nome: "Igiene Urbana - Sorrento",
      descrizione: "Servizio di igiene urbana per Sorrento",
      clienteId: SYSTEM_CUSTOMER_ID,
      parentId: "sorrento",
      dataInizio: dataInizioCommesse,
      stato: 'In Corso',
      priorita: 'media',
      isAttiva: true,
    },
  });
  await prisma.commessa.create({
    data: {
      id: "massa_lubrense_igiene_urbana", 
      externalId: "5",
      nome: "Igiene Urbana - Massa Lubrense",
      descrizione: "Servizio di igiene urbana per Massa Lubrense",
      clienteId: SYSTEM_CUSTOMER_ID,
      parentId: "massa_lubrense",
      dataInizio: dataInizioCommesse,
      stato: 'In Corso',
      priorita: 'media',
      isAttiva: true,
    },
  });

  console.log('Commesse secondarie (Attività) create.');


  // 4. Voci Analitiche di base
  console.log('Creazione Voci Analitiche di base...');
  await prisma.voceAnalitica.deleteMany({}); // Pulisce prima di ricreare
  await prisma.voceAnalitica.createMany({
    data: [
      // Voci di Costo
      { nome: 'Materiale di Consumo', tipo: 'Costo' },
      { nome: 'Carburanti e Lubrificanti', tipo: 'Costo' },
      { nome: 'Utenze', tipo: 'Costo' },
      { nome: 'Lavorazioni Esterne', tipo: 'Costo' },
      { nome: 'Spese Generali / di Struttura', tipo: 'Costo' },
      { nome: 'Pulizie di Cantiere', tipo: 'Costo' },
      { nome: 'Oneri e Spese Accessorie', tipo: 'Costo' },
      { nome: 'Smaltimento Rifiuti Speciali', tipo: 'Costo' },
      { nome: 'Manutenzione Mezzi', tipo: 'Costo' },
      { nome: 'Consulenze Tecniche/Legali', tipo: 'Costo' },
      { nome: 'Servizi Generici di Cantiere', tipo: 'Costo' },
      { nome: 'Manodopera Diretta', tipo: 'Costo' },
      { nome: 'Oneri su Manodopera', tipo: 'Costo' },
      
      // Voci di Ricavo
      { nome: 'Ricavi da Prestazioni Contrattuali', tipo: 'Ricavo' },
      { nome: 'Rettifiche Negative su Ricavi (NC)', tipo: 'Ricavo' },
      { nome: 'Ricavi Accessori', tipo: 'Ricavo' },
    ],
    skipDuplicates: true,
  });
  console.log('Voci Analitiche di base create.');

  // 5. Budget Realistici per Commesse
  console.log('Creazione Budget per Commesse...');
  
  // Prima elimina budget esistenti per ricreazione pulita
  await prisma.budgetVoce.deleteMany({});
  
  // Recupera le voci analitiche per creare budget
  const vociAnalitiche = await prisma.voceAnalitica.findMany();
  const vociCosto = vociAnalitiche.filter(v => v.tipo === 'Costo');
  const vociRicavo = vociAnalitiche.filter(v => v.tipo === 'Ricavo');
  
  // COMMESSE PADRE (MASTRI) - Budget Complessivi Alti
  
  // Sorrento - Budget: €2,500,000 (Comune grande)
  await prisma.budgetVoce.createMany({
    data: [
      // Ricavi
      { commessaId: 'sorrento', voceAnaliticaId: vociRicavo[0].id, importo: 2800000 }, // Prestazioni Contrattuali
      { commessaId: 'sorrento', voceAnaliticaId: vociRicavo[2].id, importo: 50000 },   // Ricavi Accessori
      // Costi principali
      { commessaId: 'sorrento', voceAnaliticaId: vociCosto[11].id, importo: 1200000 }, // Manodopera Diretta
      { commessaId: 'sorrento', voceAnaliticaId: vociCosto[12].id, importo: 400000 },  // Oneri Manodopera
      { commessaId: 'sorrento', voceAnaliticaId: vociCosto[1].id, importo: 180000 },   // Carburanti
      { commessaId: 'sorrento', voceAnaliticaId: vociCosto[8].id, importo: 150000 },   // Manutenzione Mezzi
      { commessaId: 'sorrento', voceAnaliticaId: vociCosto[4].id, importo: 280000 },   // Spese Generali
    ]
  });
  
  // Massa Lubrense - Budget: €1,800,000 (Comune medio)
  await prisma.budgetVoce.createMany({
    data: [
      // Ricavi
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociRicavo[0].id, importo: 2000000 },
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociRicavo[2].id, importo: 30000 },
      // Costi principali
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociCosto[11].id, importo: 850000 },
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociCosto[12].id, importo: 280000 },
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociCosto[1].id, importo: 120000 },
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociCosto[8].id, importo: 100000 },
      { commessaId: 'massa_lubrense', voceAnaliticaId: vociCosto[4].id, importo: 200000 },
    ]
  });
  
  // Piano di Sorrento - Budget: €1,200,000 (Comune piccolo)
  await prisma.budgetVoce.createMany({
    data: [
      // Ricavi
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociRicavo[0].id, importo: 1350000 },
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociRicavo[2].id, importo: 20000 },
      // Costi principali
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociCosto[11].id, importo: 580000 },
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociCosto[12].id, importo: 190000 },
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociCosto[1].id, importo: 80000 },
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociCosto[8].id, importo: 70000 },
      { commessaId: 'piano_di_sorrento', voceAnaliticaId: vociCosto[4].id, importo: 130000 },
    ]
  });
  
  // SOTTO-COMMESSE (SOTTOCONTI) - Budget Specifici Dettagliati
  
  // Sorrento - Igiene Urbana (Sottoconto specifico)
  await prisma.budgetVoce.createMany({
    data: [
      // Budget più dettagliato per analisi specifica
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[11].id, importo: 450000 }, // Manodopera Diretta
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[12].id, importo: 150000 }, // Oneri Manodopera  
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[1].id, importo: 95000 },   // Carburanti (alto per mezzi)
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[8].id, importo: 75000 },   // Manutenzione Mezzi
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[7].id, importo: 45000 },   // Smaltimento Rifiuti
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[0].id, importo: 25000 },   // Materiale Consumo
      { commessaId: 'sorrento_igiene_urbana', voceAnaliticaId: vociCosto[2].id, importo: 18000 },   // Utenze
    ]
  });
  
  // Massa Lubrense - Igiene Urbana (Sottoconto specifico)
  await prisma.budgetVoce.createMany({
    data: [
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[11].id, importo: 320000 },
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[12].id, importo: 105000 },
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[1].id, importo: 65000 },
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[8].id, importo: 50000 },
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[7].id, importo: 30000 },
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[0].id, importo: 15000 },
      { commessaId: 'massa_lubrense_igiene_urbana', voceAnaliticaId: vociCosto[2].id, importo: 12000 },
    ]
  });
  
  console.log('Budget per Commesse creati.');


  // 6. Template di Importazione (essenziali per funzionamento) - UPSERT
  console.log('Creazione/Aggiornamento Template di Importazione...');
  
  // Template Causali - Prima elimina quello esistente
  const existingCausaliTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'causali' },
    include: { fieldDefinitions: true }
  });
  
  if (existingCausaliTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingCausaliTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingCausaliTemplate.id }
    });
  }
  
  await prisma.importTemplate.create({
    data: {
      name: 'causali',
      modelName: 'CausaleContabile',
      fieldDefinitions: { create: [
        // Campi principali (bibbia parser_causali.py) - POSIZIONI CORRETTE Python → TypeScript
        { fieldName: 'codiceCausale', start: 5, length: 6, end: 10 },                          // line[4:10] → start 5
        { fieldName: 'descrizione', start: 11, length: 40, end: 50 },                         // line[10:50] → start 11
        { fieldName: 'tipoMovimento', start: 51, length: 1, end: 51 },                        // line[50:51] → start 51
        { fieldName: 'tipoAggiornamento', start: 52, length: 1, end: 52 },                    // line[51:52] → start 52
        { fieldName: 'dataInizio', start: 53, length: 8, end: 60, format: 'date:DDMMYYYY' },  // line[52:60] → start 53
        { fieldName: 'dataFine', start: 61, length: 8, end: 68, format: 'date:DDMMYYYY' },    // line[60:68] → start 61
        { fieldName: 'tipoRegistroIva', start: 69, length: 1, end: 69 },                      // line[68:69] → start 69
        { fieldName: 'segnoMovimentoIva', start: 70, length: 1, end: 70 },                    // line[69:70] → start 70
        { fieldName: 'contoIva', start: 71, length: 10, end: 80 },                            // line[70:80] → start 71
        { fieldName: 'generazioneAutofattura', start: 81, length: 1, end: 81, format: 'boolean' }, // line[80:81] → start 81
        { fieldName: 'tipoAutofatturaGenerata', start: 82, length: 1, end: 82 },              // line[81:82] → start 82
        { fieldName: 'contoIvaVendite', start: 83, length: 10, end: 92 },                     // line[82:92] → start 83
        { fieldName: 'fatturaImporto0', start: 93, length: 1, end: 93, format: 'boolean' },   // line[92:93] → start 93
        { fieldName: 'fatturaValutaEstera', start: 94, length: 1, end: 94, format: 'boolean' },// line[93:94] → start 94
        { fieldName: 'nonConsiderareLiquidazioneIva', start: 95, length: 1, end: 95, format: 'boolean' }, // line[94:95] → start 95
        { fieldName: 'ivaEsigibilitaDifferita', start: 96, length: 1, end: 96 },              // line[95:96] → start 96
        { fieldName: 'fatturaEmessaRegCorrispettivi', start: 97, length: 1, end: 97, format: 'boolean' }, // line[96:97] → start 97
        { fieldName: 'gestionePartite', start: 98, length: 1, end: 98 },                      // line[97:98] → start 98
        { fieldName: 'gestioneIntrastat', start: 99, length: 1, end: 99, format: 'boolean' }, // line[98:99] → start 99
        { fieldName: 'gestioneRitenuteEnasarco', start: 100, length: 1, end: 100 },            // line[99:100] → start 100
        { fieldName: 'versamentoRitenute', start: 101, length: 1, end: 101, format: 'boolean' }, // line[100:101] → start 101
        { fieldName: 'noteMovimento', start: 102, length: 60, end: 161 },                      // line[101:161] → start 102
        { fieldName: 'descrizioneDocumento', start: 162, length: 5, end: 166 },                // line[161:166] → start 162
        { fieldName: 'identificativoEsteroClifor', start: 167, length: 1, end: 167, format: 'boolean' }, // line[166:167] → start 167
        { fieldName: 'scritturaRettificaAssestamento', start: 168, length: 1, end: 168, format: 'boolean' }, // line[167:168] → start 168
        { fieldName: 'nonStampareRegCronologico', start: 169, length: 1, end: 169, format: 'boolean' },    // line[168:169] → start 169
        { fieldName: 'movimentoRegIvaNonRilevante', start: 170, length: 1, end: 170, format: 'boolean' },  // line[169:170] → start 170
        { fieldName: 'tipoMovimentoSemplificata', start: 171, length: 1, end: 171 }            // line[170:171] → start 171
      ] },
    }
  });

  // Template Condizioni Pagamento - Prima elimina quello esistente
  const existingCondizioniTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'condizioni_pagamento' },
    include: { fieldDefinitions: true }
  });
  
  if (existingCondizioniTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingCondizioniTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingCondizioniTemplate.id }
    });
  }
  
  await prisma.importTemplate.create({
    data: {
      name: 'condizioni_pagamento',
      modelName: 'CondizionePagamento',
      fieldDefinitions: { create: [
        // Campi principali (bibbia parser_codpagam.py) - POSIZIONI CORRETTE
        { fieldName: 'codicePagamento', start: 5, length: 8, end: 12 },                  // pos 5-12
        { fieldName: 'descrizione', start: 13, length: 40, end: 52 },                    // pos 13-52
        { fieldName: 'contoIncassoPagamento', start: 53, length: 10, end: 62 },        // pos 53-62
        { fieldName: 'calcolaGiorniCommerciali', start: 63, length: 1, end: 63, format: 'boolean' },       // pos 63 (X = True)
        { fieldName: 'consideraPeriodiChiusura', start: 64, length: 1, end: 64, format: 'boolean' },       // pos 64 (X = True)
        { fieldName: 'suddivisione', start: 65, length: 1, end: 65 },                    // pos 65 (D=Dettaglio, T=Totale)
        { fieldName: 'inizioScadenza', start: 66, length: 1, end: 66 },                 // pos 66 (D=Data doc, F=Fine mese, R=Registrazione, P=Reg IVA, N=Non determinata)
        { fieldName: 'numeroRate', start: 67, length: 2, end: 68, format: 'number' }    // pos 67-68
      ] },
    }
  });

  // Template Codici IVA - Prima elimina quello esistente
  const existingCodiciIvaTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'codici_iva' },
    include: { fieldDefinitions: true }
  });
  
  if (existingCodiciIvaTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingCodiciIvaTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingCodiciIvaTemplate.id }
    });
  }
  
  await prisma.importTemplate.create({
    data: {
      name: 'codici_iva',
      modelName: 'CodiceIva',
      fieldDefinitions: { create: [
          // === DEFINIZIONI CORRETTE - Allineate 1:1 con parser_codiciiva.py ===
          // Python slice: line[start:end] -> TS: { start: start + 1, length: end - start }
          { fieldName: 'codice', start: 5, length: 4, end: 8 },                           // line[4:8]
          { fieldName: 'descrizione', start: 9, length: 40, end: 48 },                     // line[8:48]
          { fieldName: 'tipoCalcolo', start: 49, length: 1, end: 49 },                      // line[48:49]
          { fieldName: 'aliquota', start: 50, length: 6, end: 55, format: 'percentage' },  // line[49:55]
          { fieldName: 'indetraibilita', start: 56, length: 3, end: 58, format: 'percentage' },// line[55:58]
          { fieldName: 'note', start: 59, length: 40, end: 98 },                           // line[58:98]
          { fieldName: 'validitaInizio', start: 99, length: 8, end: 106, format: 'date:DDMMYYYY' },// line[98:106]
          { fieldName: 'validitaFine', start: 107, length: 8, end: 114, format: 'date:DDMMYYYY' },// line[106:114]
          { fieldName: 'imponibile50Corrispettivi', start: 115, length: 1, end: 115 },      // line[114:115]
          { fieldName: 'imposteIntrattenimenti', start: 116, length: 2, end: 117 },           // line[115:117]
          { fieldName: 'ventilazione', start: 118, length: 1, end: 118 },                    // line[117:118]
          { fieldName: 'aliquotaDiversa', start: 119, length: 6, end: 124, format: 'percentage' },// line[118:124]
          { fieldName: 'plafondAcquisti', start: 125, length: 1, end: 125 },                 // line[124:125]
          { fieldName: 'monteAcquisti', start: 126, length: 1, end: 126 },                   // line[125:126]
          { fieldName: 'plafondVendite', start: 127, length: 1, end: 127 },                  // line[126:127]
          { fieldName: 'noVolumeAffariPlafond', start: 128, length: 1, end: 128 },           // line[127:128]
          { fieldName: 'gestioneProRata', start: 129, length: 1, end: 129 },                 // line[128:129]
          { fieldName: 'acqOperazImponibiliOccasionali', start: 130, length: 1, end: 130 },  // line[129:130]
          { fieldName: 'comunicazioneDatiIvaVendite', start: 131, length: 1, end: 131 },     // line[130:131]
          { fieldName: 'agevolazioniSubforniture', start: 132, length: 1, end: 132 },       // line[131:132]
          { fieldName: 'comunicazioneDatiIvaAcquisti', start: 133, length: 1, end: 133 },    // line[132:133]
          { fieldName: 'autofatturaReverseCharge', start: 134, length: 1, end: 134 },      // line[133:134]
          { fieldName: 'operazioneEsenteOccasionale', start: 135, length: 1, end: 135 },    // line[134:135]
          { fieldName: 'cesArt38QuaterStornoIva', start: 136, length: 1, end: 136 },        // line[135:136]
          { fieldName: 'percDetrarreExport', start: 137, length: 6, end: 142, format: 'number:decimal' },// line[136:142]
          { fieldName: 'acquistiCessioni', start: 143, length: 1, end: 143 },                // line[142:143]
          { fieldName: 'percentualeCompensazione', start: 144, length: 6, end: 149, format: 'percentage' },// line[143:149]
          { fieldName: 'beniAmmortizzabili', start: 150, length: 1, end: 150, format: 'boolean' },             // line[149:150]
          { fieldName: 'indicatoreTerritorialeVendite', start: 151, length: 2, end: 152 },   // line[150:152]
          { fieldName: 'provvigioniDm34099', start: 153, length: 1, end: 153 },             // line[152:153]
          { fieldName: 'indicatoreTerritorialeAcquisti', start: 154, length: 2, end: 155 },  // line[153:155]
          { fieldName: 'metodoDaApplicare', start: 156, length: 1, end: 156 },               // line[155:156]
          { fieldName: 'percentualeForfetaria', start: 157, length: 2, end: 158 },           // line[156:158]
          { fieldName: 'analiticoBeniAmmortizzabili', start: 159, length: 1, end: 159 },    // line[158:159]
          { fieldName: 'quotaForfetaria', start: 160, length: 1, end: 160 },                 // line[159:160]
          { fieldName: 'acquistiIntracomunitari', start: 161, length: 1, end: 161 },        // line[160:161]
          { fieldName: 'cessioneProdottiEditoriali', start: 162, length: 1, end: 162 },     // line[161:162]
      ] },
    }
  });

  // Template Piano dei Conti - Ricostruito e Completo
  const existingPianoDeiContiTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'piano_dei_conti' },
    include: { fieldDefinitions: true }
  });

  if (existingPianoDeiContiTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingPianoDeiContiTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingPianoDeiContiTemplate.id }
    });
  }

  await prisma.importTemplate.create({
    data: {
      name: 'piano_dei_conti',
      modelName: 'StagingConto',
      fieldDefinitions: {
        create: [
          // Allineato 1:1 con parser_contigen.py
          { fieldName: 'livello', start: 5, length: 1, end: 5 },
          { fieldName: 'codice', start: 6, length: 10, end: 15 },
          { fieldName: 'descrizione', start: 16, length: 60, end: 75 },
          { fieldName: 'tipo', start: 76, length: 1, end: 76 },
          { fieldName: 'sigla', start: 77, length: 12, end: 88 },
          { fieldName: 'controlloSegno', start: 89, length: 1, end: 89 },
          { fieldName: 'contoCostiRicaviCollegato', start: 90, length: 10, end: 99 },
          { fieldName: 'validoImpresaOrdinaria', start: 100, length: 1, end: 100, format: 'boolean' },
          { fieldName: 'validoImpresaSemplificata', start: 101, length: 1, end: 101, format: 'boolean' },
          { fieldName: 'validoProfessionistaOrdinario', start: 102, length: 1, end: 102, format: 'boolean' },
          { fieldName: 'validoProfessionistaSemplificato', start: 103, length: 1, end: 103, format: 'boolean' },
          { fieldName: 'validoUnicoPf', start: 104, length: 1, end: 104, format: 'boolean' },
          { fieldName: 'validoUnicoSp', start: 105, length: 1, end: 105, format: 'boolean' },
          { fieldName: 'validoUnicoSc', start: 106, length: 1, end: 106, format: 'boolean' },
          { fieldName: 'validoUnicoEnc', start: 107, length: 1, end: 107, format: 'boolean' },
          { fieldName: 'codiceClasseIrpefIres', start: 108, length: 10, end: 117 },
          { fieldName: 'codiceClasseIrap', start: 118, length: 10, end: 127 },
          { fieldName: 'codiceClasseProfessionista', start: 128, length: 10, end: 137 },
          { fieldName: 'codiceClasseIrapProfessionista', start: 138, length: 10, end: 147 },
          { fieldName: 'codiceClasseIva', start: 148, length: 10, end: 157 },
          { fieldName: 'numeroColonnaRegCronologico', start: 158, length: 4, end: 161 },
          { fieldName: 'numeroColonnaRegIncassiPag', start: 162, length: 4, end: 165 },
          { fieldName: 'contoDareCee', start: 166, length: 12, end: 177 },
          { fieldName: 'contoAvereCee', start: 178, length: 12, end: 189 },
          { fieldName: 'naturaConto', start: 190, length: 4, end: 193 },
          { fieldName: 'gestioneBeniAmmortizzabili', start: 194, length: 1, end: 194 },
          { fieldName: 'percDeduzioneManutenzione', start: 195, length: 6, end: 200, format: 'number:decimal' },
          { fieldName: 'gruppo', start: 257, length: 1, end: 257 },
          { fieldName: 'codiceClasseDatiStudiSettore', start: 258, length: 10, end: 267 },
          { fieldName: 'dettaglioClienteFornitore', start: 268, length: 1, end: 268 },
          { fieldName: 'descrizioneBilancioDare', start: 269, length: 60, end: 328 },
          { fieldName: 'descrizioneBilancioAvere', start: 329, length: 60, end: 388 },
        ]
      },
    }
  });

  // Template Piano dei Conti AZIENDALE - AGGIUNTO
  const existingPianoDeiContiAziendaleTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'piano_dei_conti_aziendale' },
    include: { fieldDefinitions: true }
  });

  if (existingPianoDeiContiAziendaleTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingPianoDeiContiAziendaleTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingPianoDeiContiAziendaleTemplate.id }
    });
  }

  await prisma.importTemplate.create({
    data: {
      name: 'piano_dei_conti_aziendale',
      modelName: 'StagingConto', // Stesso modello di destinazione
      fieldDefinitions: {
        create: [
          // Basato sul tracciato CONTIAZI.TXT
          { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16, end: 19 },
          { fieldName: 'subcodiceAzienda', start: 20, length: 1, end: 20 },
          { fieldName: 'livello', start: 22, length: 1, end: 22 },
          { fieldName: 'codice', start: 23, length: 10, end: 32 },
          { fieldName: 'tipo', start: 33, length: 1, end: 33 },
          { fieldName: 'descrizione', start: 34, length: 60, end: 93 },
          { fieldName: 'sigla', start: 94, length: 12, end: 105 },
          { fieldName: 'controlloSegno', start: 106, length: 1, end: 106 },
          { fieldName: 'contoCostiRicaviCollegato', start: 107, length: 10, end: 116 }, // FIX: Rinominato da contoCostiRicavi
          { fieldName: 'validoImpresaOrdinaria', start: 117, length: 1, end: 117, format: 'boolean' },
          { fieldName: 'validoImpresaSemplificata', start: 118, length: 1, end: 118, format: 'boolean' },
          { fieldName: 'validoProfessionistaOrdinario', start: 119, length: 1, end: 119, format: 'boolean' },
          { fieldName: 'validoProfessionistaSemplificato', start: 120, length: 1, end: 120, format: 'boolean' },
          { fieldName: 'validoUnicoPf', start: 121, length: 1, end: 121, format: 'boolean' },
          { fieldName: 'validoUnicoSp', start: 122, length: 1, end: 122, format: 'boolean' },
          { fieldName: 'validoUnicoSc', start: 123, length: 1, end: 123, format: 'boolean' },
          { fieldName: 'validoUnicoEnc', start: 124, length: 1, end: 124, format: 'boolean' },
          { fieldName: 'classeIrpefIres', start: 125, length: 10, end: 134 },
          { fieldName: 'classeIrap', start: 135, length: 10, end: 144 },
          { fieldName: 'classeProfessionista', start: 145, length: 10, end: 154 },
          { fieldName: 'classeIrapProfessionista', start: 155, length: 10, end: 164 },
          { fieldName: 'classeIva', start: 165, length: 10, end: 174 },
          { fieldName: 'classeDatiExtracontabili', start: 175, length: 10, end: 184 },
          { fieldName: 'colonnaRegistroCronologico', start: 185, length: 4, end: 188 },
          { fieldName: 'colonnaRegistroIncassiPagamenti', start: 189, length: 4, end: 192 },
          { fieldName: 'contoDareCee', start: 193, length: 12, end: 204 },
          { fieldName: 'contoAvereCee', start: 205, length: 12, end: 216 },
          { fieldName: 'naturaConto', start: 217, length: 4, end: 220 },
          { fieldName: 'gestioneBeniAmmortizzabili', start: 221, length: 1, end: 221 },
          { fieldName: 'percDeduzioneManutenzione', start: 222, length: 6, end: 227, format: 'number:decimal' },
          { fieldName: 'gruppo', start: 228, length: 1, end: 228 },
          { fieldName: 'dettaglioClienteFornitore', start: 229, length: 1, end: 229 },
          { fieldName: 'descrizioneBilancioDare', start: 230, length: 60, end: 289 },
          { fieldName: 'descrizioneBilancioAvere', start: 290, length: 60, end: 349 },
          { fieldName: 'utilizzaDescrizioneLocale', start: 350, length: 1, end: 350, format: 'boolean' },
          { fieldName: 'descrizioneLocale', start: 351, length: 40, end: 390 },
          { fieldName: 'consideraBilancioSemplificato', start: 391, length: 1, end: 391, format: 'boolean' },
        ]
      },
    }
  });

  // Template Scritture Contabili
  type ScritturaField = {
    fileIdentifier: string;
    fieldName: string;
    start: number;
    length: number;
    end: number;
    format?: string;
  };
  
  const scrittureContabiliFields: ScritturaField[] = [
    // PNTESTA.TXT - POSIZIONI CORRETTE (1-based)
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'externalId', start: 21, length: 12, end: 32 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'causaleId', start: 40, length: 6, end: 45 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'dataRegistrazione', start: 86, length: 8, end: 93, format: 'date:DDMMYYYY' },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'clienteFornitoreCodiceFiscale', start: 100, length: 16, end: 115 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'dataDocumento', start: 129, length: 8, end: 136, format: 'date:DDMMYYYY' },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'numeroDocumento', start: 137, length: 12, end: 148 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'totaleDocumento', start: 173, length: 12, end: 184, format: 'number' },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'noteMovimento', start: 193, length: 60, end: 252 },

    // PNRIGCON.TXT - POSIZIONI CORRETTE (1-based)
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'externalId', start: 4, length: 12, end: 15 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'progressivoRigo', start: 16, length: 3, end: 18, format: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'tipoConto', start: 19, length: 1, end: 19 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'clienteFornitoreCodiceFiscale', start: 20, length: 16, end: 35 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'conto', start: 49, length: 10, end: 58 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'importoDare', start: 59, length: 12, end: 70, format: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'importoAvere', start: 71, length: 12, end: 82, format: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'note', start: 83, length: 60, end: 142 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'movimentiAnalitici', start: 248, length: 1, end: 248 },

    // PNRIGIVA.TXT - POSIZIONI CORRETTE (1-based) secondo tracciato ufficiale
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'codiceUnivocoScaricamento', start: 4, length: 12, end: 15 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'codiceIva', start: 16, length: 4, end: 19 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'contropartita', start: 20, length: 10, end: 29 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imponibile', start: 30, length: 12, end: 41, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imposta', start: 42, length: 12, end: 53, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'impostaIntrattenimenti', start: 54, length: 12, end: 65, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imponibile50CorrNonCons', start: 66, length: 12, end: 77, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'impostaNonConsiderata', start: 78, length: 12, end: 89, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'importoLordo', start: 90, length: 12, end: 101, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'note', start: 102, length: 60, end: 161 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'siglaContropartita', start: 162, length: 12, end: 173 },

    // MOVANAC.TXT - POSIZIONI CORRETTE (1-based)
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'externalId', start: 4, length: 12, end: 15 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'progressivoRigoContabile', start: 16, length: 3, end: 18, format: 'number' },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'centroDiCosto', start: 19, length: 4, end: 22 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'parametro', start: 23, length: 12, end: 34, format: 'number' }
  ];
  // Template Scritture Contabili - Prima elimina quello esistente
  const existingScrittureTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'scritture_contabili' },
    include: { fieldDefinitions: true }
  });

  if (existingScrittureTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingScrittureTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingScrittureTemplate.id }
    });
  }

  // Poi ricrea da zero con posizioni corrette
  await prisma.importTemplate.create({
    data: {
      name: 'scritture_contabili',
      modelName: null,
      fieldDefinitions: { create: scrittureContabiliFields },
    },
  });

  // Template Anagrafica Clienti/Fornitori - Prima elimina quello esistente
  const existingCliForTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'anagrafica_clifor' },
    include: { fieldDefinitions: true }
  });

  if (existingCliForTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingCliForTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingCliForTemplate.id }
    });
  }

  await prisma.importTemplate.create({
    data: {
      name: 'anagrafica_clifor',
      modelName: 'AnagraficaCliFor', // Virtual model name, handled in backend
      fieldDefinitions: {
        create: [
          // Layout basato su .docs/code/parser_a_clifor.py - CORRETTO CON START A BASE 1
          // Python slice line[py_start:py_end] -> { start: py_start + 1, length: py_end - py_start }
          { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16, end: 19 },
          { fieldName: 'subcodiceAzienda', start: 20, length: 1, end: 20 },
          { fieldName: 'codiceUnivoco', start: 21, length: 12, end: 32 },
          { fieldName: 'codiceFiscaleClifor', start: 33, length: 16, end: 48 },
          { fieldName: 'subcodiceClifor', start: 49, length: 1, end: 49 },
          { fieldName: 'tipoConto', start: 50, length: 1, end: 50 },
          { fieldName: 'sottocontoCliente', start: 51, length: 10, end: 60 },
          { fieldName: 'sottocontoFornitore', start: 61, length: 10, end: 70 },
          { fieldName: 'codiceAnagrafica', start: 71, length: 12, end: 82 },
          { fieldName: 'partitaIva', start: 83, length: 11, end: 93 },
          { fieldName: 'tipoSoggetto', start: 94, length: 1, end: 94 },
          { fieldName: 'denominazione', start: 95, length: 60, end: 154 },
          { fieldName: 'cognome', start: 155, length: 20, end: 174 },
          { fieldName: 'nome', start: 175, length: 20, end: 194 },
          { fieldName: 'sesso', start: 195, length: 1, end: 195 },
          { fieldName: 'dataNascita', start: 196, length: 8, end: 203, format: 'date:DDMMYYYY' },
          { fieldName: 'comuneNascita', start: 204, length: 4, end: 207 },
          { fieldName: 'comuneResidenza', start: 208, length: 4, end: 211 },
          { fieldName: 'cap', start: 212, length: 5, end: 216 },
          { fieldName: 'indirizzo', start: 217, length: 30, end: 246 },
          { fieldName: 'prefissoTelefono', start: 247, length: 4, end: 250 },
          { fieldName: 'numeroTelefono', start: 251, length: 11, end: 261 },
          { fieldName: 'idFiscaleEstero', start: 262, length: 20, end: 281 },
          { fieldName: 'codiceIso', start: 282, length: 2, end: 283 },
          { fieldName: 'codiceIncassoPagamento', start: 284, length: 8, end: 291 },
          { fieldName: 'codiceIncassoCliente', start: 292, length: 8, end: 299 },
          { fieldName: 'codicePagamentoFornitore', start: 300, length: 8, end: 307 },
          { fieldName: 'codiceValuta', start: 308, length: 4, end: 311 },
          { fieldName: 'gestioneDati770', start: 312, length: 1, end: 312, format: 'boolean' },
          { fieldName: 'soggettoARitenuta', start: 313, length: 1, end: 313, format: 'boolean' },
          { fieldName: 'quadro770', start: 314, length: 1, end: 314 },
          { fieldName: 'contributoPrevidenziale', start: 315, length: 1, end: 315, format: 'boolean' },
          { fieldName: 'codiceRitenuta', start: 316, length: 5, end: 320 },
          { fieldName: 'enasarco', start: 321, length: 1, end: 321, format: 'boolean' },
          { fieldName: 'tipoRitenuta', start: 322, length: 1, end: 322 },
          { fieldName: 'soggettoInail', start: 323, length: 1, end: 323, format: 'boolean' },
          { fieldName: 'contributoPrevid335', start: 324, length: 1, end: 324 },
          { fieldName: 'aliquota', start: 325, length: 6, end: 330, format: 'percentage' },
          { fieldName: 'percContributoCassa', start: 331, length: 6, end: 336, format: 'percentage' },
          { fieldName: 'attivitaMensilizzazione', start: 337, length: 2, end: 338 }
        ]
      },
    },
  });

  // Template Centri di Costo (ANAGRACC.TXT) - Prima elimina quello esistente
  const existingCentriCostoTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'centri_costo' },
    include: { fieldDefinitions: true }
  });

  if (existingCentriCostoTemplate) {
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingCentriCostoTemplate.id }
    });
    await prisma.importTemplate.delete({
      where: { id: existingCentriCostoTemplate.id }
    });
  }

  await prisma.importTemplate.create({
    data: {
      name: 'centri_costo',
      modelName: 'StagingCentroCosto',
      fieldDefinitions: {
        create: [
          // Layout basato su ANAGRACC.md - 156 bytes + CRLF (158 bytes totali)
          // Posizioni 1-based come da tracciato ufficiale - filler (pos. 1-3) ignorato
          { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16, end: 19 },
          { fieldName: 'subcodeAzienda', start: 20, length: 1, end: 20 },
          { fieldName: 'codice', start: 21, length: 4, end: 24 },
          { fieldName: 'descrizione', start: 25, length: 40, end: 64 },
          { fieldName: 'responsabile', start: 65, length: 40, end: 104 },
          { fieldName: 'livello', start: 105, length: 2, end: 106, format: 'number' },
          { fieldName: 'note', start: 107, length: 50, end: 156 }
        ]
      },
    },
  });

  console.log('Template creati/aggiornati.');

  // 7. Centri di Costo di base per collegamento MOVANAC
  console.log('Creazione Centri di Costo per collegamento MOVANAC...');
  
  // Prima pulisce la tabella
  await (prisma as any).stagingCentroCosto.deleteMany({});
  
  // Crea centri di costo collegati alle commesse seed
  await (prisma as any).stagingCentroCosto.createMany({
    data: [
      // Centri di costo principali collegati alle commesse
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE', // Mock - in produzione sarà il CF reale
        subcodeAzienda: '1',
        codice: '0001',
        descrizione: 'Centro Costo Sorrento - Igiene Urbana',
        responsabile: 'Responsabile Sorrento',
        livello: 1,
        note: 'Centro collegato a commessa sorrento_igiene_urbana'
      },
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1', 
        codice: '0002',
        descrizione: 'Centro Costo Massa Lubrense - Igiene Urbana',
        responsabile: 'Responsabile Massa Lubrense',
        livello: 1,
        note: 'Centro collegato a commessa massa_lubrense_igiene_urbana'
      },
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1',
        codice: '0003', 
        descrizione: 'Centro Costo Piano di Sorrento - Generale',
        responsabile: 'Responsabile Piano di Sorrento',
        livello: 1,
        note: 'Centro collegato a commessa piano_di_sorrento'
      },
      
      // Centri di costo aggiuntivi per pattern recognition
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1',
        codice: 'SORR',
        descrizione: 'Sorrento - Attività Generali',
        responsabile: 'Coordinatore Sorrento',
        livello: 2,
        note: 'Centro costo generico Sorrento per attività non specifiche'
      },
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1',
        codice: 'MASS',
        descrizione: 'Massa Lubrense - Attività Generali', 
        responsabile: 'Coordinatore Massa Lubrense',
        livello: 2,
        note: 'Centro costo generico Massa Lubrense per attività non specifiche'
      },
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1',
        codice: 'AMM',
        descrizione: 'Amministrazione e Gestione Generale',
        responsabile: 'Responsabile Amministrativo',
        livello: 1,
        note: 'Centro costo amministrativo generale'
      },
      
      // Centri di costo per tipologie di attività
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1',
        codice: 'MANU',
        descrizione: 'Manodopera Diretta',
        responsabile: 'Capo Cantiere',
        livello: 2,
        note: 'Centro costo specifico per manodopera diretta'
      },
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE', 
        subcodeAzienda: '1',
        codice: 'MEZZ',
        descrizione: 'Mezzi e Attrezzature',
        responsabile: 'Responsabile Parco Mezzi',
        livello: 2,
        note: 'Centro costo per gestione mezzi e attrezzature'
      },
      {
        codiceFiscaleAzienda: 'AZIENDA_CLIENTE',
        subcodeAzienda: '1', 
        codice: 'MATE',
        descrizione: 'Materiali e Consumabili',
        responsabile: 'Magazziniere',
        livello: 2,
        note: 'Centro costo per materiali e beni di consumo'
      }
    ]
  });
  
  console.log('Centri di Costo creati per collegamento MOVANAC.');

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