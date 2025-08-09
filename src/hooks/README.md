# Custom Hooks (`/hooks`)

Questa directory contiene i "custom hooks" di React, che sono funzioni riutilizzabili per incapsulare logiche complesse e stateful all'interno dei componenti.

## File Principali

-   `useAdvancedTable.ts`: Un hook complesso che gestisce lo stato e la logica per tabelle dati avanzate. Si occupa di:
    -   Paginazione lato client/server.
    -   Ordinamento (sorting) multi-colonna.
    -   Ricerca testuale (con debounce per ottimizzare le performance).
    -   Gestione dei filtri.
    -   Caricamento dei dati da un endpoint API specificato.

-   `useCrudTable.ts`: Un hook che astrae la logica CRUD (Create, Read, Update, Delete) per una risorsa di dati visualizzata in una tabella. Gestisce:
    -   Lo stato dei dialoghi di creazione/modifica.
    -   La gestione dello stato dei form (utilizzando `react-hook-form` e `zod` per la validazione).
    -   Le chiamate API per le operazioni CRUD.
    -   La visualizzazione di notifiche (toast) per feedback all'utente.

-   `use-toast.ts`: Implementa il sistema di notifiche "toast" dell'applicazione, basato su `sonner`. Gestisce la coda, la visualizzazione e la rimozione delle notifiche.

-   `use-mobile.tsx`: Un semplice hook che rileva se l'applicazione è visualizzata su un dispositivo mobile (basandosi sulla larghezza della finestra), restituendo un booleano. 