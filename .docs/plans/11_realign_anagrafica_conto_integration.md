# Piano di Lavoro 11: Riallineamento Integrazione Anagrafiche e Piano dei Conti

**Data:** 2024-07-03

**Autore:** Gemini

**Stato:** Da Iniziare

## 1. Obiettivo

Il processo di importazione attuale separa le anagrafiche dei clienti/fornitori (`A_CLIFOR.TXT`) dalla tabella del piano dei conti (`Conto`), popolando tabelle distinte (`Cliente`, `Fornitore`). L'interfaccia utente, tuttavia, si aspetta di trovare una visione unificata all'interno della tabella `Conto` per le operazioni contabili.

Questo piano ha l'obiettivo di modificare l'architettura di importazione per risolvere questa discrepanza, facendo in modo che l'importazione delle anagrafiche arricchisca direttamente il piano dei conti, creando una fonte dati unica e coerente per l'applicazione.

## 2. Fasi del Progetto

Il lavoro è suddiviso in due fasi principali: una fase di **Analisi** per comprendere a fondo l'implementazione corrente e una di **Implementazione** per eseguire le modifiche necessarie.

---

### Fase 1: Analisi della Situazione Attuale

In questa fase, mapperemo i flussi di dati e le componenti UI esistenti per avere un quadro completo dell'impatto delle future modifiche.

| ID | Task | Descrizione | Stato |
| :--- | :--- | :--- | :--- |
| **AN-01** | Analizzare l'attuale workflow di importazione di `A_CLIFOR.TXT` | Rivedere il codice del workflow `importAnagraficheWorkflow.ts` e degli handler/transformer associati per confermare che i dati vengono salvati esclusivamente nelle tabelle `Cliente` e `Fornitore`. | `completed` |
| **AN-02** | Analizzare l'attuale workflow di importazione di `CONTIGEN.TXT` | Rivedere il codice del workflow di importazione del piano dei conti per confermare che popola esclusivamente la tabella `Conto` e come gestisce le descrizioni. | `completed` |
| **AN-03** | Mappare le componenti UI per la selezione dei conti | Identificare tutte le pagine e i componenti React (es. `NuovaRegistrazionePrimaNota.tsx`, `Riconciliazione.tsx`) che utilizzano dropdown o campi di ricerca per i conti. Verificare se attingono dati solo dalla tabella `Conto` o se eseguono query multiple. | `completed` |
| **AN-04** | Documentare la discrepanza | **Rilevazioni:** 1. L'import delle anagrafiche scrive solo su `Cliente`/`Fornitore`. 2. L'import del piano dei conti scrive solo su `Conto`. 3. L'UI legge solo da `Conto`. **Conclusione:** I dati anagrafici non arrivano mai all'UI. | `completed` |

---

### Fase 2: Implementazione e Ricalibrazione

In questa fase, modificheremo i processi di importazione per allinearli alla nuova architettura.

| ID | Task | Descrizione | Stato |
| :--- | :--- | :--- | :--- |
| **IM-01** | Modificare il workflow di importazione di `A_CLIFOR.TXT` | Estendere l'handler (`anagraficaHandler.ts`) in modo che, per ogni record valido, esegua un'operazione di `upsert` sulla tabella `Conto`. | `pending` |
| **IM-02** | Definire e implementare il mapping dei campi | Durante l'upsert, mappare i campi come segue: `Conto.codice` = `A_CLIFOR.sottoconto_cliente/fornitore`, `Conto.descrizione` = `A_CLIFOR.ragione_sociale`. Definire una logica per derivare il `mastro` e la `natura` (es. dal prefisso del codice conto). | `pending` |
| **IM-03** | Gestire la transazionalità | Assicurarsi che l'inserimento/aggiornamento nella tabella `Conto` e nella tabella `Cliente`/`Fornitore` avvenga in modo transazionale. Se un'operazione fallisce, devono fallire entrambe. | `pending` |
| **IM-04** | Testare l'importazione end-to-end | Eseguire un'importazione completa partendo da tabelle vuote: prima `CONTIGEN.TXT` e poi `A_CLIFOR.TXT`. Verificare che la tabella `Conto` contenga le anagrafiche con la descrizione corretta. | `pending` |
| **IM-05** | Verificare l'impatto sull'UI | Dopo l'importazione, navigare nelle pagine identificate in **AN-03** e verificare che i campi di selezione dei conti ora mostrino correttamente i clienti e i fornitori importati. | `pending` |
| **IM-06** | Pulizia del codice (opzionale) | Valutare se, a seguito delle modifiche, alcune query dirette alle tabelle `Cliente`/`Fornitore` sono diventate ridondanti e possono essere rimosse o semplificate. | `pending` |
| **IM-07** | Aggiornare la documentazione di seed | Modificare il file `prisma/seed.ts` (o simili) per riflettere la nuova logica, assicurando che i dati di seed siano coerenti con il nuovo approccio. | `pending` | 