import { Prisma } from '@prisma/client';
import {
  ValidatedPnTesta,
  ValidatedPnRigCon,
  ValidatedPnRigIva,
  ValidatedMovAnac,
} from '../../acquisition/validators/scrittureContabiliValidator';

// =============================================================================
// PARSER 6 MVP: SCRITTURE CONTABILI (APPROCCIO PYTHON-LIKE)
// =============================================================================
// Segue ESATTAMENTE la stessa logica del parser Python di riferimento:
// 1. Organizza per CODICE_UNIVOCO come il Python transactions[key]
// 2. Crea SOLO le testate (MVP) per validare l'architettura
// 3. Mantiene i dati organizzati per future implementazioni
// =============================================================================

// Costanti di sistema
const SYSTEM_CUSTOMER_ID = 'cliente_sistema';

// -----------------------------------------------------------------------------
// INTERFACCE (STILE PYTHON - FLAT)
// -----------------------------------------------------------------------------

export interface ScrittureContabiliTransformResult {
  // 🎯 MVP: Solo testate (come primo step del Python)
  scritture: Prisma.ScritturaContabileCreateInput[];
  
  // 📊 Dati organizzati (come il parser Python transactions[key])
  scrittureOrganizzate: Record<string, ScritturaOrganizzata>;
  
  // Entità dipendenti (solo per le testate)
  fornitori: Prisma.FornitoreCreateInput[];
  causali: Prisma.CausaleContabileCreateInput[];
  
  // Statistiche
  stats: {
    scrittureProcessate: number;
    righeContabiliOrganizzate: number;
    righeIvaOrganizzate: number;
    allocazioniOrganizzate: number;
    fornitoriCreati: number;
    causaliCreate: number;
  };
}

// Struttura dati identica al parser Python
interface ScritturaOrganizzata {
  testata: ValidatedPnTesta;
  righeContabili: ValidatedPnRigCon[];
  righeIva: ValidatedPnRigIva[];
  allocazioni: ValidatedMovAnac[];
}

// -----------------------------------------------------------------------------
// FUNZIONE PRINCIPALE (REPLICA ESATTA DELLA LOGICA PYTHON)
// -----------------------------------------------------------------------------

export function transformScrittureContabiliMVP(
  testate: ValidatedPnTesta[],
  righeContabili: ValidatedPnRigCon[],
  righeIva: ValidatedPnRigIva[],
  allocazioni: ValidatedMovAnac[]
): ScrittureContabiliTransformResult {
  
  console.log('🐍 Transformer MVP: Replica esatta del parser Python...');
  
  // FASE 1: Organizza dati per CODICE_UNIVOCO (identica al Python)
  const scrittureOrganizzate = organizzaDatiComePython(testate, righeContabili, righeIva, allocazioni);
  
  // FASE 2: Crea solo le testate (MVP approach)
  const { scritture, entitaDipendenti } = creaSoloTestate(scrittureOrganizzate);
  
  // FASE 3: Statistiche finali
  const stats = calcolaStatisticheComplete(scrittureOrganizzate, entitaDipendenti);
  
  console.log(`✅ Transformer MVP: ${stats.scrittureProcessate} scritture organizzate`);
  
  return {
    scritture,
    scrittureOrganizzate,
    ...entitaDipendenti,
    stats,
  };
}

// -----------------------------------------------------------------------------
// FASE 1: ORGANIZZAZIONE DATI (IDENTICA AL PYTHON process_files_robust)
// -----------------------------------------------------------------------------

function organizzaDatiComePython(
  testate: ValidatedPnTesta[],
  righeContabili: ValidatedPnRigCon[],
  righeIva: ValidatedPnRigIva[],
  allocazioni: ValidatedMovAnac[]
): Record<string, ScritturaOrganizzata> {
  
  const transactions: Record<string, ScritturaOrganizzata> = {};
  
  // 1. Prima le testate (come Python: transactions[key] = {testata: ...})
  console.log(`📋 Organizzando ${testate.length} testate...`);
  for (const testata of testate) {
    const key = testata.externalId;
    transactions[key] = {
      testata,
      righeContabili: [],
      righeIva: [],
      allocazioni: [],
    };
  }
  
  // 2. Poi righe contabili (come Python: if key in transactions)
  console.log(`💰 Associando ${righeContabili.length} righe contabili...`);
  let righeAssociate = 0;
  for (const riga of righeContabili) {
    const key = riga.externalId;
    if (transactions[key]) {
      transactions[key].righeContabili.push(riga);
      righeAssociate++;
    }
  }
  console.log(`✅ ${righeAssociate}/${righeContabili.length} righe contabili associate`);
  
  // 3. Poi righe IVA (come Python)
  console.log(`📊 Associando ${righeIva.length} righe IVA...`);
  let righeIvaAssociate = 0;
  for (const riga of righeIva) {
    const key = riga.externalId;
    if (transactions[key]) {
      transactions[key].righeIva.push(riga);
      righeIvaAssociate++;
    }
  }
  console.log(`✅ ${righeIvaAssociate}/${righeIva.length} righe IVA associate`);
  
  // 4. Infine allocazioni (come Python mov_analitici)
  console.log(`🏭 Associando ${allocazioni.length} allocazioni...`);
  let allocazioniAssociate = 0;
  for (const alloc of allocazioni) {
    const key = alloc.externalId;
    if (transactions[key]) {
      transactions[key].allocazioni.push(alloc);
      allocazioniAssociate++;
    }
  }
  console.log(`✅ ${allocazioniAssociate}/${allocazioni.length} allocazioni associate`);
  
  return transactions;
}

