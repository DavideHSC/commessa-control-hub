# Nuovi Custom Hooks (`/new_hooks`)

Questa directory, parte della nuova architettura, contiene una versione rivista e migliorata dei custom hooks di React, progettati per essere più generici, robusti e facili da usare.

## File Principali

### Generic Hooks

-   `useApi.ts`: Un hook generico per interagire con un endpoint API REST. Fornisce metodi per le operazioni CRUD (`fetch`, `create`, `update`, `remove`) e gestisce lo stato di caricamento (`loading`) e degli errori (`error`), astraendo completamente la logica di `fetch`.

-   `useForm.ts`: Un potente hook per la gestione dei form. A differenza della versione precedente che si appoggiava a `react-hook-form`, questa è un'implementazione custom che gestisce:
    -   Lo stato dei valori del form (`values`).
    -   Lo stato degli errori di validazione (`errors`).
    -   Lo stato "touched" per ogni campo.
    -   Un sistema di validazione configurabile (su `onChange`, `onBlur`, `onSubmit`) basato su regole definite dall'utente.
    -   Funzioni di utilità come `reset`, `setFieldValue`, etc.

-   `useTable.ts`: Un hook per la gestione della logica di tabelle dati complesse, interamente lato client. Fornisce funzionalità di:
    -   **Paginazione**: Calcola le pagine e fornisce i dati per la pagina corrente.
    -   **Ricerca**: Filtra i dati in base a un termine di ricerca.
    -   **Ordinamento**: Ordina i dati in base a una colonna e una direzione specificate.

### Import Hooks ✅ COMPLETE

Specialized hooks for handling data import workflows from Contabilità Evolution trace files:

-   `useImportScritture.ts`: Handles complex multi-file import workflow for Scritture Contabili (PNTESTA.TXT, PNRIGCON.TXT, PNRIGIVA.TXT, MOVANAC.TXT). Manages progress polling and detailed error reporting.

-   `useImportPianoDeiConti.ts`: Manages single-file import for Piano dei Conti (CONTIGEN.TXT). Provides upload state, validation errors, and import statistics.

-   `useImportCondizioniPagamento.ts`: Handles Condizioni di Pagamento import (CODPAGAM.TXT). Single-file upload with validation and error reporting.

-   `useImportCodiciIva.ts`: Manages Codici IVA import (CODICIVA.TXT). Provides structured error handling for IVA code validation.

-   `useImportCausaliContabili.ts`: Handles Causali Contabili import (CAUSALI.TXT). Manages accounting cause validation and import statistics.

-   `useImportAnagrafiche.ts`: Manages Anagrafiche Clienti/Fornitori import (A_CLIFOR.TXT). Handles customer/supplier data import with validation.

All import hooks follow a consistent pattern:
- **State Management**: `idle`, `uploading`, `completed`, `failed` states
- **Error Handling**: Structured error reporting with validation details
- **Type Safety**: Full TypeScript coverage with proper type definitions
- **API Integration**: Seamless integration with backend import endpoints

### Utilities

-   `index.ts`: Esporta tutti gli hooks dalla cartella per consentire importazioni più pulite da un unico punto. 