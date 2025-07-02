import { Prisma } from '@prisma/client';
import {
  ValidatedPnTesta,
  ValidatedPnRigCon,
  ValidatedPnRigIva,
  ValidatedMovAnac,
} from '../../acquisition/validators/scrittureContabiliValidator';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - TRANSFORMER COMPLETO
// =============================================================================
// Implementa il transformer completo che crea TUTTE le entità:
// - ScritturaContabile (testate)
// - RigaScrittura (righe contabili)
// - RigaIva (righe IVA)
// - Allocazione (movimenti analitici)
// - Entità dipendenti (fornitori, causali, conti, codici IVA, commesse)
// =============================================================================

// Costanti di sistema
const SYSTEM_CUSTOMER_ID = 'cliente_sistema';
const DEFAULT_VOCE_ANALITICA_ID = 'default_voce_analitica';

// -----------------------------------------------------------------------------
// INTERFACCE DI OUTPUT COMPLETE
// -----------------------------------------------------------------------------

export interface ScrittureContabiliTransformResult {
  // Entità principali
  scritture: Prisma.ScritturaContabileCreateInput[];
  righeScrittura: Prisma.RigaScritturaCreateInput[];
  righeIva: Prisma.RigaIvaCreateInput[];
  allocazioni: Prisma.AllocazioneCreateInput[];
  
  // Entità dipendenti da creare
  fornitori: Prisma.FornitoreCreateInput[];
  causali: Prisma.CausaleContabileCreateInput[];
  conti: Prisma.ContoCreateInput[];
  codiciIva: Prisma.CodiceIvaCreateInput[];
  commesse: Prisma.CommessaCreateInput[];
  vociAnalitiche: Prisma.VoceAnaliticaCreateInput[];
  
  // Dati organizzati per diagnostica
  scrittureOrganizzate: Record<string, ScritturaOrganizzata>;
  
  // Statistiche complete
  stats: TransformationStats;
}

export interface TransformationStats {
  scrittureProcessate: number;
  righeContabiliProcessate: number;
  righeIvaProcessate: number;
  allocazioniProcessate: number;
  entitaCreate: {
    scritture: number;
    righeScrittura: number;
    righeIva: number;
    allocazioni: number;
    fornitori: number;
    causali: number;
    conti: number;
    codiciIva: number;
    commesse: number;
    vociAnalitiche: number;
  };
  erroriIntegrita: string[];
}

// Struttura dati intermedia
interface ScritturaOrganizzata {
  testata: ValidatedPnTesta;
  righeContabili: ValidatedPnRigCon[];
  righeIva: ValidatedPnRigIva[];
  allocazioni: ValidatedMovAnac[];
}

// Mappa per correlazioni
interface EntitaCorrelazioni {
  scrittureByExternalId: Map<string, string>; // externalId -> scritturaId generato
  righeByKey: Map<string, string>; // "scritturaId:progressivo" -> rigaId generato
  righeIvaByKey: Map<string, string>; // "scritturaId:progressivo" -> rigaId generato
}

interface EntitaNecessarie {
  fornitori: Set<string>;
  causali: Set<string>;
  conti: Set<string>;
  codiciIva: Set<string>;
  commesse: Set<string>;
  vociAnalitiche: Set<string>;
}

// -----------------------------------------------------------------------------
// FUNZIONE PRINCIPALE COMPLETA
// -----------------------------------------------------------------------------

export function transformScrittureContabili(
  testate: ValidatedPnTesta[],
  righeContabili: ValidatedPnRigCon[],
  righeIva: ValidatedPnRigIva[],
  allocazioni: ValidatedMovAnac[]
): ScrittureContabiliTransformResult {
  
  console.log('🔧 Transformer COMPLETO: Creazione di TUTTE le entità...');
  
  // FASE 1: Organizza dati per CODICE_UNIVOCO
  const scrittureOrganizzate = organizzaDatiMultiFile(testate, righeContabili, righeIva, allocazioni);
  
  // FASE 2: Valida integrità referenziale
  const erroriIntegrita = validaIntegritaReferenziale(scrittureOrganizzate);
  
  // FASE 3: Identifica entità dipendenti necessarie
  const entitaNecessarie = identificaEntitaDipendenti(scrittureOrganizzate);
  
  // FASE 4: Crea tutte le entità con correlazioni
  const entitaPrisma = creaTutteLeEntita(scrittureOrganizzate, entitaNecessarie);
  
  // FASE 5: Statistiche finali
  const stats = calcolaStatisticheComplete(scrittureOrganizzate, entitaPrisma, erroriIntegrita);
  
  console.log(`✅ Transformer COMPLETO: ${stats.entitaCreate.scritture} scritture complete create`);
  console.log(`   📊 Righe contabili: ${stats.entitaCreate.righeScrittura}`);
  console.log(`   💰 Righe IVA: ${stats.entitaCreate.righeIva}`);
  console.log(`   🏭 Allocazioni: ${stats.entitaCreate.allocazioni}`);
  
  return {
    ...entitaPrisma,
    scrittureOrganizzate,
    stats,
  };
}