// -----------------------------------------------------------------------------
// FASE 2: CREAZIONE SOLO TESTATE (MVP)
// -----------------------------------------------------------------------------

function creaSoloTestate(
  scrittureMap: Record<string, ScritturaOrganizzata>
): {
  scritture: Prisma.ScritturaContabileCreateInput[];
  entitaDipendenti: EntitaDipendentiMVP;
} {
  
  // Collectors per entità uniche
  const fornitoriSet = new Set<string>();
  const causaliSet = new Set<string>();
  
  // Array per testate
  const scritture: Prisma.ScritturaContabileCreateInput[] = [];
  
  // Processa ogni scrittura organizzata
  Object.entries(scrittureMap).forEach(([key, scrittura]) => {
    
    // Raccoglie entità dipendenti
    const causaleId = scrittura.testata.causaleId;
    if (causaleId) causaliSet.add(causaleId);
    
    const fornitoreId = scrittura.testata.clienteFornitoreCodiceFiscale;
    if (fornitoreId) fornitoriSet.add(fornitoreId);
    
    // Crea ScritturaContabile (solo campi essenziali) - SISTEMATO
    const dataValida = scrittura.testata.dataRegistrazione || new Date('2025-01-01');
    const descrizioneValida = scrittura.testata.noteMovimento?.trim() || 
                             `Scrittura importata ${key} - Causale ${causaleId}`;
    
    scritture.push({
      externalId: key,
      data: dataValida,
      descrizione: descrizioneValida,
      causale: causaleId ? { connect: { id: causaleId } } : undefined,
      fornitore: fornitoreId ? { connect: { id: fornitoreId } } : undefined,
      dataDocumento: scrittura.testata.dataDocumento,
      numeroDocumento: scrittura.testata.numeroDocumento,
    });
  });
  
  // Crea entità dipendenti
  const fornitori: Prisma.FornitoreCreateInput[] = Array.from(fornitoriSet).map(id => ({
    id,
    externalId: id,
    nome: `Fornitore importato - ${id}`,
  }));
  
  const causali: Prisma.CausaleContabileCreateInput[] = Array.from(causaliSet).map(id => ({
    id,
    descrizione: `Causale importata - ${id}`,
  }));
  
  return {
    scritture,
    entitaDipendenti: {
      fornitori,
      causali,
    },
  };
}

// -----------------------------------------------------------------------------
// FASE 3: STATISTICHE COMPLETE
// -----------------------------------------------------------------------------

interface EntitaDipendentiMVP {
  fornitori: Prisma.FornitoreCreateInput[];
  causali: Prisma.CausaleContabileCreateInput[];
}

function calcolaStatisticheComplete(
  scrittureMap: Record<string, ScritturaOrganizzata>,
  entitaDipendenti: EntitaDipendentiMVP
) {
  
  const totaleScrittureProcessate = Object.keys(scrittureMap).length;
  const totaleRigheContabili = Object.values(scrittureMap)
    .reduce((sum, s) => sum + s.righeContabili.length, 0);
  const totaleRigheIva = Object.values(scrittureMap)
    .reduce((sum, s) => sum + s.righeIva.length, 0);
  const totaleAllocazioni = Object.values(scrittureMap)
    .reduce((sum, s) => sum + s.allocazioni.length, 0);
  
  return {
    scrittureProcessate: totaleScrittureProcessate,
    righeContabiliOrganizzate: totaleRigheContabili,
    righeIvaOrganizzate: totaleRigheIva,
    allocazioniOrganizzate: totaleAllocazioni,
    fornitoriCreati: entitaDipendenti.fornitori.length,
    causaliCreate: entitaDipendenti.causali.length,
  };
} 