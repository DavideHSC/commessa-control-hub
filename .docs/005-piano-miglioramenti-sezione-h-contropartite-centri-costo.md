# Piano Aggiornamento Sezione H - Movimenti Contabili Completi

## 🎯 Obiettivo
Implementare due miglioramenti alla Sezione H basati sui feedback dell'utente:

### 1. **Aggiungere Contropartite nel Dettaglio IVA**
- **Problema**: Le righe IVA mostrano solo codice IVA, descrizione e importi, ma mancano le informazioni sulla contropartita
- **Soluzione**: Aggiungere colonne "Codice Contropartita" e "Descrizione Contropartita" nel dettaglio IVA

### 2. **Integrare Descrizioni Centri di Costo nel Dettaglio Contabilità Analitica**  
- **Problema**: La sezione allocazioni mostra solo il codice del centro di costo (es: "2"), ma non la descrizione
- **Soluzione**: Utilizzare il sistema di lookup `centriCostoMap` già esistente per aggiungere le descrizioni

## 📋 Implementazione Dettagliata

### **FASE 1: Backend - Arricchimento Righe IVA con Contropartite**

#### 1.1 Aggiornare MovimentiContabiliService.ts
- **File**: `server/staging-analysis/services/MovimentiContabiliService.ts` 
- **Metodo**: `aggregateAndEnrichMovimenti()` linee 324-330
- **Azione**: Arricchire ogni riga IVA con informazioni contropartita:
  ```typescript
  scrittura.righeIva.push({
    ...riga,
    imponibile: parseGestionaleCurrency(riga.imponibile),
    imposta: parseGestionaleCurrency(riga.imposta), 
    importoLordo: parseGestionaleCurrency(riga.importoLordo),
    matchedCodiceIva,
    // NUOVO: Aggiungere contropartita arricchita
    matchedContropartita: {
      codice: riga.contropartita,
      descrizione: this.contiMap.get(riga.contropartita)?.descrizione || 'Conto non trovato'
    }
  });
  ```

#### 1.2 Aggiornare Tipi TypeScript
- **File**: `server/staging-analysis/types/virtualEntities.ts`
- **Interface**: `VirtualRigaIva` 
- **Azione**: Aggiungere campo `matchedContropartita`:
  ```typescript
  export interface VirtualRigaIva {
    // ... campi esistenti
    matchedCodiceIva: { id: string; descrizione: string; aliquota: number; } | null;
    // NUOVO: Contropartita arricchita
    matchedContropartita?: { codice: string; descrizione: string; } | null;
  }
  ```

### **FASE 2: Backend - Arricchimento Allocazioni con Descrizioni Centri di Costo**

#### 2.1 Aggiornare Processo Allocazioni
- **File**: `server/staging-analysis/services/MovimentiContabiliService.ts`
- **Metodo**: `aggregateAndEnrichMovimenti()` linee 334-337
- **Azione**: Arricchire allocazioni con descrizioni centri di costo:
  ```typescript
  allocazioni.forEach(alloc => {
    const scrittura = scrittureMap.get(alloc.codiceUnivocoScaricamento);
    if (scrittura) {
      const centroCostoInfo = this.centriCostoMap.get(alloc.centroDiCosto);
      scrittura.allocazioni.push({
        ...alloc,
        // NUOVO: Centro di costo arricchito
        matchedCentroCosto: {
          codice: alloc.centroDiCosto,
          descrizione: centroCostoInfo?.descrizione || 'Centro di costo non trovato'
        }
      });
    }
  });
  ```

#### 2.2 Aggiornare Tipi per Allocazioni
- **File**: `server/staging-analysis/types/virtualEntities.ts`
- **Interface**: `VirtualAllocazione`
- **Azione**: Aggiungere campo centro di costo arricchito

### **FASE 3: Frontend - Aggiornamento UI Dettaglio IVA**

