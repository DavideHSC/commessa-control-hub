# PNRIGIVA.TXT - Tracciato Prima Nota Righe IVA

**Data**: 19/09/2012  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 173 Bytes + CRLF = 175 Bytes  
**Nome File**: PNRIGIVA.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 4         | Codice univoco di scaricamento della prima nota |

> **Nota**: È il codice univoco di scaricamento della prima nota a cui fanno riferimento i righi IVA.

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------------- | ---- | --------- | --------- | ----------------------- |
| **CODICE IVA**              | A    | 4         | 16        | Codice IVA              |
| **CONTROPARTITA**           | A    | 10        | 20        | Contropartita           |
| **IMPONIBILE**              | N    | 12        | 30        | Imponibile              |
| **IMPOSTA**                 | N    | 12        | 42        | Imposta                 |
| **IMPOSTA INTRATTENIMENTI** | N    | 12        | 54        | Imposta intrattenimenti |

> **Nota**: Il codice IVA deve essere presente in tabella codici IVA.

| Campo                                      | Tipo | Lunghezza | Posizione | Descrizione                                  |
| ------------------------------------------ | ---- | --------- | --------- | -------------------------------------------- |
| **IMPONIBILE 50% CORRISPETTIVI NON CONS.** | N    | 12        | 66        | Imponibile 50% corrispettivi non considerato |

> **Nota**: Va specificato quando sul codice IVA è presente la barratura di "Imponibile 50% dei corrispettivi" normalmente è uguale all'imponibile tranne quando l'imponibile iniziale non è divisibile per 2 e quindi ci sarà una differenza di 1 centesimo.

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------------- | ---- | --------- | --------- | ----------------------- |
| **IMPOSTA NON CONSIDERATA** | N    | 12        | 78        | Imposta non considerata |

> **Nota**: Va specificato quando sul codice IVA è presente la barratura di "Imponibile 50% dei corrispettivi" e contiene l'eventuale differenza fra imposta + imposta intrattenimenti calcolate sull'imponibile originale Imposta + imposta intrattenimenti calcolato sul 50% dell'importo dimezzato.

> **N.B. La somma dei campi:**
>
> - Imponibile
> - Imponibile 50% corr. non cons.
> - Imposta
> - Imposta Intrattenimenti
> - Imposta non considerata
>
> **deve corrispondere all'importo lordo del rigo IVA.**

| Campo             | Tipo | Lunghezza | Posizione | Descrizione   |
| ----------------- | ---- | --------- | --------- | ------------- |
| **IMPORTO LORDO** | N    | 12        | 90        | Importo lordo |

> **Nota**: Questo importo è da utilizzare in alternativa agli importi precedenti qualora si desideri far effettuare tutti i calcoli alla procedura.

| Campo    | Tipo | Lunghezza | Posizione | Descrizione |
| -------- | ---- | --------- | --------- | ----------- |
| **NOTE** | A    | 60        | 102       | Note        |

## ------------------------------------------

## Nuovo Tracciato da Release 9.9.3

## ------------------------------------------

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione         |
| ----------------------- | ---- | --------- | --------- | ------------------- |
| **SIGLA CONTROPARTITA** | A    | 12        | 162       | Sigla contropartita |

> **Nota**: La sigla conto viene utilizzata per identificare il conto da inserire in prima nota quando non è stata indicata la CONTROPARTITA (progressivo 20).

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 174       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato PNRIGIVA.TXT_
