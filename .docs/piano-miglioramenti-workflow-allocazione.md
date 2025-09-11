# Piano Miglioramenti Workflow Allocazione

**Data**: 2025-01-14  
**Conversazione**: Analisi completa workflow allocazione Centro di Controllo  
**Stato**: In pianificazione

## 📋 Ragionamenti e Evidenze Emerse

### **Evidenze Critiche Identificate**

1. **🔥 Bug Bloccante**: Pulsante "Applica Allocazioni" senza onClick handler
   - **File**: `ValidationPreview.tsx:492-498`
   - **Impatto**: Workflow non completabile, funzionalità inutilizzabile
   - **API Backend**: Già implementata e funzionante (`POST /api/centro-controllo/allocation-workflow/apply`)

2. **🚨 Errore Logico Grave**: TipoMovimentoAnalitico hardcoded
   - **File**: `AllocationWorkflowService.ts:888`
   - **Codice**: `TipoMovimentoAnalitico.COSTO_EFFETTIVO` (sempre fisso)
   - **Problema**: Ignora 5 altri tipi possibili (RICAVO_EFFETTIVO, COSTO_STIMATO, etc.)
   - **Validazione Business**: I dati contabili contengono informazioni sufficienti per determinazione automatica

3. **🎯 Sistema Numerazione Inconsistente**: ID allocazioni generati random
   - **Pattern attuale**: `manual-${Date.now()}-${Math.random()}` (non business-driven)
   - **Impatto**: Non tracciabile, non prevedibile, non adatto a produzione

### **Opportunità di Miglioramento UX**

4. **Label Confusionaria**: "Allocazioni Virtuali" poco chiara per utenti business
5. **Informazioni Insufficienti**: Header movimento non mostra codice univoco di riferimento
6. **Mancanza Automazione**: Sistema di suggerimenti commesse/voci analitiche sottoutilizzato

### **Architettura Esistente Validata**

- **Centro Costo → Commessa**: `CentroCostoResolver` già implementato e funzionale
- **Staging Tables**: `StagingCentroCosto`, `StagingAllocazione` correttamente strutturate
- **Voci Analitiche**: 16 categorie predefinite (13 Costi + 3 Ricavi) con automazione possibile
- **Relazioni Prisma**: Schema corretto per `Allocazione` ↔ `Commessa` ↔ `VoceAnalitica`

## 🎯 Soluzioni Proposte

### **1. Determinazione Automatica TipoMovimentoAnalitico**

**Logica Business Validata**:
```typescript
function determinaTipoMovimentoAnalitico(riga: StagingRigaContabile): TipoMovimentoAnalitico {
  // 1. Priorità: Gruppo Conto (dal piano dei conti CONTIGEN.md)
  if (riga.conto?.gruppo === 'C') return COSTO_EFFETTIVO;
  if (riga.conto?.gruppo === 'R') return RICAVO_EFFETTIVO;
  
  // 2. Fallback: Tipo Conto Cliente/Fornitore (PNRIGCON.md)
  if (riga.tipoConto === 'C') return RICAVO_EFFETTIVO; // Cliente
  if (riga.tipoConto === 'F') return COSTO_EFFETTIVO;  // Fornitore
  
  // 3. Ultimo fallback: Dare/Avere
  if (riga.importoDare > 0) return COSTO_EFFETTIVO;
  if (riga.importoAvere > 0) return RICAVO_EFFETTIVO;
}
```

### **2. Sistema Gestione Mismatch Centro Costo**

**Casi di Gestione**:
```typescript
enum CentroCostoStatus {
  MATCHED,           // Centro costo → Commessa trovata ✅
  UNMATCHED_CODE,    // Centro costo non in StagingCentroCosto ⚠️
  UNMATCHED_COMMESSA, // Centro costo OK, ma nessuna commessa matchata 🔍
  AMBIGUOUS         // Multiple commesse candidate 🤔
}
```

### **3. Automazione Suggerimenti Voci Analitiche**

**Pattern Recognition**:
- Codice conto `62xxx` → "Lavorazioni Esterne"
- Denominazione `CARBURANTE` → "Carburanti e Lubrificanti"  
- Tipo conto `F` + `CONSULENZ` → "Consulenze Tecniche/Legali"
- Default → "Spese Generali / di Struttura"

## 📝 Task Dettagliati

### **FASE 1: Correzioni Critiche** (Priorità MASSIMA)

#### **Task 1.1: Fix Pulsante "Applica Allocazioni"**
- **Scopo**: Rendere funzionante il workflow end-to-end
- **File**: `src/centro-controllo/components/workflow/ValidationPreview.tsx`
- **Modifiche**:
  1. Aggiungere prop `onApply: () => void` all'interfaccia `ValidationPreviewProps`
  2. Aggiungere onClick handler al Button (riga 492-498)
  3. Implementare chiamata API `POST /api/centro-controllo/allocation-workflow/apply`
  4. Gestire loading state e feedback utente
- **Test**: Verificare creazione records in tabella `Allocazione`

#### **Task 1.2: Eliminare TipoMovimentoAnalitico Hardcoded**
- **Scopo**: Correggere logica business errata
- **File**: `server/centro-controllo/services/AllocationWorkflowService.ts`
- **Modifiche**:
  1. Creare funzione `determinaTipoMovimentoAnalitico(riga, movimento)`
  2. Sostituire hardcode riga 888 con chiamata alla funzione
  3. Aggiungere lookup `StagingConto` per gruppo conto
  4. Implementare fallback chain (Gruppo → TipoConto → Dare/Avere)
