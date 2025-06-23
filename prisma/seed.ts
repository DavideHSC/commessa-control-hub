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
      clienteId: clientePenisolaVerde.id,
    },
  });

  const commessaMassa = await prisma.commessa.create({
    data: {
      id: 'massa_lubrense',
      externalId: '2',
      nome: 'Comune di Massa Lubrense',
      clienteId: clientePenisolaVerde.id,
    },
  });

  const commessaPiano = await prisma.commessa.create({
    data: {
      id: 'piano_di_sorrento',
      externalId: '3',
      nome: 'Comune di Piano di Sorrento',
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
      clienteId: clientePenisolaVerde.id,
      commessaPadreId: commessaSorrento.id,
    },
  });
  await prisma.commessa.create({
    data: {
      id: 'massa_igiene_urbana',
      externalId: '5',
      nome: 'Igiene Urbana - Massa Lubrense',
      clienteId: clientePenisolaVerde.id,
      commessaPadreId: commessaMassa.id,
    },
  });
  await prisma.commessa.create({
    data: {
      id: 'piano_igiene_urbana',
      externalId: '6',
      nome: 'Igiene Urbana - Piano di Sorrento',
      clienteId: clientePenisolaVerde.id,
      commessaPadreId: commessaPiano.id,
    },
  });
  await prisma.commessa.create({
    data: {
      id: 'sorrento_verde_pubblico',
      externalId: '7',
      nome: 'Verde Pubblico - Sorrento',
      clienteId: clientePenisolaVerde.id,
      commessaPadreId: commessaSorrento.id,
    },
  });
  console.log('Commesse figlie (Attività) create.');

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