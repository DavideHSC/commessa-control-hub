# Tracciati Record Definitivi

Questo file contiene le definizioni corrette e verificate dei tracciati record per l'importazione dei file ASCII. Funge da unica fonte di verità per la scrittura dei parser.

---

## Mappa dei File di Importazione

Questa sezione riassume i file utilizzati per l'importazione e il loro scopo, come descritto nel documento `Import_Export file ascii.txt`.

### Scritture Contabili (Prima Nota)
La chiave di collegamento tra questi file è il `CODICE UNIVOCO DI SCARICAMENTO`.
- `PNTESTA.TXT`: Testate delle registrazioni di prima nota.
- `PNRIGCON.TXT`: Righe contabili (costi/ricavi/patrimoniali).
- `PNRIGIVA.TXT`: Righe IVA associate alle registrazioni.
- `MOVANAC.TXT`: Dettagli di allocazione analitica (Centri di Costo) per le righe contabili.
- `PNRATE.TXT`: Rate di pagamento.
- ... e altri file facoltativi non utilizzati in questo progetto.

### Anagrafiche di Base (Tabelle)
- `A_CLIFOR.TXT` o `CLIFOR.TXT`: Anagrafica Clienti e Fornitori.
- `CONTIGEN.TXT`: Piano dei Conti generale.
- `CAUSALI.TXT`: Causali Contabili.
- `CODICIVA.TXT`: Codici IVA.
- `CODPAGAM.TXT`: Condizioni di Pagamento.
- ... e altri file di dettaglio associati.

---

## `PNRIGIVA.TXT`

- **Nome File**: PNRIGIVA.TXT
- **Lunghezza Fissa**: 173 Bytes + CRLF

| Campo                         | Start (1-based) | Lunghezza | Tipo   | Note                                   |
| ----------------------------- | --------------- | --------- | ------ | -------------------------------------- |
| `codiceUnivocoScaricamento`   | 4               | 12        | String | Codice univoco della testata prima nota|
| `codiceIva`                   | 16              | 4         | String | Deve esistere nella tabella Codici Iva |
| `contropartita`               | 20              | 10        | String | Sottoconto                             |
| `imponibile`                  | 30              | 12        | Numero |                                        |
| `imposta`                     | 42              | 12        | Numero |                                        |
| `impostaIntrattenimenti`      | 54              | 12        | Numero |                                        |
| `imponibile50CorrNonCons`     | 66              | 12        | Numero |                                        |
| `impostaNonConsiderata`       | 78              | 12        | Numero |                                        |
| `importoLordo`                | 90              | 12        | Numero | In alternativa ai campi precedenti     |
| `note`                        | 102             | 60        | String |                                        |
| `siglaContropartita`          | 162             | 12        | String | Usata se `contropartita` è vuoto       | 

---

## `PNRIGCON.TXT`

- **Nome File**: PNRIGCON.TXT
- **Lunghezza Fissa**: 312 Bytes + CRLF

| Campo                         | Start (1-based) | Lunghezza | Tipo   | Note                                                                       |
| ----------------------------- | --------------- | --------- | ------ | -------------------------------------------------------------------------- |
| `codiceUnivocoScaricamento`   | 4               | 12        | String | Codice univoco della testata prima nota                                    |
| `progressivoNumeroRigo`       | 16              | 3         | Number | Progressivo del rigo (usato per studi di settore e analitici)              |
| `tipoConto`                   | 19              | 1         | String | 'C' = Cliente, 'F' = Fornitore, altrimenti conto generico                  |
| `codiceFiscaleClienteFornitore` | 20              | 16        | String | Codice Fiscale del cliente/fornitore (usato se `tipoConto` è 'C' o 'F')    |
| `siglaClienteFornitore`       | 37              | 12        | String | Sigla del cliente/fornitore (alternativa al codice fiscale)                |
| `conto`                       | 49              | 10        | String | Codice del conto (usato se `tipoConto` non è 'C' o 'F')                    |
| `importoDare`                 | 59              | 12        | Number | Importo in DARE (con 2 decimali impliciti)                                 |
| `importoAvere`                | 71              | 12        | Number | Importo in AVERE (con 2 decimali impliciti)                                |
| `note`                        | 83              | 60        | String | Note libere sulla riga                                                     |
| `flagDatiCompetenza`          | 143             | 1         | Number | '1' se sono presenti dati di competenza                                    |
| `dataInizioCompetenza`        | 144             | 8         | Date   | Data inizio competenza (YYYYMMDD)                                          |
| `dataFineCompetenza`          | 152             | 8         | Date   | Data fine competenza (YYYYMMDD)                                            |
| `noteCompetenza`              | 160             | 60        | String | Note relative alla competenza                                              |
| `flagMovimentiAnalitici`      | 248             | 1         | Number | '1' se sono presenti centri di costo (riferimento a `MOVANAC.TXT`)         | 

