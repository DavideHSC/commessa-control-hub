# Piano di Refactoring e Correzione del Parser Scritture Contabili

**Data:** 28 Giugno 2025
**Autore:** Gemini
**Stato:** Completato

## 1. Obiettivo

Risolvere in modo definitivo il bug che impedisce il corretto parsing dei file delle scritture contabili (`PNTESTA.TXT`, `PNRIGCON.TXT`, `PNRIGIVA.TXT`, `MOVANAC.TXT`).

L'intervento non si limiterà a una semplice correzione, ma completerà l'allineamento del workflow di importazione alla nuova architettura type-safe e resiliente definita nel documento `progetto_info_plan.md`, eliminando le dipendenze da configurazioni dinamiche e fragili.

## 2. Analisi e Diagnosi

L'analisi del file `server/import-engine/orchestration/workflows/importScrittureContabiliWorkflow.ts` ha rivelato uno scenario inaspettato:

-   **Stato Attuale**: Il workflow è già stato oggetto di un significativo refactoring e adotta già la struttura a 4 fasi (Acquisizione, Validazione, Trasformazione, Persistenza) prevista dalla nuova architettura. Utilizza Zod per la validazione, transformer puri e transazioni atomiche.
-   **Causa del Problema**: Nonostante l'avanzamento, il workflow presenta un punto debole critico nella **Fase 1 (Acquisizione)**. Il metodo `parseMultiFiles` recupera ancora le definizioni dei campi (posizione, lunghezza) da un template (`scritture_contabili`) memorizzato nel database.
-   **Conclusione della Diagnosi**: Il bug non risiede nella logica del codice del parser, ma nelle **definizioni dei campi errate o mal configurate nel database**. Il workflow moderno è alimentato da un meccanismo di configurazione legacy, che è la fonte diretta del fallimento del parsing.

## 3. Piano d'Azione

Per risolvere il problema e completare il refactoring, il piano prevede di rimuovere l'ultima dipendenza dal vecchio sistema di template.

### Fase 1: Creazione delle Definizioni Statiche dei Campi

1.  **Azione**: Creare un nuovo file TypeScript dedicato: `server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts`.
2.  **Scopo**: Questo file esporterà come costanti le definizioni dei campi (`FieldDefinition[]`) per ognuno dei quattro file (`PNTESTA`, `PNRIGCON`, `PNRIGIVA`, `MOVANAC`).
3.  **Fonte di Verità**: Le definizioni saranno basate sulle specifiche corrette e verificate presenti nel documento `.docs/analysis/fix_scrritture_contabili_parser_04.md`. Inoltre, si farà riferimento alla logica implementata nell'applicazione di test standalone e funzionante (`parser-dati-contabili-gemini`), come ulteriore conferma della correttezza dell'implementazione. Questo sposta la fonte della verità dal database (fragile) al codice (robusto e versionato).

**Stato: Completato.** Il file `server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts` è stato creato e contiene le definizioni statiche necessarie.

### Fase 2: Modifica del Workflow di Importazione

1.  **Azione**: Modificare il file `server/import-engine/orchestration/workflows/importScrittureContabiliWorkflow.ts`.
2.  **Scopo**: Disaccoppiare il workflow dal sistema di template del database.
3.  **Modifiche Specifiche**:
    -   All'interno del metodo `parseMultiFiles`, rimuovere completamente la query al database: `this.prisma.importTemplate.findFirst(...)`.
    -   Importare le definizioni statiche create nella Fase 1 (es. `import { pnTestaDefinitions, ... } from '../definitions/scrittureContabiliDefinitions';`).
    -   Passare queste definizioni statiche e corrette direttamente alla funzione di parsing `parseFixedWidth` per ogni rispettivo file.

**Stato: Completato.** Il file `server/import-engine/orchestration/workflows/importScrittureContabiliWorkflow.ts` è stato aggiornato per utilizzare le definizioni statiche e non dipende più dal database per il recupero dei template.

## 4. Risultati Attesi

-   **Correzione del Bug**: Il parser riceverà le definizioni corrette e sarà in grado di elaborare i file delle scritture contabili.
-   **Completamento del Refactoring**: Il workflow delle scritture contabili diventerà il primo componente a implementare al 100% la nuova architettura, senza più dipendenze da configurazioni esterne per la sua logica di base.
-   **Miglioramento della Robustezza**: Il sistema diventerà più affidabile, in quanto la struttura dei file sarà definita staticamente, validata dal compilatore TypeScript e tracciata tramite Git.
-   **Creazione di un Precedente**: Questo intervento fungerà da modello per il successivo refactoring degli altri 5 parser legacy.