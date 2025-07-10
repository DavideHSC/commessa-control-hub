import { Prisma } from '@prisma/client';
import { ValidatedPianoDeiConti, ValidatedPianoDeiContiAziendale } from '../../acquisition/validators/pianoDeiContiValidator';
// Rimosso import decoders, non più necessari qui

/**
 * Trasforma un record validato del Piano dei Conti in un oggetto
 * `Prisma.StagingContoCreateInput` pronto per l'inserimento nella tabella di staging.
 * Questa funzione è ora un semplice mapping 1:1.
 *
 * @param validatedRecord Il record validato da Zod.
 * @returns Un oggetto `Prisma.StagingContoCreateInput`.
 */
export function transformPianoDeiContiToStaging(
  validatedRecord: ValidatedPianoDeiConti
): Prisma.StagingContoCreateInput {
  return {
    ...validatedRecord,
    codiceFiscaleAzienda: '', // Default per i conti generici
  };
}

/**
 * Trasforma un record validato del Piano dei Conti AZIENDALE in un oggetto
 * `Prisma.StagingContoCreateInput` pronto per l'inserimento nella tabella di staging.
 *
 * @param validatedRecord Il record validato da Zod (versione aziendale).
 * @returns Un oggetto `Prisma.StagingContoCreateInput`.
 */
export function transformPianoDeiContiAziendaleToStaging(
  validatedRecord: ValidatedPianoDeiContiAziendale
): Prisma.StagingContoCreateInput {
  return {
    ...validatedRecord,
  };
} 