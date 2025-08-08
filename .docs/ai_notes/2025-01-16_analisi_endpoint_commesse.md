# Analisi Endpoint `/commesse` - Processi Operativi

**Data**: 16 Gennaio 2025  
**Endpoint**: `/api/commesse-performance`  
**Pagina Frontend**: `/commesse`

## Architettura del Sistema

### 1. Frontend: Pagina Commesse
**File**: `src/pages/Commesse.tsx`
- **Funzione**: Visualizza commesse in struttura gerarchica (Comuni → Attività)
- **Chiamata API**: `getCommesseWithPerformance()` → `/api/commesse-performance`
- **Struttura Dati**: Accordion con commesse principali e figlie
- **KPI Mostrati**: Budget, Costi, Margine, Avanzamento, Ricavi

### 2. Backend: API Performance
**File**: `server/routes/commesseWithPerformance.ts`
- **Endpoint**: `GET /api/commesse-performance`
- **Funzione**: Calcola performance metrics per ogni commessa
- **Struttura Risposta**: Commesse con dati consolidati padre-figlie

## Tabelle Database Utilizzate

### Tabelle Principali
1. **`Commessa`** - Dati base commesse
2. **`Cliente`** - Informazioni clienti
3. **`BudgetVoce`** - Budget per commessa/voce analitica
4. **`ScritturaContabile`** - Movimenti contabili
5. **`RigaScrittura`** - Righe dei movimenti
6. **`Allocazione`** - Allocazioni costi/ricavi a commesse
7. **`Conto`** - Piano dei conti (per determinare tipo Costo/Ricavo)
8. **`VoceAnalitica`** - Categorizzazione budget

### Relazioni Database
```sql
Commessa (1:N) → BudgetVoce
Commessa (1:N) → Allocazione
Commessa (1:N) → Children (autoreferenziale)
Cliente (1:N) → Commessa
ScritturaContabile (1:N) → RigaScrittura
RigaScrittura (1:N) → Allocazione
Conto (1:N) → RigaScrittura
VoceAnalitica (1:N) → BudgetVoce
VoceAnalitica (1:N) → Allocazione
```

## Flusso Dati Operativo

### 1. Caricamento Dati Base
```typescript
// Carica tutte le entità necessarie
const clienti = await prisma.cliente.findMany()
const commesse = await prisma.commessa.findMany({
  include: {
    budget: { include: { voceAnalitica: true } },
    allocazioni: { include: { rigaScrittura: true } },
    parent: true,
    children: true
  }
})
const scritture = await prisma.scritturaContabile.findMany({
  include: {
    righe: {
      include: {
        conto: true,
        allocazioni: {
          include: { commessa: true, voceAnalitica: true }
        }
      }
    }
  }
})
```

### 2. Calcolo Performance Metrics

#### A. Calcolo Costi/Ricavi
```typescript
const calcolaTotaliCommessa = (commessaId: string) => {
  const costi = scritture.flatMap(s => s.righe)
    .filter(r => r.conto && r.conto.tipo === 'Costo' && 
                 r.allocazioni.some(a => a.commessaId === commessaId))
    .reduce((acc, r) => acc + (r.dare || 0), 0);

  const ricavi = scritture.flatMap(s => s.righe)
    .filter(r => r.conto && r.conto.tipo === 'Ricavo' && 
                 r.allocazioni.some(a => a.commessaId === commessaId))
    .reduce((acc, r) => acc + (r.avere || 0), 0);

  return { costi, ricavi };
};
```

#### B. Calcolo Margine
```typescript
const margine = ricavi > 0 ? ((ricavi - costi) / ricavi) * 100 : 0;
```

#### C. Calcolo Avanzamento
```typescript
const calcolaAvanzamento = (commessaId: string, budgetTotale: number) => {
  if (budgetTotale === 0) return 0;
  const { costi } = calcolaTotaliCommessa(commessaId);
  const percentuale = (costi / budgetTotale) * 100;
  return Math.min(percentuale, 100);
};
```

### 3. Consolidamento Gerarchico
```typescript
// Commesse padre con figlie consolidate
const commesseConPerformance = commessePadre.map(padre => {
  const figlieAssociate = commesseFiglie.filter(f => f.parentId === padre.id);
  
  // Totali consolidati
  const ricaviTotali = padre.ricavi + figlieAssociate.reduce((acc, f) => acc + f.ricavi, 0);
  const costiTotali = padre.costi + figlieAssociate.reduce((acc, f) => acc + f.costi, 0);
  const budgetTotale = padre.budget + figlieAssociate.reduce((acc, f) => acc + f.budget, 0);
  
  // Margine consolidato
  const margineConsolidato = ricaviTotali > 0 ? ((ricaviTotali - costiTotali) / ricaviTotali) * 100 : 0;
  
  // Avanzamento medio ponderato
  const avanzamentoMedio = budgetTotale > 0 
    ? ((padre.percentualeAvanzamento * padre.budget) + 
       figlieAssociate.reduce((acc, f) => acc + (f.percentualeAvanzamento * f.budget), 0)) / budgetTotale
    : padre.percentualeAvanzamento;

  return {
    ...padre,
    ricavi: ricaviTotali,
    costi: costiTotali,
    budget: budgetTotale,
    margine: margineConsolidato,
    percentualeAvanzamento: avanzamentoMedio,
    figlie: figlieAssociate
  };
});
```

