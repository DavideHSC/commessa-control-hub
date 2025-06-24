import * as z from 'zod'; 
import { TipoConto } from '@prisma/client';

export const baseSchema = z.object({
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  externalId: z.string().optional(),
}); 

export const causaleSchema = z.object({
  id: z.string().min(1, { message: "L'ID è obbligatorio." }),
  codice: z.string().optional().nullable(),
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }).optional().nullable(),
  descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }).optional().nullable(),
  externalId: z.string().optional().nullable(),
  dataFine: z.date().optional().nullable(),
  dataInizio: z.date().optional().nullable(),
  noteMovimento: z.string().optional().nullable(),
  tipoAggiornamento: z.string().optional().nullable(),
  tipoMovimento: z.string().optional().nullable(),
  tipoRegistroIva: z.string().optional().nullable(),
  tipoMovimentoDesc: z.string().optional().nullable(),
  tipoAggiornamentoDesc: z.string().optional().nullable(),
  tipoRegistroIvaDesc: z.string().optional().nullable(),
  segnoMovimentoIva: z.string().optional().nullable(),
  segnoMovimentoIvaDesc: z.string().optional().nullable(),
  contoIva: z.string().optional().nullable(),
  contoIvaVendite: z.string().optional().nullable(),
  generazioneAutofattura: z.boolean().default(false),
  tipoAutofatturaGenerata: z.string().optional().nullable(),
  tipoAutofatturaDesc: z.string().optional().nullable(),
  fatturaImporto0: z.boolean().default(false),
  fatturaValutaEstera: z.boolean().default(false),
  nonConsiderareLiquidazioneIva: z.boolean().default(false),
  fatturaEmessaRegCorrispettivi: z.boolean().default(false),
  ivaEsigibilitaDifferita: z.string().optional().nullable(),
  ivaEsigibilitaDifferitaDesc: z.string().optional().nullable(),
  gestionePartite: z.string().optional().nullable(),
  gestionePartiteDesc: z.string().optional().nullable(),
  gestioneIntrastat: z.boolean().default(false),
  gestioneRitenuteEnasarco: z.string().optional().nullable(),
  gestioneRitenuteEnasarcoDesc: z.string().optional().nullable(),
  versamentoRitenute: z.boolean().default(false),
  descrizioneDocumento: z.string().optional().nullable(),
  identificativoEsteroClifor: z.boolean().default(false),
  scritturaRettificaAssestamento: z.boolean().default(false),
  nonStampareRegCronologico: z.boolean().default(false),
  movimentoRegIvaNonRilevante: z.boolean().default(false),
  tipoMovimentoSemplificata: z.string().optional().nullable(),
  tipoMovimentoSemplificataDesc: z.string().optional().nullable(),
});

export const codiceIvaSchema = z.object({
    id: z.string().min(1, { message: "L'ID è obbligatorio." }),
    descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }),
    aliquota: z.number().min(0).max(100, { message: "L'aliquota deve essere tra 0 e 100." }),
    externalId: z.string().optional(),
  });

export const condizioneSchema = z.object({
    id: z.string().min(1, { message: "L'ID è obbligatorio." }),
    descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }),
    externalId: z.string().optional(),
});

export const voceSchema = z.object({
    id: z.string().min(1, { message: "L'ID è obbligatorio." }),
    nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
    descrizione: z.string().optional(),
    externalId: z.string().optional(),
});

export const contoSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    codice: z.string().min(1, "Il codice è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    tipo: z.nativeEnum(TipoConto),
    richiedeVoceAnalitica: z.boolean().default(false),
    voceAnaliticaSuggeritaId: z.string().optional().nullable(),
});

export const commessaSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    descrizione: z.string().optional(),
    clienteId: z.string().min(1, "È obbligatorio selezionare un cliente."),
});