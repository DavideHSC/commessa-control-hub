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
        // Campi principali (bibbia parser_causali.py)
        { fieldName: 'codiceCausale', start: 4, length: 6 },                          // pos 5-10
        { fieldName: 'descrizione', start: 10, length: 40 },                         // pos 11-50
        { fieldName: 'tipoMovimento', start: 50, length: 1 },                        // pos 51
        { fieldName: 'tipoAggiornamento', start: 51, length: 1 },                    // pos 52
        { fieldName: 'dataInizio', start: 52, length: 8, format: 'date:DDMMYYYY' },  // pos 53-60
        { fieldName: 'dataFine', start: 60, length: 8, format: 'date:DDMMYYYY' },    // pos 61-68
        { fieldName: 'tipoRegistroIva', start: 68, length: 1 },                      // pos 69
        { fieldName: 'segnoMovimentoIva', start: 69, length: 1 },                    // pos 70
        { fieldName: 'contoIva', start: 70, length: 10 },                            // pos 71-80
        { fieldName: 'generazioneAutofattura', start: 80, length: 1 },               // pos 81
        { fieldName: 'tipoAutofatturaGenerata', start: 81, length: 1 },              // pos 82
        { fieldName: 'contoIvaVendite', start: 82, length: 10 },                     // pos 83-92
        { fieldName: 'fatturaImporto0', start: 92, length: 1 },                      // pos 93
        { fieldName: 'fatturaValutaEstera', start: 93, length: 1 },                  // pos 94
        { fieldName: 'nonConsiderareLiquidazioneIva', start: 94, length: 1 },        // pos 95
        { fieldName: 'ivaEsigibilitaDifferita', start: 95, length: 1 },              // pos 96
        { fieldName: 'fatturaEmessaRegCorrispettivi', start: 96, length: 1 },        // pos 97
        { fieldName: 'gestionePartite', start: 97, length: 1 },                      // pos 98
        { fieldName: 'gestioneIntrastat', start: 98, length: 1 },                    // pos 99
        { fieldName: 'gestioneRitenuteEnasarco', start: 99, length: 1 },             // pos 100
        { fieldName: 'versamentoRitenute', start: 100, length: 1 },                  // pos 101
        { fieldName: 'noteMovimento', start: 101, length: 60 },                      // pos 102-161
        { fieldName: 'descrizioneDocumento', start: 161, length: 5 },                // pos 162-166
        { fieldName: 'identificativoEsteroClifor', start: 166, length: 1 },          // pos 167
        { fieldName: 'scritturaRettificaAssestamento', start: 167, length: 1 },      // pos 168
        { fieldName: 'nonStampareRegCronologico', start: 168, length: 1 },           // pos 169
        { fieldName: 'movimentoRegIvaNonRilevante', start: 169, length: 1 },         // pos 170
        { fieldName: 'tipoMovimentoSemplificata', start: 170, length: 1 }            // pos 171
      ] },
    }
  });

  // Template Condizioni Pagamento
  await prisma.importTemplate.upsert({
    where: { name: 'condizioni_pagamento' },
    update: {},
    create: {
      name: 'condizioni_pagamento',
      modelName: 'CondizionePagamento',
      fieldDefinitions: { create: [
        { fieldName: 'id', start: 4, length: 8 },
        { fieldName: 'externalId', start: 4, length: 8 },
        { fieldName: 'descrizione', start: 12, length: 40 },
        { fieldName: 'contoIncassoPagamento', start: 52, length: 10 },
        { fieldName: 'suddivisione', start: 64, length: 1 },
        { fieldName: 'inizioScadenza', start: 65, length: 1 },
        { fieldName: 'numeroRate', start: 66, length: 2, format: 'number' }
      ] },
    }
  });

  // Template Codici IVA
  await prisma.importTemplate.upsert({
    where: { name: 'codici_iva' },
    update: {},
    create: {
      name: 'codici_iva',
      modelName: 'CodiceIva',
      fieldDefinitions: { create: [
        { fieldName: 'id', start: 4, length: 4 },
        { fieldName: 'externalId', start: 4, length: 4 },
        { fieldName: 'descrizione', start: 8, length: 40 },
        { fieldName: 'tipoCalcolo', start: 48, length: 1 },
        { fieldName: 'aliquota', start: 49, length: 6, format: 'number' },
        { fieldName: 'indetraibilita', start: 55, length: 3, format: 'number' },
        { fieldName: 'note', start: 58, length: 40 },
        { fieldName: 'dataInizio', start: 98, length: 8, format: 'date:YYYYMMDD' },
        { fieldName: 'dataFine', start: 106, length: 8, format: 'date:YYYYMMDD' }
      ] },
    }
  });

  // Template Anagrafica Clienti/Fornitori
  await prisma.importTemplate.upsert({
    where: { name: 'anagrafica_clifor' },
    update: {},
    create: {
      name: 'anagrafica_clifor',
      modelName: null,
      fieldDefinitions: { create: [
        { fieldName: 'id', start: 20, length: 12 },
        { fieldName: 'externalId', start: 20, length: 12 },
        { fieldName: 'codiceFiscale', start: 32, length: 16 },
        { fieldName: 'tipo', start: 49, length: 1 },
        { fieldName: 'piva', start: 82, length: 11 },
        { fieldName: 'nome', start: 94, length: 60 }
      ] },
    }
  });

  // Template Piano dei Conti
  // Prima elimina le FieldDefinition esistenti per il template piano_dei_conti
  const existingTemplate = await prisma.importTemplate.findUnique({
    where: { name: 'piano_dei_conti' },
    include: { fieldDefinitions: true }
  });
  
  if (existingTemplate) {
    // Elimina prima le FieldDefinition
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: existingTemplate.id }
    });
    // Poi elimina il template
    await prisma.importTemplate.delete({
      where: { id: existingTemplate.id }
    });
  }
  
  await prisma.importTemplate.create({
    data: {
      name: 'piano_dei_conti',
      modelName: null, // Gestione custom per mappare i tipi
      fieldDefinitions: { create: [
        // Campi principali (come parser Python)
        { fieldName: 'livello', start: 4, length: 1 },                    // pos 5
        { fieldName: 'codice', start: 5, length: 10 },                    // pos 6-15 CODIFICA
        { fieldName: 'nome', start: 15, length: 60 },                     // pos 16-75 DESCRIZIONE
        { fieldName: 'tipoChar', start: 75, length: 1 },                  // pos 76 TIPO
        { fieldName: 'sigla', start: 76, length: 12 },                    // pos 77-88
        { fieldName: 'controlloSegno', start: 88, length: 1 },            // pos 89
        { fieldName: 'contoCostiRicavi', start: 89, length: 10 },         // pos 90-99
        
        // Validità per tipo contabilità
        { fieldName: 'validoImpresaOrd', start: 99, length: 1 },          // pos 100
        { fieldName: 'validoImpresaSempl', start: 100, length: 1 },       // pos 101
        { fieldName: 'validoProfOrd', start: 101, length: 1 },            // pos 102
        { fieldName: 'validoProfSempl', start: 102, length: 1 },          // pos 103
        
        // Validità per tipo dichiarazione
        { fieldName: 'validoUnicoPf', start: 103, length: 1 },            // pos 104
        { fieldName: 'validoUnicoSp', start: 104, length: 1 },            // pos 105
        { fieldName: 'validoUnicoSc', start: 105, length: 1 },            // pos 106
        { fieldName: 'validoUnicoEnc', start: 106, length: 1 },           // pos 107
        
        // Classi fiscali
        { fieldName: 'classeIrpefIres', start: 107, length: 10 },         // pos 108-117
        { fieldName: 'classeIrap', start: 117, length: 10 },              // pos 118-127
        { fieldName: 'classeProfessionista', start: 127, length: 10 },    // pos 128-137
        { fieldName: 'classeIrapProf', start: 137, length: 10 },          // pos 138-147
        { fieldName: 'classeIva', start: 147, length: 10 },               // pos 148-157
        
        // Registro professionisti
        { fieldName: 'colRegCronologico', start: 157, length: 4 },        // pos 158-161
        { fieldName: 'colRegIncassiPag', start: 161, length: 4 },         // pos 162-165
        
        // Piano dei conti CEE
        { fieldName: 'contoDare', start: 165, length: 12 },               // pos 166-177
        { fieldName: 'contoAvere', start: 177, length: 12 },              // pos 178-189
        
        // Altri dati
        { fieldName: 'naturaConto', start: 189, length: 4 },              // pos 190-193
        { fieldName: 'gestioneBeniAmm', start: 193, length: 1 },          // pos 194
        { fieldName: 'percDedManut', start: 194, length: 6 },             // pos 195-200
        
        { fieldName: 'gruppo', start: 256, length: 1 },                   // pos 257
        { fieldName: 'classeDatiExtra', start: 257, length: 10 },         // pos 258-267
        { fieldName: 'dettaglioCliFor', start: 267, length: 1 },          // pos 268
        
        // Descrizioni bilancio
        { fieldName: 'descBilancioDare', start: 268, length: 60 },        // pos 269-328
        { fieldName: 'descBilancioAvere', start: 328, length: 60 }        // pos 329-388
      ] },
    }
  });

  // Template Scritture Contabili
  const scrittureContabiliFields: any = [
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

  console.log('Template di importazione creati/aggiornati.');
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