// -----------------------------------------------------------------------------
// FASE 1: ORGANIZZAZIONE DATI (IDENTICA AL MVP)
// -----------------------------------------------------------------------------

function organizzaDatiMultiFile(
  testate: ValidatedPnTesta[],
  righeContabili: ValidatedPnRigCon[],
  righeIva: ValidatedPnRigIva[],
  allocazioni: ValidatedMovAnac[]
): Record<string, ScritturaOrganizzata> {
  
  const scrittureMap: Record<string, ScritturaOrganizzata> = {};
  
  // 1. Prima le testate
  console.log(`📋 Organizzando ${testate.length} testate...`);
  for (const testata of testate) {
    const key = testata.externalId;
    scrittureMap[key] = {
      testata,
      righeContabili: [],
      righeIva: [],
      allocazioni: [],
    };
  }
  console.log(`✅ Testate organizzate. Prime 5 chiavi:`, Object.keys(scrittureMap).slice(0, 5));
  
  // 2. Poi righe contabili
  console.log(`💰 Associando ${righeContabili.length} righe contabili...`);
  let righeAssociate = 0;
  for (const riga of righeContabili) {
    const key = riga.externalId;
    if (scrittureMap[key]) {
      scrittureMap[key].righeContabili.push(riga);
      righeAssociate++;
    } else {
      // DEBUG: primi 3 che non si associano
      if (righeAssociate < 3) {
        console.log(`❌ DEBUG RIGA ${righeAssociate + 1}: Riga externalId="${riga.externalId}" non trova testata.`);
        console.log(`❌ DEBUG: Prime 5 testate: ${Object.keys(scrittureMap).slice(0, 5).join('", "')}`);
        console.log(`❌ DEBUG: Lunghezza riga externalId: ${riga.externalId.length}, lunghezza testata externalId: ${Object.keys(scrittureMap)[0]?.length || 'N/A'}`);
      }
    }
  }
  console.log(`✅ ${righeAssociate}/${righeContabili.length} righe contabili associate`);
  
  // 3. Poi righe IVA
  console.log(`📊 Associando ${righeIva.length} righe IVA...`);
  let righeIvaAssociate = 0;
  for (const riga of righeIva) {
    const key = riga.externalId;
    if (scrittureMap[key]) {
      scrittureMap[key].righeIva.push(riga);
      righeIvaAssociate++;
    }
  }
  console.log(`✅ ${righeIvaAssociate}/${righeIva.length} righe IVA associate`);
  
  // 4. Infine allocazioni analitiche
  console.log(`🏭 Associando ${allocazioni.length} allocazioni...`);
  let allocazioniAssociate = 0;
  for (const alloc of allocazioni) {
    const key = alloc.externalId;
    if (scrittureMap[key]) {
      scrittureMap[key].allocazioni.push(alloc);
      allocazioniAssociate++;
    }
  }
  console.log(`✅ ${allocazioniAssociate}/${allocazioni.length} allocazioni associate`);
  
  return scrittureMap;
}

// -----------------------------------------------------------------------------
// FASE 2: VALIDAZIONE INTEGRITÀ REFERENZIALE
// -----------------------------------------------------------------------------

function validaIntegritaReferenziale(
  scrittureMap: Record<string, ScritturaOrganizzata>
): string[] {
  const errori: string[] = [];
  
  Object.entries(scrittureMap).forEach(([key, scrittura]) => {
    // Controllo testata
    if (!scrittura.testata) {
      errori.push(`Scrittura ${key}: testata mancante`);
    }
    
    // Controllo righe contabili
    if (scrittura.righeContabili.length === 0) {
      errori.push(`Scrittura ${key}: nessuna riga contabile trovata`);
    }
    
    // Controllo coerenza righe IVA
    scrittura.righeIva.forEach((rigaIva, idx) => {
      if (rigaIva.externalId !== key) {
        errori.push(`Scrittura ${key}: riga IVA ${idx} ha externalId diverso (${rigaIva.externalId})`);
      }
    });
    
    // Controllo coerenza allocazioni
    scrittura.allocazioni.forEach((alloc, idx) => {
      if (alloc.externalId !== key) {
        errori.push(`Scrittura ${key}: allocazione ${idx} ha externalId diverso (${alloc.externalId})`);
      }
    });
  });
  
  return errori;
}

