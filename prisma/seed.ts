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

  // A. Inserisce anagrafiche di base (Clienti/Fornitori)
  console.log('Seeding Clienti e Fornitori...');
  const clienteDefault = await prisma.cliente.create({
    data: {
      id: 'cl_rossi',
      nome: 'Mario Rossi SRL',
      piva: '01234567890',
    },
  });

  await prisma.fornitore.create({
    data: {
      id: 'for_bianchi',
      nome: 'Fratelli Bianchi SPA',
      piva: '09876543210',
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

    if (budget) {
      for (const [voceAnaliticaId, importo] of Object.entries(budget)) {
        await prisma.budgetVoce.upsert({
          where: {
            commessaId_voceAnaliticaId: {
              commessaId: createdCommessa.id,
              voceAnaliticaId: voceAnaliticaId,
            },
          },
          update: { importo: importo as number },
          create: {
            importo: importo as number,
            commessaId: createdCommessa.id,
            voceAnaliticaId: voceAnaliticaId,
          },
        });
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