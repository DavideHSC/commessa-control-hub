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

describe('API End-to-End: Import Condizioni Pagamento (/api/import/condizioni-pagamento)', () => {

  // Pulisce la tabella di staging delle condizioni pagamento prima di ogni test.
  beforeEach(async () => {
    console.log('\n🧼 Pulizia della tabella StagingCondizionePagamento prima del test...');
    await prisma.stagingCondizionePagamento.deleteMany();
    console.log('✅ Tabella StagingCondizionePagamento pulita.');
  });

  // Test principale per l'importazione delle condizioni di pagamento.
  it('dovrebbe caricare il file CODPAGAM.TXT, processarlo e popopolare la tabella di staging', async () => {
    
    // Nome del file di test per le condizioni di pagamento.
    // TEMP: uso il file dai tracciati originali finché non viene creato il file test
    const condizioniPagamentoPath = path.join(process.cwd(), '.docs', 'dati_cliente', 'tracciati', 'CODPAGAM.TXT');

    // Verifica preliminare che il file di test esista.
    if (!fs.existsSync(condizioniPagamentoPath)) {
      throw new Error(`File di test non trovato al percorso: ${condizioniPagamentoPath}. Assicurati che lo script 'prepare_test_data.ts' sia stato eseguito correttamente.`);
    }

    console.log(`\n--- ESEGUENDO: Test di Importazione Condizioni Pagamento (CODPAGAM.TXT) ---`);
    console.log(`📂 Caricamento file da: ${condizioniPagamentoPath}`);
    
    // ESECUZIONE: Simula l'upload del file tramite l'endpoint API.
    const response = await request(app)
      .post('/api/import/condizioni-pagamento')
      .attach('file', condizioniPagamentoPath);

    // 1. VERIFICA DELLA RISPOSTA API
    console.log('📊 Analisi della risposta API...');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.stats.totalRecords).toBeGreaterThan(0);
    console.log(`✅ Risposta API valida: ${response.body.stats.totalRecords} record processati.`);
    
    const recordCreati = response.body.stats.successfulRecords || response.body.stats.createdRecords || response.body.stats.totalRecords;

    // 2. VERIFICA DEI DATI SUL DATABASE
    console.log('🔍 Verifica dei dati scritti nel database di staging...');
    const condizioniPagamentoInDbCount = await prisma.stagingCondizionePagamento.count();

    // Il numero di record nel DB deve corrispondere ai record validati con successo
    expect(condizioniPagamentoInDbCount).toBe(recordCreati);
    console.log(`✅ Conteggio record nel DB (${condizioniPagamentoInDbCount}) corrisponde alle statistiche della API.`);

    // 3. VERIFICA DI UN RECORD CAMPIONE
    // Selezioniamo un record campione per verificare il parsing corretto.
    const primaCondizione = await prisma.stagingCondizionePagamento.findFirst({
      orderBy: { codicePagamento: 'asc' }
    });
    
    expect(primaCondizione).toBeDefined();
    // Verifichiamo che i campi principali siano stati parsati correttamente
    expect(primaCondizione?.codicePagamento).toBeDefined();
    expect(primaCondizione?.descrizione).toBeDefined();
    expect(primaCondizione?.descrizione?.length).toBeGreaterThan(0);

    console.log(`✅ Verifica di un record campione (Codice: ${primaCondizione?.codicePagamento}) superata.`);
    
  }, 20000); // Timeout di 20 secondi.
});

// Pulisce la connessione al DB dopo l'esecuzione di tutti i test.
afterAll(async () => {
    await prisma.$disconnect();
});