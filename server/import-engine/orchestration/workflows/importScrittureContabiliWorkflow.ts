import { 
  pnTestaDefinitions,
  pnRigConDefinitions,
  pnRigIvaDefinitions,
  movAnacDefinitions,
} from '../../acquisition/definitions/scrittureContabiliDefinitions';
import { PrismaClient } from '@prisma/client';
import { parseFixedWidth, FieldDefinition } from '../../../lib/fixedWidthParser';
import { DLQService } from '../../persistence/dlq/DLQService';
import { ImportJob } from '../../core/jobs/ImportJob';
import { TelemetryService } from '../../core/telemetry/TelemetryService';
import {
  rawPnTestaSchema,
  rawPnRigConSchema,
  rawPnRigIvaSchema,
  rawMovAnacSchema,
  validatedPnTestaSchema,
  validatedPnRigConSchema,
  validatedPnRigIvaSchema,
  validatedMovAnacSchema,
  ValidatedPnTesta,
  ValidatedPnRigCon,
  ValidatedPnRigIva,
  ValidatedMovAnac,
} from '../../acquisition/validators/scrittureContabiliValidator';
import { transformScrittureContabili, ScrittureContabiliTransformResult } from '../../transformation/transformers/scrittureContabiliTransformer';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - WORKFLOW ORCHESTRATOR
// =============================================================================
// Questo è il cuore del parser più complesso del sistema (⭐⭐⭐⭐⭐).
// Coordina il parsing, validazione, trasformazione e persistenza di 4 file
// interconnessi mantenendo integrità transazionale assoluta.
//
// FLUSSO:
// 1. ACQUISIZIONE: Parsing type-safe dei 4 file
// 2. VALIDAZIONE: Validazione Zod con gestione errori
// 3. TRASFORMAZIONE: Logica business pura multi-file
// 4. PERSISTENZA: Pattern staging-commit con transazioni atomiche
// =============================================================================

// -----------------------------------------------------------------------------
// TIPI E INTERFACCE
// -----------------------------------------------------------------------------

export interface ScrittureContabiliFiles {
  pnTesta: Buffer;
  pnRigCon: Buffer;
  pnRigIva?: Buffer;
  movAnac?: Buffer;
}

// Interfaccia per statistiche di creazione delle entità
interface EntityCreationStat {
  count: number;
  sample: { id: string; nome: string }[];
}

export interface ImportScrittureContabiliResult {
  success: boolean;
  jobId: string;
  stats: {
    filesProcessed: number;
    scrittureImportate: number;
    righeContabiliOrganizzate: number;
    righeIvaOrganizzate: number;
    allocazioniOrganizzate: number;
    erroriValidazione: number;
    contiCreati: EntityCreationStat;
    fornitoriCreati: EntityCreationStat;
    causaliCreate: EntityCreationStat;
    codiciIvaCreati: EntityCreationStat;
    vociAnaliticheCreate: EntityCreationStat;
  };
  message: string;
}

interface RawData {
  pnTesta: Record<string, unknown>[];
  pnRigCon: Record<string, unknown>[];
  pnRigIva: Record<string, unknown>[];
  movAnac: Record<string, unknown>[];
}

// -----------------------------------------------------------------------------
// SERVIZI DIPENDENTI
// -----------------------------------------------------------------------------

export class ImportScrittureContabiliWorkflow {

  constructor(
    private prisma: PrismaClient,
    private dlqService: DLQService,
    private telemetryService: TelemetryService
  ) {}

  // ---------------------------------------------------------------------------
  // METODO PRINCIPALE
  // ---------------------------------------------------------------------------

