/**
 * ANAGRAFICA TRANSFORMER
 * Trasformazione pura dei dati validati in entità Cliente/Fornitore
 * 
 * Fonte: parser_a_clifor copy.py
 * Logica: smistamento basato su TIPO_CONTO (C/F/E)
 */

import { Prisma } from '@prisma/client';
import type { ValidatedAnagrafica } from '../../acquisition/validators/anagraficaValidator';
import {
  decodeTipoConto,
  decodeTipoSoggetto,
  decodeSesso,
  decodeQuadro770,
  decodeTipoRitenuta,
  decodeContributo335,
  formatDataNascita,
  formatCodiceFiscale,
  formatPartitaIva,
  decodeFlagBoolean,
  formatNomeCompleto,
  determineSottocontoAttivo
} from '../decoders/anagraficaDecoders';

export interface TransformedAnagrafica {
  tipoConto: string;
  tipoContoDescrizione: string;
  isCliente: boolean;
  isFornitore: boolean;
  isPersonaFisica: boolean;
  nomeCompleto: string;
  sottocontoAttivo: string;
  
  // Dati base
  codiceUnivoco: string;
  codiceFiscale: string;
  partitaIva: string;
  codiceAnagrafica: string;
  denominazione: string;
  
  // Dati persona fisica - possono essere nulli
  cognome: string | null;
  nome: string | null;
  sesso: string;
  dataNascitaFormatted: string;
  
  // Dati geografici
  comuneNascita: string;
  comuneResidenza: string;
  cap: string;
  indirizzo: string;
  
  // Contatti
  prefissoTelefono: string;
  numeroTelefono: string;
  
  // Fiscale estero
  idFiscaleEstero: string;
  codiceIso: string;
  
  // Conti contabili
  sottocontoCliente: string;
  sottocontoFornitore: string;
  
  // Pagamenti
  codiceIncassoPagamento: string;
  codiceIncassoCliente: string;
  codicePagamentoFornitore: string;
  codiceValuta: string;
  
  // Dati fiscali fornitore (flags boolean)
  gestioneDati770: boolean;
  soggettoARitenuta: boolean;
  contributoPrevidenziale: boolean;
  enasarco: boolean;
  soggettoInail: boolean;
  
  // Dati fiscali fornitore (valori)
  quadro770: string;
  quadro770Descrizione: string;
  codiceRitenuta: string;
  tipoRitenuta: string;
  tipoRitenutaDescrizione: string;
  contributoPrevid335: string;
  contributoPrevid335Descrizione: string;
  aliquota: string;
  percContributoCassa: string;
  attivitaMensilizzazione: string;
}

export interface AnagraficaTransformResult {
  clienti: Prisma.ClienteCreateInput[];
  fornitori: Prisma.FornitoreCreateInput[];
  statistics: {
    totalProcessed: number;
    clientiCreated: number;
    fornitoriCreated: number;
    entrambiCreated: number;
    personeeFisiche: number;
    societa: number;
    conPartitaIva: number;
    soggettiARitenuta: number;
  };
}

/**
 * Trasforma un singolo record validato in dati arricchiti
 */
