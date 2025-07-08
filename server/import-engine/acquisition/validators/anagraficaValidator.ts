/**
 * ANAGRAFICA VALIDATOR
 * Schema Zod per validazione e coercizione dati A_CLIFOR.TXT
 * 
 * Tracciato: .docs/dati_cliente/tracciati/A_CLIFOR.TXT
 * Parser Python: parser_a_clifor copy.py
 */

import { z } from 'zod';

// Schema per i dati grezzi (tutte stringhe dal parser)
export const rawAnagraficaSchema = z.object({
  // Dati azienda
  CODICE_FISCALE_AZIENDA: z.string().default(''),
  SUBCODICE_AZIENDA: z.string().default(''),
  
  // Dati generali
  CODICE_UNIVOCO: z.string().default(''),
  CODICE_FISCALE_CLIFOR: z.string().default(''),
  SUBCODICE_CLIFOR: z.string().default(''),
  TIPO_CONTO: z.string().default(''),
  SOTTOCONTO_CLIENTE: z.string().default(''),
  SOTTOCONTO_FORNITORE: z.string().default(''),
  CODICE_ANAGRAFICA: z.string().default(''),
  PARTITA_IVA: z.string().default(''),
  TIPO_SOGGETTO: z.string().default(''),
  DENOMINAZIONE: z.string().default(''),
  
  // Dati persona fisica
  COGNOME: z.string().default(''),
  NOME: z.string().default(''),
  SESSO: z.string().default(''),
  DATA_NASCITA: z.string().default(''),
  COMUNE_NASCITA: z.string().default(''),
  COMUNE_RESIDENZA: z.string().default(''),
  CAP: z.string().default(''),
  INDIRIZZO: z.string().default(''),
  PREFISSO_TELEFONO: z.string().default(''),
  NUMERO_TELEFONO: z.string().default(''),
  ID_FISCALE_ESTERO: z.string().default(''),
  CODICE_ISO: z.string().default(''),
  
  // Dati pagamenti
  CODICE_INCASSO_PAGAMENTO: z.string().default(''),
  CODICE_INCASSO_CLIENTE: z.string().default(''),
  CODICE_PAGAMENTO_FORNITORE: z.string().default(''),
  CODICE_VALUTA: z.string().default(''),
  
  // Dati fiscali fornitore
  GESTIONE_DATI_770: z.string().default(''),
  SOGGETTO_A_RITENUTA: z.string().default(''),
  QUADRO_770: z.string().default(''),
  CONTRIBUTO_PREVIDENZIALE: z.string().default(''),
  CODICE_RITENUTA: z.string().default(''),
  ENASARCO: z.string().default(''),
  TIPO_RITENUTA: z.string().default(''),
  SOGGETTO_INAIL: z.string().default(''),
  CONTRIBUTO_PREVID_335: z.string().default(''),
  ALIQUOTA: z.string().default(''),
  PERC_CONTRIBUTO_CASSA: z.string().default(''),
  ATTIVITA_MENSILIZZAZIONE: z.string().default('')
});

