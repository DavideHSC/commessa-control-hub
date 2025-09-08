import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { createApp } from '../app.js';

// --- SETUP ---
const app = createApp();
const prisma = new PrismaClient();

// Definiamo il percorso della cartella dei dati di test.
// NOTA: Usiamo lo stesso percorso che abbiamo confermato funzionare.
const TEST_DATA_DIR = path.join(process.cwd(), '.docs', 'dati_cliente', 'dati_esempio', 'tests');

describe('API End-to-End: Import Anagrafiche (/api/import/clienti-fornitori)', () => {

  // Pulisce la tabella di staging delle anagrafiche prima di ogni test.
  beforeEach(async () => {
    console.log('\n🧼 Pulizia della tabella StagingAnagrafica prima del test...');
    await prisma.stagingAnagrafica.deleteMany();
    console.log('✅ Tabella StagingAnagrafica pulita.');
  });

  // Test principale per l'importazione delle anagrafiche.
  it('dovrebbe caricare il file A_CLIFOR.TXT, processarlo e popopolare la tabella di staging', async () => {
    
    const anagrafichePath = path.join(TEST_DATA_DIR, 'A_CLIFOR.TXT');

    // Verifica preliminare che il file di test esista nel percorso atteso.
    if (!fs.existsSync(anagrafichePath)) {
      throw new Error(`File di test non trovato al percorso: ${anagrafichePath}. Assicurati che il file esista.`);
    }

    console.log(`\n--- ESEGUENDO: Test di Importazione Anagrafiche (A_CLIFOR.TXT) ---`);
    console.log(`📂 Caricamento file da: ${anagrafichePath}`);
    
    // ESECUZIONE: Simula l'upload del file tramite l'endpoint API corretto.
    const response = await request(app)
      .post('/api/import/clienti-fornitori') // Usa l'endpoint corretto definito in import.ts
      .attach('file', anagrafichePath);

    // 1. VERIFICA DELLA RISPOSTA API
    console.log('📊 Analisi della risposta API...');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.createdRecords).toBeGreaterThan(0);
    console.log(`✅ Risposta API valida: ${response.body.createdRecords} record creati nello staging.`);
    
    const recordCreati = response.body.createdRecords;

    // 2. VERIFICA DEI DATI SUL DATABASE
    console.log('🔍 Verifica dei dati scritti nel database di staging...');
    const anagraficheInDbCount = await prisma.stagingAnagrafica.count();

    // Il numero di record nel DB deve corrispondere a quanto dichiarato dalla API.
    expect(anagraficheInDbCount).toBe(recordCreati);
    console.log(`✅ Conteggio record nel DB (${anagraficheInDbCount}) corrisponde alle statistiche della API.`);

    // 3. VERIFICA DI UN RECORD CAMPIONE
    // Controlliamo che un record esista e che alcuni campi chiave siano stati popolati.
    const unAnagrafica = await prisma.stagingAnagrafica.findFirst();
    expect(unAnagrafica).toBeDefined();
    expect(unAnagrafica?.codiceUnivoco).toBeDefined();
    expect(unAnagrafica?.denominazione).toBeDefined(); // Un campo testuale chiave
    expect(unAnagrafica?.tipoConto).toBeDefined();      // Un campo logico chiave

    console.log('✅ Verifica di un record campione superata.');
    
  }, 30000); // Timeout aumentato a 30 secondi per gestire file potenzialmente grandi.
});

// Pulisce la connessione al DB dopo l'esecuzione di tutti i test.
afterAll(async () => {
    await prisma.$disconnect();
});