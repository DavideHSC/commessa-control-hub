# Piano di Recupero e Refactoring (v3 - "Refactor-First")

**Data**: 25 Giugno 2025
**Autore**: Gemini Assistant (revisionato con la supervisione dell'utente)
**Stato**: **Approvato. In Esecuzione.**

## 1. Logica Fondamentale (Refactor-First)

Non ricostruiamo il monolite. Lo smantelliamo *subito* nella sua versione stabile e poi aggiungiamo le modifiche successive direttamente nella nuova struttura modulare. Questo approccio previene la corruzione del codice durante il processo di recupero.

---

## 2. Piano Operativo

### Fase 0: Preparazione Ambiente di Analisi (IN CORSO)
**Obiettivo**: Preparare un ambiente sicuro per l'analisi forense, senza toccare la codebase attiva.

*   **Azione 0.1**: Creare una directory dedicata per l'analisi.
    ```bash
    mkdir -p .docs/analysis/commit_by_commit_recovery
    ```
*   **Azione 0.2**: Ottenere la lista cronologica di tutti i commit da analizzare e salvarla per riferimento.
    ```bash
    git rev-list 0b1b23b..HEAD --reverse > .docs/analysis/commit_by_commit_recovery/commits_to_analyze.txt
    ```

### Fase 1: Stabilizzazione e Refactoring IMMEDIATO (PROSSIMO PASSO)
**Obiettivo**: Smantellare la versione stabile del monolite prima di integrare qualsiasi nuova modifica.

*   **Azione 1.1 (Stabilizzazione)**: Ripristinare `importAnagrafiche.ts` alla versione stabile e completa del commit `0b1b23b`.
    ```bash
    # (Comando da eseguire)
    rm server/routes/importAnagrafiche.ts && mv server/routes/importAnagrafiche_0b1b23b_working.ts server/routes/importAnagrafiche.ts
    ```
*   **Azione 1.2 (Refactoring IMMEDIATO)**: Subito dopo la stabilizzazione, smantellare il file ripristinato.
    *   Creare la directory `server/lib/importers/`.
    *   Creare i file specifici per ogni logica (`codiciIvaImporter.ts`, `causaliImporter.ts`, ecc.).
    *   Spostare ogni funzione `handle...` dal file stabile ai nuovi moduli dedicati.
    *   Semplificare `importAnagrafiche.ts` a un ruolo di puro "dispatcher".

### Fase 2: Analisi Forense e Integrazione MIRATA
**Obiettivo**: Recuperare il lavoro successivo al commit stabile e integrarlo nella nuova architettura modulare.

**PRINCIPIO OPERATIVO FONDAMENTALE (DA NON DIMENTICARE):** L'analisi di ogni commit deve essere **olistica**. È obbligatorio ispezionare **TUTTI i file modificati** nel commit (parser, schema, UI, etc.) per capire l'intera portata delle modifiche e garantire un'integrazione coerente, evitando di introdurre bug dovuti a una visione parziale.

*   **Azione 2.1 (Analisi Completa)**: Per ogni commit in `commits_to_analyze.txt`:
    *   Ottenere la lista di **tutti** i file modificati.
    *   Analizzare il `diff` per **ciascun file** per comprendere le modifiche.
*   **Azione 2.2 (Integrazione Controllata)**: Applicare le modifiche identificate **in modo coordinato** ai moduli e file corrispondenti nell'architettura refattorizzata. Ogni integrazione significativa richiederà la tua approvazione.

### Fase 3: Validazione Finale e Pulizia
**Obiettivo**: Verificare il corretto funzionamento e pulire gli artefatti di recupero.

*   **Azione 3.1**: Eseguire test di importazione completi per ogni anagrafica.
*   **Azione 3.2**: Rimuovere la cartella di analisi e i file temporanei. 