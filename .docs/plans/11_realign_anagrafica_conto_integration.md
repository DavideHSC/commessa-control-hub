# Piano di Lavoro 11: Riallineamento Integrazione Anagrafiche e Piano dei Conti

**Data:** 2024-07-03

**Autore:** Gemini

**Stato:** Da Iniziare

## 1. Obiettivo ⚠️ STRATEGIA RIVISTA

~~Il processo di importazione attuale separa le anagrafiche dei clienti/fornitori (`A_CLIFOR.TXT`) dalla tabella del piano dei conti (`Conto`), popolando tabelle distinte (`Cliente`, `Fornitore`). L'interfaccia utente, tuttavia, si aspetta di trovare una visione unificata all'interno della tabella `Conto` per le operazioni contabili.~~

**NUOVO APPROCCIO CORRETTO:**

Il problema reale è che l'importazione delle **scritture contabili** cerca di collegare clienti/fornitori ma non riesce a trovarli. La soluzione corretta NON è duplicare le anagrafiche nel piano dei conti, ma modificare il **transformer delle scritture contabili** per:

1. **Mantenere separazione logica**: Anagrafiche in `Cliente`/`Fornitore`, conti normali in `Conto`
2. **Logica di ricerca intelligente**: Quando una scrittura contabile referenzia un conto cliente/fornitore, cercare nelle tabelle appropriate
3. **Evitare duplicazione**: Non inserire le stesse entità in multiple tabelle

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

### Fase 2: Implementazione Corretta ⚠️ STRATEGIA RIVISTA

~~In questa fase, modificheremo i processi di importazione per allinearli alla nuova architettura.~~ **APPROCCIO SBAGLIATO - CANCELLATO**

**NUOVA IMPLEMENTAZIONE CORRETTA:**

| ID | Task | Descrizione | Stato |
| :--- | :--- | :--- | :--- |
| **NEW-01** | Analizzare transformer scritture contabili | Identificare dove e come il transformer cerca di collegare clienti/fornitori e perché fallisce. | `pending` |
| **NEW-02** | Implementare logica di ricerca intelligente | Modificare il transformer per distinguere tra conti normali (cerca in `Conto`) e conti anagrafiche (cerca in `Cliente`/`Fornitore`). | `pending` |
| **NEW-03** | Identificare pattern conti anagrafiche | Stabilire come riconoscere quando un conto è un cliente/fornitore (es. dal prefisso, dal range di codici, ecc.). | `pending` |
| **NEW-04** | Testare importazione scritture contabili | Verificare che l'importazione delle scritture contabili funzioni correttamente dopo le modifiche. | `pending` |
| **NEW-05** | Documentare nuova logica | Aggiornare la documentazione per spiegare la logica di ricerca per anagrafiche vs piano dei conti. | `pending` |

**TASK ORIGINALI - CANCELLATE:**
| ID | Task | Stato |
| :--- | :--- | :--- |
| ~~**IM-01** a **IM-07**~~ | ~~Approccio sbagliato - duplicazione anagrafiche in piano dei conti~~ | `cancelled` | 