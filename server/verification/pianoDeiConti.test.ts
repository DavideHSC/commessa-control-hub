import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Importa la factory dell'app e creane un'istanza per il test
import { createApp } from '../app.js';
const app = createApp();

const prisma = new PrismaClient();

// Il percorso che hai indicato tu, che è corretto.
const TEST_DATA_DIR = path.join(process.cwd(), '.docs', 'dati_cliente', 'dati_esempio', 'tests');

describe('API End-to-End: Import Piano dei Conti (/api/import/piano-dei-conti)', () => {

  // Pulisce la tabella di staging dei conti prima di ogni test
  beforeEach(async () => {
    console.log('\n🧼 Pulizia della tabella StagingConto prima del test...');
    await prisma.stagingConto.deleteMany();
    console.log('✅ Tabella StagingConto pulita.');
  });

  // Test che esegue l'intero ciclo di vita: Creazione -> Aggiornamento -> Overlay
  it('dovrebbe gestire correttamente creazione, aggiornamento e overlay dei conti', async () => {
    
    // highlight-start
    // CORREZIONE FINALE: I nomi dei file ora corrispondono esattamente
    // a quelli nello screenshot (case-sensitive).
    const contigenPath = path.join(TEST_DATA_DIR, 'ContiGen.txt');
    const contiaziPath = path.join(TEST_DATA_DIR, 'ContiAzi.txt');
    // highlight-end
    
    // --- 1. TEST CREAZIONE INIZIALE (CONTIGEN.TXT) ---
    console.log('\n--- 1. ESEGUENDO: Test di Creazione Iniziale (ContiGen.txt) ---');
    
    const responseCreazione = await request(app)
      .post('/api/import/piano-dei-conti')
      .attach('file', contigenPath);

    // VERIFICA RISPOSTA API (Creazione)
    expect(responseCreazione.status).toBe(200);
    expect(responseCreazione.body.success).toBe(true);
    expect(responseCreazione.body.stats.createdRecords).toBeGreaterThan(0);
    expect(responseCreazione.body.stats.updatedRecords).toBe(0);
    const initialCount = responseCreazione.body.stats.createdRecords;
    console.log(`✅ API Creazione: OK (${initialCount} record creati).`);

    // VERIFICA STATO DB (Creazione)
    const countDopoCreazione = await prisma.stagingConto.count();
    expect(countDopoCreazione).toBe(initialCount);
    const contiStandard = await prisma.stagingConto.findMany({ where: { codiceFiscaleAzienda: '' } });
    expect(contiStandard.length).toBe(initialCount);
    console.log('✅ DB Creazione: OK (Tutti i record sono "standard").');


    // --- 2. TEST AGGIORNAMENTO (stesso CONTIGEN.TXT) ---
    console.log('\n--- 2. ESEGUENDO: Test di Aggiornamento (stesso ContiGen.txt) ---');
    
    const responseAggiornamento = await request(app)
      .post('/api/import/piano-dei-conti')
      .attach('file', contigenPath);

    // VERIFICA RISPOSTA API (Aggiornamento)
    expect(responseAggiornamento.status).toBe(200);
    expect(responseAggiornamento.body.success).toBe(true);
    expect(responseAggiornamento.body.stats.createdRecords).toBe(0);
    expect(responseAggiornamento.body.stats.updatedRecords).toBe(initialCount);
    console.log(`✅ API Aggiornamento: OK (${initialCount} record aggiornati, 0 creati).`);

    // VERIFICA STATO DB (Aggiornamento)
    const countDopoAggiornamento = await prisma.stagingConto.count();
    expect(countDopoAggiornamento).toBe(initialCount); // Il numero totale non deve cambiare
    console.log('✅ DB Aggiornamento: OK (Nessun duplicato creato).');


    // --- 3. TEST OVERLAY (CONTIAZI.TXT) ---
    console.log('\n--- 3. ESEGUENDO: Test di Overlay (ContiAzi.txt) ---');
    
    const responseOverlay = await request(app)
      .post('/api/import/piano-dei-conti')
      .attach('file', contiaziPath);

    // VERIFICA RISPOSTA API (Overlay)
    expect(responseOverlay.status).toBe(200);
    expect(responseOverlay.body.success).toBe(true);
    const contiAziendaliImportati = responseOverlay.body.stats.createdRecords + responseOverlay.body.stats.updatedRecords;
    expect(contiAziendaliImportati).toBeGreaterThan(0);
    console.log(`✅ API Overlay: OK (${contiAziendaliImportati} record aziendali processati).`);

    // VERIFICA STATO DB (Overlay)
    const primoContoAziendale = await prisma.stagingConto.findFirst({
        where: { NOT: { codiceFiscaleAzienda: '' } }
    });
    const cfAzienda = primoContoAziendale?.codiceFiscaleAzienda;
    expect(cfAzienda).toBeDefined();

    // Verifica che tutti i conti aziendali siano stati creati/aggiornati
    const countAziendaliInDb = await prisma.stagingConto.count({ where: { codiceFiscaleAzienda: cfAzienda } });
    expect(countAziendaliInDb).toBe(contiAziendaliImportati);
    console.log(`✅ DB Overlay: OK (${countAziendaliInDb} record con CF aziendale trovati).`);

    // Verifica che i conti standard siano stati correttamente eliminati dove necessario
    const codiciContiAziendali = (await prisma.stagingConto.findMany({
        where: { codiceFiscaleAzienda: cfAzienda },
        select: { codice: true }
    })).map(c => c.codice);

    const contiStandardSovrascritti = await prisma.stagingConto.count({
        where: {
            codice: { in: codiciContiAziendali },
            codiceFiscaleAzienda: ''
        }
    });
    expect(contiStandardSovrascritti).toBe(0);
    console.log('✅ DB Overlay: OK (Nessun conto standard residuo per i codici sovrascritti).');

  }, 45000); // Timeout aumentato per gestire 3 chiamate API e query multiple
});

// Pulisce la connessione al DB dopo l'esecuzione di tutti i test
afterAll(async () => {
    await prisma.$disconnect();
});