// -----------------------------------------------------------------------------
// FASE 3: IDENTIFICAZIONE ENTITÀ DIPENDENTI
// -----------------------------------------------------------------------------

function identificaEntitaDipendenti(
  scrittureMap: Record<string, ScritturaOrganizzata>
) {
  const entitaSet = {
    fornitori: new Set<string>(),
    causali: new Set<string>(),
    conti: new Set<string>(),
    codiciIva: new Set<string>(),
    commesse: new Set<string>(),
    vociAnalitiche: new Set<string>(),
  };
  
  Object.values(scrittureMap).forEach(scrittura => {
    // Dalle testate
    if (scrittura.testata.causaleId) {
      entitaSet.causali.add(scrittura.testata.causaleId);
    }
    if (scrittura.testata.clienteFornitoreCodiceFiscale) {
      entitaSet.fornitori.add(scrittura.testata.clienteFornitoreCodiceFiscale);
    }
    
    // Dalle righe contabili
    scrittura.righeContabili.forEach(riga => {
      if (riga.conto) {
        entitaSet.conti.add(riga.conto);
      }
    });
    
    // Dalle righe IVA
    scrittura.righeIva.forEach(riga => {
      if (riga.codiceIva) {
        entitaSet.codiciIva.add(riga.codiceIva);
      }
    });
    
    // Dalle allocazioni
    scrittura.allocazioni.forEach(alloc => {
      if (alloc.centroDiCosto) {
        entitaSet.commesse.add(alloc.centroDiCosto);
      }
      // Aggiungi voce analitica di default se non specificata
      entitaSet.vociAnalitiche.add(DEFAULT_VOCE_ANALITICA_ID);
    });
  });
  
  return entitaSet;
}

// -----------------------------------------------------------------------------
// FASE 4: CREAZIONE TUTTE LE ENTITÀ
// -----------------------------------------------------------------------------

function creaTutteLeEntita(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  entitaNecessarie: EntitaNecessarie
) {
  console.log('🔧 Creando tutte le entità Prisma...');
  
  // 1. Crea entità dipendenti
  const entitaDipendenti = creaEntitaDipendenti(entitaNecessarie);
  
  // 2. Crea correlazioni per le foreign keys
  const correlazioni: EntitaCorrelazioni = {
    scrittureByExternalId: new Map(),
    righeByKey: new Map(),
    righeIvaByKey: new Map(),
  };
  
  // 3. Crea scritture (testate)
  const scritture = creaScrittureContabili(scrittureMap, correlazioni);
  
  // 4. Crea righe contabili
  const righeScrittura = creaRigheScrittura(scrittureMap, correlazioni);
  
  // 5. Crea righe IVA
  const righeIva = creaRigheIva(scrittureMap, correlazioni);
  
  // 6. Crea allocazioni
  const allocazioni = creaAllocazioni(scrittureMap, correlazioni);
  
  return {
    ...entitaDipendenti,
    scritture,
    righeScrittura,
    righeIva,
    allocazioni,
  };
}

// -----------------------------------------------------------------------------
// CREAZIONE ENTITÀ DIPENDENTI
// -----------------------------------------------------------------------------