export function transformSingleAnagrafica(validated: ValidatedAnagrafica): TransformedAnagrafica {
  // Decodifiche principali
  const tipoConto = decodeTipoConto(validated.tipoConto);
  const tipoSoggetto = decodeTipoSoggetto(validated.tipoSoggetto);
  const sesso = decodeSesso(validated.sesso);
  const quadro770 = decodeQuadro770(validated.quadro770);
  const tipoRitenuta = decodeTipoRitenuta(validated.tipoRitenuta);
  const contributo335 = decodeContributo335(validated.contributoPrevid335);
  
  // Formattazioni
  const codiceFiscaleFormatted = formatCodiceFiscale(validated.codiceFiscaleClifor);
  const partitaIvaFormatted = formatPartitaIva(validated.partitaIva);
  const dataNascitaFormatted = formatDataNascita(validated.dataNascita);
  
  // Flags boolean
  const gestioneDati770 = decodeFlagBoolean(validated.gestioneDati770);
  const soggettoARitenuta = decodeFlagBoolean(validated.soggettoARitenuta);
  const contributoPrevidenziale = decodeFlagBoolean(validated.contributoPrevidenziale);
  const enasarco = decodeFlagBoolean(validated.enasarco);
  const soggettoInail = decodeFlagBoolean(validated.soggettoInail);
  
  // Calcoli derivati
  const nomeCompleto = formatNomeCompleto(
    validated.nome,
    validated.cognome, 
    validated.denominazione,
    tipoSoggetto.isPersonaFisica
  );
  
  const sottocontoAttivo = determineSottocontoAttivo(
    validated.tipoConto,
    validated.sottocontoCliente,
    validated.sottocontoFornitore
  );
  
  return {
    // Classificazione
    tipoConto: tipoConto.codice,
    tipoContoDescrizione: tipoConto.descrizione,
    isCliente: tipoConto.isCliente,
    isFornitore: tipoConto.isFornitore,
    isPersonaFisica: tipoSoggetto.isPersonaFisica,
    nomeCompleto,
    sottocontoAttivo,
    
    // Dati base
    codiceUnivoco: validated.codiceUnivoco,
    codiceFiscale: codiceFiscaleFormatted,
    partitaIva: partitaIvaFormatted,
    codiceAnagrafica: validated.codiceAnagrafica,
    denominazione: validated.denominazione,
    
    // Dati persona fisica
    cognome: validated.cognome || null,
    nome: validated.nome || null,
    sesso: sesso.codice,
    dataNascitaFormatted,
    
    // Dati geografici
    comuneNascita: validated.comuneNascita,
    comuneResidenza: validated.comuneResidenza,
    cap: validated.cap,
    indirizzo: validated.indirizzo,
    
    // Contatti
    prefissoTelefono: validated.prefissoTelefono,
    numeroTelefono: validated.numeroTelefono,
    
    // Fiscale estero
    idFiscaleEstero: validated.idFiscaleEstero,
    codiceIso: validated.codiceIso,
    
    // Conti contabili
    sottocontoCliente: validated.sottocontoCliente,
    sottocontoFornitore: validated.sottocontoFornitore,
    
    // Pagamenti
    codiceIncassoPagamento: validated.codiceIncassoPagamento,
    codiceIncassoCliente: validated.codiceIncassoCliente,
    codicePagamentoFornitore: validated.codicePagamentoFornitore,
    codiceValuta: validated.codiceValuta,
    
    // Dati fiscali fornitore (flags)
    gestioneDati770,
    soggettoARitenuta,
    contributoPrevidenziale,
    enasarco,
    soggettoInail,
    
    // Dati fiscali fornitore (valori)
    quadro770: quadro770.codice,
    quadro770Descrizione: quadro770.descrizione,
    codiceRitenuta: validated.codiceRitenuta,
    tipoRitenuta: tipoRitenuta.codice,
    tipoRitenutaDescrizione: tipoRitenuta.descrizione,
    contributoPrevid335: contributo335.codice,
    contributoPrevid335Descrizione: contributo335.descrizione,
    aliquota: validated.aliquota,
    percContributoCassa: validated.percContributoCassa,
    attivitaMensilizzazione: validated.attivitaMensilizzazione
  };
}

/**
 * Crea input per entità Cliente
 */
