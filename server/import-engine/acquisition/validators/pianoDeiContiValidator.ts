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
  validoImpresaOrdinaria: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoImpresaSemplificata: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoProfessionistaOrdinario: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoProfessionistaSemplificato: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoUnicoPf: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoUnicoSp: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoUnicoSc: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  validoUnicoEnc: z.string().trim().transform(v => v.toUpperCase() === 'X'),
  classeIrpefIres: z.string().trim().transform(v => v || undefined).optional(),
  classeIrap: z.string().trim().transform(v => v || undefined).optional(),
  classeProfessionista: z.string().trim().transform(v => v || undefined).optional(),
  classeIrapProfessionista: z.string().trim().transform(v => v || undefined).optional(),
  classeIva: z.string().trim().transform(v => v || undefined).optional(),
  contoCostiRicavi: z.string().trim().transform(v => v || undefined).optional(),
  contoDareCee: z.string().trim().transform(v => v || undefined).optional(),
  contoAvereCee: z.string().trim().transform(v => v || undefined).optional(),
  naturaConto: z.string().trim().transform(v => v || undefined).optional(),
  gestioneBeniAmmortizzabili: z.string().trim().transform(v => v || undefined).optional(),
  percDeduzioneManutenzione: z.string().transform(v => {
    const num = parseFloat(v.replace(',', '.'));
    return isNaN(num) ? undefined : num;
  }).optional(),
  dettaglioClienteFornitore: z.string().trim().transform(v => v || undefined).optional(),
  descrizioneBilancioDare: z.string().trim().transform(v => v || undefined).optional(),
  descrizioneBilancioAvere: z.string().trim().transform(v => v || undefined).optional(),
  classeDatiExtracontabili: z.string().trim().transform(v => v || undefined).optional(),
  colonnaRegistroCronologico: z.string().trim().transform(v => v || undefined).optional(),
  colonnaRegistroIncassiPagamenti: z.string().trim().transform(v => v || undefined).optional(),
});

export type ValidatedPianoDeiConti = z.infer<typeof validatedPianoDeiContiSchema>;

// Rimuovo lo schema raw che non è più necessario,
// il nuovo schema fa sia da validatore che da trasformatore di base. 