# Piano di Ristrutturazione Architetturale per Piattaforma di Importazione Enterprise-Grade

## 🎯 Obiettivo Generale

Trasformare l'attuale sistema di importazione dati da una collezione di script procedurali a una **piattaforma enterprise-grade** che implementa i quattro pilastri architetturali:

1. **Garanzia di Correttezza (Correctness by Design)**
2. **Flussi di Dati Unidirezionali e Prevedibili**
3. **Integrità Transazionale Assoluta**
4. **Osservabilità Totale**

---

## 📜 **PRINCIPIO GUIDA: LE FONTI DI VERITÀ**

**Prima di qualsiasi implementazione o refactoring**, è obbligatorio fare riferimento alle seguenti fonti come unica e indiscussa verità. L'implementazione attuale del software NON deve essere considerata la fonte primaria.

1.  **Tracciati Record Originali (`.docs/dati_cliente/tracciati`)**
    -   **Scopo**: Definiscono la struttura (posizione, lunghezza, tipo) di ogni campo nei file a larghezza fissa.
    -   **Utilizzo**: Devono essere usati per definire le `FieldDefinition` nel database e per la logica di parsing di basso livello. Qualsiasi discrepanza va risolta allineandosi a questi documenti.

2.  **Parser Python di Riferimento (`.docs/code`)**
    -   **Scopo**: Contengono la logica di business validata per la decodifica, la trasformazione e l'interpretazione semantica dei dati grezzi.
    -   **Utilizzo**: Sono la "bibbia" per implementare i *Transformation Services* e i *Decoders* nella nuova architettura. La logica di trasformazione (es. `determinaTipoConto`) deve replicare fedelmente quella dei parser Python.

3.  **Dati di Esempio (`.docs/dati_cliente`)**
    -   **Scopo**: Forniscono dati reali per il testing, la validazione e il debug.
    -   **Utilizzo**: Devono essere usati per creare test di unità e di integrazione che verifichino la correttezza dei nuovi parser e trasformatori rispetto all'output atteso (generato dai parser Python di riferimento).

**Ogni task di sviluppo relativo a un parser deve iniziare con un'analisi di questi tre asset.**

---

## 📜 **PRINCIPI OPERATIVI FONDAMENTALI**

1.  **SVILUPPO PARALLELO, NON SOSTITUTIVO**
    -   La nuova architettura (`server/import-engine`) sarà sviluppata **in parallelo** a quella esistente (`server/lib/importers`).
    -   Nessun codice legacy verrà rimosso o modificato. I nuovi parser saranno esposti tramite endpoint API versionati (es. `/api/v2/import/...`) per consentire un confronto diretto e una migrazione graduale solo dopo una validazione completa da parte tua.

2.  **CICLO DI CONSEGNA E VALIDAZIONE (UAT)**
    -   Al termine dello sviluppo di ogni singolo parser secondo la nuova architettura, il mio lavoro si fermerà.
    -   Consegnerò il parser completato a te per i **Test di Accettazione Utente (UAT)**.
    -   Attenderò il tuo **feedback e la tua approvazione esplicita** prima di iniziare a lavorare sul parser successivo o su qualsiasi altra fase del piano. Questo ciclo di feedback è un passaggio obbligatorio.

3.  **GESTIONE DELLA COMPLESSITÀ DEL CODICE (REGOLA DELLE 400 LINEE)**
    -   Durante la creazione o modifica di un file, se questo supera le **400 linee di codice**, lo sviluppo su quel file si interrompe.
    -   Prima di procedere, proporrò una **strategia di rifattorizzazione** per suddividere il file in moduli più piccoli, focalizzati e manutenibili, aderendo al principio della singola responsabilità.

---

## 📊 Analisi Approfondita dell'Architettura Attuale

### Punti di Forza
- **Template Dinamici**: Sistema flessibile basato su `ImportTemplate` e `FieldDefinition`
- **Separazione Business Logic**: Decodifiche centralizzate in `businessDecoders.ts`
- **Gestione Transazionale**: Uso di `Prisma.$transaction` per operazioni atomiche
- **Parsing Generico**: `fixedWidthParser.ts` fornisce una base solida e riutilizzabile

### Criticità Architetturali
- **Accoppiamento Stretto**: Parser mescolano parsing, validazione, trasformazione e persistenza
- **Mancanza di Type Safety**: Dati trattati come `any` o `Record<string, any>`
- **Error Handling Debole**: Errori non strutturati e difficili da diagnosticare
- **Logica di Business Dispersa**: Regole business sparse nei vari parser
- **Testing Limitato**: Funzioni non pure, difficili da testare in isolamento
- **Mancanza di Dead Letter Queue**: Perdita di visibilità sui record falliti