// Schema per i dati validati e coerced
export const validatedAnagraficaSchema = z.object({
  // Dati azienda
  codiceFiscaleAzienda: z.string().trim().default(''),
  subcodeAzienda: z.string().trim().default(''),
  
  // Dati generali
  codiceUnivoco: z.string().trim().default(''),
  codiceFiscaleClifor: z.string().trim().default(''),
  subcodeClifor: z.string().trim().default(''),
  tipoConto: z.string()
    .trim()
    .refine((val) => !val || ['C', 'F', 'E'].includes(val), {
      message: "Tipo conto deve essere 'C' (Cliente), 'F' (Fornitore), 'E' (Entrambi) o vuoto"
    })
    .default(''),
  sottocontoCliente: z.string().trim().default(''),
  sottocontoFornitore: z.string().trim().default(''),
  codiceAnagrafica: z.string().trim().default(''),
  partitaIva: z.string()
    .trim()
    .refine((val) => !val || /^\d{11}$/.test(val) || val.length === 0, {
      message: "Partita IVA deve essere vuota o 11 cifre"
    })
    .default(''),
  tipoSoggetto: z.string()
    .trim()
    .refine((val) => !val || ['0', '1'].includes(val), {
      message: "Tipo soggetto deve essere '0' (Persona Fisica) o '1' (Soggetto Diverso)"
    })
    .default(''),
  denominazione: z.string().trim().default(''),
  
  // Dati persona fisica
  cognome: z.string().trim().default(''),
  nome: z.string().trim().default(''),
  sesso: z.string()
    .trim()
    .refine((val) => !val || ['M', 'F'].includes(val), {
      message: "Sesso deve essere 'M' o 'F'"
    })
    .default(''),
  dataNascita: z.string()
    .trim()
    .refine((val) => !val || /^\d{8}$/.test(val), {
      message: "Data nascita deve essere formato GGMMAAAA"
    })
    .default(''),
  comuneNascita: z.string().trim().default(''),
  comuneResidenza: z.string().trim().default(''),
  cap: z.string()
    .trim()
    .refine((val) => !val || /^\d{5}$/.test(val), {
      message: "CAP deve essere 5 cifre"
    })
    .default(''),
  indirizzo: z.string().trim().default(''),
  prefissoTelefono: z.string()
    .trim()
    .refine((val) => !val || /^\d{0,4}$/.test(val), {
      message: "Prefisso telefono massimo 4 cifre"
    })
    .default(''),
  numeroTelefono: z.string()
    .trim()
    .refine((val) => !val || /^\d{0,11}$/.test(val), {
      message: "Numero telefono massimo 11 cifre"
    })
    .default(''),
  idFiscaleEstero: z.string().trim().default(''),
  codiceIso: z.string()
    .trim()
    .refine((val) => !val || val.length === 2, {
      message: "Codice ISO deve essere 2 caratteri"
    })
    .default(''),
  
  // Dati pagamenti
  codiceIncassoPagamento: z.string().trim().default(''),
  codiceIncassoCliente: z.string().trim().default(''),
  codicePagamentoFornitore: z.string().trim().default(''),
  codiceValuta: z.string().trim().default(''),
  
  // Dati fiscali fornitore
  gestioneDati770: z.union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === 'boolean') return val ? 'X' : '';
      return val.trim();
    })
    .refine((val) => !val || val === 'X', {
      message: "Gestione 770 deve essere 'X' o vuoto"
    })
    .default(''),
  soggettoARitenuta: z.union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === 'boolean') return val ? 'X' : '';
      return val.trim();
    })
    .refine((val) => !val || val === 'X', {
      message: "Soggetto a ritenuta deve essere 'X' o vuoto"
    })
    .default(''),
  quadro770: z.string()
    .trim()
    .refine((val) => !val || ['0', '1', '2'].includes(val), {
      message: "Quadro 770 deve essere '0', '1', '2' o vuoto"
    })
    .default(''),
  contributoPrevidenziale: z.union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === 'boolean') return val ? 'X' : '';
      return val.trim();
    })
    .refine((val) => !val || val === 'X', {
      message: "Contributo previdenziale deve essere 'X' o vuoto"
    })
    .default(''),
  codiceRitenuta: z.string().trim().default(''),
  enasarco: z.union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === 'boolean') return val ? 'X' : '';
      return val.trim();
    })
    .refine((val) => !val || val === 'X', {
      message: "ENASARCO deve essere 'X' o vuoto"
    })
    .default(''),
  tipoRitenuta: z.string()
    .trim()
    .refine((val) => !val || ['A', 'I', 'M'].includes(val), {
      message: "Tipo ritenuta deve essere 'A', 'I', 'M' o vuoto"
    })
    .default(''),
  soggettoInail: z.union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === 'boolean') return val ? 'X' : '';
      return val.trim();
    })
    .refine((val) => !val || val === 'X', {
      message: "Soggetto INAIL deve essere 'X' o vuoto"
    })
    .default(''),
  contributoPrevid335: z.string()
    .trim()
    .refine((val) => !val || ['0', '1', '2', '3'].includes(val), {
      message: "Contributo L.335/95 deve essere '0', '1', '2', '3' o vuoto"
    })
    .default(''),
  aliquota: z.union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null) return '';
      if (typeof val === 'number') return val.toString();
      return val.trim();
    })
    .refine((val) => !val || /^\d*\.?\d*$/.test(val), {
      message: "Aliquota deve essere un numero"
    })
    .default(''),
  percContributoCassa: z.union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null) return '';
      if (typeof val === 'number') return val.toString();
      return val.trim();
    })
    .refine((val) => !val || /^\d*\.?\d*$/.test(val), {
      message: "Percentuale contributo cassa deve essere un numero"
    })
    .default(''),
  attivitaMensilizzazione: z.string()
    .trim()
    .refine((val) => !val || /^\d{0,2}$/.test(val), {
      message: "Attività mensilizzazione deve essere massimo 2 cifre"
    })
    .default('')
});