function creaEntitaDipendenti(entitaSet: EntitaNecessarie) {
  // Fornitori
  const fornitori: Prisma.FornitoreCreateInput[] = Array.from(entitaSet.fornitori).map(id => ({
    id: id as string,
    externalId: id as string,
    nome: `Fornitore importato - ${id}`,
  }));
  
  // Causali
  const causali: Prisma.CausaleContabileCreateInput[] = Array.from(entitaSet.causali).map(id => ({
    id: id as string,
    externalId: id as string,
    descrizione: `Causale importata - ${id}`,
  }));
  
  // Conti
  const conti: Prisma.ContoCreateInput[] = Array.from(entitaSet.conti).map(id => ({
    id: id as string,
    codice: id as string,
    nome: `Conto importato - ${id}`,
    tipo: 'Patrimoniale',
  }));
  
  // Codici IVA
  const codiciIva: Prisma.CodiceIvaCreateInput[] = Array.from(entitaSet.codiciIva).map(id => ({
    id: id as string,
    externalId: id as string,
    descrizione: `Codice IVA importato - ${id}`,
    aliquota: 22.0, // Default
  }));
  
  // Commesse
  const commesse: Prisma.CommessaCreateInput[] = Array.from(entitaSet.commesse).map(id => ({
    id: id as string,
    nome: `Commessa importata - ${id}`,
    descrizione: `Commessa importata dal sistema legacy - ${id}`,
    cliente: { connect: { id: SYSTEM_CUSTOMER_ID } },
  }));
  
  // Voci Analitiche
  const vociAnalitiche: Prisma.VoceAnaliticaCreateInput[] = Array.from(entitaSet.vociAnalitiche).map(id => ({
    id: id as string,
    nome: id === DEFAULT_VOCE_ANALITICA_ID ? 'Voce Analitica Default' : `Voce Analitica - ${id}`,
    descrizione: `Voce analitica importata - ${id}`,
  }));
  
  return {
    fornitori,
    causali,
    conti,
    codiciIva,
    commesse,
    vociAnalitiche,
  };
}

// -----------------------------------------------------------------------------
// CREAZIONE SCRITTURE CONTABILI (TESTATE)
// -----------------------------------------------------------------------------

function creaScrittureContabili(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  correlazioni: EntitaCorrelazioni
): Prisma.ScritturaContabileCreateInput[] {
  
  const scritture: Prisma.ScritturaContabileCreateInput[] = [];
  
  Object.entries(scrittureMap).forEach(([key, scrittura]) => {
    // Genera ID unico per la scrittura
    const scritturaId = `scrittura_${key}`;
    correlazioni.scrittureByExternalId.set(key, scritturaId);
    
    // FIX DATI (come nell'MVP)
    const dataValida = scrittura.testata.dataRegistrazione || new Date('2025-01-01');
    const descrizioneValida = scrittura.testata.noteMovimento?.trim() || 
                             `Scrittura importata ${key} - Causale ${scrittura.testata.causaleId}`;
    
    scritture.push({
      id: scritturaId,
      externalId: key,
      data: dataValida,
      descrizione: descrizioneValida,
      causale: scrittura.testata.causaleId ? { connect: { id: scrittura.testata.causaleId } } : undefined,
      fornitore: scrittura.testata.clienteFornitoreCodiceFiscale ? { connect: { id: scrittura.testata.clienteFornitoreCodiceFiscale } } : undefined,
      dataDocumento: scrittura.testata.dataDocumento,
      numeroDocumento: scrittura.testata.numeroDocumento,
    });
  });
  
  return scritture;
}

// -----------------------------------------------------------------------------
// CREAZIONE RIGHE SCRITTURA (RIGHE CONTABILI)
// -----------------------------------------------------------------------------

function creaRigheScrittura(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  correlazioni: EntitaCorrelazioni
): Prisma.RigaScritturaCreateInput[] {
  
  const righe: Prisma.RigaScritturaCreateInput[] = [];
  
  Object.entries(scrittureMap).forEach(([key, scrittura]) => {
    const scritturaId = correlazioni.scrittureByExternalId.get(key)!;
    
    scrittura.righeContabili.forEach((riga, idx) => {
      const rigaId = `riga_${key}_${idx}`;
      const rigaKey = `${scritturaId}:${idx}`;
      correlazioni.righeByKey.set(rigaKey, rigaId);
      
      // FIX DATI (gestione valori null)
      const descrizioneRiga = riga.note?.trim() || `Riga ${idx + 1} - Conto ${riga.conto}`;
      const dare = riga.importoDare || 0;
      const avere = riga.importoAvere || 0;
      
      righe.push({
        id: rigaId,
        descrizione: descrizioneRiga,
        dare: dare,
        avere: avere,
        conto: { connect: { id: riga.conto } },
        scritturaContabile: { connect: { id: scritturaId } },
      });
    });
  });
  
  return righe;
}

// -----------------------------------------------------------------------------
// CREAZIONE RIGHE IVA
// -----------------------------------------------------------------------------