- **Test**: Verificare correttezza per movimenti clienti vs fornitori

### **FASE 2: Sistema Numerazione Business-Driven** (Priorità ALTA)

#### **Task 2.1: Progettazione Schema Numerazione**
- **Scopo**: Sostituire ID random con sistema business-driven
- **Analisi**:
  1. Definire formato numerazione (es. "ALF-2025-MOV001-001")
  2. Creare tabella `AllocationNumbering` per parametri
  3. Implementare contatori per movimento/anno
- **Schema Proposto**:
  ```sql
  AllocationNumbering {
    id: string
    pattern: string      // "ALF-{YYYY}-MOV{nnn}-{nnn}"
    currentYear: number
    currentMovementCounter: number
    currentAllocationCounter: number
  }
  ```

#### **Task 2.2: Implementazione Generatore ID**
- **File**: `server/centro-controllo/utils/AllocationIdGenerator.ts`
- **Funzioni**:
  1. `generateAllocationId(movimentoId: string): Promise<string>`
  2. `resetCountersForYear(year: number): Promise<void>`
- **UI Config**: Pagina amministrazione per modificare pattern numerazione

### **FASE 3: UX Enhancements** (Priorità MEDIA)

#### **Task 3.1: Migliorare Labels Confusionarie**
- **File**: `src/centro-controllo/components/workflow/SimulatoreCanvas.tsx`
- **Modifiche**:
  1. Cambiare "Allocazioni Virtuali" → "Allocazioni da Confermare"
  2. Aggiungere tooltip esplicativo
- **File**: `src/centro-controllo/components/workflow/ValidationPreview.tsx`
- **Modifiche**:
  1. Header riga 389: "Documento Numero: X - Rif. Movimento: XXXXX"
  2. Utilizzare `movimento.testata.numeroDocumento` + `codiceUnivocoScaricamento`

#### **Task 3.2: Sistema Gestione Mismatch Centro Costo**
- **File**: `server/centro-controllo/services/CentroCostoMismatchResolver.ts`
- **Componenti**:
  1. Funzione `analyzeCentroCostoStatus(centroDiCosto: string)`
  2. UI Warning per stati UNMATCHED/AMBIGUOUS
  3. Dialog creazione commessa per centri costo non matchati
  4. Confidence scoring per suggerimenti

### **FASE 4: Automazione Intelligente** (Priorità MEDIA)

#### **Task 4.1: Auto-Suggerimenti Commessa**
- **Scopo**: Utilizzare `CentroCostoResolver` esistente in UI
- **File**: `src/centro-controllo/components/workflow/SimulatoreCanvas.tsx`
- **Modifiche**:
  1. Auto-populate dropdown Commessa quando `centroDiCosto` disponibile
  2. Badge "Suggerito" per indicate automazione
  3. Tooltip con spiegazione mapping centro costo

#### **Task 4.2: Auto-Suggerimenti Voce Analitica**
- **File**: `server/centro-controllo/utils/VoceAnaliticaSuggestionEngine.ts`
- **Logica**:
  1. Pattern matching su codici conto standardizzati
  2. Keyword analysis su denominazioni conti
  3. Confidence scoring per ranking suggerimenti
- **UI**: Dropdown con suggerimenti ordinati per confidence

### **FASE 5: Testing e Validazione** (Priorità ALTA)

#### **Task 5.1: Test Suite Allocazioni**
- **File**: `server/verification/allocationWorkflow.test.ts`
- **Test Cases**:
  1. Workflow completo end-to-end
  2. Determinazione corretta TipoMovimentoAnalitico
  3. Gestione errori mismatch centro costo
  4. Validazione persistenza in tabella `Allocazione`

#### **Task 5.2: Test UX Workflow**
- **Scenario**: Utente business (non tecnico) completa allocazione
- **Validazione**: 
  1. Terminologia chiara (no "virtuali")
  2. Informazioni sufficienti per decisioni
  3. Feedback appropriati per errori
  4. Suggerimenti utili e non invadenti

## 📊 Business Value Atteso

### **Immediato** (FASE 1)
- **Workflow Funzionante**: Utenti possono completare allocazioni
- **Correttezza Contabile**: TipoMovimentoAnalitico appropriato per ogni transazione
- **Riduzione Errori**: Eliminazione hardcoding e valori fissi inappropriati

### **Medio Termine** (FASE 2-3)
- **Tracciabilità**: Numerazione business-driven per audit e controllo
- **UX Professionale**: Terminologia contabile appropriata
- **Efficienza**: Meno passi manuali, più automazione intelligente

### **Lungo Termine** (FASE 4-5)
- **Automazione Completa**: 80%+ allocazioni suggerite automaticamente
- **Qualità Dati**: Consistenza mapping centro costo ↔ commessa
- **Scalabilità**: Sistema robusto per crescita volume transazioni

## 🔄 Criterio di Successo

### **Metriche Tecniche**
- Workflow completabile al 100% senza errori
- TipoMovimentoAnalitico corretto per ogni tipo di movimento
- Tempo completamento allocazione < 2 minuti per movimento

### **Metriche Business**
- Riduzione 80% tempo richiesto per allocazioni manuali
- 95% accuracy suggerimenti commessa da centro costo
- Zero escalation per allocazioni "stuck" o incomplete

### **Metriche UX**
- Terminologia comprensibile senza formazione tecnica
- Feedback positivo utenti su chiarezza workflow
- Riduzione support tickets relativi ad allocazioni

---

**Prossimo Step**: Approvazione piano e prioritizzazione task per implementazione