import * as z from 'zod';

export const regolaRipartizioneSchema = z.object({
  descrizione: z.string().min(1, 'La descrizione è obbligatoria.'),
  percentuale: z.number().min(0, 'La percentuale non può essere negativa.').max(100, 'La percentuale non può superare 100.'),
  contoId: z.string().min(1, 'È obbligatorio selezionare un conto.'),
  commessaId: z.string().min(1, 'È obbligatorio selezionare una commessa.'),
  voceAnaliticaId: z.string().min(1, 'È obbligatorio selezionare una voce analitica.'),
});

export type RegolaRipartizioneInput = z.infer<typeof regolaRipartizioneSchema>; 