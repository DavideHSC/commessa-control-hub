import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validatedPianoDeiContiAziendaleSchema, ValidatedPianoDeiContiAziendale } from '../../acquisition/validators/pianoDeiContiValidator';
import { RawPianoDeiContiAziendale } from '../../core/types/generated';

const prisma = new PrismaClient();

interface WorkflowResult {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: unknown }[];
}

/**
 * Orchestra l'importazione del Piano dei Conti aziendale (CONTIAZI) in una tabella di staging.
 * @param fileContent Il contenuto del file da importare come stringa.
 * @returns Un oggetto con le statistiche dell'importazione.
 */
export async function importPianoDeiContiAziendaleWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow Staging] Avvio importazione Piano dei Conti Aziendale.');
  
  const stats: WorkflowResult = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // 1. Parsing
  const templateName = 'piano_dei_conti_aziendale';
  const parseResult = await parseFixedWidth<RawPianoDeiContiAziendale>(fileContent, templateName);
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Staging] Parsati ${stats.totalRecords} record.`);
  
  // Determina il codice fiscale dal primo record, se esiste
  const codiceFiscaleAzienda = rawRecords.length > 0 ? rawRecords[0].codiceFiscaleAzienda?.trim() : undefined;
  if (!codiceFiscaleAzienda) {
    console.error("[Workflow Staging] Impossibile determinare il codice fiscale dell'azienda dal file.");
    stats.errors.push({ row: 0, message: "Impossibile determinare il codice fiscale dell'azienda dal file.", data: {} });
    return stats;
  }
  console.log(`[Workflow Staging] Rilevato codice fiscale azienda: ${codiceFiscaleAzienda}`);

  // 2. Validazione
  const validRecords: ValidatedPianoDeiContiAziendale[] = [];
  console.log('[Workflow Staging] Inizio validazione e coercizione dei tipi...');
  for (const [index, rawRecord] of rawRecords.entries()) {
    const validationResult = validatedPianoDeiContiAziendaleSchema.safeParse(rawRecord);
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
      console.warn(`[Workflow Staging] Errore di validazione riga ${index + 1}:`, flatError.fieldErrors);
    }
  }
  console.log(`[Workflow Staging] Validazione completata. Record validi: ${validRecords.length}, Errori: ${stats.errorRecords}.`);

  // 3. Mappatura esplicita
  const toString = (val: string | undefined): string => val ?? '';
  const recordsToCreate = validRecords.map(r => ({
    codiceFiscaleAzienda: toString(r.codiceFiscaleAzienda),
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

  // 4. Salvataggio in Staging
  if (recordsToCreate.length > 0) {
    console.log(`[Workflow Staging] Inizio salvataggio ottimizzato di ${recordsToCreate.length} record per l'azienda ${codiceFiscaleAzienda}.`);
    try {
      await prisma.stagingConto.deleteMany({ where: { codiceFiscaleAzienda: codiceFiscaleAzienda } });
      const result = await prisma.stagingConto.createMany({
        data: recordsToCreate,
        skipDuplicates: true,
      });
      stats.successfulRecords = result.count;
      console.log(`[Workflow Staging] Salvati ${result.count} record per l'azienda ${codiceFiscaleAzienda}.`);
    } catch (e) {
      const error = e as Error;
      stats.errorRecords = recordsToCreate.length;
      stats.errors.push({ row: 0, message: `Errore di massa durante il salvataggio ottimizzato: ${error.message}`, data: {} });
      console.error(`[Workflow Staging] Errore durante il salvataggio in staging:`, error);
    }
  } else {
    console.log('[Workflow Staging] Nessun record valido da salvare.');
  }

  console.log('[Workflow Staging] Importazione Piano dei Conti Aziendale terminata.');
  return stats;
} 