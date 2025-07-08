import { z } from 'zod';

// Validatore di base per i campi comuni che vengono letti come stringhe
const stringToBoolean = z.string().transform(val => val.toUpperCase() === 'X').nullable().optional();
const stringToNumber = z.string().transform(val => parseFloat(val.replace(',', '.'))).nullable().optional();

export const validatedPianoDeiContiAziendaleSchema = z.object({
  codiceFiscaleAzienda: z.string(),
  subcodiceAzienda: z.string().optional(),
  livello: z.string(),
  codice: z.string(),
  tipo: z.string(),
  descrizione: z.string(),
  sigla: z.string().optional(),
  controlloSegno: z.string().optional(),
  contoCostiRicavi: z.string().optional(),
  validoImpresaOrdinaria: stringToBoolean,
  validoImpresaSemplificata: stringToBoolean,
  validoProfessionistaOrdinario: stringToBoolean,
  validoProfessionistaSemplificato: stringToBoolean,
  validoUnicoPf: stringToBoolean,
  validoUnicoSp: stringToBoolean,
  validoUnicoSc: stringToBoolean,
  validoUnicoEnc: stringToBoolean,
  classeIrpefIres: z.string().optional(),
  classeIrap: z.string().optional(),
  classeProfessionista: z.string().optional(),
  classeIrapProfessionista: z.string().optional(),
  classeIva: z.string().optional(),
  classeDatiStudiSettore: z.string().optional(),
  colonnaRegistroCronologico: stringToNumber,
  colonnaRegistroIncassiPagamenti: stringToNumber,
  contoDareCee: z.string().optional(),
  contoAvereCee: z.string().optional(),
  naturaConto: z.string().optional(),
  gestioneBeniAmmortizzabili: z.string().optional(),
  percDeduzioneManutenzione: stringToNumber,
  gruppo: z.string().optional(),
  dettaglioClienteFornitore: z.string().optional(),
  descrizioneBilancioDare: z.string().optional(),
  descrizioneBilancioAvere: z.string().optional(),
  utilizzaDescrizioneLocale: stringToBoolean,
  descrizioneLocale: z.string().optional(),
  consideraBilancioSemplificato: stringToBoolean,
});

export type ValidatedPianoDeiContiAziendale = z.infer<typeof validatedPianoDeiContiAziendaleSchema>; 