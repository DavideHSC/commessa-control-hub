# Piano Operativo Aggiornato - Fase 2: Sviluppo del Processo di Riconciliazione

**Data:** 11/07/2025
**Autore:** Gemini
**Obiettivo:** Dettagliare il piano di implementazione per la Fase 2, integrando le logiche di configurazione e automazione discusse per la creazione di un flusso di riconciliazione robusto, intelligente e incentrato sull'utente.

---

## Introduzione

Questo documento sostituisce la precedente analisi e funge da **piano operativo definitivo** per lo sviluppo della Fase 2. A seguito delle nostre recenti discussioni, abbiamo identificato funzionalità chiave che renderanno il sistema significativamente più potente. Questo piano le integra in modo strutturato.

Il principio guida è: **configurazione esplicita a monte, massima automazione a valle**.

---

## Sezione 1: Fondamenta del Database e della Configurazione

Come primo passo, implementeremo le fondamenta che abiliteranno tutte le automazioni successive. Questo coinvolge modifiche allo schema `prisma/schema.prisma` e la creazione delle relative interfacce di configurazione.

### Task 1.1: Filtro dei Conti Rilevanti
*   **Logica:** Introdurremo un meccanismo per filtrare le migliaia di scritture contabili e concentrarci solo su quelle rilevanti per le commesse (costi e ricavi).
*   **Implementazione DB:** Aggiungere il campo `isRilevantePerCommesse: Boolean @default(false)` al modello `Conto`.
*   **Implementazione UI:** Creare una pagina in "Impostazioni" chiamata **"Configurazione Conti per Analitica"**. Sarà una tabella di tutti i conti con un interruttore on/off per gestire il nuovo flag.

### Task 1.2: Creazione delle Voci Analitiche e Mapping (✅ Completato)
*   **Logica:** Disaccoppieremo la contabilità fiscale da quella gestionale. Creeremo "etichette di business" (Voci Analitiche) e le mapperemo ai conti contabili per automatizzare i suggerimenti.
*   **Implementazione DB:**
    1.  Creare il modello `VoceAnalitica` (`id`, `nome`, `tipo`).
    2.  Stabilire una relazione **molti-a-molti** tra `Conto` e `VoceAnalitica`.
*   **Implementazione UI:** Creare una pagina "Gestione Voci Analitiche" con un'interfaccia a due pannelli per creare le voci e associare a ciascuna i conti rilevanti.

### Task 1.3: Implementazione Regole di Ripartizione (Logica `DETTANAL`) (✅ Completato)
*   **Logica:** Creeremo un sistema per definire regole di ripartizione automatica per costi indiretti o ricorrenti.
*   **Implementazione DB (✅ Completato):** Creare un modello `RegolaRipartizione` (es. `contoCodice`, `commessaId`, `percentuale`).
*   **Implementazione UI (✅ Completato):** Creare una pagina "Regole di Ripartizione" per gestire queste regole.

### Task 1.4: Modello di Destinazione Finale (✅ Completato)
*   **Logica:** Definiremo la tabella finale che conterrà i dati post-riconciliazione.
*   **Implementazione DB (✅ Completato):** Rivedere e finalizzare il modello `Allocazione` (o `MovimentoCommessa`) assicurandoci che contenga i campi necessari: `rigaScritturaId`, `commessaId`, `voceAnaliticaId`, `importo`, `tipoMovimento` (`COSTO_EFFETTIVO`, `COSTO_STIMATO`, etc.), `data`.

---

## Sezione 2: Sviluppo del Processo di Riconciliazione (Backend)

Una volta preparato il database, svilupperemo l'endpoint principale che orchestra la logica di riconciliazione.

### Task 2.1: Endpoint `POST /api/reconciliation/run`
Il processo logico eseguito da questo endpoint seguirà una gerarchia precisa per ogni riga di costo/ricavo:

1.  **Pre-Filtro Intelligente:** Il sistema estrae **solo** le scritture dallo staging che contengono almeno una riga relativa a un `Conto` marcato come `isRilevantePerCommesse = true`.
2.  **Livello 1 - Automazione Diretta (`MOVANAC`):** Cerca una corrispondenza in `StagingAllocazione`. Se trovata, la riconciliazione è automatica.
3.  **Livello 2 - Automazione tramite Regole (`DETTANAL`):** Se il livello 1 fallisce, cerca una `RegolaRipartizione` per il conto. Se trovata, la applica.
4.  **Livello 3 - Preparazione per Riconciliazione Manuale:** Se entrambi i livelli automatici falliscono:
    *   La riga viene marcata come `DA_RICONCILIARE_MANUALMENTE`.
    *   Il sistema cerca la `VoceAnalitica` mappata a quel conto.
    *   I dati vengono preparati per essere inviati al frontend, **includendo il suggerimento per la Voce Analitica**.

---

## Sezione 3: Sviluppo dell'Interfaccia Utente di Riconciliazione

Infine, costruiremo l'interfaccia utente che permetterà all'operatore di finalizzare il processo.

### Task 3.1: Pagina di Riconciliazione
*   **Implementazione UI:** Svilupperemo la pagina "Riconciliazione" come descritto in precedenza (layout a due colonne, lista scritture a sinistra, dettaglio a destra).
*   **Funzionalità Chiave:**
    *   La tabella di dettaglio mostrerà lo stato di ogni riga (`Automatica`, `Da Assegnare`, etc.).
    *   Per le righe manuali, il campo "Voce Analitica" sarà **pre-compilato con il suggerimento** proveniente dal backend.
    *   L'utente potrà splittare un costo su più commesse.
    *   Un pulsante "Salva e Conferma" finalizzerà le assegnazioni.

---

**Conclusione:** Questo piano operativo dettagliato costituisce la nostra roadmap. Ogni task verrà affrontato in sequenza, e ti presenterò il lavoro per approvazione ad ogni passo significativo. 