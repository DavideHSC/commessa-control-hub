**Il ruolo centrale del Piano dei Conti (`CONTIGEN.TXT`)**

In un sistema contabile strutturato, il **Piano dei Conti (`CONTIGEN.TXT`)** è l'elemento architetturale portante. Non è semplicemente una delle tabelle, ma la spina dorsale che collega ogni operazione. Ogni anagrafica e ogni movimento contabile ha senso solo in relazione a un conto specifico.

**La relazione fondamentale è sempre `Anagrafica -> Conto <- Movimento`.**

Ecco come i file interagiscono secondo questo principio:

1.  **`CONTIGEN.TXT` (Piano dei Conti):**
    *   **Scopo:** Definire **tutti** i conti e sottoconti disponibili nel sistema.
    *   **Campo Chiave:** `CODIFICA SOTTO CONTO` (pos. 1). Questa è la chiave primaria che identifica univocamente un record nel piano dei conti.

2.  **`A_CLIFOR.TXT` (Anagrafica Clienti/Fornitori):**
    *   **Scopo:** Arricchire e specializzare i conti di tipo "Cliente" e "Fornitore" con informazioni anagrafiche dettagliate (ragione sociale, partita IVA, indirizzo, ecc.).
    *   **Campo Chiave di Relazione:** `SOTTOCONTO CLIENTE` (pos. 51) o `SOTTOCONTO FORNITORE` (pos. 61). Il valore in questo campo **corrisponde esattamente** al `CODIFICA SOTTO CONTO` presente in `CONTIGEN.TXT`.

3.  **`PNTESTA.TXT` / `PNRIGCON.TXT` (Movimenti Contabili):**
    *   **Scopo:** Registrare le operazioni contabili (fatture, pagamenti, ecc.).
    *   **Campo Chiave di Relazione:** `SOTTOCONTO` (es. `SOTTOCONTO DARE` e `SOTTOCONTO AVERE` in `PNRIGCON.TXT`). Anche in questo caso, il valore **corrisponde esattamente** al `CODIFICA SOTTO CONTO` del piano dei conti.

### Il Meccanismo di Collegamento Corretto

Il collegamento non avviene tramite codici fiscali o sigle, ma direttamente tramite il **codice del sottoconto**.

| File Sorgente (Arricchimento) | Campo Chiave in `A_CLIFOR.TXT` | Tabella Centrale (Master) | Campo Chiave in `CONTIGEN.TXT` | File Transazione | Campo Chiave nei Movimenti |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `A_CLIFOR.TXT` | `SOTTOCONTO FORNITORE` | `CONTIGEN.TXT` | `CODIFICA SOTTO CONTO` | `PNRIGCON.TXT` | `SOTTOCONTO DARE/AVERE` |
| `A_CLIFOR.TXT` | `SOTTOCONTO CLIENTE` | `CONTIGEN.TXT` | `CODIFICA SOTTO CONTO` | `PNRIGCON.TXT` | `SOTTOCONTO DARE/AVERE` |

### Ruolo degli Identificatori Secondari (Sigla, Codice Fiscale)

La `CODICE ANAGRAFICA` (sigla) e il `CODICE FISCALE` sono **attributi** dell'anagrafica, non la chiave della relazione contabile. Servono a:
*   Fornire un identificatore alternativo e più leggibile per l'utente.
*   Potenzialmente, fungere da meccanismo di "ricerca" per risalire al conto corretto in interfacce utente o report.

Tuttavia, la coerenza strutturale del database è garantita **esclusivamente** dalla relazione basata sul codice del sottoconto.

### Flusso Logico Corretto

1.  **Importazione Piano dei Conti:** Il file `CONTIGEN.TXT` viene importato per primo, popolando la tabella `Conto`. Questa tabella conterrà tutti i conti, inclusi quelli generici per Clienti e Fornitori (es. `2010000070`).
2.  **Importazione Anagrafiche:** Durante l'importazione di `A_CLIFOR.TXT`, il sistema deve:
    *   Leggere il `SOTTOCONTO FORNITORE` (es. `2010000070`).
    *   Cercare questo codice nella tabella `Conto`.
    *   **Aggiornare** il record del conto esistente con le informazioni anagrafiche, come la `RAGIONE SOCIALE` ("PULIRAPID DI VENANZIO...").
    *   In parallelo, può salvare i dati anagrafici completi nella tabella `Fornitore`, mantenendo il riferimento al codice conto.
3.  **Importazione Movimenti:** Quando si importa una riga da `PNRIGCON.TXT` che usa il sottoconto `2010000070`, il sistema si collega direttamente al record corrispondente nella tabella `Conto`, che ora contiene la descrizione corretta e tutti i dati associati.

In sintesi, la precedente analisi che metteva la `sigla` come metodo primario era errata. **Il perno di tutto è il codice del conto.**

