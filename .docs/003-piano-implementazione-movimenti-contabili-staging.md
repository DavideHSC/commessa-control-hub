# Piano Implementazione: Sezione "Movimenti Contabili Completi" in Staging Analysis

## 🎯 Obiettivo
Creare una nuova sezione "G. Movimenti Contabili Completi" nella pagina Staging Analysis che riproduca l'interfaccia del file mock `movimenti.html` con logica backend reale.

## 📊 Analisi del Mock
Il file `movimenti.html` presenta:
- **Lista movimenti**: Tabella con Data Reg., Protocollo, Documento, Causale, Soggetto, Totale Doc., Stato
- **Filtri**: Data Da/A, Cliente/Fornitore, Stato (D/P/V)
- **Dettaglio espandibile**: Click su movimento → mostra Scrittura Contabile + IVA + Analitica
- **Logica business**: Aggregazione testate+righe+IVA, formattazione valute/date, decodifiche anagrafiche

## 🏗️ Implementazione Backend

### 1. **Nuovo Servizio MovimentiContabiliService**
- **File**: `server/staging-analysis/services/MovimentiContabiliService.ts`
- **Base**: Riutilizza logica `RigheAggregator.ts` esistente per aggregazione
- **Funzionalità**:
  - `getMovimentiContabili(filters)`: Aggrega testate+righe+IVA+anagrafiche
  - Filtri: dateRange, cliente/fornitore, stato (D/P/V)
  - Decodifiche: Piano conti, codici IVA, causali, anagrafiche
  - Paginazione e ordinamento

### 2. **Nuovo Endpoint API**
- **File**: `server/staging-analysis/routes.ts`
- **Endpoint**: `GET /api/staging-analysis/movimenti-contabili`
- **Query params**: `dataDa`, `dataA`, `soggetto`, `stato`, `page`, `limit`
- **Response**: Lista movimenti con dettaglio completo (testate+righe+IVA)

## 🖥️ Implementazione Frontend

### 3. **Componente React MovimentiContabiliSection**
- **File**: `src/staging-analysis/components/MovimentiContabiliSection.tsx`
- **Funzionalità**:
  - **Filtri**: Form con date, ricerca soggetto, dropdown stato
  - **Tabella master**: Lista movimenti (7 colonne come nel mock)
  - **Dettaglio espandibile**: Click row → pannello dettaglio con 3 sezioni:
    - Scrittura Contabile (Dare/Avere con totali)
    - Dettaglio IVA (se presente)
    - Contabilità Analitica (se presente)
  - **Formattazione**: Date italiane, valute EUR, badge stati colorati

### 4. **Aggiornamento StagingAnalysisPage**
- **File**: `src/staging-analysis/pages/StagingAnalysisPage.tsx`
- **Nuova sezione**: Aggiunta "G. Movimenti Contabili Completi" in SECTIONS array
- **Icona**: Database, colore rosa/indaco
- **Integrazione**: Import e rendering condizionale

## 🔧 Logica Business da Implementare

### **Sostituzione Mock → Real Data**:
1. **fetchMovimenti()** → Query reali a `StagingTestata` con JOIN a righe/IVA
2. **fetchAnagrafiche()** → Query a `StagingConto`, `StagingCodiceIva`, causali
3. **Filtri attivi** → WHERE clauses su date, cliente/fornitore, stato
4. **Aggregazione** → Riutilizzo `RigheAggregator` per logica esistente testata
5. **Decodifiche** → Integrazione `contiGenLookup` e `fieldDecoders`

### **Funzionalità Avanzate**:
- **Performance**: Paginazione server-side, indici database
- **UX**: Loading states, error handling, refresh automatico
- **Business Logic**: Totali dinamici, validazione stati, highlight anomalie

## 📄 Struttura Dati Target

### **Movimento Completo**:
```typescript
interface MovimentoContabile {
  testata: StagingTestata & { 
    descrizioneCausale: string,
    cliForDenominazione: string 
  }
  righeContabili: VirtualRigaContabile[]
  righeIva: VirtualRigaIva[]  
  allocazioni?: VirtualAllocazione[]
  totaliDare: number
  totaliAvere: number
  isQuadrata: boolean
}
```

## 🎯 Business Value

- **Prima Nota Digitale**: Visualizzazione completa movimenti contabili staging
- **Validazione Pre-Import**: Verifica scritture prima della finalizzazione  
- **Debug Advanced**: Drill-down completo su ogni movimento problematico
- **User Experience**: Interface familiare tipo gestionale tradizionale
- **Integration Ready**: Preparazione per export/import verso gestionali esterni

## 📋 Piano di Test

1. **Dati Mock**: Verifica rendering con dati del file HTML
2. **Dati Reali**: Test con staging data esistenti (746 movimenti)
3. **Filtri**: Validazione query performance con grandi dataset
4. **Responsiveness**: Test mobile/desktop per tabella complessa
5. **Integration**: Verifica compatibilità con sistema esistente

## 📁 Files da Creare/Modificare

### **Nuovi Files**:
- `server/staging-analysis/services/MovimentiContabiliService.ts`
- `src/staging-analysis/components/MovimentiContabiliSection.tsx`

### **Files da Modificare**:
- `server/staging-analysis/routes.ts` (nuovo endpoint)
- `src/staging-analysis/pages/StagingAnalysisPage.tsx` (nuova sezione)
- `CLAUDE.md` (aggiornamento documentazione)

## ⏱️ Timeline Implementazione

1. **Fase 1 - Backend** (1-2 ore):
   - MovimentiContabiliService
   - Endpoint API
   - Test con dati reali

2. **Fase 2 - Frontend** (2-3 ore):
   - MovimentiContabiliSection componente
   - Integrazione StagingAnalysisPage
   - Styling e UX

3. **Fase 3 - Testing & Docs** (1 ora):
   - Test funzionali
   - Aggiornamento documentazione
   - Verifica performance

**Totale stimato**: 4-6 ore di sviluppo

## 🔗 Integrazione con Esistente

- **Riutilizzo**: Sfrutta `RigheAggregator` esistente per logica aggregazione
- **Consistency**: Mantiene pattern architetturali staging-analysis
- **Performance**: Usa servizi lookup (`contiGenLookup`) già ottimizzati
- **UI/UX**: Coerente con altri componenti staging-analysis esistenti

---

**Status**: 📋 PIANIFICATO - Ready per implementazione  
**Owner**: Claude Code  
**Data**: 2025-09-06  
**Priority**: HIGH - Richiesta specifica utente