#### 3.1 Espandere Tabella IVA
- **File**: `src/staging-analysis/components/MovimentiContabiliSection.tsx`
- **Sezione**: Dettaglio IVA (linee 304-339)
- **Azione**: Aggiungere 2 colonne per contropartita:
  ```tsx
  <TableHeader>
    <TableRow className="bg-gray-100">
      <TableHead className="w-20">Codice IVA</TableHead>
      <TableHead className="w-40">Descrizione</TableHead>
      <TableHead className="w-16 text-center">Aliquota</TableHead>
      <TableHead className="w-20">Cod. Contropartita</TableHead>  {/* NUOVO */}
      <TableHead className="w-40">Desc. Contropartita</TableHead> {/* NUOVO */}
      <TableHead className="w-24 text-right">Imponibile</TableHead>
      <TableHead className="w-24 text-right">Imposta</TableHead>
      <TableHead className="w-24 text-right">Totale</TableHead>
    </TableRow>
  </TableHeader>
  ```

#### 3.2 Aggiungere Rendering Contropartite
- **Azione**: Aggiungere celle per contropartita in ogni riga:
  ```tsx
  <TableCell className="font-mono text-xs">
    {riga.matchedContropartita?.codice || 'N/D'}
  </TableCell>
  <TableCell className="text-sm">
    {riga.matchedContropartita?.descrizione || 'N/D'}
  </TableCell>
  ```

### **FASE 4: Frontend - Aggiornamento UI Contabilità Analitica**

#### 4.1 Modificare Colonna Centro di Costo
- **File**: `src/staging-analysis/components/MovimentiContabiliSection.tsx`
- **Sezione**: Contabilità Analitica (linee 369-371)
- **Azione**: Mostrare codice + descrizione invece di solo codice:
  ```tsx
  <TableCell className="font-medium text-sm">
    <div className="flex flex-col">
      <span className="font-mono text-xs text-gray-500">
        {alloc.centroDiCosto}
      </span>
      <span className="text-sm">
        {alloc.matchedCentroCosto?.descrizione || 'Centro di costo non trovato'}
      </span>
    </div>
  </TableCell>
  ```

## ✅ Risultati Attesi

### Dettaglio IVA Migliorato:
- ✅ **Contropartita visibile**: Codice e descrizione del conto di contropartita
- ✅ **Migliore comprensione**: User può capire a quale conto si riferisce ogni riga IVA
- ✅ **Coerenza**: Same level di dettaglio della pagina Staging Master-Detail

### Contabilità Analitica Arricchita:
- ✅ **Descrizioni centri di costo**: "Marketing" invece di solo "2"
- ✅ **Usabilità migliorata**: User può identificare facilmente i centri di costo
- ✅ **Integrazione completa**: Sfrutta il sistema di lookup già esistente

## 🔧 Note Tecniche

### Dati Già Disponibili:
- ✅ Campo `contropartita` esiste in StagingRigaIva
- ✅ Sistema `centriCostoMap` già caricato in MovimentiContabiliService
- ✅ Sistema `contiMap` già disponibile per lookup contropartite

### Zero Breaking Changes:
- ✅ Tutte le modifiche sono **additive** (non modificano campi esistenti)
- ✅ Backward compatibility completa
- ✅ TypeScript safe con campi opzionali

### Performance Impact:
- ✅ **Zero impatto**: Usa lookup tables già caricate
- ✅ **O(1) lookup**: Hash maps per performance ottimali
- ✅ **Minimal overhead**: Solo arricchimento dati esistenti

## 🗂️ File da Modificare

### Backend:
1. **`server/staging-analysis/services/MovimentiContabiliService.ts`**
   - Metodo `aggregateAndEnrichMovimenti()` per arricchimento righe IVA
   - Metodo `aggregateAndEnrichMovimenti()` per arricchimento allocazioni

2. **`server/staging-analysis/types/virtualEntities.ts`**
   - Interface `VirtualRigaIva` per campo `matchedContropartita`
   - Interface `VirtualAllocazione` per campo `matchedCentroCosto`

### Frontend:
3. **`src/staging-analysis/components/MovimentiContabiliSection.tsx`**
   - Sezione Dettaglio IVA: nuove colonne contropartita
   - Sezione Contabilità Analitica: descrizioni centri di costo

## 🚀 Implementazione

Il sistema di lookup è già presente e funzionante nel `MovimentiContabiliService`:
- `this.contiMap` per le contropartite
- `this.centriCostoMap` per i centri di costo

Questo garantisce implementazione rapida e performance ottimali senza modifiche architetturali.