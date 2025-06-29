# Istruzioni per Gemini CLI

Questo file contiene le istruzioni specifiche e la metodologia operativa per l'agente Gemini CLI, al fine di garantire coerenza e efficienza nelle interazioni con il progetto `commessa-control-hub`.

## 1. File di Riferimento e Contesto

Quando richiesto di analizzare o lavorare su specifici aspetti del progetto, fare riferimento ai seguenti percorsi:

*   **Documentazione dei Tracciati Analizzati:**
    *   `./.docs/tracciati-analizzati/` (per una panoramica generale dei tracciati e delle loro relazioni).
    *   `./.docs/tracciati-analizzati/01-relazioni-tabelle-parsers.md` (per le relazioni chiave tra anagrafiche e movimenti).
    *   `./.docs/tracciati-analizzati/02-schema-di-importazione-dati.md` (per l'ordine di importazione e le dipendenze).
    *   `./.docs/tracciati-analizzati/03-schema-e-relazioni-databae.md` (per lo schema logico del database e le relazioni ERD).
    *   `./.docs/tracciati-analizzati/movimenti_contabili.md` (per il dettaglio dei 4 file delle scritture contabili).

*   **File di Dati Cliente (per test di importazione):**
    *   `./.docs/dati_cliente/` (per i file anagrafici generali come `A_CLIFOR.TXT`, `Causali.txt`, `CodicIva.txt`, `CodPagam.txt`, `ContiGen.txt`).
    *   `./.docs/dati_cliente/prima_nota/` (per i file specifici delle scritture contabili: `PNTESTA.TXT`, `PNRIGCON.TXT`, `PNRIGIVA.TXT`, `MOVANAC.TXT`).

*   **File di Implementazione Corrente (per analisi codice):**
    *   `./prisma/schema.prisma` (per lo schema del database).
    *   `./server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts` (per le definizioni dei campi delle scritture contabili).
    *   `./server/import-engine/acquisition/validators/scrittureContabiliValidator.ts` (per i validatori Zod delle scritture contabili).

## 2. Metodologia di Debug e Risoluzione Problemi

*   I test tu li scrivi, io li eseguo, copio i log e li scrivo nel file `console-logs.md` nel percorso @.docs/messages/console-logs.md, dopodichè ti informo di poterlo leggere.
*   Durante le tue modifiche, l'IDE potrebbe lamentare dei problemi che tu non riesci a leggere. Io li copierò e li incollerò nel file `problems.md` nel percorso @.docs/messages/problems.md, e io ti dirò che ci sono problemi segnalati dall'IDE e tu andrai a leggerli dal file. Queste operazioni non le farò mai autonomamente poiché implicano il mio intervento, quindi le farò solo su mie istruzioni.
