# MOVANAC.TXT - Tracciato Movimenti Analitici

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 34 Bytes + CRLF = 36 Bytes  
**Nome File**: MOVANAC.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 4         | Codice univoco di scaricamento della prima nota |

> **Nota**: È il codice univoco di scaricamento della prima nota a cui sono associati i centri di costo.

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                              |
| ------------------------------------- | ---- | --------- | --------- | ---------------------------------------- |
| **PROGRESSIVO NUMERO RIGO CONTABILE** | N    | 3         | 16        | Numero di riferimento del rigo contabile |

> **Nota**: È il numero di riferimento del rigo contabile al quale associare i centri relativi ai movimenti analitici.

| Campo               | Tipo | Lunghezza | Posizione | Descrizione     |
| ------------------- | ---- | --------- | --------- | --------------- |
| **CENTRO DI COSTO** | A    | 4         | 19        | Centro di costo |
| **PARAMETRO**       | N    | 12        | 23        | Parametro       |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 35        | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato MOVANAC.TXT_
