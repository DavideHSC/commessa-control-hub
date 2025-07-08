# Piano di Analisi e Risoluzione per il Sistema di Parsing Duale

**Data:** 02/08/2024
**Autore:** Gemini AI
**Stato:** In Analisi

## 1. Sommario Esecutivo

Il sistema di importazione dati sta affrontando una criticità dovuta all'introduzione di un nuovo formato di esportazione dati da un sistema esterno. L'implementazione attuale, che tenta di supportare sia il vecchio che il nuovo formato, è instabile: il nuovo flusso di importazione non processa correttamente i dati (problemi di associazione delle causali), mentre il vecchio flusso causa un crash dell'applicazione.

L'obiettivo di questo piano è analizzare in modo strutturato le cause dei problemi, definire una strategia di risoluzione chiara e implementare una soluzione robusta che permetta di gestire entrambi i formati di importazione in modo affidabile e isolato.

## 2. Problemi Evidenziati

1.  **Fallimento del Nuovo Parser:** Il nuovo parser per il piano dei conti, pur processando il file, porta a errori a valle nell'assemblaggio dei movimenti contabili, specificamente nel riconoscimento delle causali.
2.  **Incertezza sulla Struttura dei Movimenti Contabili:** I 4 file relativi ai movimenti contabili, generati insieme al nuovo piano dei conti, hanno gli stessi nomi dei precedenti, ma la loro struttura non è stata verificata. Attualmente vengono processati dal parser esistente, il che potrebbe essere la causa principale del problema #1.
3.  **Instabilità del Sistema "Duale":** Il tentativo di far coesistere due logiche di parsing ha reso il sistema instabile. L'utilizzo del vecchio parser, che prima funzionava, ora porta a un crash inaspettato.

## 3. Piano D'azione

### Fase 1: Analisi e Raccolta Informazioni (Bloccante)

| ID | Task | Stato | Note |
| --- | --- | --- | --- |
| **1.1** | **Raccolta Tracciati e File Dati** | ⏳ **In Attesa** | **BLOCCANTE** - In attesa di ricevere i file e i tracciati dall'utente. |
| **1.2** | Analisi Codebase: Importazione Piano dei Conti | ⬜ Pending | Identificare i parser, il selettore di logica e le cause del crash. |
| **1.3** | Analisi Codebase: Importazione Movimenti | ⬜ Pending | Mappare il flusso, verificare il parser usato, analizzare il join con le causali. |
| **1.4** | Creazione Documento di Analisi | ⬜ Pending | Iniziare a documentare i risultati in `@/analysis/dual_parser_system_analysis.md`. |

### Fase 2: Strategia di Risoluzione e Implementazione

| ID | Task | Stato | Note |
| --- | --- | --- | --- |
| **2.1** | Progettazione Selettore di Strategia | ⬜ Pending | Definire un pattern (es. Strategy Pattern) per selezionare il flusso corretto. |
| **2.2** | Refactoring/Correzione Parser Piano dei Conti | ⬜ Pending | Stabilizzare il vecchio parser e correggere/finalizzare il nuovo. |
| **2.3** | Refactoring/Correzione Parser Movimenti | ⬜ Pending | Creare un nuovo parser se necessario, o correggere la logica di lookup. |
| **2.4** | Integrazione e Test Flusso "Vecchio" | ⬜ Pending | Testare l'importazione del vecchio formato end-to-end. |
| **2.5** | Integrazione e Test Flusso "Nuovo" | ⬜ Pending | Testare l'importazione del nuovo formato end-to-end. |

### Fase 3: Documentazione

| ID | Task | Stato | Note |
| --- | --- | --- | --- |
| **3.1** | Finalizzazione Documento di Analisi | ⬜ Pending | Completare il file in `@/analysis` con tutte le scoperte. |
| **3.2** | Aggiornamento Documentazione di Progetto | ⬜ Pending | Aggiornare la documentazione utente/tecnica se necessario. |

## 4. Prerequisiti (Input dall'Utente)

Per avviare la **Fase 1**, è indispensabile ricevere i seguenti materiali:

1.  **Formato "Vecchio":**
    *   File di esempio del **Piano dei Conti**.
    *   Il **tracciato record** corrispondente al Piano dei Conti.
    *   Il set di **4 file di esempio** per i movimenti contabili.
    *   I **tracciati record** corrispondenti ai 4 file dei movimenti.

2.  **Formato "Nuovo":**
    *   File di esempio del **Piano dei Conti** (quello con colonne aggiuntive).
    *   Il **tracciato record** corrispondente al nuovo Piano dei Conti.
    *   Il set di **4 file di esempio** per i movimenti contabili.
    *   I **tracciati record** corrispondenti ai 4 file dei movimenti. 