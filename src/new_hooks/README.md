# Nuovi Custom Hooks (`/new_hooks`)

Questa directory, parte della nuova architettura, contiene una versione rivista e migliorata dei custom hooks di React, progettati per essere più generici, robusti e facili da usare.

## File Principali

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

-   `index.ts`: Esporta tutti gli hooks dalla cartella per consentire importazioni più pulite da un unico punto. 