function createClienteInput(transformed: TransformedAnagrafica): Prisma.ClienteCreateInput {
  return {
    // Campi precedentemente non standard che ora esistono nel modello Prisma
    externalId: transformed.codiceUnivoco,
    codiceFiscale: transformed.codiceFiscale,
    piva: transformed.partitaIva || null,
    codiceAnagrafica: transformed.codiceAnagrafica,
    
    // === CORREZIONE ===
    // 'nome' è obbligatorio (String) nello schema, usiamo 'nomeCompleto' che è sempre valorizzato.
    nome: transformed.nomeCompleto,
    // 'denominazione' è opzionale (String?), usiamo il valore originale.
    denominazione: transformed.denominazione || null,
    
    // Dati persona fisica
    // 'cognome' è opzionale (String?), può essere null.
    cognome: transformed.cognome,
    sesso: transformed.sesso || null,
    dataNascita: transformed.dataNascitaFormatted ? new Date(transformed.dataNascitaFormatted) : null,
    
    // Dati geografici  
    comuneNascita: transformed.comuneNascita || null,
    comune: transformed.comuneResidenza || null, // Mappatura da 'comuneResidenza' a 'comune'
    cap: transformed.cap || null,
    indirizzo: transformed.indirizzo || null,
    
    // Contatti
    prefissoTelefono: transformed.prefissoTelefono || null,
    telefono: transformed.numeroTelefono || null, // Mappatura da 'numeroTelefono' a 'telefono'
    
    // Fiscale estero
    idFiscaleEstero: transformed.idFiscaleEstero || null,
    codiceIso: transformed.codiceIso || null,
    
    // Conti e pagamenti
    sottocontoCliente: transformed.sottocontoCliente || null,
    codicePagamento: transformed.codiceIncassoPagamento || null, // Mappatura generica
    codiceIncassoCliente: transformed.codiceIncassoCliente || null,
    codiceValuta: transformed.codiceValuta || null,
    
    // Metadati / Flags calcolati
    ePersonaFisica: transformed.isPersonaFisica,
    haPartitaIva: Boolean(transformed.partitaIva),
    eCliente: true,
    eFornitore: transformed.isFornitore,
    
    // Campi di audit
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Crea input per entità Fornitore  
 */
function createFornitoreInput(transformed: TransformedAnagrafica): Prisma.FornitoreCreateInput {
  return {
    // Campi precedentemente non standard che ora esistono nel modello Prisma
    externalId: transformed.codiceUnivoco,
    codiceFiscale: transformed.codiceFiscale,
    piva: transformed.partitaIva || null,
    codiceAnagrafica: transformed.codiceAnagrafica,
    
    // === CORREZIONE ===
    // 'nome' è obbligatorio (String) nello schema, usiamo 'nomeCompleto' che è sempre valorizzato.
    nome: transformed.nomeCompleto,
    // 'denominazione' è opzionale (String?), usiamo il valore originale.
    denominazione: transformed.denominazione || null,
    
    // Dati persona fisica
    // 'cognome' è opzionale (String?), può essere null.
    cognome: transformed.cognome,
    sesso: transformed.sesso || null,
    dataNascita: transformed.dataNascitaFormatted ? new Date(transformed.dataNascitaFormatted) : null,
    
    // Dati geografici
    comuneNascita: transformed.comuneNascita || null,
    comune: transformed.comuneResidenza || null, // Mappatura da 'comuneResidenza' a 'comune'
    cap: transformed.cap || null,
    indirizzo: transformed.indirizzo || null,
    
    // Contatti
    prefissoTelefono: transformed.prefissoTelefono || null,
    telefono: transformed.numeroTelefono || null, // Mappatura da 'numeroTelefono' a 'telefono'
    
    // Fiscale estero
    idFiscaleEstero: transformed.idFiscaleEstero || null,
    codiceIso: transformed.codiceIso || null,
    
    // Conti e pagamenti
    sottocontoFornitore: transformed.sottocontoFornitore || null,
    codicePagamentoFornitore: transformed.codicePagamentoFornitore || null,
    codiceValuta: transformed.codiceValuta || null,
    
    // Dati fiscali specifici fornitore
    gestione770: transformed.gestioneDati770,
    soggettoRitenuta: transformed.soggettoARitenuta,
    quadro770: transformed.quadro770 || null,
    contributoPrevidenziale: transformed.contributoPrevidenziale,
    codiceRitenuta: transformed.codiceRitenuta || null,
    enasarco: transformed.enasarco,
    tipoRitenuta: transformed.tipoRitenuta || null,
    soggettoInail: transformed.soggettoInail,
    contributoPrevidenzialeL335: transformed.contributoPrevid335 || null,
    aliquota: transformed.aliquota ? parseFloat(transformed.aliquota) : null,
    percContributoCassaPrev: transformed.percContributoCassa ? parseFloat(transformed.percContributoCassa) : null,
    attivitaMensilizzazione: transformed.attivitaMensilizzazione ? parseInt(transformed.attivitaMensilizzazione, 10) : null,
    
    // Metadati / Flags calcolati
    ePersonaFisica: transformed.isPersonaFisica,
    haPartitaIva: Boolean(transformed.partitaIva),
    eCliente: transformed.isCliente,
    eFornitore: true,

    // Campi di audit
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Trasforma array di anagrafiche validate in entità Cliente/Fornitore
 * Logica di smistamento basata su TIPO_CONTO:
 * - C: solo Cliente
 * - F: solo Fornitore  
 * - E: sia Cliente che Fornitore (duplicazione record)
 */
export function transformAnagrafiche(validatedRecords: ValidatedAnagrafica[]): AnagraficaTransformResult {
  const clienti: Prisma.ClienteCreateInput[] = [];
  const fornitori: Prisma.FornitoreCreateInput[] = [];
  
  let clientiCreated = 0;
  let fornitoriCreated = 0;
  let entrambiCreated = 0;
  let personeeFisiche = 0;
  let societa = 0;
  let conPartitaIva = 0;
  let soggettiARitenuta = 0;
  
  for (const validated of validatedRecords) {
    const transformed = transformSingleAnagrafica(validated);
    
    // Statistiche
    if (transformed.isPersonaFisica) {
      personeeFisiche++;
    } else {
      societa++;
    }
    
    if (transformed.partitaIva) {
      conPartitaIva++;
    }
    
    if (transformed.soggettoARitenuta) {
      soggettiARitenuta++;
    }
    
    // Smistamento basato su tipo conto
    switch (transformed.tipoConto) {
      case 'C': // Solo Cliente
        clienti.push(createClienteInput(transformed));
        clientiCreated++;
        break;
        
      case 'F': // Solo Fornitore
        fornitori.push(createFornitoreInput(transformed));
        fornitoriCreated++;
        break;
        
      case 'E': // Entrambi - duplicazione record
        clienti.push(createClienteInput(transformed));
        fornitori.push(createFornitoreInput(transformed));
        entrambiCreated++;
        clientiCreated++;
        fornitoriCreated++;
        break;
        
      default:
        // Tipo conto non riconosciuto - skipp record
        console.warn(`Tipo conto non riconosciuto: ${transformed.tipoConto} per codice ${transformed.codiceUnivoco}`);
        break;
    }
  }
  
  return {
    clienti,
    fornitori,
    statistics: {
      totalProcessed: validatedRecords.length,
      clientiCreated,
      fornitoriCreated, 
      entrambiCreated,
      personeeFisiche,
      societa,
      conPartitaIva,
      soggettiARitenuta
    }
  };
}