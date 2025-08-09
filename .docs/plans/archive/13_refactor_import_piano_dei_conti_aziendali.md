# Piano di Lavoro 13: Gestione Piano dei Conti Standard e Aziendale

**Data:** 2024-07-03

**Autore:** Gemini

**Stato:** Da Iniziare

## 1. Obiettivo

Estendere il sistema di importazione per gestire due formati per il Piano dei Conti:
- `CONTIGEN.TXT`: Piano dei Conti standard (già gestito).
- `CONTIAZI.TXT`: Piano dei Conti personalizzato per una specifica azienda.

L'obiettivo è creare una logica di importazione unificata che possa distinguere i due file e applicare le personalizzazioni aziendali sopra il piano standard in modo transazionale e coerente.

---
## Fase 1: Analisi e Refactoring Architetturale

In questa fase, prepariamo il terreno per le nuove modifiche, allineando l'import del piano dei conti all'architettura a workflow più moderna.

| ID | Task | Descrizione | Stato |
| :--- | :--- | :--- | :--- |
| **AR-01** | Isolare la rotta di importazione | Creare una nuova rotta `server/routes/importConti.ts` e spostare la logica di importazione per `piano_dei_conti` da `importAnagrafiche.ts` al nuovo file. Aggiornare il server per usare la nuova rotta. | `pending` |
| **AR-02** | Estendere il modello `Conto` | Analizzare `prisma/schema.prisma` e aggiungere al modello `Conto` i campi necessari per gestire le personalizzazioni di `CONTIAZI.TXT` (es. `descrizioneLocale`, `codiceFiscaleAzienda`, `subcodiceAzienda`). Questi campi dovranno essere opzionali. | `pending` |
| **AR-03** | Creare il workflow per `CONTIGEN` | Creare un nuovo workflow `importContiGenWorkflow.ts` basato sulla logica esistente in `pianoDeiContiImporter.ts`. Questo includerà la definizione del parser, del trasformatore e dell'handler per il formato `CONTIGEN.TXT`. | `pending` |
| **AR-04** | Sostituire la vecchia logica | Aggiornare la nuova rotta `importConti.ts` affinché utilizzi il workflow creato al punto AR-03 al posto della vecchia funzione `handlePianoDeiContiImport`. | `pending` |

---
## Fase 2: Implementazione del Parser per `CONTIAZI`

Questa fase è dedicata alla creazione dei componenti per interpretare il nuovo formato.

| ID | Task | Descrizione | Stato |
| :--- | :--- | :--- | :--- |
| **IM-01** | Creare il parser per `CONTIAZI` | Implementare un nuovo parser in `server/import-engine/acquisition/parsers/` specifico per il formato a larghezza fissa di `CONTIAZI.TXT`, basandosi sul documento `@CONTIAZI.md`. | `pending` |
| **IM-02** | Creare il decodificatore per `CONTIAZI` | Implementare le funzioni di decodifica in `server/import-engine/transformation/decoders/` per validare e convertire i dati grezzi del `CONTIAZI` (es. tipi, flag). | `pending` |
| **IM-03** | Creare il trasformatore per `CONTIAZI` | Implementare la logica di trasformazione in `server/import-engine/transformation/transformers/` per mappare i dati decodificati del `CONTIAZI` al modello `Conto` di Prisma. | `pending` |

---
## Fase 3: Logica di Business e Workflow Unificato

In questa fase finale, unifichiamo i due flussi e gestiamo la logica di "override".

| ID | Task | Descrizione | Stato |
| :--- | :--- | :--- | :--- |
| **WF-01** | Creare l'handler per `CONTIAZI` | Implementare un handler in `server/import-engine/orchestration/handlers/` che, per ogni record di `CONTIAZI.TXT`, esegua un'operazione di `upsert` sulla tabella `Conto`. La `upsert` cercherà un conto tramite `codifica` e `codiceFiscaleAzienda` e lo aggiornerà con i dati personalizzati. | `pending` |
| **WF-02** | Creare il workflow per `CONTIAZI` | Creare un nuovo workflow `importContiAziWorkflow.ts` che orchestri il parsing, la trasformazione e il caricamento dei dati per il file `CONTIAZI.TXT`. | `pending` |
| **WF-03** | Aggiornare la rotta di importazione | Modificare la rotta `importConti.ts` per accettare un parametro che distingua il tipo di importazione (es. `/import/conti/standard` vs `/import/conti/aziendale`). La rotta chiamerà il workflow corretto in base a questo parametro. | `pending` |
| **WF-04** | Test End-to-End | Eseguire un test completo: 1. Importare `CONTIGEN.TXT`. 2. Importare `CONTIAZI.TXT`. 3. Verificare nel database che i conti standard siano stati creati e che quelli personalizzati siano stati aggiornati correttamente. | `pending` | 