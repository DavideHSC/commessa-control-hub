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

describe('API End-to-End: Import Codici IVA (/api/import/codici-iva)', () => {

  // Pulisce la tabella di staging dei codici IVA prima di ogni test.
  beforeEach(async () => {
    console.log('\n🧼 Pulizia della tabella StagingCodiceIva prima del test...');
    await prisma.stagingCodiceIva.deleteMany();
    console.log('✅ Tabella StagingCodiceIva pulita.');
  });

  // Test principale per l'importazione dei codici IVA.
  it('dovrebbe caricare il file CODICIVA.TXT, processarlo e popopolare la tabella di staging', async () => {
    
    // Corretto il nome del file per corrispondere a quello reale (case-sensitive).
    const codiciIvaPath = path.join(TEST_DATA_DIR, 'CodicIva.txt');

    // Verifica preliminare che il file di test esista.
    if (!fs.existsSync(codiciIvaPath)) {
      throw new Error(`File di test non trovato al percorso: ${codiciIvaPath}. Assicurati che lo script 'prepare_test_data.ts' sia stato eseguito correttamente.`);
    }

    console.log(`\n--- ESEGUENDO: Test di Importazione Codici IVA (CodicIva.txt) ---`);
    console.log(`📂 Caricamento file da: ${codiciIvaPath}`);
    
    // ESECUZIONE: Simula l'upload del file tramite l'endpoint API.
    const response = await request(app)
      .post('/api/import/codici-iva')
      .attach('file', codiciIvaPath);

    // 1. VERIFICA DELLA RISPOSTA API
    console.log('📊 Analisi della risposta API...');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.createdCount).toBeGreaterThan(0);
    console.log(`✅ Risposta API valida: ${response.body.createdCount} record creati nello staging.`);
    
    const recordCreati = response.body.createdCount;

    // 2. VERIFICA DEI DATI SUL DATABASE
    console.log('🔍 Verifica dei dati scritti nel database di staging...');
    const codiciIvaInDbCount = await prisma.stagingCodiceIva.count();

    // Il numero di record nel DB deve corrispondere a quanto dichiarato dalla API.
    expect(codiciIvaInDbCount).toBe(recordCreati);
    console.log(`✅ Conteggio record nel DB (${codiciIvaInDbCount}) corrisponde alle statistiche della API.`);

    // 3. VERIFICA DI UN RECORD CAMPIONE
    // Selezioniamo il codice '22' (IVA 22%) che è un caso d'uso standard e quasi certamente presente.
    const codiceIva22 = await prisma.stagingCodiceIva.findFirst({
        where: { codice: '22' }
    });
    
    expect(codiceIva22).toBeDefined();
    // Verifichiamo che i campi principali siano stati parsati correttamente secondo il tracciato
    expect(codiceIva22?.descrizione).toBe('Iva al 22%');
    expect(codiceIva22?.tipoCalcolo).toBe('O'); // 'O' = Normale
    
    // MODIFICA CORRETTIVA:
    // Il parser esegue un .trim() sul campo estratto. Se il file contiene "    22 ",
    // il risultato corretto dopo il parsing è "22". Il test ora verifica questo.
    expect(codiceIva22?.aliquota).toBe('22');

    console.log('✅ Verifica di un record campione (Codice IVA 22) superata.');
    
  }, 20000); // Timeout di 20 secondi.
});

// Pulisce la connessione al DB dopo l'esecuzione di tutti i test.
afterAll(async () => {
    await prisma.$disconnect();
});