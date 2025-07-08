import { Prisma } from '@prisma/client';
import {
  ValidatedPnTesta,
  ValidatedPnRigCon,
  ValidatedPnRigIva,
  ValidatedMovAnac,
} from '../../acquisition/validators/scrittureContabiliValidator';
import { PrismaClient } from '@prisma/client';

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
  clienti: Prisma.ClienteCreateInput[];
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
    clienti: number;
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

// Interfaccia per raccogliere dati delle entità, non solo gli ID
interface CausaleData {
  descrizione?: string;
  nome?: string;
}

interface EntitaNecessarie {
  fornitori: Set<string>;
  clienti: Set<string>;
  causali: Map<string, CausaleData>; // Usa una mappa per storicizzare anche la descrizione
  conti: Set<string>;
  codiciIva: Set<string>;
  commesse: Set<string>;
  vociAnalitiche: Set<string>;
}

// -----------------------------------------------------------------------------
// FUNZIONE PRINCIPALE COMPLETA
// -----------------------------------------------------------------------------

export async function transformScrittureContabili(
  testate: ValidatedPnTesta[],
  righeContabili: ValidatedPnRigCon[],
  righeIva: ValidatedPnRigIva[],
  allocazioni: ValidatedMovAnac[]
): Promise<ScrittureContabiliTransformResult> {
  
  console.log('🔧 Transformer COMPLETO: Creazione di TUTTE le entità...');
  
  // FASE 1: Organizza dati per CODICE_UNIVOCO
  const scrittureOrganizzate = organizzaDatiMultiFile(testate, righeContabili, righeIva, allocazioni);
  
  // FASE 2: Valida integrità referenziale
  const erroriIntegrita = validaIntegritaReferenziale(scrittureOrganizzate);
  
  // FASE 3: Identifica entità dipendenti necessarie
  const entitaNecessarie = identificaEntitaDipendenti(scrittureOrganizzate);
  
  // FASE 4: Crea tutte le entità con correlazioni
  const entitaPrisma = await creaTutteLeEntita(scrittureOrganizzate, entitaNecessarie);
  
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
): EntitaNecessarie {
  const entita: EntitaNecessarie = {
    fornitori: new Set<string>(),
    clienti: new Set<string>(),
    causali: new Map<string, CausaleData>(), // Modificato in Mappa
    conti: new Set<string>(),
    codiciIva: new Set<string>(),
    commesse: new Set<string>(),
    vociAnalitiche: new Set<string>(),
  };

  Object.values(scrittureMap).forEach(scrittura => {
    // ---- CORREZIONE CHIAVE ----
    // Raccoglie non solo l'ID della causale, ma anche la sua descrizione
    if (scrittura.testata.causaleId) {
      if (!entita.causali.has(scrittura.testata.causaleId)) {
        entita.causali.set(scrittura.testata.causaleId, {
          descrizione: scrittura.testata.descrizioneCausale?.trim(),
          nome: scrittura.testata.descrizioneCausale?.trim(),
        });
      }
    }
    
    if (scrittura.testata.clienteFornitoreCodiceFiscale) {
      entita.fornitori.add(scrittura.testata.clienteFornitoreCodiceFiscale);
    }
    
    scrittura.righeContabili.forEach(riga => {
      if (riga.conto) {
        const tipoConto = riga.tipoConto?.toUpperCase();
        if (tipoConto === 'F') {
          entita.fornitori.add(riga.conto);
        } else if (tipoConto === 'C') {
          entita.clienti.add(riga.conto);
        } else {
          entita.conti.add(riga.conto);
        }
      }
    });

    scrittura.righeIva.forEach(riga => {
      if (riga.codiceIva) {
        entita.codiciIva.add(riga.codiceIva);
      }
      if (riga.contropartita) entita.conti.add(riga.contropartita); // Anche la contropartita è un conto
    });

    scrittura.allocazioni.forEach(alloc => {
      if (alloc.centroDiCosto) entita.commesse.add(alloc.centroDiCosto);
      // La voce analitica è implicita o gestita a valle
    });
  });

  return entita;
}

// -----------------------------------------------------------------------------
// FASE 4: CREAZIONE TUTTE LE ENTITÀ
// -----------------------------------------------------------------------------

