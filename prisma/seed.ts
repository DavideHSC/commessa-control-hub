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
    const createdCommessa = await prisma.commessa.upsert({
      where: { id: commessaData.id },
      update: commessaData,
      create: commessaData,
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