import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validatedPianoDeiContiSchema, ValidatedPianoDeiConti } from '../../acquisition/validators/pianoDeiContiValidator';
import { RawPianoDeiConti } from '../../core/types/generated';

const prisma = new PrismaClient();

interface WorkflowResult {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: unknown }[];
}

export async function importPianoDeiContiWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow Staging] Avvio importazione Piano dei Conti Standard.');
  
  const stats: WorkflowResult = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  const parseResult = await parseFixedWidth<RawPianoDeiConti>(fileContent, 'piano_dei_conti');
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Staging] Parsati ${stats.totalRecords} record.`);

  // Fase di validazione
  const validRecords: ValidatedPianoDeiConti[] = [];
  for (const [index, rawRecord] of rawRecords.entries()) {
    const validationResult = validatedPianoDeiContiSchema.safeParse(rawRecord);
    if (validationResult.success) {
      validRecords.push(validationResult.data);
    } else {
      stats.errorRecords++;
      const flatError = validationResult.error.flatten();
      stats.errors.push({
        row: index + 1,
        message: JSON.stringify(flatError.fieldErrors),
        data: rawRecord,
      });
    }
  }

  // Fase di mappatura esplicita
  const toString = (val: string | undefined): string => val ?? '';
  
  const recordsToCreate = validRecords.map(r => ({
    codice: toString(r.codice),
    descrizione: toString(r.descrizione),
    tipo: toString(r.tipo),
    livello: toString(r.livello),
    sigla: toString(r.sigla),
    gruppo: toString(r.gruppo),
    controlloSegno: toString(r.controlloSegno),
    validoImpresaOrdinaria: toString(r.validoImpresaOrdinaria),
    validoImpresaSemplificata: toString(r.validoImpresaSemplificata),
    validoProfessionistaOrdinario: toString(r.validoProfessionistaOrdinario),
    validoProfessionistaSemplificato: toString(r.validoProfessionistaSemplificato),
    validoUnicoPf: toString(r.validoUnicoPf),
    validoUnicoSp: toString(r.validoUnicoSp),
    validoUnicoSc: toString(r.validoUnicoSc),
    validoUnicoEnc: toString(r.validoUnicoEnc),
    codiceClasseIrpefIres: toString(r.codiceClasseIrpefIres),
    codiceClasseIrap: toString(r.codiceClasseIrap),
    codiceClasseProfessionista: toString(r.codiceClasseProfessionista),
    codiceClasseIrapProfessionista: toString(r.codiceClasseIrapProfessionista),
    codiceClasseIva: toString(r.codiceClasseIva),
    contoCostiRicaviCollegato: toString(r.contoCostiRicaviCollegato),
    contoDareCee: toString(r.contoDareCee),
    contoAvereCee: toString(r.contoAvereCee),
    naturaConto: toString(r.naturaConto),
    gestioneBeniAmmortizzabili: toString(r.gestioneBeniAmmortizzabili),
    percDeduzioneManutenzione: toString(r.percDeduzioneManutenzione),
    dettaglioClienteFornitore: toString(r.dettaglioClienteFornitore),
    descrizioneBilancioDare: toString(r.descrizioneBilancioDare),
    descrizioneBilancioAvere: toString(r.descrizioneBilancioAvere),
    codiceClasseDatiStudiSettore: toString(r.codiceClasseDatiStudiSettore),
    numeroColonnaRegCronologico: toString(r.numeroColonnaRegCronologico),
    numeroColonnaRegIncassiPag: toString(r.numeroColonnaRegIncassiPag),
  }));
  
  if (recordsToCreate.length > 0) {
    try {
      await prisma.stagingConto.deleteMany({ where: { codiceFiscaleAzienda: '' } });
      const result = await prisma.stagingConto.createMany({
        data: recordsToCreate,
        skipDuplicates: true,
      });
      stats.successfulRecords = result.count;
      console.log(`[Workflow Staging] Salvati ${result.count} record nella tabella di staging.`);
    } catch (e) {
      const error = e as Error;
      stats.errorRecords = recordsToCreate.length;
      stats.errors.push({ row: 0, message: `Errore di massa durante il salvataggio ottimizzato: ${error.message}`, data: {} });
      console.error(`[Workflow Staging] Errore durante il salvataggio in staging:`, error);
    }
  }
  
  console.log('[Workflow Staging] Importazione Piano dei Conti Standard terminata.');
  return stats;
} 