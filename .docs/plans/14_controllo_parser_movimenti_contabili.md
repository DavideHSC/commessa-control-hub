# Piano di Controllo e Correzione del Parser dei Movimenti Contabili

**Data:** 08/07/2025
**Autore:** Gemini
**Stato:** In Esecuzione

## 1. Obiettivo

Questo piano ha lo scopo di analizzare, verificare e correggere l'intero flusso di importazione delle scritture contabili. L'obiettivo è risolvere le incongruenze dei dati attualmente visibili nell'interfaccia utente, come:
-   ID incomprensibili al posto di descrizioni corrette per le causali.
-   Campi vuoti (causale, conto, descrizione) nel modulo di modifica delle registrazioni.
-   Nessun dato disponibile nella scrivania di riconciliazione.

L'analisi sarà guidata dal tracciato record definito in `.docs/tracciati-analizzati/movimenti_contabili.md` e validata usando i dati reali presenti in `.docs/dati_cliente/dati_reali/penisola/prima_nota`.

## 2. Fasi del Piano

### Fase 1: Analisi Preliminare e Mappatura dei File Coinvolti

**Obiettivo:** Identificare ogni file di codice sorgente coinvolto nel processo e verificare la coerenza tra i dati di test e i dati reali.

-   **Azione 1.1:** Mappare l'intero flusso di importazione, partendo dalla rotta API fino alla persistenza su database.
    -   Rotta API (`server/routes/importScritture.ts` o simile).
    -   Job di importazione (`server/import-engine/core/jobs/ImportJob.ts`).
    -   Servizio di parsing (`server/import-engine/acquisition/parsers/typeSafeFixedWidthParser.ts`).
    -   Definizioni dei tracciati (`server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts`).
    -   Validatori Zod (`server/import-engine/acquisition/validators/scrittureContabiliValidator.ts`).
    -   Transformer dei dati (`server/import-engine/transformation/transformers/scrittureContabiliTransformer.ts`).
    -   Logica di persistenza e staging.
-   **Azione 1.2:** Confrontare la struttura dei file di dati reali (`.docs/dati_cliente/dati_reali/penisola/prima_nota`) con quelli di esempio (`.docs/dati_cliente/dati_esempio/prima_nota`) per identificare eventuali differenze strutturali che potrebbero causare errori nel parser.
-   **Azione 1.3:** Verificare che le definizioni dei campi in `scrittureContabiliDefinitions.ts` corrispondano **esattamente** (posizione di inizio, fine e lunghezza) a quanto documentato in `movimenti_contabili.md`.

### Fase 2: Revisione Dettagliata del Livello di Acquisizione (Parsing)

**Obiettivo:** Assicurarsi che i dati grezzi dai file `.TXT` siano letti e interpretati correttamente.

-   **Azione 2.1:** Ispezionare `scrittureContabiliDefinitions.ts`. Per ogni file (`PNTESTA`, `PNRIGCON`, `PNRIGIVA`, `MOVANAC`), controllare ogni singolo campo, con particolare attenzione a:
    -   `CODICE CAUSALE` e `DESCRIZIONE CAUSALE` (in `PNTESTA`).
    -   `CLIENTE/FORNITORE SIGLA` (in `PNTESTA` e `PNRIGCON`).
    -   `CONTO` e `SIGLA CONTO` (in `PNRIGCON`).
    -   `PROGRESSIVO NUMERO RIGO` (in `PNRIGCON`).
    -   `CONTROPARTITA` (in `PNRIGIVA`).
-   **Azione 2.2:** Verificare che il `typeSafeFixedWidthParser.ts` gestisca correttamente i tipi di dato (numerici, stringhe, date) e la rimozione di spazi superflui (`trim`).

### Fase 3: Revisione Dettagliata del Livello di Trasformazione (Transformer)

**Obiettivo:** Correggere la logica che converte i dati parsati in entità Prisma, che è la causa più probabile degli errori visualizzati.

