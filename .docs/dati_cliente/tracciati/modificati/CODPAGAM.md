# CODPAGAM.TXT - Tracciato Condizioni di Pagamento

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 68 Bytes + CRLF = 70 Bytes  
**Nome File**: CODPAGAM.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione                |
| --------------------------- | ---- | --------- | --------- | -------------------------- |
| **TABELLA ITALSTUDIO**      | A    | 1         | 4         | Campo riservato Italstudio |
| **CODICE PAGAMENTO**        | A    | 8         | 5         | Codice pagamento           |
| **DESCRIZIONE**             | A    | 40        | 13        | Descrizione                |
| **CONTO INCASSO/PAGAMENTO** | A    | 10        | 53        | Conto incasso/pagamento    |

> **Nota**: Campo riservato Italstudio - non indicare nulla.

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                        |
| ---------------------------------- | ---- | --------- | --------- | ---------------------------------- |
| **CALCOLA CON GIORNI COMMERCIALI** | A    | 1         | 63        | Calcola con giorni commerciali (X) |
| **CONSIDERA PERIODI DI CHIUSURA**  | A    | 1         | 64        | Considera periodi di chiusura (X)  |

| Campo            | Tipo | Lunghezza | Posizione | Descrizione             |
| ---------------- | ---- | --------- | --------- | ----------------------- |
| **SUDDIVISIONE** | A    | 1         | 65        | Suddivisione            |
|                  |      |           |           | • D = Dettaglio importi |
|                  |      |           |           | • T = Totale documento  |

| Campo               | Tipo | Lunghezza | Posizione | Descrizione              |
| ------------------- | ---- | --------- | --------- | ------------------------ |
| **INIZIO SCADENZA** | A    | 1         | 66        | Inizio scadenza          |
|                     |      |           |           | • D = Data documento     |
|                     |      |           |           | • F = Fine Mese          |
|                     |      |           |           | • R = Data registrazione |
|                     |      |           |           | • P = Data registro IVA  |
|                     |      |           |           | • N = Non determinata    |

| Campo           | Tipo | Lunghezza | Posizione | Descrizione |
| --------------- | ---- | --------- | --------- | ----------- |
| **NUMERO RATE** | N    | 2         | 67        | Numero rate |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 69        | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato CODPAGAM.TXT_
