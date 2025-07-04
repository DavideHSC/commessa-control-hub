# Piano di Lavoro 12: Revisione e Allineamento Strategia `externalId`

**Data:** 2024-07-03

**Autore:** Gemini

**Stato:** Da Iniziare

## 1. Obiettivo

Il campo `externalId` è la chiave per garantire importazioni idempotenti e affidabili. Questa revisione ha lo scopo di verificare che, per ogni entità importata da file esterni, stiamo utilizzando la "chiave naturale" più robusta e immutabile disponibile nel sistema di origine come valore per `externalId`.

L'obiettivo è standardizzare questo approccio per prevenire la creazione di dati duplicati e garantire la coerenza a lungo termine.

## 2. Entità da Analizzare

| ID | Task di Revisione | Entità Target | File Sorgente Dati | Stato | Risultato / Azioni Richieste |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REV-01** | Verifica `externalId` per **Anagrafica Cli/For** | `Cliente`, `Fornitore`, `Conto` | `A_CLIFOR.TXT` | `completed` | **Confermato:** La chiave corretta è il `SOTTOCONTO`, che verrà usato come `externalId` per la tabella `Conto`. |
| **REV-02** | Verifica `externalId` per **Piano dei Conti** | `Conto` | `CONTIGEN.TXT` | `completed` | **Confermato:** La chiave corretta è la `CODIFICA` del conto. |
| **REV-03** | Verifica `externalId` per **Causali Contabili** | `CausaleContabile` | `CAUSALI.TXT` | `pending` | |
| **REV-04** | Verifica `externalId` per **Codici IVA** | `CodiceIva` | `TABIVA.TXT` | `pending` | |
| **REV-05** | Verifica `externalId` per **Condizioni Pagamento** | `CondizionePagamento` | `PAGAMENT.TXT` | `pending` | |
| **REV-06** | Verifica `externalId` per **Scritture Contabili** | `ScritturaContabile` | `PNTESTA.TXT` | `pending` | |

## 3. Piano d'Azione

Per ogni task `pending`:
1.  **Analizzare il tracciato record:** Esaminare la documentazione del file sorgente per identificare quale campo (o combinazione di campi) agisce da chiave primaria nel sistema di origine (es. un "codice causale" vs. la "descrizione causale").
2.  **Verificare l'implementazione:** Controllare il `transformer` e il `workflow` di importazione corrispondenti per vedere quale campo viene attualmente mappato su `externalId`.
3.  **Allineare (se necessario):** Se l'implementazione non usa la chiave più robusta, creare un nuovo task di refactoring per correggerla. 