async function creaTutteLeEntita(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  entitaNecessarie: EntitaNecessarie
) {
  console.log('🔧 Creando tutte le entità Prisma...');
  
  // 1. Crea entità dipendenti (ora asincrono)
  const entitaDipendenti = await creaEntitaDipendenti(entitaNecessarie);
  
  // 2. Crea correlazioni per le foreign keys
  const correlazioni: EntitaCorrelazioni = {
    scrittureByExternalId: new Map(),
    righeByKey: new Map(),
    righeIvaByKey: new Map(),
  };
  
  // 3. Crea scritture (testate)
  const scritture = creaScrittureContabili(scrittureMap, correlazioni);
  
  // 4. Crea righe contabili (che ora includono anche le righe IVA)
  const righeScrittura = creaRigheScrittura(scrittureMap, correlazioni);
  
  // 5. Crea righe IVA (la lista è vuota, la logica è spostata)
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

async function creaEntitaDipendenti(entitaSet: EntitaNecessarie) {
  const prisma = new PrismaClient();

  // --- CONTI ---
  const contiIds = Array.from(entitaSet.conti);
  const contiEsistenti = await prisma.conto.findMany({
    where: { 
      codice: { in: contiIds },
      codiceFiscaleAzienda: '' // Assumiamo conti generici
    },
    select: { codice: true }
  });
  const contiEsistentiIds = new Set(contiEsistenti.map(c => c.codice).filter(Boolean) as string[]);
  const contiDaCreareIds = contiIds.filter(id => id && !contiEsistentiIds.has(id));
  
  const conti: Prisma.ContoCreateInput[] = contiDaCreareIds.map(id => ({
    codice: id,
    codiceFiscaleAzienda: '',
    nome: `Conto importato - ${id}`,
    tipo: 'Patrimoniale', // Default
  }));

  // --- FORNITORI ---
  const fornitoriIds = Array.from(entitaSet.fornitori);
  const fornitoriEsistenti = await prisma.fornitore.findMany({
    where: { externalId: { in: fornitoriIds } },
    select: { externalId: true }
  });
  const fornitoriEsistentiIds = new Set(fornitoriEsistenti.map(f => f.externalId).filter(Boolean) as string[]);
  const fornitoriDaCreareIds = fornitoriIds.filter(id => id && !fornitoriEsistentiIds.has(id));

  const fornitori: Prisma.FornitoreCreateInput[] = fornitoriDaCreareIds.map(id => ({
    sottocontoFornitore: id,
    nome: `Fornitore importato - ${id}`,
    externalId: id, // Manteniamo per riferimento incrociato
  }));

  // --- CLIENTI ---
  const clientiIds = Array.from(entitaSet.clienti);
  const clientiEsistenti = await prisma.cliente.findMany({
    where: { externalId: { in: clientiIds } },
    select: { externalId: true }
  });
  const clientiEsistentiIds = new Set(clientiEsistenti.map(c => c.externalId).filter(Boolean) as string[]);
  const clientiDaCreareIds = clientiIds.filter(id => id && !clientiEsistentiIds.has(id));
  
  const clienti: Prisma.ClienteCreateInput[] = clientiDaCreareIds.map(id => ({
    sottocontoCliente: id,
    nome: `Cliente importato - ${id}`,
    externalId: id, // Manteniamo per riferimento incrociato
  }));

  // --- CAUSALI ---
  const causaliIds = Array.from(entitaSet.causali.keys());
  const causaliEsistenti = await prisma.causaleContabile.findMany({
    where: { externalId: { in: causaliIds } },
    select: { externalId: true }
  });
  const causaliEsistentiIds = new Set(causaliEsistenti.map(c => c.externalId).filter(Boolean) as string[]);
  
  // Filtra per ottenere le causali da creare con i loro dati completi
  const causaliDaCreare = Array.from(entitaSet.causali.entries())
    .filter(([id]) => id && !causaliEsistentiIds.has(id));

  // **CORREZIONE**: Usa i dati raccolti per creare le causali
  const causali: Prisma.CausaleContabileCreateInput[] = causaliDaCreare.map(([id, data]) => ({
    externalId: id,
    codice: id,
    descrizione: data.descrizione || `Causale importata - ${id}`,
    nome: data.nome || `Causale ${id}`
  }));
  
  // --- CODICI IVA ---
  const codiciIvaIds = Array.from(entitaSet.codiciIva);
  const codiciIvaEsistenti = await prisma.codiceIva.findMany({
      where: { externalId: { in: codiciIvaIds } },
      select: { externalId: true }
  });
  const codiciIvaEsistentiIds = new Set(codiciIvaEsistenti.map(c => c.externalId).filter(Boolean) as string[]);
  const codiciIvaDaCreareIds = codiciIvaIds.filter(id => id && !codiciIvaEsistentiIds.has(id));

  const codiciIva: Prisma.CodiceIvaCreateInput[] = codiciIvaDaCreareIds.map(id => ({
      externalId: id,
      descrizione: `Codice IVA importato - ${id}`,
      aliquota: 22.0, // Default
  }));

  // --- COMMESSE ---
  const commesseIds = Array.from(entitaSet.commesse);
  // Logica di creazione selettiva qui se necessario
  const commesse: Prisma.CommessaCreateInput[] = []; // Disabilitato come da Piano-08
  
  // --- VOCI ANALITICHE ---
  const vociAnaliticheIds = Array.from(entitaSet.vociAnalitiche);
  const vociAnaliticheEsistenti = await prisma.voceAnalitica.findMany({
      where: { id: { in: vociAnaliticheIds } },
      select: { id: true }
  });
  const vociAnaliticheEsistentiIds = new Set(vociAnaliticheEsistenti.map(v => v.id));
  const vociAnaliticheDaCreareIds = vociAnaliticheIds.filter(id => !vociAnaliticheEsistentiIds.has(id));

  const vociAnalitiche: Prisma.VoceAnaliticaCreateInput[] = vociAnaliticheDaCreareIds.map(id => ({
      id: id,
      nome: id === DEFAULT_VOCE_ANALITICA_ID ? 'Voce Analitica Default' : `Voce Analitica - ${id}`,
      descrizione: `Voce analitica importata - ${id}`,
  }));

  return {
    fornitori,
    clienti,
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
    
    // **CORREZIONE**: Usa le note del movimento come descrizione principale della scrittura
    const descrizioneValida = scrittura.testata.noteMovimento?.trim() || 
                             `Scrittura importata ${key} - Causale ${scrittura.testata.causaleId}`;
    
    scritture.push({
      id: scritturaId,
      externalId: key,
      data: scrittura.testata.dataRegistrazione || new Date('2025-01-01'),
      descrizione: descrizioneValida,
      causale: scrittura.testata.causaleId ? { connect: { externalId: scrittura.testata.causaleId } } : undefined,
      fornitore: scrittura.testata.clienteFornitoreCodiceFiscale ? { connect: { externalId: scrittura.testata.clienteFornitoreCodiceFiscale } } : undefined,
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
  const righePrisma: Prisma.RigaScritturaCreateInput[] = [];

  Object.values(scrittureMap).forEach(scrittura => {
    const scritturaId = correlazioni.scrittureByExternalId.get(scrittura.testata.externalId);
    if (!scritturaId) return;

    scrittura.righeContabili.forEach((riga, idx) => {
      // **CORREZIONE**: Mappa il campo 'note' sulla descrizione della riga
      const rigaId = `riga_${scrittura.testata.externalId}_${idx}`;

      const tipoConto = riga.tipoConto?.toUpperCase();
      const contoCodice = riga.conto;

      const rigaInput: Prisma.RigaScritturaCreateInput = {
        id: rigaId,
        descrizione: riga.note || `Riga per scrittura ${scrittura.testata.externalId}`,
        dare: riga.importoDare || 0,
        avere: riga.importoAvere || 0,
        scritturaContabile: { connect: { id: scritturaId } },
      };

      if (contoCodice) {
        if (tipoConto === 'F') {
          rigaInput.fornitore = { connect: { sottocontoFornitore: contoCodice } };
        } else if (tipoConto === 'C') {
          rigaInput.cliente = { connect: { sottocontoCliente: contoCodice } };
        } else {
          rigaInput.conto = { 
            connect: { 
              codice_codiceFiscaleAzienda: {
                codice: contoCodice,
                codiceFiscaleAzienda: ''
              }
            } 
          };
        }
      }

      righePrisma.push(rigaInput);
    });
  });

  return righePrisma;
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
    const scritturaId = correlazioni.scrittureByExternalId.get(key);
    if (!scritturaId) return;

    // Mappa per associare righe IVA a righe contabili per progressivo
    const righeIvaByProgressivo: Record<string, ValidatedPnRigIva[]> = {};
    scrittura.righeIva.forEach(rigaIva => {
      // Normalizziamo il progressivo letto dal file IVA
      const progressivo = rigaIva.riga ? String(parseInt(rigaIva.riga.trim(), 10)) : '0';
      if (!righeIvaByProgressivo[progressivo]) {
        righeIvaByProgressivo[progressivo] = [];
      }
      righeIvaByProgressivo[progressivo].push(rigaIva);
    });

    // La corrispondenza avviene tramite l'indice della riga contabile
    scrittura.righeContabili.forEach((riga, idx) => {
      // L'ID della riga contabile viene ricalcolato qui per la connessione
      const rigaId = `riga_${key}_${idx}`;
      
      // Il progressivo per cercare le righe IVA è l'indice + 1
      const progressivoCorrente = String(idx + 1);
      const righeIvaAssociate = righeIvaByProgressivo[progressivoCorrente] || [];
      
      righeIvaAssociate.forEach((rigaIva, ivaIdx) => {
        if (!rigaIva.codiceIva) {
          console.warn(`[WARN] Riga IVA per scrittura ${key}, progressivo ${progressivoCorrente}, non ha un codice IVA. La riga IVA è stata saltata.`);
          return;
        }

        const rigaIvaId = `riga_iva_${key}_${idx}_${ivaIdx}`;
        
        righeIva.push({
          id: rigaIvaId,
          imponibile: rigaIva.imponibile || 0,
          imposta: rigaIva.imposta || 0,
          rigaScrittura: { connect: { id: rigaId } },
          codiceIva: { connect: { externalId: rigaIva.codiceIva } },
        });
      });
    });
  });
  
  return righeIva;
}

// -----------------------------------------------------------------------------
// CREAZIONE ALLOCAZIONI (MOVIMENTI ANALITICI)
// -----------------------------------------------------------------------------

function creaAllocazioni(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  correlazioni: EntitaCorrelazioni
): Prisma.AllocazioneCreateInput[] {
  
  // Disabilitato intenzionalmente come da Piano-08
  return [];

  /* Logica originale disabilitata
  const allocazioni: Prisma.AllocazioneCreateInput[] = [];
  
  for (const scrittura of Object.values(scrittureMap)) {
    const scritturaId = correlazioni.scrittureByExternalId.get(scrittura.testata.externalId);
    if (!scritturaId) continue;

    for (const alloc of scrittura.allocazioni) {
      const rigaKey = `${scritturaId}:${alloc.rigaContabileProgressivo}`;
      const rigaScritturaId = correlazioni.righeByKey.get(rigaKey);
      
      if (!rigaScritturaId) {
        console.warn(`WARN: Allocazione per ${scrittura.testata.externalId} non ha trovato la riga corrispondente (progressivo: ${alloc.rigaContabileProgressivo}). Skippata.`);
        continue;
      }
      
      allocazioni.push({
        id: `alloc_${rigaScritturaId}_${alloc.commessaId}_${alloc.voceAnaliticaId}`,
        importo: alloc.importo,
        descrizione: alloc.descrizione,
        rigaScrittura: { connect: { id: rigaScritturaId } },
        commessa: {
          connect: { 
            id: `commessa_import_${alloc.commessaId.replace(/\s+/g, '_')}`
          } 
        },
        voceAnalitica: {
          connect: {
            id: `voce_analitica_import_${alloc.voceAnaliticaId.replace(/\s+/g, '_')}`
          }
        },
      });
    }
  }
  
  return allocazioni;
  */
}

// -----------------------------------------------------------------------------
// CALCOLO STATISTICHE COMPLETE
// -----------------------------------------------------------------------------

interface EntitaPrisma {
  fornitori: Prisma.FornitoreCreateInput[];
  clienti: Prisma.ClienteCreateInput[];
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
      clienti: entitaPrisma.clienti.length,
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