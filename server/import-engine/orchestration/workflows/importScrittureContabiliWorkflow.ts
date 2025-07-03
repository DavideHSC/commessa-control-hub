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
    contiCreati: { id: string, nome: string }[];
    fornitoriCreati: { id:string, nome: string }[];
    causaliCreate: { id: string, nome: string }[];
    codiciIvaCreati: { id: string, nome: string }[];
    vociAnaliticheCreate: { id: string, nome: string }[];
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
          contiCreati: transformResult.conti.map(c => ({ id: c.codice!, nome: c.nome! })),
          fornitoriCreati: transformResult.fornitori.map(f => ({ id: f.externalId!, nome: f.nome! })),
          causaliCreate: transformResult.causali.map(c => ({ id: c.externalId!, nome: c.descrizione! })),
          codiciIvaCreati: transformResult.codiciIva.map(c => ({ id: c.externalId!, nome: c.descrizione! })),
          vociAnaliticheCreate: transformResult.vociAnalitiche.map(v => ({ id: v.id!, nome: v.nome! })),
        },
        message: `Import completato con successo. ${transformResult.stats.entitaCreate.scritture} scritture importate.`,
      };

      // RIEPILOGO FINALE
      console.log('\n🎉 RIEPILOGO FINALE');
      console.log('='.repeat(80));
      console.log(`✅ Import completato con successo in ${duration}ms`);
      console.log(`📊 Performance: ${recordsPerSecond} record/secondo`);
      console.log(`\n📈 STATISTICHE FINALI:`);
      console.log(`   🎯 Scritture contabili create:  ${result.stats.scrittureImportate.toString().padStart(4)}`);
      console.log(`   🏢 Fornitori creati:            ${result.stats.fornitoriCreati.length.toString().padStart(4)}`);
      console.log(`   📋 Causali contabili create:    ${result.stats.causaliCreate.length.toString().padStart(4)}`);
      console.log(`   🏦 Conti creati:                ${result.stats.contiCreati.length.toString().padStart(4)}`);
      console.log(`   💰 Righe contabili elaborate:   ${result.stats.righeContabiliOrganizzate.toString().padStart(4)}`);
      console.log(`   🏭 Allocazioni elaborate:       ${result.stats.allocazioniOrganizzate.toString().padStart(4)}`);
      console.log(`   ❌ Record con errori (DLQ):     ${result.stats.erroriValidazione.toString().padStart(4)}`);
      console.log(`\n🚀 ARCHITETTURA ENTERPRISE: Parser 6/6 COMPLETATO!`);
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
          contiCreati: [],
          fornitoriCreati: [],
          causaliCreate: [],
          codiciIvaCreati: [],
          vociAnaliticheCreate: [],
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

      // 1. CREA ENTITÀ DIPENDENTI (in ordine di dipendenza)
      this.telemetryService.logInfo(jobId, `🏢 Creazione ${transformResult.fornitori.length} fornitori...`);
      for (const fornitore of transformResult.fornitori) {
        if (fornitore.externalId) {
            await tx.fornitore.upsert({
                where: { externalId: fornitore.externalId },
                update: fornitore,
                create: fornitore,
            });
        }
      }

      this.telemetryService.logInfo(jobId, `📋 Creazione ${transformResult.causali.length} causali...`);
      for (const causale of transformResult.causali) {
        if (causale.externalId) {
            await tx.causaleContabile.upsert({
                where: { externalId: causale.externalId },
                update: causale,
                create: causale,
            });
        }
      }
      
      this.telemetryService.logInfo(jobId, `🏦 Creazione ${transformResult.conti.length} conti...`);
      for (const conto of transformResult.conti) {
        await tx.conto.upsert({
          where: { id: conto.id },
          update: conto,
          create: conto,
        });
      }
      
      this.telemetryService.logInfo(jobId, `📊 Creazione ${transformResult.codiciIva.length} codici IVA...`);
      for (const codiceIva of transformResult.codiciIva) {
        if (codiceIva.externalId) {
            await tx.codiceIva.upsert({
                where: { externalId: codiceIva.externalId },
                update: codiceIva,
                create: codiceIva,
            });
        }
      }
      
      this.telemetryService.logInfo(jobId, `🏭 Creazione ${transformResult.commesse.length} commesse...`);
      for (const commessa of transformResult.commesse) {
        await tx.commessa.upsert({
          where: { id: commessa.id },
          update: commessa,
          create: commessa,
        });
      }
      
      this.telemetryService.logInfo(jobId, `📈 Creazione ${transformResult.vociAnalitiche.length} voci analitiche...`);
      for (const voce of transformResult.vociAnalitiche) {
        await tx.voceAnalitica.upsert({
          where: { id: voce.id },
          update: voce,
          create: voce,
        });
      }

      // 2. UPSERT SCRITTURE CONTABILI (testate)
      this.telemetryService.logInfo(jobId, `📝 Upsert ${transformResult.scritture.length} scritture contabili...`);
      
      for (const scrittura of transformResult.scritture) {
        await tx.scritturaContabile.upsert({
          where: { externalId: scrittura.externalId! },
          update: scrittura,
          create: scrittura,
        });
      }
      
      this.telemetryService.logInfo(jobId, `✅ ${transformResult.scritture.length} scritture processate con upsert`);
      
      // 3. UPSERT RIGHE SCRITTURA (righe contabili)
      this.telemetryService.logInfo(jobId, `💰 Upsert ${transformResult.righeScrittura.length} righe contabili...`);
      for (const riga of transformResult.righeScrittura) {
        await tx.rigaScrittura.upsert({
          where: { id: riga.id! },
          update: riga,
          create: riga,
        });
      }
      
      this.telemetryService.logInfo(jobId, `✅ ${transformResult.righeScrittura.length} righe contabili processate con upsert`);
      
      // 4. UPSERT RIGHE IVA
      this.telemetryService.logInfo(jobId, `🧾 Upsert ${transformResult.righeIva.length} righe IVA...`);
      for (const rigaIva of transformResult.righeIva) {
        await tx.rigaIva.upsert({
          where: { id: rigaIva.id! },
          update: rigaIva,
          create: rigaIva,
        });
      }
      
      this.telemetryService.logInfo(jobId, `✅ ${transformResult.righeIva.length} righe IVA processate con upsert`);
      
      // 5. UPSERT ALLOCAZIONI
      this.telemetryService.logInfo(jobId, `🎯 Upsert ${transformResult.allocazioni.length} allocazioni...`);
      for (const allocazione of transformResult.allocazioni) {
        await tx.allocazione.upsert({
          where: { id: allocazione.id! },
          update: allocazione,
          create: allocazione,
        });
      }
      
      this.telemetryService.logInfo(jobId, `✅ ${transformResult.allocazioni.length} allocazioni processate con upsert`);
      
      this.telemetryService.logInfo(jobId, '✅ PERSISTENZA COMPLETA: Tutte le entità salvate con successo!');
    }, {
      timeout: 300000, // 5 minuti timeout per dataset grandi
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