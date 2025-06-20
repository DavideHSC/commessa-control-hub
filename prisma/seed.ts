// prisma/seed.ts (versione finale e robusta)

import { PrismaClient } from '@prisma/client';
import {
  vociAnalitiche,
  pianoDeiConti,
  commesse,
  causaliContabili,
} from '../src/data/mock';

const prisma = new PrismaClient();

async function main() {
  console.log('Inizio seeding...');

  // 1. Pulisce i dati esistenti per evitare duplicati
  console.log('Pulizia tabelle... (l\'ordine è importante!)');
  await prisma.voceTemplateScrittura.deleteMany({});
  await prisma.campoDatiPrimari.deleteMany({});
  await prisma.causaleContabile.deleteMany({});
  await prisma.allocazione.deleteMany({});
  await prisma.rigaScrittura.deleteMany({});
  await prisma.scritturaContabile.deleteMany({});
  await prisma.budgetVoce.deleteMany({});
  await prisma.commessa.deleteMany({});
  await prisma.conto.deleteMany({});
  await prisma.voceAnalitica.deleteMany({});
  await prisma.fornitore.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.importTemplate.deleteMany({});
  await prisma.fieldDefinition.deleteMany({});

  // A.1 Inserisce i template di importazione
  console.log('Seeding Template di Importazione...');
  
  // Template per Causali Contabili
  await prisma.importTemplate.create({
    data: {
      nome: 'causali',
      fields: {
        create: [
          { nomeCampo: 'id', start: 0, length: 8 },
          { nomeCampo: 'descrizione', start: 8, length: 40 },
        ],
      },
    },
  });

  // Template per Condizioni di Pagamento
  await prisma.importTemplate.create({
    data: {
      nome: 'condizioni_pagamento',
      fields: {
        create: [
          { nomeCampo: 'id', start: 0, length: 8 },
          { nomeCampo: 'descrizione', start: 8, length: 40 },
        ],
      },
    },
  });

  // Template per Codici IVA
  await prisma.importTemplate.create({
    data: {
      nome: 'codici_iva',
      fields: {
        create: [
          { nomeCampo: 'id', start: 0, length: 5 },
          { nomeCampo: 'descrizione', start: 5, length: 45 },
        ],
      },
    },
  });

  // Template per Clienti e Fornitori
  await prisma.importTemplate.create({
    data: {
      nome: 'clienti_fornitori',
      fields: {
        create: [
          { nomeCampo: 'externalId', start: 11, length: 11 },
          { nomeCampo: 'codiceFiscale', start: 22, length: 16 },
          { nomeCampo: 'tipo', start: 38, length: 1 },
          { nomeCampo: 'piva', start: 50, length: 16 },
          { nomeCampo: 'nome', start: 66, length: 50 },
        ],
      },
    },
  });

  // Template per Scritture Contabili (multi-file)
  const scrittureContabiliFields: any = [
    // Definizioni per PNTESTA.TXT
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'id_registrazione', start: 11, length: 14 },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'data_registrazione', start: 25, length: 8, type: 'date' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'codice_causale', start: 33, length: 6 },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'data_documento', start: 56, length: 8, type: 'date' },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'id_cliente_fornitore', start: 64, length: 16 },
    { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'numero_documento', start: 96, length: 16 },

    // Definizioni per PNRIGCON.TXT
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'id_registrazione_riga', start: 0, length: 15 },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'codice_conto', start: 32, length: 16 },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importo_dare', start: 48, length: 16, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importo_avere', start: 64, length: 16, type: 'number' },
    { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'descrizione_riga', start: 144, length: 81 },

    // Definizioni per PNRIGIVA.TXT
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'id_registrazione_riga', start: 0, length: 15 },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codice_iva', start: 15, length: 5 },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imponibile', start: 36, length: 16, type: 'number' },
    { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imposta', start: 52, length: 16, type: 'number' },

    // Definizioni per MOVANAC.TXT
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'id_registrazione_riga', start: 0, length: 15 },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'codice_commessa', start: 15, length: 12 },
    { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'importo_allocato', start: 27, length: 16, type: 'number' },
  ];

  await prisma.importTemplate.create({
    data: {
      nome: 'scritture_contabili',
      fields: {
        create: scrittureContabiliFields,
      }
    }
  });

  // A.2 Inserisce anagrafiche di base (Clienti/Fornitori)
  console.log('Seeding Clienti e Fornitori...');
  const clienteDefault = await prisma.cliente.create({
    data: {
      id: 'cl_rossi',
      nome: 'Mario Rossi SRL',
      piva: '01234567890',
      externalId: 'CLI-001',
    },
  });

  await prisma.fornitore.create({
    data: {
      id: 'for_bianchi',
      nome: 'Fratelli Bianchi SPA',
      piva: '09876543210',
      externalId: 'FOR-001',
    },
  });

  // Aggiungi fornitori extra per i test
  await prisma.fornitore.create({
    data: {
      id: 'for_carburanti',
      nome: 'Carburanti Express SRL',
      piva: '11223344556',
      externalId: 'FOR-002',
    },
  });

  // 2. Inserisce le Voci Analitiche
  console.log('Seeding Voci Analitiche...');
  for (const voce of vociAnalitiche) {
    await prisma.voceAnalitica.upsert({
      where: { id: voce.id },
      update: voce,
      create: voce,
    });
  }

  // 3. Inserisce il Piano dei Conti
  console.log('Seeding Piano dei Conti...');
  for (const conto of pianoDeiConti) {
    await prisma.conto.upsert({
      where: { id: conto.id },
      update: {
        codice: conto.codice,
        nome: conto.nome,
        tipo: conto.tipo,
        richiedeVoceAnalitica: conto.richiedeVoceAnalitica,
        vociAnaliticheAbilitateIds: conto.vociAnaliticheAbilitateIds,
        contropartiteSuggeriteIds: conto.contropartiteSuggeriteIds,
        voceAnaliticaSuggeritaId: conto.voceAnaliticaSuggeritaId,
      },
      create: {
        id: conto.id,
        codice: conto.codice,
        nome: conto.nome,
        tipo: conto.tipo,
        richiedeVoceAnalitica: conto.richiedeVoceAnalitica,
        vociAnaliticheAbilitateIds: conto.vociAnaliticheAbilitateIds,
        contropartiteSuggeriteIds: conto.contropartiteSuggeriteIds,
        voceAnaliticaSuggeritaId: conto.voceAnaliticaSuggeritaId,
      },
    });
  }

  // 4. Inserisce le Commesse e il loro Budget
  console.log('Seeding Commesse e Budget...');
  for (const commessa of commesse) {
    const { budget, ...commessaData } = commessa;

    // Associa il cliente di default
    const dataToCreate = {
      ...commessaData,
      clienteId: clienteDefault.id,
    };

    const createdCommessa = await prisma.commessa.upsert({
      where: { id: commessaData.id },
      update: {
        nome: commessaData.nome,
        descrizione: commessaData.descrizione,
        clienteId: clienteDefault.id,
      },
      create: {
        id: commessaData.id,
        nome: commessaData.nome,
        descrizione: commessaData.descrizione,
        clienteId: clienteDefault.id,
      },
    });

    if (budget && Array.isArray(budget)) {
      for (const voce of budget) {
        if (voce.voceAnaliticaId && voce.importo) {
          await prisma.budgetVoce.upsert({
            where: {
              commessaId_voceAnaliticaId: {
                commessaId: createdCommessa.id,
                voceAnaliticaId: voce.voceAnaliticaId,
              },
            },
            update: { importo: voce.importo },
            create: {
              importo: voce.importo,
              commessaId: createdCommessa.id,
              voceAnaliticaId: voce.voceAnaliticaId,
            },
          });
        }
      }
    }
  }

  // 5. Inserisce le Causali Contabili con i loro template
  console.log('Seeding Causali Contabili...');
  for (const causale of causaliContabili) {
    const { datiPrimari, templateScrittura, ...causaleData } = causale;

    const createdCausale = await prisma.causaleContabile.upsert({
      where: { id: causaleData.id },
      update: causaleData,
      create: causaleData,
    });

    if (datiPrimari) {
      for (const campo of datiPrimari) {
        await prisma.campoDatiPrimari.upsert({
          where: {
            causaleId_fieldId: {
              causaleId: createdCausale.id,
              fieldId: campo.id,
            },
          },
          update: {
            label: campo.label,
            tipo: campo.tipo,
            riferimentoConto: campo.riferimentoConto,
          },
          create: {
            fieldId: campo.id,
            label: campo.label,
            tipo: campo.tipo,
            riferimentoConto: campo.riferimentoConto,
            causaleId: createdCausale.id,
          },
        });
      }
    }

    if (templateScrittura) {
      for (const voce of templateScrittura) {
        // Nota: i template non hanno un ID unico, quindi li cancelliamo e ricreiamo
        await prisma.voceTemplateScrittura.deleteMany({ where: { causaleId: createdCausale.id } });
        await prisma.voceTemplateScrittura.create({
          data: {
            sezione: voce.sezione,
            contoId: voce.contoId,
            formulaImporto: voce.formulaImporto,
            causaleId: createdCausale.id,
          },
        });
      }
    }
  }

  // 6. Inserisce alcune registrazioni di esempio con ricavi e costi
  console.log('Seeding registrazioni di esempio...');
  
  // Registrazione di ricavo
  const registrazioneRicavo = await prisma.scritturaContabile.create({
    data: {
      causaleId: 'FATTURA_ATTIVA',
      descrizione: 'Fattura attiva - Comune di Sorrento',
      fornitoreId: null, // Per i ricavi non c'è fornitore
      datiAggiuntivi: {
        numeroFattura: 'FA001',
        totaleDocumento: 50000
      },
    },
  });

  // Riga di ricavo
  const rigaRicavo = await prisma.rigaScrittura.create({
    data: {
      descrizione: 'Ricavi da commessa Sorrento',
      dare: 0,
      avere: 50000,
      contoId: '5510001122', // Conto ricavi da convenzione
      scritturaContabileId: registrazioneRicavo.id,
    },
  });

  // Allocazione del ricavo alla commessa Sorrento
  await prisma.allocazione.create({
    data: {
      importo: 50000,
      descrizione: 'Ricavo commessa Sorrento',
      rigaScritturaId: rigaRicavo.id,
      commessaId: 'SORRENTO',
      voceAnaliticaId: '1', // Manodopera
    },
  });

  // Registrazione di costo
  const registrazioneCosto = await prisma.scritturaContabile.create({
    data: {
      causaleId: 'FATT_ACQ_MERCI',
      descrizione: 'Fattura passiva - Fornitore materiali',
      fornitoreId: 'for_bianchi',
      datiAggiuntivi: {
        numeroFattura: 'FP001',
        totaleDocumento: 15000
      },
    },
  });

  // Riga di costo
  const rigaCosto = await prisma.rigaScrittura.create({
    data: {
      descrizione: 'Costi materiali',
      dare: 15000,
      avere: 0,
      contoId: '60100002', // Conto acquisti prestazioni di servizi
      scritturaContabileId: registrazioneCosto.id,
    },
  });

  // Allocazione del costo alla commessa Sorrento
  await prisma.allocazione.create({
    data: {
      importo: 15000,
      descrizione: 'Costo materiali commessa Sorrento',
      rigaScritturaId: rigaCosto.id,
      commessaId: 'SORRENTO',
      voceAnaliticaId: '2', // Materiali
    },
  });

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