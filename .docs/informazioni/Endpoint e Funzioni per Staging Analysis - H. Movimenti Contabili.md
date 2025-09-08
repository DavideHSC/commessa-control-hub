# 📋 Endpoint e Funzioni per Staging Analysis - H. Movimenti Contabili Completi

---

## 🔧 Backend - Rotte (Endpoints)

### 1. Endpoint Principale

**Metodo:** `GET`  
**URL:** `/api/staging-analysis/movimenti-contabili`  
**Localizzazione:** `server/staging-analysis/routes.ts:125-204`

#### Query Parameters (tutti opzionali):

| Parametro | Descrizione                     | Formato / Valori Validi            |
|-----------|----------------------------------|------------------------------------|
| `dataDa`  | Data inizio                     | `YYYY-MM-DD`                       |
| `dataA`   | Data fine                       | `YYYY-MM-DD`                       |
| `soggetto`| Ricerca parziale su cliente/fornitore | Stringa libera              |
| `stato`   | Filtro stato documento          | `D`=Draft, `P`=Posted, `V`=Validated, `ALL`=Tutti |
| `page`    | Numero pagina                   | Intero (default: `1`)              |
| `limit`   | Elementi per pagina             | Intero (massimo: `100`)            |

#### Validazioni Backend:

- ✅ Validazione formato date (`YYYY-MM-DD` via regex)
- ✅ Validazione valori `stato` (`D`, `P`, `V`, `ALL`)
- ✅ Validazione numerica di `page` e `limit`
- ✅ Limite massimo di 100 elementi per pagina

---

### 2. Servizio Backend

**File:** `server/staging-analysis/services/MovimentiContabiliService.ts`  
**Funzione principale:** `getMovimentiContabili(filters)`

#### Interfaccia Response:

```ts
interface MovimentiContabiliResponse {
  movimenti: MovimentoContabileCompleto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filtriApplicati: MovimentiContabiliFilters;
  statistiche: {
    totalMovimenti: number;
    totalImporto: number;
    movimentiQuadrati: number;
    movimentiAllocabili: number;
  };
}
```

---

## 🎯 Frontend - Funzioni e Hook

### 1. Componente Principale

**File:** `src/staging-analysis/components/MovimentiContabiliSection.tsx`

#### Funzioni principali:

- `fetchMovimentiContabili()` — Fetch dati con filtri
- `resetFilters()` — Reset ai filtri default
- `handleFilterChange()` — Gestione cambio filtri

---

### 2. Hook di Integrazione

**File:** `src/staging-analysis/hooks/useStagingAnalysis.ts`

> **Nota:** Non è presente una funzione specifica `fetchMovimentiContabili()` nell’hook principale. Il componente esegue chiamate dirette all’endpoint.

---

### 3. Tipi TypeScript

**File:** `src/staging-analysis/types/stagingAnalysisTypes.ts`

#### Interfacce principali:

- `MovimentiContabiliFilters` — Filtri di ricerca
- `MovimentiContabiliResponse` — Struttura completa della risposta API

---

## 🔄 Flusso di Funzionamento

1. **Frontend**: `MovimentiContabiliSection.tsx` chiama `fetchMovimentiContabili()`
2. **HTTP Request**: `GET /api/staging-analysis/movimenti-contabili` con query params
3. **Backend Route**: `routes.ts` valida i parametri e invoca `MovimentiContabiliService`
4. **Service**: `getMovimentiContabili()` esegue query Prisma
5. **Response**: Ritorna dati paginati + statistiche
6. **Frontend**: Aggiorna stato e renderizza tabella master-detail

---

## 📊 Features Implementate

- ✅ **Filtri Avanzati**: Date, soggetto, stato documento
- ✅ **Paginazione Server-side**: Performance ottimizzata
- ✅ **Master-Detail UI**: Click per espandere dettagli
- ✅ **Statistiche Real-time**: Totali e conteggi automatici
- ✅ **Validazione Robusta**: Input sanitization e error handling

--- 

✅ **Tutto pronto per integrazioni, testing e documentazione API.**