### Parser Analizzati (Complessità Crescente)

| Parser | Complessità | Logica Business | File | Modelli DB |
|--------|-------------|-----------------|------|------------|
| 4. Condizioni Pagamento | ⭐ | Minima | `CODPAGAM.TXT` | `CondizionePagamento` |
| 3. Codici IVA | ⭐⭐ | Media | `CODICIVA.TXT` | `CodiceIva` |
| 2. Causali Contabili | ⭐⭐ | Media | `CAUSALI.TXT` | `CausaleContabile` |
| 1. Anagrafiche | ⭐⭐⭐ | Alta | `A_CLIFOR.TXT` | `Cliente`, `Fornitore` |
| 5. Piano dei Conti | ⭐⭐⭐⭐ | Molto Alta | `CONTIGEN.TXT` | `Conto` |
| 6. Scritture Contabili | ⭐⭐⭐⭐⭐ | Estrema | 4 file correlati | 4 modelli correlati |

## 🏗️ Nuova Struttura Architetturale

### Organizzazione Progetti: Separazione Netta

```
server/
├── lib/                          # ARCHITETTURA ATTUALE (legacy)
│   ├── importers/               # Parser attuali (mantenuti per confronto)
│   ├── businessDecoders.ts     # Mantentuto per compatibilità
│   ├── fixedWidthParser.ts     # Base comune condivisa
│   └── importUtils.ts          # Utils legacy
│
├── import-engine/               # NUOVA ARCHITETTURA ENTERPRISE
│   ├── core/                   # Infrastruttura di base
│   │   ├── types/             # Tipi generati e shared
│   │   ├── errors/            # Sistema errori strutturato
│   │   ├── jobs/              # Job management avanzato
│   │   └── telemetry/         # Logging e monitoring
│   │
│   ├── acquisition/           # LIVELLO 1: Acquisizione
│   │   ├── parsers/          # Parser type-safe
│   │   ├── validators/       # Validazione con Zod
│   │   └── generators/       # Generazione tipi da template
│   │
│   ├── transformation/       # LIVELLO 2: Trasformazione
│   │   ├── transformers/     # Business logic pura
│   │   ├── decoders/         # Decodifiche evolute
│   │   └── mappers/          # Mapping a modelli Prisma
│   │
│   ├── persistence/          # LIVELLO 3: Persistenza
│   │   ├── staging/          # Tabelle staging
│   │   ├── transactions/     # Pattern transazionali
│   │   └── dlq/              # Dead Letter Queue
│   │
│   └── orchestration/        # Coordinamento e API
│       ├── workflows/        # Workflow engines
│       ├── handlers/         # Handler HTTP/API
│       └── middleware/       # Middleware specializzati
│
└── routes/                    # ENDPOINT API (evoluti)
    └── v2/                   # Nuovi endpoint versionati
        └── import/           # API import enterprise
```

## 📋 PIANO ESECUTIVO DETTAGLIATO

## FASE 0: Preparazione Infrastruttura

### Task 0.1: Setup Struttura Progetto e Dipendenze
**Priorità**: 🔴 Critica
**Stima**: 2-3 ore

#### Sotto-task 0.1.1: Installazione Dipendenze
- [ ] Aggiungere `zod` per validazione schema
- [ ] Aggiungere `@types/node` se mancante
- [ ] Aggiungere `winston` per logging strutturato
- [ ] Aggiungere `uuid` per job tracking

#### Sotto-task 0.1.2: Creazione Struttura Directory
- [ ] Creare `server/import-engine/` con tutte le sottodirectory
- [ ] Creare `server/import-engine/core/types/generated.ts` (placeholder)
- [ ] Creare file README.md per ogni directory principale

#### Sotto-task 0.1.3: Setup Scripts NPM
- [ ] Aggiungere script `generate:import-types` in package.json
- [ ] Aggiungere script `test:import-engine` per testing isolato
- [ ] Aggiungere script `lint:import-engine` per linting specifico

### Task 0.2: Infrastruttura Core
**Priorità**: 🔴 Critica
**Stima**: 4-5 ore

#### Sotto-task 0.2.1: Sistema Errori Strutturato
- [ ] Creare `server/import-engine/core/errors/ImportError.ts`
- [ ] Implementare hierarchy di errori (ParseError, ValidationError, TransformError, PersistenceError)
- [ ] Creare error handlers con context preserving

#### Sotto-task 0.2.2: Job Management e Telemetry
- [ ] Creare `server/import-engine/core/jobs/ImportJob.ts`
- [ ] Implementare job tracking con UUID
- [ ] Creare sistema telemetry base con Winston

