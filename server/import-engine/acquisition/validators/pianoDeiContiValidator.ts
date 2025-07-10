import { z } from 'zod';
import { TipoConto } from '@prisma/client';

// Schema per la validazione e coercizione di base dei dati grezzi.
// Il suo scopo è pulire l'input (trim) e convertire i tipi primitivi.
// Tutta la logica di business complessa è demandata al Transformation Layer.
export const validatedPianoDeiContiSchema = z.object({
  codice: z.string().trim().min(1, { message: "Il codice non può essere vuoto" }),
  descrizione: z.string().trim().default('Conto senza nome'),
  tipo: z.string().trim(),
  livello: z.string().trim().transform(v => v || undefined).optional(),
  sigla: z.string().trim().transform(v => v || undefined).optional(),
  gruppo: z.string().trim().transform(v => v || undefined).optional(),
  controlloSegno: z.string().trim().transform(v => v || undefined).optional(),
  validoImpresaOrdinaria: z.string().trim().transform(v => v || undefined).optional(),
  validoImpresaSemplificata: z.string().trim().transform(v => v || undefined).optional(),
  validoProfessionistaOrdinario: z.string().trim().transform(v => v || undefined).optional(),
  validoProfessionistaSemplificato: z.string().trim().transform(v => v || undefined).optional(),
  validoUnicoPf: z.string().trim().transform(v => v || undefined).optional(),
  validoUnicoSp: z.string().trim().transform(v => v || undefined).optional(),
  validoUnicoSc: z.string().trim().transform(v => v || undefined).optional(),
  validoUnicoEnc: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseIrpefIres: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseIrap: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseProfessionista: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseIrapProfessionista: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseIva: z.string().trim().transform(v => v || undefined).optional(),
  contoCostiRicaviCollegato: z.string().trim().transform(v => v || undefined).optional(),
  contoDareCee: z.string().trim().transform(v => v || undefined).optional(),
  contoAvereCee: z.string().trim().transform(v => v || undefined).optional(),
  naturaConto: z.string().trim().transform(v => v || undefined).optional(),
  gestioneBeniAmmortizzabili: z.string().trim().transform(v => v || undefined).optional(),
  percDeduzioneManutenzione: z.string().trim().transform(v => v || undefined).optional(),
  dettaglioClienteFornitore: z.string().trim().transform(v => v || undefined).optional(),
  descrizioneBilancioDare: z.string().trim().transform(v => v || undefined).optional(),
  descrizioneBilancioAvere: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseDatiStudiSettore: z.string().trim().transform(v => v || undefined).optional(),
  numeroColonnaRegCronologico: z.string().trim().transform(v => v || undefined).optional(),
  numeroColonnaRegIncassiPag: z.string().trim().transform(v => v || undefined).optional(),
});

export type ValidatedPianoDeiConti = z.infer<typeof validatedPianoDeiContiSchema>;

// Schema per la validazione dei dati da CONTIAZI.TXT
export const validatedPianoDeiContiAziendaleSchema = validatedPianoDeiContiSchema.extend({
  codiceFiscaleAzienda: z.string().trim().min(11, { message: "Il codice fiscale azienda è obbligatorio." }),
  // Eventuali altri campi specifici per CONTIAZI possono essere aggiunti qui
  // Per ora, la struttura principale è ereditata e viene aggiunto solo il codice fiscale.
});

export type ValidatedPianoDeiContiAziendale = z.infer<typeof validatedPianoDeiContiAziendaleSchema>;

// Rimuovo lo schema raw che non è più necessario,
// il nuovo schema fa sia da validatore che da trasformatore di base. 