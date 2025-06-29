**Per A_CLIFOR.TXT, ci sono campi chiave specifici progettati per relazionarsi con i movimenti contabili.**

I movimenti contabili (descritti in `PNTESTA.TXT` e `PNRIGCON.TXT`) e l'anagrafica clienti/fornitori (`A_CLIFOR.TXT`) sono le due facce della stessa medaglia in un sistema contabile: l'anagrafica è il "chi", mentre il movimento è il "cosa" e il "quando". Devono essere collegati.

Ecco i campi che stabiliscono questa relazione:

### I Campi Chiave di Correlazione

Esistono due meccanismi principali per collegare un movimento contabile a un'anagrafica, e i tracciati li supportano entrambi, specificando anche una gerarchia di priorità.

#### Meccanismo 1: Collegamento tramite Codice Fiscale (Metodo Primario)

Questo è il metodo più robusto e affidabile, perché basato su un identificativo univoco a livello nazionale.

| File Anagrafica (Master) | Campo Chiave in `A_CLIFOR.TXT` | File Movimenti (Transaction) | Campo Chiave in `PNTESTA.TXT` e `PNRIGCON.TXT` |
| :--- | :--- | :--- | :--- |
| `A_CLIFOR.TXT` | `CODICE FISCALE CLIENTE/FORNITORE` (pos. 33) | `PNTESTA.TXT` | `CLIENTE/FORNITORE CODICE FISCALE` (pos. 100) |
| `A_CLIFOR.TXT` | `SUBCODICE CLIENTE/FORNITORE` (pos. 49) | `PNTESTA.TXT` | `CLIENTE/FORNITORE SUBCODICE FISCALE` (pos. 116) |
| `A_CLIFOR.TXT` | `CODICE FISCALE CLIENTE/FORNITORE` (pos. 33) | `PNRIGCON.TXT` | `CLIENTE/FORNITORE CODICE FISCALE` (pos. 20) |
| `A_CLIFOR.TXT` | `SUBCODICE CLIENTE/FORNITORE` (pos. 49) | `PNRIGCON.TXT` | `CLIENTE/FORNITORE SUBCODICE FISCALE` (pos. 36) |

#### Meccanismo 2: Collegamento tramite Sigla/Codice Interno (Metodo Secondario)

Questo metodo usa un codice mnemonico o una sigla definita dall'utente. È utile quando un codice fiscale non è disponibile (es. soggetti esteri) o per semplicità d'uso.

| File Anagrafica (Master) | Campo Chiave in `A_CLIFOR.TXT` | File Movimenti (Transaction) | Campo Chiave in `PNTESTA.TXT` e `PNRIGCON.TXT` |
| :--- | :--- | :--- | :--- |
| `A_CLIFOR.TXT` | `CODICE ANAGRAFICA` (pos. 71) | `PNTESTA.TXT` | `CLIENTE/FORNITORE SIGLA` (pos. 117) |
| `A_CLIFOR.TXT` | `CODICE ANAGRAFICA` (pos. 71) | `PNRIGCON.TXT` | `CLIENTE/FORNITORE SIGLA` (pos. 37) |

### Gerarchia e Precedenza

Come si capisce quale metodo usare? I tracciati dei movimenti contabili lo specificano chiaramente. Ad esempio, nella descrizione del file `PNTESTA.TXT` si legge:

> L'identificazione del cliente/fornitore puo' essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. **La preminenza viene comunque data al codice fiscale.**

Questo significa che un software di importazione deve:
1.  **Prima cercare** di collegare il movimento usando il **Codice Fiscale**.
2.  **Se il Codice Fiscale non viene trovato** o non è presente nel file di movimento, deve **usare la Sigla** come meccanismo di fallback per trovare l'anagrafica corretta.

### Esempio Pratico del Flusso di Dati

Immagina questo scenario:

1.  **Creazione Anagrafica:**
    *   Viene creato un record nel file `A_CLIFOR.TXT` per il fornitore "Rossi Elettricità S.R.L.".
    *   In questo record, il `CODICE FISCALE CLIENTE/FORNITORE` sarà `12345678901` e il `CODICE ANAGRAFICA` (la sigla) sarà `ROSSIELET`.

2.  **Registrazione Fattura:**
    *   Si deve registrare una fattura di acquisto da questo fornitore.
    *   Viene creato un record in `PNTESTA.TXT`. All'interno di questa riga, nei campi dedicati, si inserirà:
        *   `CLIENTE/FORNITORE CODICE FISCALE`: `12345678901`
        *   `CLIENTE/FORNITORE SIGLA`: `ROSSIELET`
    *   Vengono create le righe contabili corrispondenti in `PNRIGCON.TXT`. Una di queste righe (quella per il debito verso il fornitore) avrà `TIPO CONTO` = 'F' e, di nuovo, i campi `CLIENTE/FORNITORE CODICE FISCALE` e `SIGLA` valorizzati.

3.  **Collegamento dei Dati:**
    *   Quando il software di contabilità importa questi file, legge il record di `PNTESTA.TXT`.
    *   Vede il Codice Fiscale `12345678901` e lo usa per cercare la corrispondenza nel file/tabella delle anagrafiche (`A_CLIFOR.TXT`).
    *   Trovata l'anagrafica, il sistema può accedere a tutti gli altri dati (come il sottoconto fornitore `SOTTOCONTO FORNITORE`, le condizioni di pagamento `CODICE INC./PAG. FORNITORE`, se è soggetto a ritenuta, etc.) e usarli per completare correttamente la registrazione contabile senza doverli specificare ogni volta.

In sintesi, la relazione è fondamentale e ben definita, garantendo l'integrità e la coerenza dei dati tra le anagrafiche e i movimenti.