-   **Azione 3.1:** Analizzare la funzione `identificaEntitaDipendenti` in `scrittureContabiliTransformer.ts`. Verificare quali campi vengono usati per popolare i `Set` di `fornitori`, `clienti`, `causali`, `conti`. L'ipotesi è che stiamo usando un ID tecnico invece di un codice o `externalId` significativo.
-   **Azione 3.2:** Analizzare la funzione `creaEntitaDipendenti`. Questa è una fase critica.
    -   **Causali:** Quando una `CausaleContabile` viene creata, deve usare il `CODICE CAUSALE` come `externalId` e la `DESCRIZIONE CAUSALE` (se presente) come `descrizione`. L'attuale `nome: 'Causale importata - ${id}'` è sbagliato e va sostituito con dati reali.
    -   **Conti:** Stessa logica per i `Conti`. Usare il codice conto per `codice` e cercare di derivare un nome significativo.
    -   **Fornitori/Clienti:** Assicurarsi che `externalId` sia impostato correttamente usando la `SIGLA` o il `CODICE FISCALE` e che il `nome` non sia un placeholder generico.
-   **Azione 3.3:** Analizzare le funzioni `creaScrittureContabili` e `creaRigheScrittura`.
    -   Verificare che le operazioni `connect` di Prisma usino la chiave corretta per collegare le entità. Ad esempio, la scrittura deve collegarsi alla causale tramite `{ connect: { externalId: ... } }`. È probabile che `externalId` non sia allineato tra le entità. Si farà riferimento al piano `12_review_and_align_externalid_usage.md`.
    -   Controllare che la `descrizione` della riga di scrittura sia popolata dal campo `NOTE` del file `PNRIGCON.TXT`. Le immagini mostrano che è vuota.
-   **Azione 3.4:** Rivedere l'associazione `RigaScrittura` <-> `RigaIva`. Ri-verificare che la logica di associazione (basata sull'indice o sul progressivo) sia implementata correttamente e senza ambiguità.

### Fase 4: Miglioramento del Logging e della Diagnostica

**Obiettivo:** Arricchire i log per rendere il processo di debug futuro più semplice ed efficace.

-   **Azione 4.1:** Introdurre log dettagliati nel `scrittureContabiliTransformer.ts` per tracciare la creazione delle entità dipendenti. Esempio: `console.log('Creazione Causale Contabile con externalId:', id, 'e descrizione:', descrizione)`.
-   **Azione 4.2:** Loggare avvisi (`warn`) specifici quando un'entità dipendente non viene trovata e deve essere creata, per monitorare la crescita del database.

### Fase 5: Test di Validazione End-to-End

**Obiettivo:** Eseguire un test completo per validare la soluzione.

-   **Azione 5.1:** Pulire le tabelle del database correlate alle anagrafiche e alle scritture contabili usando gli script di `truncate`.
-   **Azione 5.2:** Eseguire un nuovo import completo usando i dati reali dalla cartella `prima_nota`.
-   **Azione 5.3:** Verificare punto per punto che gli errori segnalati dalle immagini siano risolti:
    1.  Nella tabella delle Scritture Contabili, la colonna "Causale" deve mostrare una descrizione leggibile.
    2.  Nel modulo di Modifica Registrazione, tutti i campi (Causale, Conto, Descrizione) devono essere correttamente popolati.
    3.  La Scrivania di Riconciliazione deve mostrare le scritture pertinenti.
-   **Azione 5.4:** Ispezionare direttamente il database per confermare che le chiavi esterne tra le tabelle (`ScritturaContabile`, `CausaleContabile`, `RigaScrittura`, `Conto`, etc.) siano valorizzate correttamente.

Questo piano assicurerà un'analisi completa e sistematica per risolvere definitivamente i problemi di importazione. Inizio immediatamente con la Fase 1. 