#### Sotto-task 0.2.3: Dead Letter Queue (DLQ)
- [ ] Estendere Prisma schema con `ImportError` dettagliato
- [ ] Creare `server/import-engine/persistence/dlq/DLQService.ts`
- [ ] Implementare interfacce per error recovery

---

## FASE 1: Livello Acquisizione (Type-Safe Parsing)

### Task 1.1: Generazione Automatica Tipi
**Priorità**: 🔴 Critica
**Stima**: 6-8 ore

#### Sotto-task 1.1.1: Type Generator Engine
- [ ] Creare `server/import-engine/acquisition/generators/TypeGenerator.ts`
- [ ] Implementare lettura template dal database
- [ ] Generare interfacce TypeScript raw da FieldDefinition

#### Sotto-task 1.1.2: Template Integration
- [ ] Connettere generator a ImportTemplate/FieldDefinition
- [ ] Generare file `server/import-engine/core/types/generated.ts`
- [ ] Implementare refresh automatico dei tipi

#### Sotto-task 1.1.3: Parser Type-Safe
- [ ] Refactoring `fixedWidthParser.ts` → `TypeSafeParser.ts`
- [ ] Implementare generic parsing `parseFixedWidth<T>(...)`
- [ ] Aggiungere runtime type checking

### Task 1.2: Sistema Validazione con Zod
**Priorità**: 🟡 Alta
**Stima**: 8-10 ore

#### Sotto-task 1.2.1: Validators Base
- [ ] Creare `server/import-engine/acquisition/validators/` per ogni parser
- [ ] Implementare schema Zod per validazione/coercizione
- [ ] Creare utility per data validation (date, numbers, booleans)

#### Sotto-task 1.2.2: Validation Pipeline
- [ ] Implementare pipeline validazione con error collection
- [ ] Integrare DLQ per record invalidi
- [ ] Creare reporting validation stats

---

## FASE 2: Livello Trasformazione (Business Logic Pura)

### Task 2.1: Refactoring Business Decoders
**Priorità**: 🟡 Alta
**Stima**: 4-6 ore

#### Sotto-task 2.1.1: Decoders Evoluti
- [ ] Migrare `businessDecoders.ts` → `server/import-engine/transformation/decoders/`
- [ ] Suddividere per dominio (anagrafica, contabilità, IVA, ecc.)
- [ ] Aggiungere type safety completo

#### Sotto-task 2.1.2: Error Handling nei Decoders
- [ ] Implementare fallback e default values
- [ ] Aggiungere logging dettagliato per decodifiche fallite

### Task 2.2: Pure Transformation Services
**Priorità**: 🔴 Critica
**Stima**: 10-12 ore

#### Sotto-task 2.2.1: Transformer Architecture
- [ ] Creare abstract `BaseTransformer<TInput, TOutput>`
- [ ] Implementare transformers puri per ogni parser
- [ ] Separare completamente logica business da I/O

#### Sotto-task 2.2.2: Mappers to Prisma
- [ ] Creare `server/import-engine/transformation/mappers/`
- [ ] Implementare mapping type-safe a `Prisma.ModelCreateInput`
- [ ] Gestire relazioni e foreign keys

---

## FASE 3: Livello Persistenza (Transazioni Atomiche)

### Task 3.1: Pattern Staging-Commit
**Priorità**: 🔴 Critica
**Stima**: 8-10 ore

#### Sotto-task 3.1.1: Staging Tables
- [ ] Estendere Prisma schema con tabelle staging
- [ ] Implementare pattern `Staging{ModelName}` per ogni entità
- [ ] Creare migration per staging infrastructure

#### Sotto-task 3.1.2: Transaction Engine
- [ ] Creare `server/import-engine/persistence/transactions/TransactionEngine.ts`
- [ ] Implementare pattern atomico staging→production
- [ ] Aggiungere integrity validation pre-commit

### Task 3.2: Advanced Persistence Services
**Priorità**: 🟡 Alta
**Stima**: 6-8 ore

#### Sotto-task 3.2.1: Batch Processing
- [ ] Implementare batch processing ottimizzato
- [ ] Aggiungere progress tracking e cancellation
- [ ] Ottimizzare per large datasets

#### Sotto-task 3.2.2: Persistence Analytics
- [ ] Creare metriche performance per ogni operazione
- [ ] Implementare auto-tuning batch sizes
- [ ] Monitoring memoria e risorse

---

## FASE 4: Orchestrazione e API Evolution

### Task 4.1: Workflow Engine
**Priorità**: 🟡 Alta
**Stima**: 12-15 ore

#### Sotto-task 4.1.1: Import Workflows
- [ ] Creare `server/import-engine/orchestration/workflows/`
- [ ] Implementare workflow per ogni tipo import
- [ ] Coordinare parsing→validation→transformation→persistence

