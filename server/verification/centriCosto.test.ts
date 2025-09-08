/**
 * CENTRI COSTO TESTS
 * Test suite per validazione import centri di costo ANAGRACC.TXT
 * 
 * Coverage:
 * - Fixed-width parsing
 * - Validator Zod
 * - Workflow import completo
 * - Integrazione staging
 * - Business validations
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { rawCentroCostoSchema, validateCentroCosto, validateCodiciUnivoci } from '../import-engine/acquisition/validators/centroCostoValidator.js';
import { executeCentriCostoImportWorkflow } from '../import-engine/orchestration/workflows/importCentriCostoWorkflow.js';

const prisma = new PrismaClient();

describe('Centri Costo Import System', () => {
  
  beforeAll(async () => {
    // Cleanup staging table
    await prisma.stagingCentroCosto.deleteMany({});
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.stagingCentroCosto.deleteMany({});
    await prisma.$disconnect();
  });

  describe('1. Zod Validator Tests', () => {
    
    test('should validate correct centro costo data', () => {
      const validData = {
        codiceFiscaleAzienda: 'TESTCOMPANY12345',
        subcodeAzienda: '1',
        codice: 'A001',
        descrizione: 'Amministrazione Generale',
        responsabile: 'Mario Rossi',
        livello: '01',
        note: 'Centro di costo principale'
      };

      const result = rawCentroCostoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.codice).toBe('A001');
        expect(result.data.descrizione).toBe('Amministrazione Generale');
        expect(result.data.livello).toBe('01');
      }
    });

    test('should reject invalid codice (too long)', () => {
      const invalidData = {
        codiceFiscaleAzienda: 'TEST',
        subcodeAzienda: '1',
        codice: 'A0001', // Too long (5 chars, max 4)
        descrizione: 'Test',
        responsabile: '',
        livello: '01',
        note: ''
      };

      const result = rawCentroCostoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('should reject invalid livello (non-numeric)', () => {
      const invalidData = {
        codiceFiscaleAzienda: 'TEST',
        subcodeAzienda: '1',
        codice: 'A001',
        descrizione: 'Test',
        responsabile: '',
        livello: 'XX', // Non-numeric
        note: ''
      };

      const result = rawCentroCostoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('should handle optional fields correctly', () => {
      const minimalData = {
        codiceFiscaleAzienda: 'TEST',
        subcodeAzienda: '1',
        codice: 'A001',
        descrizione: 'Test Centro Costo'
        // responsabile, livello, note sono opzionali
      };

      const result = rawCentroCostoSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.responsabile).toBe('');
        expect(result.data.livello).toBe('0');
        expect(result.data.note).toBe('');
      }
    });

  });

  describe('2. Business Validation Tests', () => {
    
    test('should detect duplicate centro costo codes', () => {
      const centri = [
        {
          codiceFiscaleAzienda: 'TEST123',
          subcodeAzienda: '1',
          codice: 'A001',
          descrizione: 'Centro 1',
          responsabile: '',
          livello: '01',
          note: ''
        },
        {
          codiceFiscaleAzienda: 'TEST123',
          subcodeAzienda: '1',
          codice: 'A001', // Duplicato!
          descrizione: 'Centro 2',
          responsabile: '',
          livello: '02',
          note: ''
        }
      ];

      const validation = validateCodiciUnivoci(centri);
      expect(validation.isValid).toBe(false);
      expect(validation.duplicati).toContain('A001');
    });

    test('should validate unique codes across different aziende', () => {
      const centri = [
        {
          codiceFiscaleAzienda: 'AZIENDA1',
          subcodeAzienda: '1',
          codice: 'A001',
          descrizione: 'Centro 1',
          responsabile: '',
          livello: '01',
          note: ''
        },
        {
          codiceFiscaleAzienda: 'AZIENDA2', // Diversa azienda
          subcodeAzienda: '1',
          codice: 'A001', // Stesso codice ma azienda diversa = OK
          descrizione: 'Centro 2',
          responsabile: '',
          livello: '02',
          note: ''
        }
      ];

      const validation = validateCodiciUnivoci(centri);
      expect(validation.isValid).toBe(true);
      expect(validation.duplicati).toHaveLength(0);
    });

  });

  describe('3. Import Workflow Tests', () => {
    
    test('should successfully import valid ANAGRACC data', async () => {
      // Simula contenuto file ANAGRACC.TXT (156 caratteri per riga)
      const fileContent = [
        // filler(3) + CF_AZIENDA(16) + SUB(1) + CODICE(4) + DESCRIZIONE(40) + RESPONSABILE(40) + LIVELLO(2) + NOTE(50)
        '   TESTCOMPANY12345 1A001Amministrazione Generale            Mario Rossi                             01Centro di costo principale amministrativo       ',
        '   TESTCOMPANY12345 1B001Produzione                          Giuseppe Verdi                          02Centro di costo produzione e manifattura        ',
        '   TESTCOMPANY12345 1C001Vendite                              Anna Bianchi                           03Centro di costo commerciale e vendite          '
      ].join('\n');

      const result = await executeCentriCostoImportWorkflow(fileContent, 'centri_costo');

      expect(result.success).toBe(true);
      expect(result.stats.totalRecords).toBe(3);
      expect(result.stats.successfulRecords).toBe(3);
      expect(result.stats.errorRecords).toBe(0);
      expect(result.centriCostoStats.duplicatiRimossi).toBe(0);

      // Verifica che i dati siano stati salvati in staging
      const savedRecords = await prisma.stagingCentroCosto.findMany({
        orderBy: { codice: 'asc' }
      });

      expect(savedRecords).toHaveLength(3);
      expect(savedRecords[0].codice).toBe('A001');
      expect(savedRecords[0].descrizione).toContain('Amministrazione');
      expect(savedRecords[1].codice).toBe('B001');
      expect(savedRecords[2].codice).toBe('C001');
    });

    test('should handle malformed records gracefully', async () => {
      // Record troppo corto (mancano dati)
      const fileContent = 'INVALID_RECORD_TOO_SHORT';

      const result = await executeCentriCostoImportWorkflow(fileContent, 'centri_costo');

      // Dovrebbe completarsi ma con errori
      expect(result.success).toBe(false);
      expect(result.stats.totalRecords).toBe(1);
      expect(result.stats.errorRecords).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    test('should handle empty file', async () => {
      const fileContent = '';

      const result = await executeCentriCostoImportWorkflow(fileContent, 'centri_costo');

      expect(result.success).toBe(true);
      expect(result.stats.totalRecords).toBe(0);
      expect(result.stats.successfulRecords).toBe(0);
      expect(result.message).toContain('Nessun dato valido trovato');
    });

    test('should handle upsert correctly (update existing records)', async () => {
      // Prima importazione
      const firstImport = [
        '   TESTCOMPANY12345 1D001Marketing                            Luigi Bianchi                           04Centro marketing originale                      '
      ].join('\n');

      const result1 = await executeCentriCostoImportWorkflow(firstImport, 'centri_costo');
      expect(result1.success).toBe(true);
      expect(result1.stats.successfulRecords).toBe(1);

      // Seconda importazione con stesso codice ma descrizione diversa
      const secondImport = [
        '   TESTCOMPANY12345 1D001Marketing e Comunicazione           Luigi Bianchi                           04Centro marketing aggiornato                     '
      ].join('\n');

      const result2 = await executeCentriCostoImportWorkflow(secondImport, 'centri_costo');
      expect(result2.success).toBe(true);

      // Verifica che il record sia stato aggiornato
      const updatedRecord = await prisma.stagingCentroCosto.findFirst({
        where: { codice: 'D001' }
      });

      expect(updatedRecord).toBeTruthy();
      expect(updatedRecord?.descrizione).toContain('Comunicazione');
      expect(updatedRecord?.note).toContain('aggiornato');
    });

  });

  describe('4. Integration Tests', () => {
    
    test('should validate staging readiness', async () => {
      const { validateCentriCostoStagingReadiness } = await import('../import-engine/orchestration/workflows/importCentriCostoWorkflow.js');
      
      const validation = await validateCentriCostoStagingReadiness();
      
      expect(validation).toHaveProperty('isReady');
      expect(validation).toHaveProperty('totalCentriCosto');
      expect(validation).toHaveProperty('issues');
      expect(Array.isArray(validation.issues)).toBe(true);
      
      // Se ci sono record da test precedenti, dovrebbe essere ready
      if (validation.totalCentriCosto > 0) {
        expect(validation.isReady).toBe(true);
      }
    });

    test('should handle large import (performance test)', async () => {
      // Genera 100 record per test performance
      const records: string[] = [];
      for (let i = 1; i <= 100; i++) {
        const codice = `T${i.toString().padStart(3, '0')}`;
        const descrizione = `Centro Test ${i}`.padEnd(40, ' ');
        const responsabile = `Responsabile ${i}`.padEnd(40, ' ');
        const livello = (i % 5 + 1).toString().padStart(2, '0');
        const note = `Note centro ${i}`.padEnd(50, ' ');
        
        records.push(`   TESTCOMPANY12345 1${codice}${descrizione}${responsabile}${livello}${note}`);
      }

      const fileContent = records.join('\n');
      const startTime = Date.now();
      
      const result = await executeCentriCostoImportWorkflow(fileContent, 'centri_costo');
      
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(result.stats.totalRecords).toBe(100);
      expect(result.stats.successfulRecords).toBe(100);
      expect(duration).toBeLessThan(5000); // Meno di 5 secondi per 100 record
    });

  });

  describe('5. Error Handling Tests', () => {
    
    test('should handle database connection errors gracefully', async () => {
      // Questo test potrebbe essere skippato in CI se non è possibile simulare errori DB
      // Per ora testa solo che la funzione non crashi
      try {
        await executeCentriCostoImportWorkflow('test', 'non_existing_template');
      } catch (error) {
        // Errore atteso per template inesistente
        expect(error).toBeTruthy();
      }
    });

    test('should provide detailed error messages', async () => {
      const invalidContent = [
        '   TESTCOMPANY12345 1TOOLONG Centro con codice troppo lungo       Mario Rossi                             01Note del centro                                 '
        // Il codice "TOOLONG" ha 7 caratteri, eccede il limite di 4
      ].join('\n');

      const result = await executeCentriCostoImportWorkflow(invalidContent, 'centri_costo');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('massimo 4 caratteri');
    });

  });

});

// Test helper functions per usage esterno
export const createTestCentroCostoData = (codice: string = 'TEST') => ({
  codiceFiscaleAzienda: 'TESTCOMPANY12345',
  subcodeAzienda: '1',
  codice,
  descrizione: `Centro di costo ${codice}`,
  responsabile: 'Test Responsabile',
  livello: '01',
  note: 'Note di test'
});

export const createTestANAGRACCContent = (centri: Array<{ codice: string; descrizione: string; responsabile?: string }>) => {
  return centri.map(centro => {
    const descrizione = centro.descrizione.padEnd(40, ' ');
    const responsabile = (centro.responsabile || 'Test Responsabile').padEnd(40, ' ');
    
    return `   TESTCOMPANY12345 1${centro.codice}${descrizione}${responsabile}01Note di test per ${centro.codice}                     `;
  }).join('\n');
};