## Processi che Alimentano le Commesse

### 1. Processi di Configurazione
- **Seed Database** (`prisma/seed.ts`): Crea commesse di base
- **Gestione Clienti**: Finalizzazione anagrafiche da `staging_anagrafiche`
- **Gestione Voci Analitiche**: Configurazione categorie budget/costi

### 2. Processi Operativi
- **Import Scritture Contabili**: Da tracciati PNTESTA.TXT, PNRIGCON.TXT, PNRIGIVA.TXT
- **Finalizzazione Movimenti**: Da staging a tabelle produzione
- **Allocazione Costi**: Processo di assegnazione movimenti a commesse
- **Gestione Budget**: Definizione e aggiornamento budget commesse

### 3. Processi di Analisi
- **Riconciliazione**: Verifica coerenza allocazioni
- **Smart Allocation**: Suggerimenti automatici allocazioni
- **Reporting**: Generazione report performance

## File di Input del Sistema

### 1. Tracciati Contabili
- **PNTESTA.TXT**: Testate movimenti contabili
- **PNRIGCON.TXT**: Righe contabili
- **PNRIGIVA.TXT**: Righe IVA
- **MOVANAC.TXT**: Movimenti analitici (centri di costo)

### 2. Tracciati Anagrafiche
- **A_CLIFOR.TXT**: Anagrafiche clienti/fornitori
- **CONTIGEN.TXT**: Piano dei conti generale
- **CONTIAZI.TXT**: Piano dei conti aziendale

### 3. Tracciati Configurazione
- **CAUSALI.TXT**: Causali contabili
- **CODICIVA.TXT**: Codici IVA
- **CODPAGAM.TXT**: Condizioni pagamento

## Dipendenze Critiche

### 1. Dati Essenziali
- **Commesse**: Devono esistere nel database (configurazione business)
- **Clienti**: Creati dalla finalizzazione anagrafiche
- **Piano dei Conti**: Importato con enum corretti (Costo/Ricavo)
- **Voci Analitiche**: Configurate per budget e allocazioni

### 2. Processi Precedenti
- **Clean Slate + Finalizzazione**: Deve preservare commesse
- **Import Piano dei Conti**: Con enum mapping corretto
- **Finalizzazione Anagrafiche**: Per creare clienti associati

### 3. Integrità Dati
- **Foreign Key Constraints**: Commessa → Cliente
- **Allocazioni**: RigaScrittura → Commessa → VoceAnalitica
- **Budget**: Commessa → VoceAnalitica

## Problematiche Identificate

### 1. Dipendenza da Dati Reali
- **Movimenti Contabili**: Senza import, costi/ricavi = 0
- **Allocazioni**: Senza processo allocazione, performance = 0
- **Budget**: Attualmente solo dati mock dal seed

### 2. Logica Business Incompleta
- **Calcolo Stato**: Hardcoded "In Corso" (TODO nella linea 116)
- **Percentuale Avanzamento**: Basata solo sui costi, non considerando milestone
- **Margine**: Considera solo ricavi diretti, non margini commerciali

### 3. Performance Query
- **N+1 Problem**: Caricamento di tutte le scritture in memoria
- **Calcoli Runtime**: Tutti i calcoli sono fatti in JavaScript, non in SQL
- **Scalabilità**: Con molte scritture, potrebbe essere lento

## Raccomandazioni

### 1. Immediate
- **Test con Dati Reali**: Importare movimenti contabili reali
- **Verifica Allocazioni**: Testare processo di allocazione costi
- **Ottimizzazione Query**: Spostare calcoli in SQL

### 2. Medio Termine
- **Caching**: Implementare cache per performance metrics
- **Calcolo Incrementale**: Aggiornare metriche solo quando cambiano i dati
- **Logica Stato**: Implementare calcolo stato basato su date e avanzamento

### 3. Long Term
- **Aggregazioni Pre-calcolate**: Tabelle summary per performance
- **Real-time Updates**: Aggiornamento metriche in tempo reale
- **Advanced Analytics**: Previsioni e trend analysis

---

*Questa analisi identifica tutti i processi e dipendenze necessarie per il corretto funzionamento dell'endpoint `/commesse` e della relativa visualizzazione.*