#### Sotto-task 4.1.2: Multi-file Coordination
- [ ] Implementare workflow per import multi-file (scritture)
- [ ] Gestire dipendenze tra file
- [ ] Rollback atomico cross-file

### Task 4.2: API v2 Enterprise
**Priorità**: 🟡 Alta
**Stima**: 8-10 ore

#### Sotto-task 4.2.1: RESTful API Design
- [ ] Creare `server/routes/v2/import/` endpoints
- [ ] Implementare proper HTTP status codes
- [ ] Aggiungere OpenAPI/Swagger documentation

#### Sotto-task 4.2.2: Job Management API
- [ ] Endpoint per job tracking e status
- [ ] API per DLQ management e recovery
- [ ] Real-time progress updates via WebSocket

---

## FASE 5: Testing e Migration Strategy

### Task 5.1: Comprehensive Testing
**Prioritità**: 🔴 Critica
**Stima**: 15-20 ore

#### Sotto-task 5.1.1: Unit Testing
- [ ] Test coverage 100% per tutti i transformers
- [ ] Test isolated per ogni validator
- [ ] Mock-free testing per pure functions

#### Sotto-task 5.1.2: Integration Testing
- [ ] Test end-to-end per ogni workflow
- [ ] Test rollback e error recovery
- [ ] Performance benchmarks

#### Sotto-task 5.1.3: Regression Testing
- [ ] Confronto output old vs new architecture
- [ ] Test con dati reali legacy
- [ ] Validation data integrity

### Task 5.2: Migration Strategy
**Priorità**: 🟡 Alta
**Stima**: 6-8 ore

#### Sotto-task 5.2.1: Gradual Rollout
- [ ] Feature flags per switch old→new
- [ ] Shadow mode per validation
- [ ] Rollback plan dettagliato

#### Sotto-task 5.2.2: Legacy Cleanup
- [ ] Deprecation plan per old parsers
- [ ] Migration guide per team
- [ ] Documentation update

---

## PRIORITIZZAZIONE ESECUZIONE

### Ordine di Implementazione Parser (dal più semplice al più complesso):

1. **Parser 4: Condizioni Pagamento** (Proof of Concept)
   - Semplicità ideale per validare architettura
   - Pochi campi, logica minimal
   - Test bed perfetto

2. **Parser 3: Codici IVA** (Architecture Validation)
   - Complessità moderata
   - Validazione pattern con decodifiche

3. **Parser 2: Causali Contabili** (Business Logic Test)
   - Test decodifiche complesse
   - Validation pattern enterprise

4. **Parser 1: Anagrafiche** (Multi-entity Challenge)
   - Challenge: Cliente vs Fornitore split
   - Test logica condizionale complessa

5. **Parser 5: Piano dei Conti** (Complex Business Rules)
   - **FOCUS INIZIALE** - Più complesso single-file
   - Logica gerarchica e classificazione
   - Test completo architettura

6. **Parser 6: Scritture Contabili** (Multi-file Orchestration)
   - Complessità massima
   - Test definitivo coordinamento multi-file

## 📊 Metriche di Successo

### KPI Tecnici
- **Type Safety**: 100% eliminazione `any` types
- **Test Coverage**: >95% per transformation layer
- **Error Recovery**: 100% record processabili in DLQ
- **Performance**: Mantener performance attuali o migliorare

### KPI Business
- **Reliability**: Zero data corruption
- **Visibility**: Tracciabilità completa di ogni record
- **Maintainability**: Riduzione 70% tempo debugging
- **Extensibility**: Aggiunta nuovo parser in <2 giorni

## 🚀 Prossimi Passi Immediati

1. **[OGGI]** Fase 0: Setup infrastruttura base
2. **[Settimana 1]** Fase 1: Type generation e parsing type-safe
3. **[Settimana 2]** Fase 2: Primo parser (Condizioni Pagamento) come PoC
4. **[Settimana 3]** Focus Piano dei Conti con nuova architettura
5. **[Settimana 4+]** Roll-out graduale altri parser

---

## 📝 Note di Implementazione

### Principi da Mantenere
- **Zero Breaking Changes**: API esistenti rimangono funzionanti
- **Gradual Migration**: Switch graduale parser by parser
- **Full Backward Compatibility**: Dati esistenti completamente compatibili
- **Performance First**: Nessuna degradazione performance

### Rischi e Mitigazioni
- **Rischio**: Complessità over-engineering
  - **Mitigazione**: PoC con parser semplice, validation incrementale
- **Rischio**: Performance regression
  - **Mitigazione**: Benchmarking continuo, profiling
- **Rischio**: Team adoption resistance
  - **Mitigazione**: Documentazione estesa, training sessions 