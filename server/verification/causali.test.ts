import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { createApp } from '../app.js';

// --- SETUP ---
const app = createApp();
const prisma = new PrismaClient();

// Definiamo il percorso della cartella dei dati di test.
const TEST_DATA_DIR = path.join(process.cwd(), '.docs', 'dati_cliente', 'dati_esempio', 'tests');

describe('API End-to-End: Import Causali Contabili (/api/import/causali-contabili)', () => {

  // Pulisce la tabella di staging delle causali prima di ogni test.
  beforeEach(async () => {
    console.log('\n🧼 Pulizia della tabella StagingCausaleContabile prima del test...');
    await prisma.stagingCausaleContabile.deleteMany();
    console.log('✅ Tabella StagingCausaleContabile pulita.');
  });

  // Test principale per l'importazione delle causali contabili.
  it('dovrebbe importare correttamente e verificare un record esistente', async () => {
    
    const causaliPath = path.join(TEST_DATA_DIR, 'Causali.txt');

    // Verifica preliminare che il file di test esista.
    if (!fs.existsSync(causaliPath)) {
      throw new Error(`File di test non trovato al percorso: ${causaliPath}. Assicurati che il file esista.`);
    }

    console.log(`\n--- ESEGUENDO: Test di Importazione Causali Contabili (Causali.txt) ---`);
    console.log(`📂 Caricamento file da: ${causaliPath}`);
    
    // ESECUZIONE: Simula l'upload del file tramite l'endpoint API.
    const response = await request(app)
      .post('/api/import/causali-contabili')
      .attach('file', causaliPath);

    // 1. VERIFICA DELLA RISPOSTA API
    console.log('📊 Analisi della risposta API...');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.stats.createdRecords).toBeGreaterThan(0);
    console.log(`✅ Risposta API valida: ${response.body.stats.createdRecords} record creati nello staging.`);
    
    const recordCreati = response.body.stats.createdRecords;

    // 2. VERIFICA DEI DATI SUL DATABASE
    console.log('🔍 Verifica dei dati scritti nel database di staging...');
    const causaliInDbCount = await prisma.stagingCausaleContabile.count();
    expect(causaliInDbCount).toBe(recordCreati);
    console.log(`✅ Conteggio record nel DB (${causaliInDbCount}) corrisponde alle statistiche della API.`);

    // highlight-start
    // 3. VERIFICA DI UN RECORD CAMPIONE ESISTENTE
    // Basandoci sui dati reali nel DB, usiamo 'AC20' che è stato parsato correttamente.
    const causaleAc20 = await prisma.stagingCausaleContabile.findFirst({
        where: { codiceCausale: 'AC20' }
    });
    
    expect(causaleAc20).toBeDefined();
    
    // VERIFICA DESCRIZIONE: Controlliamo che la descrizione corrisponda.
    console.log(`Verifica descrizione per ${causaleAc20?.codiceCausale}...`);
    expect(causaleAc20?.descrizione).toBe('Fattura ricevuta cellulari reverse');

    // VERIFICA BOOLEANO: Il campo 'generazioneAutofattura' per AC20 nel file è 'X' (pos 81).
    // Ci aspettiamo che sia stato convertito in booleano e salvato come stringa "true".
    console.log(`Verifica conversione booleana per ${causaleAc20?.codiceCausale}...`);
    expect(causaleAc20?.generazioneAutofattura).toBe('true');
    console.log(`✅ Verifica del record campione 'AC20' superata.`);
    // highlight-end
    
  }, 20000); // Timeout di 20 secondi.
});

// Pulisce la connessione al DB dopo l'esecuzione di tutti i test.
afterAll(async () => {
    await prisma.$disconnect();
});