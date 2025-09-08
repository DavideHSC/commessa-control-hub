# Piano Correzione Bug Sezione H - Movimenti Contabili Completi

## 🚨 PROBLEMA PRINCIPALE
**Sezione H - Movimenti Contabili Completi** non mostra le righe IVA, mentre la **Pagina Staging Master-Detail** le mostra correttamente.

## 🎯 ROOT CAUSE IDENTIFICATA
Due sezioni diverse usano logiche diverse:
- ✅ **Staging Master-Detail**: Query diretta via `staging.ts:/scritture-complete` → FUNZIONA
- ❌ **Sezione H**: Servizio complesso `MovimentiContabiliService.ts` → NON FUNZIONA

## 📋 PIANO DETTAGLIATO

### 1. **PULIZIA IMMEDIATA - RIMOZIONE STRONZATA** 🧹
- **File**: `server/staging-analysis/routes.ts`
- **Linee**: 15-69 (endpoint `/fix-righe-iva-linkage`)
- **Azione**: Rimuovere COMPLETAMENTE l'endpoint inappropriato di fix
- **Motivo**: Endpoint di fix non appartengono ad applicazione seria - ERRORE GRAVE

### 2. **DIAGNOSIS SERVIZIO ROTTO** 🔍
- **File Problematico**: `server/staging-analysis/services/MovimentiContabiliService.ts`
- **Funzione Critica**: `aggregateAndEnrichMovimenti()` linee 311-332
- **Problema Specifico**: 
  ```typescript
  righeIva.forEach(riga => {
    const scrittura = scrittureMap.get(riga.codiceUnivocoScaricamento); // <-- Questo fallisce
    if (scrittura) {
      scrittura.righeIva.push({ ... }); // <-- Non viene mai eseguito
    }
  });
  ```
- **Cache Issue**: Maps caricate all'avvio (`loadAllLookups()`) non si aggiornano

### 3. **CONFRONTO ARCHITETTURALE** 📊
**IMPLEMENTAZIONE CHE FUNZIONA (Master-Detail):**
- **File**: `server/routes/staging.ts:459-462`
- **Query Diretta**: 
  ```typescript
  prisma.stagingRigaIva.findMany({
    where: { codiceUnivocoScaricamento: testata.codiceUnivocoScaricamento },
    orderBy: { codiceIva: 'asc' }
  })
  ```

**IMPLEMENTAZIONE CHE NON FUNZIONA (Sezione H):**
- **File**: `server/staging-analysis/services/MovimentiContabiliService.ts:220-221`
- **Query via Service**: 
  ```typescript
  this.prisma.stagingRigaIva.findMany({ 
    where: { codiceUnivocoScaricamento: { in: codiciTestate } } 
  });
  ```

### 4. **VERIFICA FRONTEND** 🖥️
**Pagina Staging (FUNZIONANTE):**
- **File**: `src/new_components/tables/ScrittureContabiliMasterDetail.tsx`
- **Endpoint**: `/api/staging/scritture-complete`
- **Risultato**: Mostra correttamente righe IVA:
  ```
  Righe IVA (2)
  Riga    Codice IVA    Contropartita    Imponibile    Imposta    Lordo
  1       22SL          6015002102       435,00 €      95,70 €   €0.00
  2       ELRF          6015002102       3.100,00 €    €0.00     €0.00
  ```

**Sezione H (NON FUNZIONANTE):**
- **File**: `src/staging-analysis/components/MovimentiContabiliSection.tsx:297-331`
- **Endpoint**: `/api/staging-analysis/movimenti-contabili`
- **Rendering Condizionato**: `{movimento.righeIva.length > 0 &&` → sempre 0
- **Risultato**: Array vuoto `"righeIva":[]`

### 5. **FIX STRUTTURALE PROPOSTO** 🔧

**OPZIONE A - SEMPLIFICAZIONE (RACCOMANDATO):**
- Modificare `MovimentiContabiliService.ts` per usare query dirette come `staging.ts`
- Eliminare cache complesse che non si sincronizzano

**OPZIONE B - FIX CACHE:**
- Aggiungere metodo `refreshCache()` nel service
- Chiamare refresh dopo modifiche ai dati

**OPZIONE C - DEBUG FIRST:**
- Aggiungere logging per capire esattamente dove si perdono le righe IVA

