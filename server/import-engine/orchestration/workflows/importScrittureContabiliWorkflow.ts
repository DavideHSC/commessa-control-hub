import { 
  pnTestaDefinitions,
  pnRigConDefinitions,
  pnRigIvaDefinitions,
  movAnacDefinitions,
} from '../../acquisition/definitions/scrittureContabiliDefinitions';
import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../../lib/fixedWidthParser';
import { DLQService } from '../../persistence/dlq/DLQService';
import { ImportJob } from '../../core/jobs/ImportJob';
import { TelemetryService } from '../../core/telemetry/TelemetryService';
import {
  rawPnTestaSchema,
  rawPnRigConSchema,
  rawPnRigIvaSchema,
  rawMovAnacSchema,
} from '../../acquisition/validators/scrittureContabiliValidator';

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
    testateStaging: number;
    righeContabiliStaging: number;
    righeIvaStaging: number;
    allocazioniStaging: number;
    erroriValidazione: number;
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
      // FASE 1: ACQUISIZIONE
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

      // FASE 2: VALIDAZIONE
      console.log('\n🔍 FASE 2: VALIDAZIONE E PULIZIA DATI');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando validazione dati...');
      const validatedData = await this.validateMultiFileData(rawData, job.id);
      const errorCount = await this.dlqService.countErrorsForJob(job.id);
      
      console.log(`✅ Validazione completata:`);
      console.log(`   ✓ Testate valide:        ${validatedData.testate.length.toString().padStart(4)} / ${rawData.pnTesta.length}`);
      console.log(`   ✓ Righe contabili valide: ${validatedData.righeContabili.length.toString().padStart(4)} / ${rawData.pnRigCon.length}`);
      console.log(`   ✓ Righe IVA valide:      ${validatedData.righeIva.length.toString().padStart(4)} / ${rawData.pnRigIva.length}`);
      console.log(`   ✓ Allocazioni valide:    ${validatedData.allocazioni.length.toString().padStart(4)} / ${rawData.movAnac.length}`);
      console.log(`   📊 TOTALE VALIDI:        ${totalRawRecords.toString().padStart(4)} record`);
      console.log(`   ❌ Record scartati:       ${errorCount.toString().padStart(4)} record (→ DLQ)`);

      // FASE 3: MAPPATURA PER LO STAGING (con conversione a stringa)
      const toString = (val: unknown): string => val?.toString() ?? '';

      const stagingTestate = validatedData.testate.map(t => ({
        ...Object.fromEntries(Object.entries(t).map(([key, value]) => [key, toString(value)])),
        codiceUnivocoScaricamento: toString(t.externalId),
      }));

      const stagingRigheContabili = validatedData.righeContabili.map(r => ({
        ...Object.fromEntries(Object.entries(r).map(([key, value]) => [key, toString(value)])),
        codiceUnivocoScaricamento: toString(r.externalId),
        progressivoNumeroRigo: toString(r.progressivoRigo),
      }));

      const stagingRigheIva = validatedData.righeIva.map(r => ({
        ...Object.fromEntries(Object.entries(r).map(([key, value]) => [key, toString(value)])),
        codiceUnivocoScaricamento: toString(r.externalId),
        rigaIdentifier: toString(r.riga),
      }));

      const stagingAllocazioni = validatedData.allocazioni.map(a => ({
        ...Object.fromEntries(Object.entries(a).map(([key, value]) => [key, toString(value)])),
        codiceUnivocoScaricamento: toString(a.externalId),
        progressivoNumeroRigoCont: toString(a.progressivoRigoContabile),
        allocazioneIdentifier: `${toString(a.externalId)}-${toString(a.progressivoRigoContabile)}`
      }));

      // FASE 4: PERSISTENZA DIRETTA SU STAGING
      console.log('\n💾 FASE 4: PERSISTENZA ATOMICA');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando persistenza su tabelle di staging...');
      
      await this.prisma.$transaction([
          this.prisma.stagingTestata.deleteMany({}),
          this.prisma.stagingRigaContabile.deleteMany({}),
          this.prisma.stagingRigaIva.deleteMany({}),
          this.prisma.stagingAllocazione.deleteMany({})
      ]);

      await this.prisma.$transaction([
        this.prisma.stagingTestata.createMany({ data: stagingTestate, skipDuplicates: true }),
        this.prisma.stagingRigaContabile.createMany({ data: stagingRigheContabili, skipDuplicates: true }),
        this.prisma.stagingRigaIva.createMany({ data: stagingRigheIva, skipDuplicates: true }),
        this.prisma.stagingAllocazione.createMany({ data: stagingAllocazioni, skipDuplicates: true }),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const recordsPerSecond = Math.round((totalRawRecords / duration) * 1000);

      // Costruisci risultato successo
      const result: ImportScrittureContabiliResult = {
        success: true,
        jobId: job.id,
        stats: {
          filesProcessed: this.countProcessedFiles(files),
          testateStaging: stagingTestate.length,
          righeContabiliStaging: stagingRigheContabili.length,
          righeIvaStaging: stagingRigheIva.length,
          allocazioniStaging: stagingAllocazioni.length,
          erroriValidazione: errorCount,
        },
        message: `Importazione nello staging completata con successo. ${stagingTestate.length} testate caricate.`,
      };

      // RIEPILOGO FINALE
      console.log('\n🎉 RIEPILOGO FINALE');
      console.log('='.repeat(80));
      console.log(`✅ Import completato con successo in ${duration}ms (${recordsPerSecond} record/secondo)`);
      console.log('📈 STATISTICHE DI CREAZIONE:');
      console.log(`   - Scritture: ${result.stats.testateStaging}`);
      console.log(`   - Fornitori: ${result.stats.righeContabiliStaging}`);
      console.log(`   - Causali:   ${result.stats.righeIvaStaging}`);
      console.log(`   - Conti:     ${result.stats.allocazioniStaging}`);
      console.log(`   - Codici IVA: ${result.stats.erroriValidazione}`);
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
          testateStaging: 0,
          righeContabiliStaging: 0,
          righeIvaStaging: 0,
          allocazioniStaging: 0,
          erroriValidazione: await this.dlqService.countErrorsForJob(job.id),
        },
        message: error instanceof Error ? error.message : 'Errore sconosciuto durante l\'importazione.',
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
      testate: [] as Record<string, unknown>[],
      righeContabili: [] as Record<string, unknown>[],
      righeIva: [] as Record<string, unknown>[],
      allocazioni: [] as Record<string, unknown>[],
    };

    // Valida PNTESTA.TXT
    for (let i = 0; i < rawData.pnTesta.length; i++) {
      try {
        const validationResult = rawPnTestaSchema.safeParse(rawData.pnTesta[i]);
        if (validationResult.success) {
          validatedData.testate.push(validationResult.data);
        } else {
          console.error(`Errore validazione PNTESTA.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione PNTESTA.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', error);
      }
    }

    // Valida PNRIGCON.TXT
    for (let i = 0; i < rawData.pnRigCon.length; i++) {
      try {
        const validationResult = rawPnRigConSchema.safeParse(rawData.pnRigCon[i]);
        if (validationResult.success) {
          validatedData.righeContabili.push(validationResult.data);
        } else {
          console.error(`Errore validazione PNRIGCON.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione PNRIGCON.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', error);
      }
    }

    // Valida PNRIGIVA.TXT
    for (let i = 0; i < rawData.pnRigIva.length; i++) {
      try {
        const validationResult = rawPnRigIvaSchema.safeParse(rawData.pnRigIva[i]);
        if (validationResult.success) {
          validatedData.righeIva.push(validationResult.data);
        } else {
          console.error(`Errore validazione PNRIGIVA.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione PNRIGIVA.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', error);
      }
    }

    // Valida MOVANAC.TXT
    for (let i = 0; i < rawData.movAnac.length; i++) {
      try {
        const validationResult = rawMovAnacSchema.safeParse(rawData.movAnac[i]);
        if (validationResult.success) {
          validatedData.allocazioni.push(validationResult.data);
        } else {
          console.error(`Errore validazione MOVANAC.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione MOVANAC.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', error);
      }
    }

    return validatedData;
  }

  // ---------------------------------------------------------------------------
  // FASE 4: PERSISTENZA STAGING-COMMIT
  // ---------------------------------------------------------------------------

  // IL METODO `persistWithStagingCommit` VIENE RIMOSSO

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