export type RawAnagrafica = z.infer<typeof rawAnagraficaSchema>;
export type ValidatedAnagrafica = z.infer<typeof validatedAnagraficaSchema>;

/**
 * Valida e pulisce i dati grezzi dall'anagrafica
 */
export function validateAnagrafica(rawData: RawAnagrafica): ValidatedAnagrafica {
  // Mappatura diretta senza double-parsing per evitare conflitti di naming
  const mapped = {
    // Dati azienda  
    codiceFiscaleAzienda: rawData.CODICE_FISCALE_AZIENDA || '',
    subcodeAzienda: rawData.SUBCODICE_AZIENDA || '',
    
    // Dati generali
    codiceUnivoco: rawData.CODICE_UNIVOCO || '',
    codiceFiscaleClifor: rawData.CODICE_FISCALE_CLIFOR || '',
    subcodeClifor: rawData.SUBCODICE_CLIFOR || '',
    tipoConto: rawData.TIPO_CONTO || '',
    sottocontoCliente: rawData.SOTTOCONTO_CLIENTE || '',
    sottocontoFornitore: rawData.SOTTOCONTO_FORNITORE || '',
    codiceAnagrafica: rawData.CODICE_ANAGRAFICA || '',
    partitaIva: rawData.PARTITA_IVA || '',
    tipoSoggetto: rawData.TIPO_SOGGETTO || '',
    denominazione: rawData.DENOMINAZIONE || '',
    
    // Dati persona fisica
    cognome: rawData.COGNOME || '',
    nome: rawData.NOME || '',
    sesso: rawData.SESSO || '',
    dataNascita: rawData.DATA_NASCITA || '',
    comuneNascita: rawData.COMUNE_NASCITA || '',
    comuneResidenza: rawData.COMUNE_RESIDENZA || '',
    cap: rawData.CAP || '',
    indirizzo: rawData.INDIRIZZO || '',
    prefissoTelefono: rawData.PREFISSO_TELEFONO || '',
    numeroTelefono: rawData.NUMERO_TELEFONO || '',
    idFiscaleEstero: rawData.ID_FISCALE_ESTERO || '',
    codiceIso: rawData.CODICE_ISO || '',
    
    // Dati pagamenti
    codiceIncassoPagamento: rawData.CODICE_INCASSO_PAGAMENTO || '',
    codiceIncassoCliente: rawData.CODICE_INCASSO_CLIENTE || '',
    codicePagamentoFornitore: rawData.CODICE_PAGAMENTO_FORNITORE || '',
    codiceValuta: rawData.CODICE_VALUTA || '',
    
    // Dati fiscali fornitore
    gestioneDati770: rawData.GESTIONE_DATI_770 || '',
    soggettoARitenuta: rawData.SOGGETTO_A_RITENUTA || '',
    quadro770: rawData.QUADRO_770 || '',
    contributoPrevidenziale: rawData.CONTRIBUTO_PREVIDENZIALE || '',
    codiceRitenuta: rawData.CODICE_RITENUTA || '',
    enasarco: rawData.ENASARCO || '',
    tipoRitenuta: rawData.TIPO_RITENUTA || '',
    soggettoInail: rawData.SOGGETTO_INAIL || '',
    contributoPrevid335: rawData.CONTRIBUTO_PREVID_335 || '',
    aliquota: rawData.ALIQUOTA || '',
    percContributoCassa: rawData.PERC_CONTRIBUTO_CASSA || '',
    attivitaMensilizzazione: rawData.ATTIVITA_MENSILIZZAZIONE || ''
  };
  
  // Validazione finale con schema tipizzato
  return validatedAnagraficaSchema.parse(mapped);
} 