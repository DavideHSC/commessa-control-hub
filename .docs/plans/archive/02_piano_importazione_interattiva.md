# Piano Operativo: Importazione Scritture con Riconciliazione Interattiva

Questo documento descrive l'evoluzione del processo di importazione delle scritture contabili, passando da un flusso puramente automatico a un **modello ibrido**. Questo nuovo approccio combina la velocità dell'automazione con la flessibilità e il controllo dell'intervento manuale, requisito fondamentale per gestire le casistiche di allocazione complesse (multi-commessa, importi parziali, percentuali).

---

## Principio Guida Fondamentale: Il "Test di Impatto"

**Regola d'Oro:** Prima di scrivere o modificare qualsiasi riga di codice che interagisce con i dati (schema del database, logica di business, API), è obbligatorio eseguire un'analisi di impatto preliminare.

Questo "test mentale" è un passaggio critico per garantire la coerenza e la stabilità del sistema e deve rispondere alle seguenti domande:

1.  **Interazione e Dipendenze:** In che modo la nuova funzionalità o modifica interagisce con le parti esistenti del sistema? Quali anagrafiche (Conti, Commesse, Clienti) sono necessarie? La modifica dipende da altri moduli o processi?
2.  **Integrità dei Dati:** La modifica rispetta i vincoli del database e la logica di business? Può creare dati orfani, incoerenti o duplicati? Come viene garantita la consistenza dei dati durante il processo?
3.  **Flusso Utente:** L'impatto sull'interfaccia utente è chiaro? La modifica semplifica o complica il lavoro dell'utente? Il flusso di lavoro risultante è logico e intuitivo?
4.  **Rischi e Mitigazione:** Quali sono i potenziali rischi (es. fallimento di un'importazione, dati errati, performance)? Quali strategie di mitigazione verranno adottate (es. transazioni, validazione dei dati, logging dettagliato, test specifici)?

**Questo principio non è opzionale.** È la base per costruire un'applicazione robusta, manutenibile e affidabile, evitando regressioni e problemi in produzione.

---

## Nuovo Flusso di Lavoro Ibrido Proposto

Il processo si evolverà in un flusso di lavoro guidato in tre fasi.

### Fase 1: Importazione e Suggerimento Automatico
L'utente carica i file (`PNTESTA`, `PNRIGCON`, ecc.). Il sistema esegue il parsing e salva i dati in tabelle di staging. In questa fase, il sistema analizza `MOVANAC.TXT` e crea delle **proposte di allocazione**, salvandole in una tabella dedicata.

### Fase 2: Scrivania di Riconciliazione
L'utente viene indirizzato a una nuova interfaccia dedicata. Questa pagina mostra tutte le righe di costo/ricavo importate, evidenziando lo stato di ciascuna:
- **Allocata (Proposta):** Il sistema ha trovato una corrispondenza 1-a-1 e ha generato una proposta.
- **Da Allocare:** La riga è un costo/ricavo ma non ha una proposta automatica.
- **Allocazione Complessa:** Il sistema ha rilevato più righe in `MOVANAC` per la stessa riga contabile.
- **Errore:** Manca un'anagrafica fondamentale (es. il Conto non esiste).

Qui l'utente può:
- **Confermare** le proposte automatiche.
- **Modificare** una proposta errata.
- **Creare** nuove allocazioni da zero attraverso un'interfaccia dedicata, permettendo di suddividere l'importo di una singola riga contabile su **più commesse**, per **importo** o per **percentuale**.

### Fase 3: Consolidamento Finale
Una volta che l'utente è soddisfatto delle allocazioni, avvia il consolidamento. Il sistema legge i dati dallo staging, applica le allocazioni (sia quelle automatiche confermate che quelle manuali) e popola le tabelle di produzione finali (`ScritturaContabile`, `RigaScrittura`, `Allocazione`), garantendo l'integrità referenziale.

---

## Piano di Implementazione Tecnico

1.  **Modifiche al Database (`prisma/schema.prisma`)**
    -   Creare un nuovo modello `ImportAllocazione` con i seguenti campi:
        -   `id`: String @id
        -   `importScritturaRigaContabileId`: Relazione con `ImportScritturaRigaContabile`.
        -   `commessaId`: L'ID della commessa a cui allocare.
        -   `importo`: Float
        -   `percentuale`: Float?
        -   `suggerimentoAutomatico`: Boolean (per distinguere le proposte del sistema dalle modifiche manuali).
    -   Rimuovere i campi `centroDiCosto` e `importoAnalitico` da `ImportScritturaRigaContabile`.
    -   Aggiungere una relazione uno-a-molti da `ImportScritturaRigaContabile` a `ImportAllocazione`.

2.  **Sviluppo del Backend (`server/`)**
    -   **Logica di Importazione (Staging):** Modificare la rotta `POST /api/import/scritture` per popolare i modelli di staging, inclusa la nuova tabella `ImportAllocazione` con i suggerimenti da `MOVANAC.TXT`.
    -   **Nuove API per la Riconciliazione:**
        -   `GET /api/staging/rows`: Fornisce i dati per la Scrivania di Riconciliazione.
        -   `POST /api/staging/allocations`: API per creare, modificare ed eliminare record in `ImportAllocazione`, usata dall'interfaccia di allocazione manuale.
    -   **Logica di Consolidamento:** Riscrivere l'endpoint `POST /api/consolidate-scritture`. Ora dovrà leggere le allocazioni dalla tabella `ImportAllocazione` per creare i record finali.

3.  **Sviluppo del Frontend (`src/`)**
    -   **Nuova Pagina:** Creare la pagina `Riconciliazione.tsx` e la relativa rotta.
    -   **Tabella di Riconciliazione:** Componente React che mostra le righe da allocare, con stati e azioni.
    -   **Modale di Allocazione:** Un componente popup riutilizzabile che permette all'utente di gestire le allocazioni multiple per una singola riga di costo/ricavo, con validazione in tempo reale (es. la somma non deve superare il 100% o l'importo totale).
    -   **Integrazione API:** Collegare i componenti del frontend alle nuove API del backend.

Questo piano trasforma l'importazione in un processo interattivo, potente e a prova di errore, mettendo l'utente al centro del controllo dei dati. 