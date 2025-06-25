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
    voceAnaliticaId: z.string().optional().nullable(),

    // === ESTENSIONI FASE 1 - PARSER PYTHON (parser_contigen.py) ===
    tabellaItalstudio: z.string().optional().nullable(),
    livello: z.string().optional().nullable(),
    livelloDesc: z.string().optional().nullable(),
    sigla: z.string().optional().nullable(),
    gruppo: z.string().optional().nullable(),
    gruppoDesc: z.string().optional().nullable(),
    controlloSegno: z.string().optional().nullable(),
    controlloSegnoDesc: z.string().optional().nullable(),
    codificaFormattata: z.string().optional().nullable(),
    
    // Validità per Tipo Contabilità
    validoImpresaOrdinaria: z.boolean().default(false).optional().nullable(),
    validoImpresaSemplificata: z.boolean().default(false).optional().nullable(),
    validoProfessionistaOrdinario: z.boolean().default(false).optional().nullable(),
    validoProfessionistaSemplificato: z.boolean().default(false).optional().nullable(),
    
    // Validità per Dichiarazioni
    validoUnicoPf: z.boolean().default(false).optional().nullable(),
    validoUnicoSp: z.boolean().default(false).optional().nullable(),
    validoUnicoSc: z.boolean().default(false).optional().nullable(),
    validoUnicoEnc: z.boolean().default(false).optional().nullable(),
    
    // Classi Fiscali
    classeIrpefIres: z.string().optional().nullable(),
    classeIrap: z.string().optional().nullable(),
    classeProfessionista: z.string().optional().nullable(),
    classeIrapProfessionista: z.string().optional().nullable(),
    classeIva: z.string().optional().nullable(),
    
    // Conti Collegati
    contoCostiRicavi: z.string().optional().nullable(),
    contoDareCee: z.string().optional().nullable(),
    contoAvereCee: z.string().optional().nullable(),
    
    // Gestione Speciale
    naturaConto: z.string().optional().nullable(),
    gestioneBeniAmmortizzabili: z.string().optional().nullable(),
    percDeduzioneManutenzione: z.number().optional().nullable(),
    dettaglioClienteFornitore: z.string().optional().nullable(),
    
    // Descrizioni Bilancio
    descrizioneBilancioDare: z.string().optional().nullable(),
    descrizioneBilancioAvere: z.string().optional().nullable(),
    
    // Dati Extracontabili
    classeDatiExtracontabili: z.string().optional().nullable(),
    
    // Registri Professionisti
    colonnaRegistroCronologico: z.string().optional().nullable(),
    colonnaRegistroIncassiPagamenti: z.string().optional().nullable(),
});

export const commessaSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    descrizione: z.string().optional(),
    clienteId: z.string().min(1, "È obbligatorio selezionare un cliente."),
});