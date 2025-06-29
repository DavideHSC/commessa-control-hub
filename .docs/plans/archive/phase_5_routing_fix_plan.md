# Fase 5 - Piano di Correzione Routing per SPA

- **ID:** `PHASE-05-ROUTING`
- **Stato:** `PLANNED`
- **Obiettivo:** Correggere il comportamento del server di produzione per supportare correttamente la navigazione di una Single Page Application (SPA), eliminando il problema delle pagine bianche.
- **Dependencies:** Nessuna

## 1. Analisi del Problema

- **Sintomo:** Navigando nell'applicazione con i pulsanti avanti/indietro del browser o accedendo a un URL direttamente (es. `/database`), viene visualizzata una pagina bianca.
- **Causa:** Il server Express è configurato per servire solo le rotte API (`/api/*`) e i file statici dalla cartella `public`. Non è presente una logica di "fallback" che reindirizzi tutte le altre richieste al file `index.html` della SPA, che è responsabile della gestione del routing lato client.

## 2. Identificazione delle Lacune

1.  Manca una rotta "catch-all" nel file `server/index.ts` che gestisca le richieste non API.
2.  Il server non serve correttamente i file statici della build di produzione del client React (che si trovano nella cartella `dist`, non `public`).

## 3. Piano d'Azione

### Task 5.1: Aggiornamento del Server Express (`server/index.ts`)

- **Azione:** Modificare il server per servire correttamente l'applicazione React e gestire il routing SPA.
- **Dettagli:**
    1.  Importare il modulo `path` di Node.js per gestire i percorsi dei file in modo cross-platform.
    2.  Rimuovere `app.use(express.static('public'));` che non è corretto per la build di produzione.
    3.  Aggiungere un middleware per servire i file statici dalla cartella `dist/assets` (o simile, a seconda della configurazione di Vite).
    4.  Aggiungere una rotta "catch-all" alla fine di tutte le definizioni di rotta. Questa rotta deve inviare il file `dist/index.html` per qualsiasi richiesta GET che non corrisponde a un'API. Questo permetterà a React Router di prendere il controllo.
- **Verifica:** Dopo la modifica, l'applicazione buildata e servita in locale (`npm run build && npm run start`) deve permettere la navigazione diretta a URL come `/database` e l'uso dei pulsanti del browser senza errori. 