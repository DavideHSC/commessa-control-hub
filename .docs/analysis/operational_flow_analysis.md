# Analisi del Flusso Operativo

Questo documento descrive le analisi dei flussi operativi dell'applicazione, partendo dall'interazione dell'utente nell'interfaccia fino alla query sul database. Serve come memoria storica e punto di riferimento per future decisioni di sviluppo.

**Premessa Metodologica:**
La nostra analisi parte sistematicamente dal punto di vista dell'utente finale. Iniziamo esaminando le voci di menu presenti nella `Sidebar` del frontend per identificare i punti di ingresso principali dell'applicazione e seguiamo il flusso di dati e logica attraverso i vari strati (componenti React, API, server, database) per ogni funzionalità.

---

## Flusso 1: Visualizzazione Elenco Commesse (`/commesse`)

**Data Analisi:** 29 Giugno 2025

**Obiettivo:** Comprendere la catena di file e componenti coinvolti quando l'utente visualizza l'elenco delle commesse.

**Punto di Partenza:** Click sulla voce di menu "Commesse" nella sidebar.

### Catena degli Eventi

1.  **Componente Sidebar - `src/components/Sidebar.tsx`**
    *   **Responsabilità:** Contiene il link di navigazione che punta al percorso `/commesse`. È il punto di innesco dell'azione da parte dell'utente.

2.  **Routing Principale - `src/App.tsx`**
    *   **Responsabilità:** Contiene la configurazione del router principale di React (`react-router-dom`). Mappa il percorso URL `/commesse` al componente della pagina `Commesse`.

3.  **Pagina Elenco Commesse - `src/pages/Commesse.tsx`**
    *   **Responsabilità:** È il componente React che renderizza l'intera pagina.
        *   **Recupero Dati:** Chiama la funzione `getCommesse()` all'avvio per caricare i dati dal backend.
        *   **Gestione Stato:** Utilizza `useState` per gestire lo stato di caricamento (`isLoading`) e per memorizzare l'elenco delle commesse ricevute.
        *   **Visualizzazione:** Organizza i dati in una struttura gerarchica (commesse principali e figlie) e li visualizza tramite un componente `Accordion`.
        *   **Navigazione:** Gestisce il click sul pulsante "Dettagli", che reindirizza l'utente alla pagina di dettaglio della singola commessa (`/commesse/:id`).

4.  **Livello API Frontend - `src/api/index.ts`**
    *   **Responsabilità:** Esporta la funzione `getCommesse`. Questa funzione astrae la logica della chiamata di rete, effettuando una richiesta `fetch` all'endpoint del backend `/api/commesse`.

5.  **Server Entry Point - `server/index.ts`**
    *   **Responsabilità:** È il punto di ingresso del server Express.
        *   Registra tutti i middleware necessari (es. `cors`, `express.json`).
        *   Importa e registra tutte le rotte dell'applicazione, inclusa quella per le commesse.
        *   Associa il percorso `/api/commesse` al gestore di rotte `commesseRoutes`.

6.  **Gestore Rotta Backend - `server/routes/commesse.ts`**
    *   **Responsabilità:** Gestisce tutte le richieste HTTP relative all'entità `Commessa`.
        *   Definisce il gestore per la richiesta `GET /`.
        *   Utilizza il client **Prisma** (`prisma.commessa.findMany(...)`) per interrogare il database.
        *   Recupera un elenco paginato di commesse, includendo relazioni importanti come `cliente` e `budget`.
        *   Formatta la risposta in JSON e la invia al frontend.

### Riepilogo del Flusso Dati

Il flusso completo può essere riassunto come segue:

`[UI: Sidebar.tsx]` → `[React Router: App.tsx]` → `[Pagina: Commesse.tsx]` → `[API Frontend: api/index.ts]` → `[Server Express: server/index.ts]` → `[Rotta Backend: server/routes/commesse.ts]` → `[Prisma Client]` → `[Database]`

In sintesi, il flusso è un classico pattern client-server full-stack, con una chiara separazione delle responsabilità tra frontend, backend e database.

---
