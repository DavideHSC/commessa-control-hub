# Piano di Documentazione del Backend

**ID:** `PLAN-20`
**Data:** 09 Agosto 2025
**Stato:** 🚧 **IN CORSO**
**Obiettivo:** Documentare in modo sistematico l'intera codebase del backend situata nella cartella `server/`. Per ogni cartella, verrà creato un file `README.md` che descrive lo scopo della cartella, elenca i file e le sottocartelle contenute, e fornisce una breve descrizione per ogni elemento.

---

## Modus Operandi

1.  **Analisi Ricorsiva:** Il processo seguirà la struttura delle cartelle in modo ricorsivo.
2.  **Creazione `README.md`:** Per ogni cartella verrà generato un file `README.md`.
3.  **Contenuto dei README:**
    *   **Scopo della Cartella:** Una breve descrizione della responsabilità principale della cartella.
    *   **Struttura:** Elenchi puntati per i file e le sottocartelle.
    *   **Descrizione File:** Per ogni file, una descrizione sintetica del suo ruolo e delle sue funzionalità principali.
    *   **Diagrammi (Opzionale):** Dove utile, verranno aggiunti diagrammi Mermaid per illustrare flussi complessi.

---

## Piano di Esecuzione

| ID Task  | Cartella da Documentare                                | Stato       |
| :------- | :----------------------------------------------------- | :---------- |
| **DOC-01** | `server/`                                              | 🚧 **In Corso** |
| **DOC-02** | `server/import-engine/`                                | 📋 Da fare   |
| **DOC-03** | `server/import-engine/acquisition/`                    | 📋 Da fare   |
| **DOC-04** | `server/import-engine/acquisition/definitions/`        | 📋 Da fare   |
| **DOC-05** | `server/import-engine/acquisition/generators/`         | 📋 Da fare   |
| **DOC-06** | `server/import-engine/acquisition/parsers/`            | 📋 Da fare   |
| **DOC-07** | `server/import-engine/acquisition/validators/`         | 📋 Da fare   |
| **DOC-08** | `server/import-engine/core/`                           | 📋 Da fare   |
| **DOC-09** | `server/import-engine/core/jobs/`                      | 📋 Da fare   |
| **DOC-10** | `server/import-engine/core/telemetry/`                 | 📋 Da fare   |
| **DOC-11** | `server/import-engine/core/types/`                     | 📋 Da fare   |
| **DOC-12** | `server/import-engine/orchestration/`                  | 📋 Da fare   |
| **DOC-13** | `server/import-engine/orchestration/handlers/`         | 📋 Da fare   |
| **DOC-14** | `server/import-engine/orchestration/workflows/`        | 📋 Da fare   |
| **DOC-15** | `server/import-engine/persistence/`                    | 📋 Da fare   |
| **DOC-16** | `server/import-engine/persistence/dlq/`                | 📋 Da fare   |
| **DOC-17** | `server/import-engine/transformation/`                 | 📋 Da fare   |
| **DOC-18** | `server/import-engine/transformation/decoders/`        | 📋 Da fare   |
| **DOC-19** | `server/lib/`                                          | 📋 Da fare   |
| **DOC-20** | `server/lib/importers/`                                | 📋 Da fare   |
| **DOC-21** | `server/routes/`                                       | 📋 Da fare   |
| **DOC-22** | `server/routes/v2/`                                    | 📋 Da fare   |
| **DOC-23** | `server/types/`                                        | 📋 Da fare   | 