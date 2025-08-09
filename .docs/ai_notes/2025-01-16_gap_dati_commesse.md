# Gap Dati - Endpoint Commesse Performance

**Data**: 16 Gennaio 2025  
**Problema**: Tutte le performance metrics restituiscono zero  
**Root Cause**: Mancanza di dati operativi collegati alle commesse

## Risultato Test Endpoint

```bash
curl -s "http://localhost:3001/api/commesse-performance"
```

**Tutte le commesse mostrano:**
- Budget: 0
- Costi: 0  
- Ricavi: 0
- Margine: 0
- Avanzamento: 0%

## Gap Dati Identificati

### 1. Budget Commesse (BudgetVoce)
**Tabella**: `BudgetVoce`
**Problema**: Nessuna voce di budget associata alle commesse
**Query Test**:
```sql
SELECT COUNT(*) FROM "BudgetVoce"; -- Risultato atteso: 0
```

### 2. Scritture Contabili (ScritturaContabile/RigaScrittura)
**Tabelle**: `ScritturaContabile`, `RigaScrittura`
**Problema**: Nessun movimento contabile importato
**Query Test**:
```sql
SELECT COUNT(*) FROM "ScritturaContabile"; -- Risultato atteso: 0
SELECT COUNT(*) FROM "RigaScrittura"; -- Risultato atteso: 0
```

### 3. Allocazioni (Allocazione)
**Tabella**: `Allocazione`  
**Problema**: Nessuna allocazione di costi/ricavi alle commesse
**Query Test**:
```sql
SELECT COUNT(*) FROM "Allocazione"; -- Risultato atteso: 0
```

## Processi Mancanti per "Dare Vita" alle Commesse

### 1. Gestione Budget
**Processo**: Definizione budget per commessa/voce analitica
**Implementazione**: 
- API: `POST /api/commesse/{id}/budget`
- UI: Form di inserimento budget
- Dati: Associazione Commessa → VoceAnalitica → Importo

### 2. Import Movimenti Contabili
**Processo**: Import da tracciati contabili (PNTESTA.TXT, PNRIGCON.TXT, etc.)
**Implementazione**:
- API: `POST /api/import/scritture`
- Files: PNTESTA.TXT, PNRIGCON.TXT, PNRIGIVA.TXT
- Finalizzazione: Da staging a tabelle produzione

### 3. Allocazione Costi/Ricavi
**Processo**: Assegnazione movimenti contabili a commesse specifiche
**Implementazione**:
- API: `POST /api/allocazioni`
- UI: Interfaccia di allocazione movimenti
- Logica: RigaScrittura → Commessa → VoceAnalitica

### 4. Centro di Costo (MOVANAC.TXT)
**Processo**: Import movimenti analitici con centri di costo
**Implementazione**:
- Files: MOVANAC.TXT (tracciato movimenti analitici)
- Mapping: Centro di Costo → Commessa

## Soluzioni Immediate

### 1. Creazione Budget Mock
```sql
-- Inserire budget di esempio per testare le funzionalità
INSERT INTO "BudgetVoce" (id, importo, "commessaId", "voceAnaliticaId")
VALUES 
  ('budget_1', 50000, 'sorrento', (SELECT id FROM "VoceAnalitica" LIMIT 1)),
  ('budget_2', 30000, 'sorrento_igiene_urbana', (SELECT id FROM "VoceAnalitica" LIMIT 1)),
  ('budget_3', 40000, 'massa_lubrense', (SELECT id FROM "VoceAnalitica" LIMIT 1)),
  ('budget_4', 25000, 'massa_lubrense_igiene_urbana', (SELECT id FROM "VoceAnalitica" LIMIT 1)),
  ('budget_5', 35000, 'piano_di_sorrento', (SELECT id FROM "VoceAnalitica" LIMIT 1));
```

### 2. Scritture Mock
```sql
-- Creare alcune scritture di test
INSERT INTO "ScritturaContabile" (id, descrizione, data)
VALUES 
  ('scrittura_1', 'Costi materiale Sorrento', '2025-01-15'),
  ('scrittura_2', 'Ricavi servizio Massa Lubrense', '2025-01-14');

-- Creare righe contabili
INSERT INTO "RigaScrittura" (id, descrizione, dare, avere, "contoId", "scritturaContabileId")
VALUES 
  ('riga_1', 'Materiale consumo', 5000, null, 
   (SELECT id FROM "Conto" WHERE tipo = 'Costo' LIMIT 1), 'scrittura_1'),
  ('riga_2', 'Ricavo servizio', null, 8000,
   (SELECT id FROM "Conto" WHERE tipo = 'Ricavo' LIMIT 1), 'scrittura_2');
```

### 3. Allocazioni Mock
```sql
-- Allocare le righe alle commesse
INSERT INTO "Allocazione" (id, importo, "rigaScritturaId", "commessaId", "voceAnaliticaId", "dataMovimento", "tipoMovimento")
VALUES 
  ('alloc_1', 5000, 'riga_1', 'sorrento', 
   (SELECT id FROM "VoceAnalitica" WHERE tipo = 'Costo' LIMIT 1), 
   '2025-01-15', 'COSTO_EFFETTIVO'),
  ('alloc_2', 8000, 'riga_2', 'massa_lubrense',
   (SELECT id FROM "VoceAnalitica" WHERE tipo = 'Ricavo' LIMIT 1),
   '2025-01-14', 'RICAVO_EFFETTIVO');
```

## Flusso Operativo Completo

### 1. Configurazione Iniziale
- ✅ Commesse create (seed)
- ✅ Voci Analitiche create (seed)
- ✅ Piano dei Conti importato
- ❌ **Budget commesse** (mancante)

### 2. Operazioni Contabili
- ❌ **Import movimenti contabili** (mancante)
- ❌ **Finalizzazione movimenti** (mancante)
- ❌ **Allocazione a commesse** (mancante)

### 3. Visualizzazione Performance
- ✅ API endpoint funzionante
- ✅ Frontend implementato
- ❌ **Dati operativi** (mancanti)

## Priorità di Implementazione

### 1. **Immediata** - Dati di Test
- Inserire budget mock per testare visualizzazione
- Creare scritture e allocazioni di esempio
- Verificare che i calcoli funzionino

### 2. **Breve Termine** - Interfacce Utente
- Implementare gestione budget commesse
- Creare interfaccia allocazione movimenti
- Testare workflow completo

### 3. **Medio Termine** - Import Reali
- Implementare import movimenti contabili
- Testare con dati reali del cliente
- Automatizzare processo di allocazione

## Next Steps

1. **Inserire dati mock** per testare performance metrics
2. **Re-testare endpoint** per verificare calcoli
3. **Implementare UI** per gestione budget
4. **Pianificare import** movimenti contabili reali

---

*Questo gap spiega perché l'endpoint commesse funziona tecnicamente ma non mostra dati significativi: mancano i processi operativi che dovrebbero alimentarlo con dati reali.*