function creaRigheIva(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  correlazioni: EntitaCorrelazioni
): Prisma.RigaIvaCreateInput[] {
  
  const righeIva: Prisma.RigaIvaCreateInput[] = [];
  
  Object.entries(scrittureMap).forEach(([key, scrittura]) => {
    const scritturaId = correlazioni.scrittureByExternalId.get(key)!;
    
    scrittura.righeIva.forEach((riga, idx) => {
      const rigaIvaId = `riga_iva_${key}_${idx}`;
      
      // Trova la riga contabile corrispondente (se esiste)
      const rigaContabileKey = `${scritturaId}:${Number(riga.riga) - 1}`; // riga.riga è 1-based
      const rigaContabileId = correlazioni.righeByKey.get(rigaContabileKey);
      
      righeIva.push({
        id: rigaIvaId,
        imponibile: riga.imponibile || 0,
        imposta: riga.imposta || 0,
        codiceIva: { connect: { id: riga.codiceIva } },
      });
    });
  });
  
  return righeIva;
}

// -----------------------------------------------------------------------------
// CREAZIONE ALLOCAZIONI
// -----------------------------------------------------------------------------

function creaAllocazioni(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  correlazioni: EntitaCorrelazioni
): Prisma.AllocazioneCreateInput[] {
  
  const allocazioni: Prisma.AllocazioneCreateInput[] = [];
  
  Object.entries(scrittureMap).forEach(([key, scrittura]) => {
    const scritturaId = correlazioni.scrittureByExternalId.get(key)!;
    
    scrittura.allocazioni.forEach((alloc, idx) => {
      const allocazioneId = `alloc_${key}_${idx}`;
      
      // Trova la riga contabile corrispondente
      const rigaContabileKey = `${scritturaId}:${alloc.progressivoRigoContabile - 1}`; // progressivoRigoContabile è 1-based
      const rigaContabileId = correlazioni.righeByKey.get(rigaContabileKey);
      
      if (rigaContabileId) {
        allocazioni.push({
          id: allocazioneId,
          importo: alloc.parametro || 0,
          descrizione: `Allocazione ${idx + 1} - Commessa ${alloc.centroDiCosto}`,
          rigaScrittura: { connect: { id: rigaContabileId } },
          commessa: { connect: { id: alloc.centroDiCosto } },
          voceAnalitica: { connect: { id: DEFAULT_VOCE_ANALITICA_ID } },
        });
      }
    });
  });
  
  return allocazioni;
}

// -----------------------------------------------------------------------------
// CALCOLO STATISTICHE COMPLETE
// -----------------------------------------------------------------------------

interface EntitaPrisma {
  fornitori: Prisma.FornitoreCreateInput[];
  causali: Prisma.CausaleContabileCreateInput[];
  conti: Prisma.ContoCreateInput[];
  codiciIva: Prisma.CodiceIvaCreateInput[];
  commesse: Prisma.CommessaCreateInput[];
  vociAnalitiche: Prisma.VoceAnaliticaCreateInput[];
  scritture: Prisma.ScritturaContabileCreateInput[];
  righeScrittura: Prisma.RigaScritturaCreateInput[];
  righeIva: Prisma.RigaIvaCreateInput[];
  allocazioni: Prisma.AllocazioneCreateInput[];
}

function calcolaStatisticheComplete(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  entitaPrisma: EntitaPrisma,
  erroriIntegrita: string[]
): TransformationStats {
  
  let righeContabiliProcessate = 0;
  let righeIvaProcessate = 0;
  let allocazioniProcessate = 0;

  for (const s of Object.values(scrittureMap)) {
    righeContabiliProcessate += s.righeContabili.length;
    righeIvaProcessate += s.righeIva.length;
    allocazioniProcessate += s.allocazioni.length;
  }

  const stats = {
    scrittureProcessate: Object.keys(scrittureMap).length,
    righeContabiliProcessate,
    righeIvaProcessate,
    allocazioniProcessate,
    entitaCreate: {
      scritture: entitaPrisma.scritture.length,
      righeScrittura: entitaPrisma.righeScrittura.length,
      righeIva: entitaPrisma.righeIva.length,
      allocazioni: entitaPrisma.allocazioni.length,
      fornitori: entitaPrisma.fornitori.length,
      causali: entitaPrisma.causali.length,
      conti: entitaPrisma.conti.length,
      codiciIva: entitaPrisma.codiciIva.length,
      commesse: entitaPrisma.commesse.length,
      vociAnalitiche: entitaPrisma.vociAnalitiche.length,
    },
    erroriIntegrita,
  };
  
  return stats;
}