### 6. **CORREZIONE PARSER (ROOT CAUSE)** ⚙️
**Problema Strutturale**:
- **File**: `server/import-engine/orchestration/workflows/importScrittureContabiliWorkflow.ts:234`
- **Issue**: `toStringOrEmpty(r.externalId)` restituisce stringa vuota per righe IVA
- **Root**: Parser PNRIGIVA.TXT non imposta `codiceUnivocoScaricamento` correttamente

**Soluzione a Lungo Termine**:
- Fix nel tipo generator o decoder per mappare correttamente `codiceUnivocoScaricamento` → `externalId`

## 🗂️ FILE COINVOLTI E FUNZIONI

### Frontend (React)
1. **`src/staging-analysis/pages/StagingAnalysisPage.tsx`**
   - Linea 88-94: Sezione H - Movimenti Contabili Completi
   - Componente: `<MovimentiContabiliSection>`

2. **`src/staging-analysis/components/MovimentiContabiliSection.tsx`**
   - Linee 297-331: Rendering righe IVA condizionato
   - Funzione: `fetchMovimenti()` - chiama API
   - Hook: `useEffect()` per refresh

3. **`src/new_components/tables/ScrittureContabiliMasterDetail.tsx`** ✅ FUNZIONANTE
   - Linee 15-16: Interface con `righeIva: any[]`
   - Implementazione di riferimento che funziona

### Backend (API)
4. **`server/staging-analysis/routes.ts`** 🚨 DA PULIRE
   - Linee 15-69: ENDPOINT DI FIX DA RIMUOVERE 
   - Linea 184: Endpoint `/movimenti-contabili` che non funziona

5. **`server/staging-analysis/services/MovimentiContabiliService.ts`** 💥 ROTTO
   - Linee 220-221: `loadRigheIvaForTestate()` - query che dovrebbe funzionare
   - Linee 311-332: `righeIva.forEach()` - loop che non trova dati
   - Linee 156-158: `aggregateAndEnrichMovimenti()` - chiamata principale

6. **`server/routes/staging.ts`** ✅ RIFERIMENTO FUNZIONANTE
   - Linee 459-462: Query diretta che funziona
   - Endpoint `/scritture-complete` da usare come esempio

### Import Engine
7. **`server/import-engine/orchestration/workflows/importScrittureContabiliWorkflow.ts`**
   - Linea 234: `codiceUnivocoScaricamento: toStringOrEmpty(r.externalId)` 
   - Root cause: `r.externalId` è vuoto per righe IVA

## ⚡ PRIORITÀ AZIONI

### 🔥 **IMMEDIATA (Ora)**
1. **Rimozione endpoint fix**: `server/staging-analysis/routes.ts` linee 15-69

### 🚨 **CRITICA (Oggi)** 
2. **Debug MovimentiContabiliService**: Capire perché `aggregateAndEnrichMovimenti` non trova righe IVA
3. **Test comparativo**: Confrontare query tra service rotto e staging funzionante

### ⚠️ **IMPORTANTE (Domani)**
4. **Fix service**: Implementare soluzione basata su analisi
5. **Verifica frontend**: Assicurarsi che rendering riceva dati corretti

### 📝 **FINALE (Dopo fix)**
6. **Correzione parser**: Fix root cause nel workflow di importazione
7. **Test completo**: Verificare parità funzionale tra Sezione H e Master-Detail

## 📍 PAGINE E PERCORSI RIFERIMENTO

### 🟢 **PAGINA CHE FUNZIONA**
- **URL**: `/staging` 
- **Dropdown**: "Scritture Contabili (Master-Detail)"
- **Risultato**: Righe IVA visibili e corrette

### 🔴 **PAGINA CHE NON FUNZIONA**  
- **URL**: `/staging-analysis`
- **Sezione**: "H. Movimenti Contabili Completi"
- **Risultato**: Righe IVA sempre vuote `[]`

## 📝 CORREZIONE DELLA STRONZATA

**ERRORE COMMESSO**: Creazione endpoint di fix `/api/staging-analysis/fix-righe-iva-linkage`
**PERCHÉ È SBAGLIATO**: 
- Applicazione seria non deve avere endpoint di fix
- Nasconde problemi strutturali invece di risolverli
- Crea dipendenze da operazioni manuali
- Non è maintainable né professionale

**AZIONE CORRETTIVA**: Rimozione completa dell'endpoint e approccio strutturale al problema.