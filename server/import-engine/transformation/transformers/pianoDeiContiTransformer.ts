import { Prisma } from '@prisma/client';
import { ValidatedPianoDeiConti } from '../../acquisition/validators/pianoDeiContiValidator';
import * as decoders from '../decoders/contoDecoders';

/**
 * Trasforma un record validato del Piano dei Conti in un oggetto
 * `Prisma.ContoCreateInput` pronto per l'inserimento nel database.
 * Questa funzione è pura e non ha effetti collaterali.
 *
 * @param validatedRecord Il record validato da Zod.
 * @returns Un oggetto `Prisma.ContoCreateInput`.
 */
export function transformPianoDeiConti(
  validatedRecord: ValidatedPianoDeiConti
): Prisma.ContoCreateInput {
  
  const tipoConto = decoders.determineTipoConto(validatedRecord.tipo, validatedRecord.codice);

  // Estrai 'descrizione' e mantieni il resto dei campi in 'remaningRecord'
  const { descrizione, ...remaningRecord } = validatedRecord;

  const dataToUpsert: Prisma.ContoCreateInput = {
    ...remaningRecord,
    nome: descrizione, // Mappa 'descrizione' a 'nome'
    id: validatedRecord.codice,
    externalId: validatedRecord.codice,
    tipo: tipoConto,
    livelloDesc: decoders.decodeLivello(validatedRecord.livello),
    gruppoDesc: decoders.decodeGruppo(validatedRecord.gruppo),
    controlloSegnoDesc: decoders.decodeControlloSegno(validatedRecord.controlloSegno),
    codificaFormattata: decoders.formatCodificaGerarchica(validatedRecord.codice, validatedRecord.livello),
    richiedeVoceAnalitica: false,
    vociAnaliticheAbilitateIds: [],
    contropartiteSuggeriteIds: [],
  };

  return dataToUpsert;
} 