---

## `PNTESTA.TXT`

- **Nome File**: PNTESTA.TXT
- **Lunghezza Fissa**: 445 Bytes + CRLF

| Campo                         | Start (1-based) | Lunghezza | Tipo   | Note                                                                       |
| ----------------------------- | --------------- | --------- | ------ | -------------------------------------------------------------------------- |
| `codiceFiscaleAzienda`        | 4               | 16        | String | Codice fiscale dell'azienda                                                |
| `codiceUnivocoScaricamento`   | 21              | 12        | String | Codice univoco della registrazione                                         |
| `codiceCausale`               | 40              | 6         | String | Codice della causale contabile                                             |
| `descrizioneCausale`          | 46              | 40        | String | Descrizione (facoltativa)                                                  |
| `dataRegistrazione`           | 86              | 8         | Date   | Data di registrazione (GGMMAAAA)                                           |
| `tipoRegistroIva`             | 96              | 1         | String | 'A' = Acquisti, 'C' = Corrispettivi, 'V' = Vendite                         |
| `codiceFiscaleClienteFornitore` | 100             | 16        | String | Codice fiscale del cliente/fornitore                                       |
| `siglaClienteFornitore`       | 117             | 12        | String | Sigla del cliente/fornitore (alternativa)                                  |
| `dataDocumento`               | 129             | 8         | Date   | Data del documento (GGMMAAAA)                                              |
| `numeroDocumento`             | 137             | 12        | String | Numero del documento                                                       |
| `totaleDocumento`             | 173             | 12        | Number | Totale del documento (con 2 decimali impliciti)                            |
| `noteMovimento`               | 193             | 60        | String | Note della testata                                                         |

| `flagMovimentiAnalitici`      | 248             | 1         | Number | '1' se sono presenti centri di costo (riferimento a `MOVANAC.TXT`)         | 

---

## `MOVANAC.TXT`

- **Nome File**: MOVANAC.TXT
- **Lunghezza Fissa**: 34 Bytes + CRLF

| Campo                         | Start (1-based) | Lunghezza | Tipo   | Note                                                                       |
| ----------------------------- | --------------- | --------- | ------ | -------------------------------------------------------------------------- |
| `codiceUnivocoScaricamento`   | 4               | 12        | String | Codice univoco della testata prima nota                                    |
| `progressivoRigaContabile`    | 16              | 3         | Number | Riferimento al `progressivoNumeroRigo` del file `PNRIGCON.TXT`             |
| `centroDiCosto`               | 19              | 4         | String | Codice del centro di costo/commessa a cui allocare l'importo               |
| `importo`                     | 23              | 12        | Number | Importo da allocare (con 2 decimali impliciti)                             | 

---

## Dati da utilizzare per la Demo

Questa sezione definisce i record specifici da utilizzare per il seeding della demo. La selezione è mirata a mostrare i principali casi d'uso della scrivania di riconciliazione interattiva.

| Caso d'Uso                     | `codiceUnivocoScaricamento` | `progressivoRigaContabile` | Note                                                                                                    | Stato Atteso         |
| ------------------------------ | --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| **Allocazione Complessa (1-a-N)** | `012025110315`              | `2`                        | Una singola riga di costo (`PNRIGCON`) viene allocata su 4 diverse commesse (`MOVANAC`). Perfetto per il test manuale. | Allocazione Complessa|
| **Allocazione Semplice (1-a-1)**  | `012025110008`              | `2`                        | Il sistema suggerisce l'allocazione 1 a 1. L'utente deve solo confermare.                                | Allocata (Proposta)  |
| **Documento con Righe Multiple** | `012025110002`              | `2`, `3`, `4`              | Un documento con 3 righe di costo, ognuna con la sua allocazione semplice. Mostra la gestione di più voci.  | Allocata (Proposta)  |
| **Riga non Allocata**            | `012025110013`              | `2`                        | Una riga di costo presente in `PNRIGCON.TXT` ma senza una corrispondente voce in `MOVANAC.TXT`.            | Da Allocare          | 