  /**
   * Importa le scritture contabili da 4 file interconnessi
   * Implementa pattern staging-commit per garantire atomicità
   */
  async execute(files: ScrittureContabiliFiles): Promise<ImportScrittureContabiliResult> {
    const job = ImportJob.create('import_scritture_contabili');
    const startTime = Date.now();
    
    console.log('\n' + '='.repeat(80));
    console.log('🚀 PARSER 6: SCRITTURE CONTABILI - Avvio Import Multi-File');
    console.log('='.repeat(80));
    
    this.telemetryService.logJobStart(job);

    try {
      // FASE 1: ACQUISIZIONE - Parsing type-safe dei 4 file
      console.log('\n📋 FASE 1: ACQUISIZIONE DATI');
      console.log('─'.repeat(50));
      console.log('🔍 DEBUG: File ricevuti:');
      console.log('  - pnTesta:', files.pnTesta ? files.pnTesta.length + ' bytes' : 'MISSING');
      console.log('  - pnRigCon:', files.pnRigCon ? files.pnRigCon.length + ' bytes' : 'MISSING');
      console.log('  - pnRigIva:', files.pnRigIva ? files.pnRigIva.length + ' bytes' : 'MISSING');
      console.log('  - movAnac:', files.movAnac ? files.movAnac.length + ' bytes' : 'MISSING');
      
      this.telemetryService.logInfo(job.id, 'Iniziando parsing multi-file...');
      const rawData = await this.parseMultiFiles(files, job.id);
      
      const totalRawRecords = rawData.pnTesta.length + rawData.pnRigCon.length + 
                             rawData.pnRigIva.length + rawData.movAnac.length;
      
      console.log(`✅ Parsing completato:`);
      console.log(`   📄 PNTESTA.TXT:   ${rawData.pnTesta.length.toString().padStart(4)} record (testate)`);
      console.log(`   📄 PNRIGCON.TXT:  ${rawData.pnRigCon.length.toString().padStart(4)} record (righe contabili)`);
      console.log(`   📄 PNRIGIVA.TXT:  ${rawData.pnRigIva.length.toString().padStart(4)} record (righe IVA)`);
      console.log(`   📄 MOVANAC.TXT:   ${rawData.movAnac.length.toString().padStart(4)} record (allocazioni)`);
      console.log(`   📊 TOTALE:        ${totalRawRecords.toString().padStart(4)} record estratti`);

      // FASE 2: VALIDAZIONE - Validazione Zod con error handling
      console.log('\n🔍 FASE 2: VALIDAZIONE E PULIZIA DATI');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando validazione dati...');
      const validatedData = await this.validateMultiFileData(rawData, job.id);
      
      const totalValidRecords = validatedData.testate.length + validatedData.righeContabili.length + 
                               validatedData.righeIva.length + validatedData.allocazioni.length;
      const errorCount = await this.dlqService.countErrorsForJob(job.id);
      
      console.log(`✅ Validazione completata:`);
      console.log(`   ✓ Testate valide:        ${validatedData.testate.length.toString().padStart(4)} / ${rawData.pnTesta.length}`);
      console.log(`   ✓ Righe contabili valide: ${validatedData.righeContabili.length.toString().padStart(4)} / ${rawData.pnRigCon.length}`);
      console.log(`   ✓ Righe IVA valide:      ${validatedData.righeIva.length.toString().padStart(4)} / ${rawData.pnRigIva.length}`);
      console.log(`   ✓ Allocazioni valide:    ${validatedData.allocazioni.length.toString().padStart(4)} / ${rawData.movAnac.length}`);
      console.log(`   📊 TOTALE VALIDI:        ${totalValidRecords.toString().padStart(4)} record`);
      console.log(`   ❌ Record scartati:       ${errorCount.toString().padStart(4)} record (→ DLQ)`);

      // FASE 3: TRASFORMAZIONE - Logica business pura
      console.log('\n🔄 FASE 3: TRASFORMAZIONE BUSINESS LOGIC');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando trasformazione business logic...');
      const transformResult = await transformScrittureContabili(
        validatedData.testate,
        validatedData.righeContabili,
        validatedData.righeIva,
        validatedData.allocazioni
      );
      
      console.log(`✅ Trasformazione completata:`);
      console.log(`   📝 Scritture create:        ${transformResult.stats.entitaCreate.scritture.toString().padStart(4)}`);
      console.log(`   💰 Righe contabili create:  ${transformResult.stats.entitaCreate.righeScrittura.toString().padStart(4)}`);
      console.log(`   📊 Righe IVA create:        ${transformResult.stats.entitaCreate.righeIva.toString().padStart(4)}`);
      console.log(`   🏭 Allocazioni create:      ${transformResult.stats.entitaCreate.allocazioni.toString().padStart(4)}`);

      // FASE 4: PERSISTENZA - Pattern staging-commit atomico
      console.log('\n💾 FASE 4: PERSISTENZA ATOMICA');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando persistenza con staging-commit...');
      await this.persistWithStagingCommit(transformResult, job.id);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const recordsPerSecond = Math.round((totalValidRecords / duration) * 1000);

      // Costruisci risultato successo
      const result: ImportScrittureContabiliResult = {
        success: true,
        jobId: job.id,
        stats: {
          filesProcessed: this.countProcessedFiles(files),
          scrittureImportate: transformResult.stats.entitaCreate.scritture,
          righeContabiliOrganizzate: transformResult.stats.entitaCreate.righeScrittura,
          righeIvaOrganizzate: transformResult.stats.entitaCreate.righeIva,
          allocazioniOrganizzate: transformResult.stats.entitaCreate.allocazioni,
          erroriValidazione: errorCount,
          contiCreati: {
            count: transformResult.conti.length,
            sample: transformResult.conti.slice(0, 3).map(c => ({ id: c.codice!, nome: c.nome! }))
          },
          fornitoriCreati: {
            count: transformResult.fornitori.length,
            sample: transformResult.fornitori.slice(0, 3).map(f => ({ id: f.externalId!, nome: f.nome! }))
          },
          causaliCreate: {
            count: transformResult.causali.length,
            sample: transformResult.causali.slice(0, 3).map(c => ({ id: c.externalId!, nome: c.descrizione! }))
          },
          codiciIvaCreati: {
            count: transformResult.codiciIva.length,
            sample: transformResult.codiciIva.slice(0, 3).map(c => ({ id: c.externalId!, nome: c.descrizione! }))
          },
          vociAnaliticheCreate: {
            count: transformResult.vociAnalitiche.length,
            sample: transformResult.vociAnalitiche.slice(0, 3).map(v => ({ id: v.id!, nome: v.nome! }))
          },
        },
        message: `Import completato con successo. ${transformResult.stats.entitaCreate.scritture} scritture importate.`,
      };

      // RIEPILOGO FINALE
      console.log('\n🎉 RIEPILOGO FINALE');
      console.log('='.repeat(80));
      console.log(`✅ Import completato con successo in ${duration}ms (${recordsPerSecond} record/secondo)`);
      console.log('📈 STATISTICHE DI CREAZIONE:');
      console.log(`   - Scritture: ${result.stats.scrittureImportate}`);
      console.log(`   - Fornitori: ${result.stats.fornitoriCreati.count}`);
      console.log(`   - Causali:   ${result.stats.causaliCreate.count}`);
      console.log(`   - Conti:     ${result.stats.contiCreati.count}`);
      console.log(`   - Codici IVA: ${result.stats.codiciIvaCreati.count}`);
      console.log(`   - Errori DLQ: ${result.stats.erroriValidazione}`);
      console.log('='.repeat(80) + '\n');
      
      this.telemetryService.logJobSuccess(job, result.stats);

      return result;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('\n❌ ERRORE DURANTE L\'IMPORT');
      console.log('='.repeat(80));
      console.log(`💥 Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      console.log(`⏱️  Durata parziale: ${duration}ms`);
      console.log(`🔍 Job ID: ${job.id}`);
      console.log('='.repeat(80) + '\n');
      
      this.telemetryService.logJobError(job, error);
      
      return {
        success: false,
        jobId: job.id,
        stats: {
          filesProcessed: 0,
          scrittureImportate: 0,
          righeContabiliOrganizzate: 0,
          righeIvaOrganizzate: 0,
          allocazioniOrganizzate: 0,
          erroriValidazione: 0,
          contiCreati: {
            count: 0,
            sample: [],
          },
          fornitoriCreati: {
            count: 0,
            sample: [],
          },
          causaliCreate: {
            count: 0,
            sample: [],
          },
          codiciIvaCreati: {
            count: 0,
            sample: [],
          },
          vociAnaliticheCreate: {
            count: 0,
            sample: [],
          },
        },
        message: `Errore durante l'import: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // HELPER METHODS
  // ---------------------------------------------------------------------------

  

  // ---------------------------------------------------------------------------
  // FASE 1: ACQUISIZIONE - PARSING MULTI-FILE
  // ---------------------------------------------------------------------------

  

  private async parseMultiFiles(files: ScrittureContabiliFiles, jobId: string) {
    // FASE 1: ACQUISIZIONE - Usa le definizioni statiche e corrette
    this.telemetryService.logInfo(jobId, 'Utilizzando definizioni di campo statiche dal codice.');

    const pnTestaRaw = parseFixedWidth<Record<string, unknown>>(
      files.pnTesta.toString('utf-8'),
      pnTestaDefinitions
    );

    const pnRigConRaw = parseFixedWidth<Record<string, unknown>>(
      files.pnRigCon.toString('utf-8'),
      pnRigConDefinitions
    );

    const pnRigIvaRaw = files.pnRigIva
      ? parseFixedWidth<Record<string, unknown>>(files.pnRigIva.toString('utf-8'), pnRigIvaDefinitions)
      : [];

    const movAnacRaw = files.movAnac
      ? parseFixedWidth<Record<string, unknown>>(files.movAnac.toString('utf-8'), movAnacDefinitions)
      : [];

    return {
      pnTesta: pnTestaRaw,
      pnRigCon: pnRigConRaw,
      pnRigIva: pnRigIvaRaw,
      movAnac: movAnacRaw,
    };
  }

  // ---------------------------------------------------------------------------
  // FASE 2: VALIDAZIONE MULTI-FILE
  // ---------------------------------------------------------------------------

  private async validateMultiFileData(rawData: RawData, jobId: string) {
    const validatedData = {
      testate: [] as ValidatedPnTesta[],
      righeContabili: [] as ValidatedPnRigCon[],
      righeIva: [] as ValidatedPnRigIva[],
      allocazioni: [] as ValidatedMovAnac[],
    };

    // Valida PNTESTA.TXT
    for (let i = 0; i < rawData.pnTesta.length; i++) {
      try {
        // BYPASS: Usa direttamente i dati raw (già hanno i nomi corretti dal template DB)
        const validated = validatedPnTestaSchema.parse(rawData.pnTesta[i]);
        validatedData.testate.push(validated);
      } catch (error) {
        console.error(`Errore validazione PNTESTA.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', error);
      }
    }

    // Valida PNRIGCON.TXT
    for (let i = 0; i < rawData.pnRigCon.length; i++) {
      try {
        // BYPASS: Usa direttamente i dati raw (già hanno i nomi corretti dal template DB)
        const validated = validatedPnRigConSchema.parse(rawData.pnRigCon[i]);
        validatedData.righeContabili.push(validated);
      } catch (error) {
        console.error(`Errore validazione PNRIGCON.TXT riga ${i + 1}:`, error);
        await this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', error);
      }
    }

    // Valida PNRIGIVA.TXT
    for (let i = 0; i < rawData.pnRigIva.length; i++) {
      try {
        // BYPASS: Usa direttamente i dati raw (già hanno i nomi corretti dal template DB)
        const validated = validatedPnRigIvaSchema.parse(rawData.pnRigIva[i]);
        validatedData.righeIva.push(validated);
      } catch (error) {
        console.error(`Errore validazione PNRIGIVA.TXT riga ${i + 1}:`, error);
        await this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', error);
      }
    }

    // Valida MOVANAC.TXT
    for (let i = 0; i < rawData.movAnac.length; i++) {
      try {
        // BYPASS: Usa direttamente i dati raw (già hanno i nomi corretti dal template DB)
        const validated = validatedMovAnacSchema.parse(rawData.movAnac[i]);
        validatedData.allocazioni.push(validated);
      } catch (error) {
        console.error(`Errore validazione MOVANAC.TXT riga ${i + 1}:`, error);
        await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', error);
      }
    }

    return validatedData;
  }

  // ---------------------------------------------------------------------------
  // FASE 4: PERSISTENZA STAGING-COMMIT
  // ---------------------------------------------------------------------------

  private async persistWithStagingCommit(
    transformResult: ScrittureContabiliTransformResult,
    jobId: string
  ): Promise<void> {
    
    this.telemetryService.logInfo(jobId, '💾 PERSISTENZA COMPLETA: Salvataggio di tutte le entità');
    
    // Usa una transazione per garantire atomicità completa (timeout esteso)
    await this.prisma.$transaction(async (tx) => {
      
      // NOTA: Logica deleteMany rimossa per prevenire perdita dati
      // Le operazioni di creazione saranno convertite in upsert nella fase successiva
      
      // Assicurati che il cliente di sistema esista
      await tx.cliente.upsert({
        where: { id: 'cliente_sistema' },
        update: {},
        create: {
          id: 'cliente_sistema',
          nome: 'Cliente di Sistema',
        },
      });
      this.telemetryService.logInfo(jobId, `✅ Cliente di sistema (cliente_sistema) assicurato.`);

      // 1. Creazione/aggiornamento entità dipendenti (upserts)
      // Questo garantisce che tutte le dipendenze esistano prima di creare le scritture.
      console.log('   - Creazione/aggiornamento anagrafiche dipendenti...');

      await Promise.all(transformResult.causali.map(causale =>
        tx.causaleContabile.upsert({
          where: { externalId: causale.externalId! },
          update: causale,
          create: causale,
        })
      ));
      
      await Promise.all(transformResult.codiciIva.map(codiceIva =>
        tx.codiceIva.upsert({
          where: { externalId: codiceIva.externalId! },
          update: codiceIva,
          create: codiceIva,
        })
      ));

      await Promise.all(transformResult.conti.map(conto =>
        tx.conto.upsert({
          where: { 
            codice_codiceFiscaleAzienda: {
              codice: conto.codice!,
              codiceFiscaleAzienda: conto.codiceFiscaleAzienda || ''
            }
          },
          update: conto,
          create: conto,
        })
      ));
      
      // Upsert Fornitori
      await Promise.all(transformResult.fornitori.map(fornitore =>
        tx.fornitore.upsert({
          where: { sottocontoFornitore: fornitore.sottocontoFornitore! },
          update: {}, // Non aggiorniamo se esiste già
          create: fornitore,
        })
      ));
      
      // Upsert Clienti
      await Promise.all(transformResult.clienti.map(cliente =>
        tx.cliente.upsert({
          where: { sottocontoCliente: cliente.sottocontoCliente! },
          update: {}, // Non aggiorniamo se esiste già
          create: cliente,
        })
      ));

      // 3. Creazione entità principali
      // NOTA: Usiamo cicli di `create` invece di `createMany` perché `createMany`
      // non supporta la creazione di relazioni nidificate (i `connect`), che è
      // fondamentale per la nostra logica.
      console.log('   - Creazione scritture, righe e allocazioni...');
      
      for (const scritturaData of transformResult.scritture) {
        await tx.scritturaContabile.create({ data: scritturaData });
      }

      for (const rigaData of transformResult.righeScrittura) {
        await tx.rigaScrittura.create({ data: rigaData });
      }
      
      for (const rigaIvaData of transformResult.righeIva) {
        await tx.rigaIva.create({ data: rigaIvaData });
      }

      for (const allocazioneData of transformResult.allocazioni) {
        await tx.allocazione.create({ data: allocazioneData });
      }

      console.log('   - Entità principali create con successo.');
      
      // 4. Fine transazione
    }, {
      timeout: 900000, // 15 minuti timeout per dataset grandi
    });
  }

  // ---------------------------------------------------------------------------
  // UTILITY
  // ---------------------------------------------------------------------------

  private countProcessedFiles(files: ScrittureContabiliFiles): number {
    let count = 2; // PNTESTA e PNRIGCON sono obbligatori
    if (files.pnRigIva) count++;
    if (files.movAnac) count++;
    return count;
  }
} 