import { z } from 'zod';
import { TipoConto } from '@prisma/client';

// --- HELPERS DI COERCIZIONE ---
// Funzioni per convertire i dati grezzi in tipi puliti, come per le causali.

const toBoolean = (val: unknown) => {
    if (typeof val !== 'string') return false;
    const upperVal = val.trim().toUpperCase();
    return upperVal === 'X' || upperVal === 'S'; // Accettiamo sia 'X' che 'S' come true
};

const toNumber = (val: unknown) => {
    if (typeof val !== 'string' || val.trim() === '') return null;
    const num = parseInt(val.trim(), 10);
    return isNaN(num) ? null : num;
};

// --- SCHEMA PIANO DEI CONTI STANDARD (CONTIGEN) ---
export const validatedPianoDeiContiSchema = z.object({
  codice: z.string().trim().min(1, { message: "Il codice non può essere vuoto" }),
  descrizione: z.string().trim().default('Conto senza nome'),
  tipo: z.string().trim(),
  livello: z.string().trim().transform(v => v || undefined).optional(),
  sigla: z.string().trim().transform(v => v || undefined).optional(),
  gruppo: z.string().trim().transform(v => v || undefined).optional(),
  controlloSegno: z.string().trim().transform(v => v || undefined).optional(),
  
  // Campi Flag convertiti in Booleani
  validoImpresaOrdinaria: z.preprocess(toBoolean, z.boolean().optional()),
  validoImpresaSemplificata: z.preprocess(toBoolean, z.boolean().optional()),
  validoProfessionistaOrdinario: z.preprocess(toBoolean, z.boolean().optional()),
  validoProfessionistaSemplificato: z.preprocess(toBoolean, z.boolean().optional()),
  validoUnicoPf: z.preprocess(toBoolean, z.boolean().optional()),
  validoUnicoSp: z.preprocess(toBoolean, z.boolean().optional()),
  validoUnicoSc: z.preprocess(toBoolean, z.boolean().optional()),
  validoUnicoEnc: z.preprocess(toBoolean, z.boolean().optional()),
  
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
  
  // Campo numerico convertito
  percDeduzioneManutenzione: z.preprocess(toNumber, z.number().nullable().optional()),
  
  dettaglioClienteFornitore: z.string().trim().transform(v => v || undefined).optional(),
  descrizioneBilancioDare: z.string().trim().transform(v => v || undefined).optional(),
  descrizioneBilancioAvere: z.string().trim().transform(v => v || undefined).optional(),
  codiceClasseDatiStudiSettore: z.string().trim().transform(v => v || undefined).optional(),

  // Campi numerici convertiti
  numeroColonnaRegCronologico: z.preprocess(toNumber, z.number().nullable().optional()),
  numeroColonnaRegIncassiPag: z.preprocess(toNumber, z.number().nullable().optional()),
});

export type ValidatedPianoDeiConti = z.infer<typeof validatedPianoDeiContiSchema>;

// --- SCHEMA PIANO DEI CONTI AZIENDALE (CONTIAZI) ---
export const validatedPianoDeiContiAziendaleSchema = validatedPianoDeiContiSchema.extend({
  codiceFiscaleAzienda: z.string().trim().min(11, { message: "Il codice fiscale azienda è obbligatorio." }),
  // Eventuali altri campi specifici per CONTIAZI possono essere aggiunti qui
});

export type ValidatedPianoDeiContiAziendale = z.infer<typeof validatedPianoDeiContiAziendaleSchema>;