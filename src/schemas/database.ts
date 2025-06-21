import * as z from 'zod'; 
import { TipoConto } from '@prisma/client';

export const baseSchema = z.object({
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  externalId: z.string().optional(),
}); 

export const causaleSchema = z.object({
  id: z.string().min(1, { message: "L'ID è obbligatorio." }),
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }),
  externalId: z.string().optional(),
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