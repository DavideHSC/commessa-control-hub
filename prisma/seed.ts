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

  // 2. Popola dati di base (Voci Analitiche) - con UPSERT per evitare errori
  console.log('Creazione/aggiornamento Voci Analitiche di base...');
  const vociAnaliticheData = [
    { id: 'costo_personale', nome: 'Costo del personale' },
    { id: 'gestione_automezzi', nome: 'Gestione automezzi' },
    { id: 'gestione_attrezzature', nome: 'Gestione attrezzature' },
    { id: 'sacchi_materiali_consumo', nome: 'Sacchi e materiali di consumo' },
    { id: 'servizi_esterni', nome: 'Servizi esterni' },
    { id: 'pulizia_strade_rurali', nome: 'Pulizia strade rurali' },
    { id: 'gestione_aree_operative', nome: 'Gestione Aree operative' },
    { id: 'ammortamento_automezzi', nome: 'Ammortamento Automezzi' },
    { id: 'ammortamento_attrezzature', nome: 'Ammortamento Attrezzature' },
    { id: 'locazione_sedi_operative', nome: 'Locazione sedi operative' },
    { id: 'trasporti_esterni', nome: 'Trasporti esterni' },
    { id: 'spese_generali', nome: 'Spese generali' },
    { id: 'selezione_valorizzazione_rifiuti', nome: 'Selezione e Valorizzazione Rifiuti Differenziati' },
    { id: 'gestione_frazione_organica', nome: 'Gestione frazione organica' },
  ];
  
  for (const voce of vociAnaliticheData) {
    await prisma.voceAnalitica.upsert({
      where: { id: voce.id },
      update: { nome: voce.nome },
      create: voce,
    });
  }
  console.log('Voci Analitiche create/aggiornate.');

  // 3. Cliente e Fornitore di sistema (necessari per importazioni) - UPSERT
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

  // 4. Popola dati specifici del cliente (PENISOLAVERDE SPA) - UPSERT
  console.log('Creazione/aggiornamento dati cliente e commesse per PENISOLAVERDE SPA...');
  
  const clientePenisolaVerde = await prisma.cliente.upsert({
    where: { externalId: 'PENISOLAVERDE_SPA' },
    update: { nome: 'PENISOLAVERDE SPA' },
    create: {
      nome: 'PENISOLAVERDE SPA',
      externalId: 'PENISOLAVERDE_SPA',
      piva: '01234567890', // Placeholder
    },
  });

  console.log(`Cliente '${clientePenisolaVerde.nome}' creato/trovato con ID: ${clientePenisolaVerde.id}`);

  // Commesse Principali (Comuni)
  const commessaSorrento = await prisma.commessa.create({
    data: {
      id: 'sorrento',
      externalId: '1',
      nome: 'Comune di Sorrento',
      descrizione: 'Commessa principale per il comune di Sorrento',
      clienteId: clientePenisolaVerde.id,
    },
  });

  const commessaMassa = await prisma.commessa.create({
    data: {
      id: 'massa_lubrense',
      externalId: '2',
      nome: 'Comune di Massa Lubrense',
      descrizione: 'Commessa principale per il comune di Massa Lubrense',
      clienteId: clientePenisolaVerde.id,
    },
  });

  const commessaPiano = await prisma.commessa.create({
    data: {
      id: 'piano_di_sorrento',
      externalId: '3',
      nome: 'Comune di Piano di Sorrento',
      descrizione: 'Commessa principale per il comune di Piano di Sorrento',
      clienteId: clientePenisolaVerde.id,
    },
  });
  console.log('Commesse principali (Comuni) create.');

  // Commesse Figlie (Attività / Centri di Costo)
  await prisma.commessa.create({
    data: {
      id: 'sorrento_igiene_urbana',
      externalId: '4',
      nome: 'Igiene Urbana - Sorrento',
      descrizione: 'Servizio di igiene urbana per Sorrento',
      clienteId: clientePenisolaVerde.id,
      parentId: commessaSorrento.id,
    },
  });
  await prisma.commessa.create({
    data: {
      id: 'massa_lubrense_igiene_urbana',
      externalId: '5',
      nome: 'Igiene Urbana - Massa Lubrense',
      descrizione: 'Servizio di igiene urbana per Massa Lubrense',
      clienteId: clientePenisolaVerde.id,
      parentId: commessaMassa.id,
    },
  });
  await prisma.commessa.create({
    data: {
      id: 'piano_di_sorrento_igiene_urbana',
      externalId: '6',
      nome: 'Igiene Urbana - Piano di Sorrento',
      descrizione: 'Servizio di igiene urbana per Piano di Sorrento',
      clienteId: clientePenisolaVerde.id,
      parentId: commessaPiano.id,
    },
  });
  await prisma.commessa.create({
    data: {
      id: 'sorrento_verde_pubblico',
      externalId: '7',
      nome: 'Verde Pubblico - Sorrento',
      descrizione: 'Servizio di gestione del verde pubblico per Sorrento',
      clienteId: clientePenisolaVerde.id,
      parentId: commessaSorrento.id,
    },
  });
  console.log('Commesse figlie (Attività) create.');

  // 5. Template di Importazione (essenziali per funzionamento) - UPSERT
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
        { fieldName: 'codiceCausale', start: 5, length: 6 },                          // line[4:10] → start 5
        { fieldName: 'descrizione', start: 11, length: 40 },                         // line[10:50] → start 11
        { fieldName: 'tipoMovimento', start: 51, length: 1 },                        // line[50:51] → start 51
        { fieldName: 'tipoAggiornamento', start: 52, length: 1 },                    // line[51:52] → start 52
        { fieldName: 'dataInizio', start: 53, length: 8, format: 'date:DDMMYYYY' },  // line[52:60] → start 53
        { fieldName: 'dataFine', start: 61, length: 8, format: 'date:DDMMYYYY' },    // line[60:68] → start 61
        { fieldName: 'tipoRegistroIva', start: 69, length: 1 },                      // line[68:69] → start 69
        { fieldName: 'segnoMovimentoIva', start: 70, length: 1 },                    // line[69:70] → start 70
        { fieldName: 'contoIva', start: 71, length: 10 },                            // line[70:80] → start 71
        { fieldName: 'generazioneAutofattura', start: 81, length: 1, format: 'boolean' }, // line[80:81] → start 81
        { fieldName: 'tipoAutofatturaGenerata', start: 82, length: 1 },              // line[81:82] → start 82
        { fieldName: 'contoIvaVendite', start: 83, length: 10 },                     // line[82:92] → start 83
        { fieldName: 'fatturaImporto0', start: 93, length: 1, format: 'boolean' },   // line[92:93] → start 93
        { fieldName: 'fatturaValutaEstera', start: 94, length: 1, format: 'boolean' },// line[93:94] → start 94
        { fieldName: 'nonConsiderareLiquidazioneIva', start: 95, length: 1, format: 'boolean' }, // line[94:95] → start 95
        { fieldName: 'ivaEsigibilitaDifferita', start: 96, length: 1 },              // line[95:96] → start 96
        { fieldName: 'fatturaEmessaRegCorrispettivi', start: 97, length: 1, format: 'boolean' }, // line[96:97] → start 97
        { fieldName: 'gestionePartite', start: 98, length: 1 },                      // line[97:98] → start 98
        { fieldName: 'gestioneIntrastat', start: 99, length: 1, format: 'boolean' }, // line[98:99] → start 99
        { fieldName: 'gestioneRitenuteEnasarco', start: 100, length: 1 },            // line[99:100] → start 100
        { fieldName: 'versamentoRitenute', start: 101, length: 1, format: 'boolean' }, // line[100:101] → start 101
        { fieldName: 'noteMovimento', start: 102, length: 60 },                      // line[101:161] → start 102
        { fieldName: 'descrizioneDocumento', start: 162, length: 5 },                // line[161:166] → start 162
        { fieldName: 'identificativoEsteroClifor', start: 167, length: 1, format: 'boolean' }, // line[166:167] → start 167
        { fieldName: 'scritturaRettificaAssestamento', start: 168, length: 1, format: 'boolean' }, // line[167:168] → start 168
        { fieldName: 'nonStampareRegCronologico', start: 169, length: 1, format: 'boolean' },    // line[168:169] → start 169
        { fieldName: 'movimentoRegIvaNonRilevante', start: 170, length: 1, format: 'boolean' },  // line[169:170] → start 170
        { fieldName: 'tipoMovimentoSemplificata', start: 171, length: 1 }            // line[170:171] → start 171
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
        { fieldName: 'codicePagamento', start: 5, length: 8 },                  // pos 5-12
        { fieldName: 'descrizione', start: 13, length: 40 },                    // pos 13-52
        { fieldName: 'contoIncassoPagamento', start: 53, length: 10 },        // pos 53-62
        { fieldName: 'calcolaGiorniCommerciali', start: 63, length: 1, format: 'boolean' },       // pos 63 (X = True)
        { fieldName: 'consideraPeriodiChiusura', start: 64, length: 1, format: 'boolean' },       // pos 64 (X = True)
        { fieldName: 'suddivisione', start: 65, length: 1 },                    // pos 65 (D=Dettaglio, T=Totale)
        { fieldName: 'inizioScadenza', start: 66, length: 1 },                 // pos 66 (D=Data doc, F=Fine mese, R=Registrazione, P=Reg IVA, N=Non determinata)
        { fieldName: 'numeroRate', start: 67, length: 2, format: 'number' }    // pos 67-68
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
          { fieldName: 'codice', start: 5, length: 4 },                           // line[4:8]
          { fieldName: 'descrizione', start: 9, length: 40 },                     // line[8:48]
          { fieldName: 'tipoCalcolo', start: 49, length: 1 },                      // line[48:49]
          { fieldName: 'aliquota', start: 50, length: 6, format: 'percentage' },  // line[49:55]
          { fieldName: 'indetraibilita', start: 56, length: 3, format: 'percentage' },// line[55:58]
          { fieldName: 'note', start: 59, length: 40 },                           // line[58:98]
          { fieldName: 'validitaInizio', start: 99, length: 8, format: 'date:DDMMYYYY' },// line[98:106]
          { fieldName: 'validitaFine', start: 107, length: 8, format: 'date:DDMMYYYY' },// line[106:114]
          { fieldName: 'imponibile50Corrispettivi', start: 115, length: 1 },      // line[114:115]
          { fieldName: 'imposteIntrattenimenti', start: 116, length: 2 },           // line[115:117]
          { fieldName: 'ventilazione', start: 118, length: 1 },                    // line[117:118]
          { fieldName: 'aliquotaDiversa', start: 119, length: 6, format: 'percentage' },// line[118:124]
          { fieldName: 'plafondAcquisti', start: 125, length: 1 },                 // line[124:125]
          { fieldName: 'monteAcquisti', start: 126, length: 1 },                   // line[125:126]
          { fieldName: 'plafondVendite', start: 127, length: 1 },                  // line[126:127]
          { fieldName: 'noVolumeAffariPlafond', start: 128, length: 1 },           // line[127:128]
          { fieldName: 'gestioneProRata', start: 129, length: 1 },                 // line[128:129]
          { fieldName: 'acqOperazImponibiliOccasionali', start: 130, length: 1 },  // line[129:130]
          { fieldName: 'comunicazioneDatiIvaVendite', start: 131, length: 1 },     // line[130:131]
          { fieldName: 'agevolazioniSubforniture', start: 132, length: 1 },       // line[131:132]
          { fieldName: 'comunicazioneDatiIvaAcquisti', start: 133, length: 1 },    // line[132:133]
          { fieldName: 'autofatturaReverseCharge', start: 134, length: 1 },      // line[133:134]
          { fieldName: 'operazioneEsenteOccasionale', start: 135, length: 1 },    // line[134:135]
          { fieldName: 'cesArt38QuaterStornoIva', start: 136, length: 1 },        // line[135:136]
          { fieldName: 'percDetrarreExport', start: 137, length: 6, format: 'number:decimal' },// line[136:142]
          { fieldName: 'acquistiCessioni', start: 143, length: 1 },                // line[142:143]
          { fieldName: 'percentualeCompensazione', start: 144, length: 6, format: 'percentage' },// line[143:149]
          { fieldName: 'beniAmmortizzabili', start: 150, length: 1, format: 'boolean' },             // line[149:150]
          { fieldName: 'indicatoreTerritorialeVendite', start: 151, length: 2 },   // line[150:152]
          { fieldName: 'provvigioniDm34099', start: 153, length: 1 },             // line[152:153]
          { fieldName: 'indicatoreTerritorialeAcquisti', start: 154, length: 2 },  // line[153:155]
          { fieldName: 'metodoDaApplicare', start: 156, length: 1 },               // line[155:156]
          { fieldName: 'percentualeForfetaria', start: 157, length: 2 },           // line[156:158]
          { fieldName: 'analiticoBeniAmmortizzabili', start: 159, length: 1 },    // line[158:159]
          { fieldName: 'quotaForfetaria', start: 160, length: 1 },                 // line[159:160]
          { fieldName: 'acquistiIntracomunitari', start: 161, length: 1 },        // line[160:161]
          { fieldName: 'cessioneProdottiEditoriali', start: 162, length: 1 },     // line[161:162]
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
      modelName: 'Conto',
      fieldDefinitions: {
        create: [
          // Allineato 1:1 con parser_contigen.py
          { fieldName: 'livello', start: 5, length: 1 },
          { fieldName: 'codice', start: 6, length: 10 },
          { fieldName: 'descrizione', start: 16, length: 60 },
          { fieldName: 'tipo', start: 76, length: 1 },
          { fieldName: 'sigla', start: 77, length: 12 },
          { fieldName: 'controlloSegno', start: 89, length: 1 },
          { fieldName: 'contoCostiRicavi', start: 90, length: 10 },
          { fieldName: 'validoImpresaOrdinaria', start: 100, length: 1, format: 'boolean' },
          { fieldName: 'validoImpresaSemplificata', start: 101, length: 1, format: 'boolean' },
          { fieldName: 'validoProfessionistaOrdinario', start: 102, length: 1, format: 'boolean' },
          { fieldName: 'validoProfessionistaSemplificato', start: 103, length: 1, format: 'boolean' },
          { fieldName: 'validoUnicoPf', start: 104, length: 1, format: 'boolean' },
          { fieldName: 'validoUnicoSp', start: 105, length: 1, format: 'boolean' },
          { fieldName: 'validoUnicoSc', start: 106, length: 1, format: 'boolean' },
          { fieldName: 'validoUnicoEnc', start: 107, length: 1, format: 'boolean' },
          { fieldName: 'classeIrpefIres', start: 108, length: 10 },
          { fieldName: 'classeIrap', start: 118, length: 10 },
          { fieldName: 'classeProfessionista', start: 128, length: 10 },
          { fieldName: 'classeIrapProfessionista', start: 138, length: 10 },
          { fieldName: 'classeIva', start: 148, length: 10 },
          { fieldName: 'colonnaRegistroCronologico', start: 158, length: 4 },
          { fieldName: 'colonnaRegistroIncassiPagamenti', start: 162, length: 4 },
          { fieldName: 'contoDareCee', start: 166, length: 12 },
          { fieldName: 'contoAvereCee', start: 178, length: 12 },
          { fieldName: 'naturaConto', start: 190, length: 4 },
          { fieldName: 'gestioneBeniAmmortizzabili', start: 194, length: 1 },
          { fieldName: 'percDeduzioneManutenzione', start: 195, length: 6, format: 'number:decimal' },
          { fieldName: 'gruppo', start: 257, length: 1 },
          { fieldName: 'classeDatiExtracontabili', start: 258, length: 10 },
          { fieldName: 'dettaglioClienteFornitore', start: 268, length: 1 },
          { fieldName: 'descrizioneBilancioDare', start: 269, length: 60 },
          { fieldName: 'descrizioneBilancioAvere', start: 329, length: 60 },
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
    format?: string;
  };
  
  const scrittureContabiliFields: ScritturaField[] = [
    // PNTESTA.TXT
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'externalId', start: 20, length: 12 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'causaleId', start: 39, length: 6 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'dataRegistrazione', start: 85, length: 8, format: 'date:YYYYMMDD' },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'clienteFornitoreCodiceFiscale', start: 99, length: 16 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'dataDocumento', start: 128, length: 8, format: 'date:YYYYMMDD' },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'numeroDocumento', start: 136, length: 12 },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'totaleDocumento', start: 172, length: 12, format: 'number' },
    { fileIdentifier: 'PNTESTA.TXT', fieldName: 'noteMovimento', start: 192, length: 60 },

    // PNRIGCON.TXT
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'externalId', start: 3, length: 12 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'progressivoRigo', start: 15, length: 3, format: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'tipoConto', start: 18, length: 1 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'clienteFornitoreCodiceFiscale', start: 19, length: 16 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'conto', start: 48, length: 10 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'importoDare', start: 58, length: 12, format: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'importoAvere', start: 70, length: 12, format: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'note', start: 82, length: 60 },
    { fileIdentifier: 'PNRIGCON.TXT', fieldName: 'movimentiAnalitici', start: 247, length: 1 },

    // PNRIGIVA.TXT
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'externalId', start: 3, length: 12 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'codiceIva', start: 15, length: 4 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'contropartita', start: 19, length: 10 },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imponibile', start: 29, length: 12, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'imposta', start: 41, length: 12, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'importoLordo', start: 89, length: 12, format: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', fieldName: 'note', start: 101, length: 60 },

    // MOVANAC.TXT
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'externalId', start: 3, length: 12 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'progressivoRigoContabile', start: 15, length: 3, format: 'number' },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'centroDiCosto', start: 18, length: 4 },
    { fileIdentifier: 'MOVANAC.TXT', fieldName: 'parametro', start: 22, length: 12, format: 'number' }
  ];
  await prisma.importTemplate.upsert({
    where: { name: 'scritture_contabili' },
    update: {},
    create: {
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
          { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16 },      // (3, 19)
          { fieldName: 'subcodiceAzienda', start: 20, length: 1 },         // (19, 20)
          { fieldName: 'codiceUnivoco', start: 21, length: 12 },          // (20, 32)
          { fieldName: 'codiceFiscaleClifor', start: 33, length: 16 },   // (32, 48)
          { fieldName: 'subcodiceClifor', start: 49, length: 1 },         // (48, 49)
          { fieldName: 'tipoConto', start: 50, length: 1 },              // (49, 50)
          { fieldName: 'sottocontoCliente', start: 51, length: 10 },      // (50, 60)
          { fieldName: 'sottocontoFornitore', start: 61, length: 10 },    // (60, 70)
          { fieldName: 'codiceAnagrafica', start: 71, length: 12 },       // (70, 82)
          { fieldName: 'partitaIva', start: 83, length: 11 },             // (82, 93)
          { fieldName: 'tipoSoggetto', start: 94, length: 1 },           // (93, 94)
          { fieldName: 'denominazione', start: 95, length: 60 },          // (94, 154)
          { fieldName: 'cognome', start: 155, length: 20 },               // (154, 174)
          { fieldName: 'nome', start: 175, length: 20 },                  // (174, 194)
          { fieldName: 'sesso', start: 195, length: 1 },                 // (194, 195)
          { fieldName: 'dataNascita', start: 196, length: 8, format: 'date:DDMMYYYY' }, // (195, 203)
          { fieldName: 'comuneNascita', start: 204, length: 4 },        // (203, 207)
          { fieldName: 'comuneResidenza', start: 208, length: 4 },      // (207, 211)
          { fieldName: 'cap', start: 212, length: 5 },                   // (211, 216)
          { fieldName: 'indirizzo', start: 217, length: 30 },             // (216, 246)
          { fieldName: 'prefissoTelefono', start: 247, length: 4 },      // (246, 250)
          { fieldName: 'numeroTelefono', start: 251, length: 11 },        // (250, 261)
          { fieldName: 'idFiscaleEstero', start: 262, length: 20 },      // (261, 281)
          { fieldName: 'codiceIso', start: 282, length: 2 },            // (281, 283)
          { fieldName: 'codiceIncassoPagamento', start: 284, length: 8 },  // (283, 291)
          { fieldName: 'codiceIncassoCliente', start: 292, length: 8 },    // (291, 299)
          { fieldName: 'codicePagamentoFornitore', start: 300, length: 8 },// (299, 307)
          { fieldName: 'codiceValuta', start: 308, length: 4 },           // (307, 311)
          { fieldName: 'gestioneDati770', start: 312, length: 1, format: 'boolean' },        // (311, 312)
          { fieldName: 'soggettoARitenuta', start: 313, length: 1, format: 'boolean' },      // (312, 313)
          { fieldName: 'quadro770', start: 314, length: 1 },              // (313, 314)
          { fieldName: 'contributoPrevidenziale', start: 315, length: 1, format: 'boolean' },// (314, 315)
          { fieldName: 'codiceRitenuta', start: 316, length: 5 },         // (315, 320)
          { fieldName: 'enasarco', start: 321, length: 1, format: 'boolean' },                // (320, 321)
          { fieldName: 'tipoRitenuta', start: 322, length: 1 },           // (321, 322)
          { fieldName: 'soggettoInail', start: 323, length: 1, format: 'boolean' },          // (322, 323)
          { fieldName: 'contributoPrevid335', start: 324, length: 1 },   // (323, 324)
          { fieldName: 'aliquota', start: 325, length: 6, format: 'percentage' },               // (324, 330)
          { fieldName: 'percContributoCassa', start: 331, length: 6, format: 'percentage' },   // (330, 336)
          { fieldName: 'attivitaMensilizzazione', start: 337, length: 2 } // (336, 338)
        ]
      },
    },
  });

  console.log('Template creati/aggiornati.');

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