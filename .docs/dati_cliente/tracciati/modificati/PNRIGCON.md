# PNRIGCON.TXT - Tracciato Prima Nota Righe Contabili

**Data**: 19/09/2012  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 312 Bytes + CRLF = 314 Bytes  
**Nome File**: PNRIGCON.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 4         | Codice univoco di scaricamento della prima nota |

> **Nota**: È il codice univoco di scaricamento della prima nota a cui fanno riferimento i righi Contabili.

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------------- | ---- | --------- | --------- | ----------------------- |
| **PROGRESSIVO NUMERO RIGO** | N    | 3         | 16        | Progressivo numero rigo |

> **Nota**: Da utilizzare solamente per movimenti relativi agli Studi di Settore e per quelli analitici.

| Campo          | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------- | ---- | --------- | --------- | ---------------------- |
| **TIPO CONTO** | A    | 1         | 19        | Tipo conto             |
|                |      |           |           | • (vuoto) = Sottoconto |
|                |      |           |           | • C = Cliente          |
|                |      |           |           | • F = Fornitore        |

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                         |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **CLIENTE/FORNITORE CODICE FISCALE**    | A    | 16        | 20        | Codice fiscale cliente/fornitore    |
| **CLIENTE/FORNITORE SUBCODICE FISCALE** | A    | 1         | 36        | Subcodice fiscale cliente/fornitore |
| **CLIENTE/FORNITORE SIGLA**             | A    | 12        | 37        | Sigla cliente/fornitore             |

> **Nota**: L'identificazione del cliente/fornitore può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data al codice fiscale.

> **Nota**: I dati del cliente/fornitore non vengono considerati se Tipo Conto ≠ Cliente o Fornitore.

| Campo     | Tipo | Lunghezza | Posizione | Descrizione  |
| --------- | ---- | --------- | --------- | ------------ |
| **CONTO** | A    | 10        | 49        | Codice conto |

> **Nota**: Il codice conto non viene considerato se Tipo Conto = Cliente o Fornitore.

| Campo             | Tipo | Lunghezza | Posizione | Descrizione   |
| ----------------- | ---- | --------- | --------- | ------------- |
| **IMPORTO DARE**  | N    | 12        | 59        | Importo dare  |
| **IMPORTO AVERE** | N    | 12        | 71        | Importo avere |

> **Nota**: L'importo dare e l'importo avere sono alternativi quindi se è presente l'importo dare non viene portato l'importo avere.

| Campo    | Tipo | Lunghezza | Posizione | Descrizione |
| -------- | ---- | --------- | --------- | ----------- |
| **NOTE** | A    | 60        | 83        | Note        |

## Dati Competenza Contabile

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                            |
| --------------------------------------- | ---- | --------- | --------- | -------------------------------------- |
| **INS. DATI COMPETENZA CONTABILE(0/1)** | N    | 1         | 143       | Indicatore inserimento dati competenza |

> **Nota**: Indicare 1 se sono presenti le date di competenza e compilare i dati successivi.

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **DATA INIZIO COMPETENZA** | N    | 8         | 144       | Data inizio competenza |
| **DATA FINE COMPETENZA**   | N    | 8         | 152       | Data fine competenza   |
| **NOTE DI COMPETENZA**     | A    | 60        | 160       | Note di competenza     |

## Campi Facoltativi

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                   |
| ----------------------------------- | ---- | --------- | --------- | ----------------------------- |
| **DATA REGISTRAZIONE APERTURA**     | N    | 8         | 220       | Data registrazione apertura   |
| **CONTO DA RILEVARE (MOVIMENTO 1)** | A    | 10        | 228       | Conto da rilevare movimento 1 |
| **CONTO DA RILEVARE (MOVIMENTO 2)** | A    | 10        | 238       | Conto da rilevare movimento 2 |

## Dati Movimenti Analitici

| Campo                                  | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **INS. DATI MOVIMENTI ANALITICI(0/1)** | N    | 1         | 248       | Indicatore inserimento dati movimenti analitici |

> **Nota**: Indicare 1 se sono presenti i centri di costo collegati alla prima nota e compilare i dati successivi e il file MOVANAC.TXT.

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **DATA INIZIO COMPETENZA** | N    | 8         | 249       | Data inizio competenza |
| **DATA FINE COMPETENZA**   | N    | 8         | 257       | Data fine competenza   |

## Dati Studi di Settore

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                               |
| ----------------------------------- | ---- | --------- | --------- | ----------------------------------------- |
| **INS. DATI STUDI DI SETTORE(0/1)** | N    | 1         | 265       | Indicatore inserimento dati studi settore |

> **Nota**: Indicare 1 se sono associati studi di settore alla prima nota e compilare i dati successivi e il file RIGSTUDI.TXT.

| Campo                     | Tipo | Lunghezza | Posizione | Descrizione           |
| ------------------------- | ---- | --------- | --------- | --------------------- |
| **STATO MOVIMENTO STUDI** | A    | 1         | 266       | Stato movimento studi |
|                           |      |           |           | • G = Generato        |
|                           |      |           |           | • M = Manuale         |

## **_ Fine Vecchio Tracciato _**

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                    |
| ---------------------------------- | ---- | --------- | --------- | ------------------------------ |
| **ESERCIZIO DI RILEVANZA FISCALE** | A    | 5         | 267       | Esercizio di rilevanza fiscale |

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                         |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **DETTAGLIO CLI/FOR CODICE FISCALE**    | A    | 16        | 272       | Codice fiscale dettaglio cli/for    |
| **DETTAGLIO CLI/FOR SUBCODICE FISCALE** | A    | 1         | 288       | Subcodice fiscale dettaglio cli/for |
| **DETTAGLIO CLI/FOR SIGLA**             | A    | 12        | 289       | Sigla dettaglio cli/for             |

> **Nota**: L'identificazione del dettaglio cli/for può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data al codice fiscale.

## ------------------------------------------

## Nuovo Tracciato da Release 9.9.3

## ------------------------------------------

| Campo           | Tipo | Lunghezza | Posizione | Descrizione |
| --------------- | ---- | --------- | --------- | ----------- |
| **SIGLA CONTO** | A    | 12        | 301       | Sigla conto |

> **Nota**: La sigla conto viene utilizzata per identificare il conto da inserire in prima nota quando non è stato indicato il CONTO (progressivo 49).

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 313       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato PNRIGCON.TXT_
