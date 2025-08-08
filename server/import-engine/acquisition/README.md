# Acquisition Layer

Questa directory rappresenta il primo strato dell'Import Engine. La sua responsabilità esclusiva è leggere i dati grezzi da sorgenti esterne (in questo caso, file a larghezza fissa) e trasformarli in strutture dati TypeScript tipizzate e validate, pronte per essere processate dai layer successivi.

## Struttura della Cartella

-   **`/definitions/`**: Contiene le definizioni della struttura dei file a larghezza fissa.
-   **`/generators/`**: Contiene script per la generazione automatica di codice, come i tipi TypeScript.
-   **`/parsers/`**: Ospita i parser responsabili della lettura e trasformazione dei dati grezzi.
-   **`/validators/`**: Contiene gli schemi di validazione (usando Zod) per ogni tipo di dato importato.
-   `README.md`: Questo file.

---

### Sottocartelle

#### `/definitions/`

Contiene le definizioni letterali dei tracciati dei file a larghezza fissa. Ogni file in questa cartella esporta un array di oggetti `FieldDefinition` che descrive i campi di un record, specificando nome, lunghezza, posizione e tipo.

-   `scrittureContabiliDefinitions.ts`: Definisce la struttura dei file relativi alle scritture contabili, come `PNTESTA`, `PNRIGCON`, `PNRIGIVA` e `MOVANAC`.

#### `/generators/`

Include script per automatizzare la creazione di codice boilerplate.

-   `TypeGenerator.ts`: Uno script Node.js che si connette al database, legge i template di importazione (`ImportTemplate`) e genera automaticamente le interfacce TypeScript corrispondenti in `server/import-engine/core/types/generated.ts`. Questo garantisce che i tipi usati nel codice siano sempre sincronizzati con le definizioni nel database.

#### `/parsers/`

Contiene la logica per interpretare i file a larghezza fissa.

-   `typeSafeFixedWidthParser.ts`: Fornisce un wrapper "type-safe" attorno al parser legacy (`fixedWidthParser.ts`). Sfrutta i `FieldDefinition` per restituire un array di oggetti tipizzati, migliorando la robustezza e la manutenibilità del codice.

#### `/validators/`

Questa è una delle cartelle più importanti del layer. Contiene schemi di validazione Zod per ogni entità di dati importata. Questi schemi non solo validano la struttura e i tipi dei dati, ma eseguono anche coercizione e trasformazioni di base (es. da stringhe a date, numeri o booleani), garantendo che solo dati puliti e conformi procedano al layer di trasformazione.

-   `anagraficaValidator.ts`: Schema per la validazione delle anagrafiche clienti/fornitori.
-   `causaleContabileValidator.ts`: Schema per le causali contabili.
-   `codiceIvaValidator.ts`: Schema per i codici IVA.
-   `condizioniPagamentoValidator.ts`: Schema per le condizioni di pagamento.
-   `pianoDeiContiValidator.ts`: Schema per il piano dei conti standard.
-   `pianoDeiContiAziendaleValidator.ts`: Schema per il piano dei conti specifico dell'azienda.
-   `scrittureContabiliValidator.ts`: Schemi complessi e interconnessi per la validazione delle scritture contabili (testate, righe contabili, righe IVA, movimenti analitici). 