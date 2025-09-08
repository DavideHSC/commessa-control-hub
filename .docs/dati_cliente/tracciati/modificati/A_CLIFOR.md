# A_CLIFOR.TXT - Tracciato Anagrafica Clienti/Fornitori

**Data**: 10/07/2007  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 338 Bytes + CRLF = 340 Bytes  
**Nome File**: A_CLIFOR.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Anagrafica Azienda

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **CODICE FISCALE AZIENDA** | A    | 16        | 4         | Codice fiscale azienda |
| **SUBCODICE AZIENDA**      | A    | 1         | 20        | Subcodice azienda      |

## Dati Generali

| Campo                                | Tipo | Lunghezza | Posizione | Descrizione                      |
| ------------------------------------ | ---- | --------- | --------- | -------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO**   | A    | 12        | 21        | Codice univoco di scaricamento   |
| **CODICE FISCALE CLIENTE/FORNITORE** | A    | 16        | 33        | Codice fiscale cliente/fornitore |
| **SUBCODICE CLIENTE/FORNITORE**      | A    | 1         | 49        | Subcodice cliente/fornitore      |
| **TIPO CONTO**                       | A    | 1         | 50        | Tipo conto                       |
|                                      |      |           |           | • C = Cliente                    |
|                                      |      |           |           | • F = Fornitore                  |
|                                      |      |           |           | • E = Entrambi                   |

| Campo                    | Tipo | Lunghezza | Posizione | Descrizione                            |
| ------------------------ | ---- | --------- | --------- | -------------------------------------- |
| **SOTTOCONTO CLIENTE**   | A    | 10        | 51        | Sottoconto cliente (MMCC/MMCCSSSSSS)   |
| **SOTTOCONTO FORNITORE** | A    | 10        | 61        | Sottoconto fornitore (MMCC/MMCCSSSSSS) |

> **Nota**: Se si specifica un conto (codifica MMCC) il sottoconto verrà assegnato automaticamente.

| Campo                 | Tipo | Lunghezza | Posizione | Descrizione            |
| --------------------- | ---- | --------- | --------- | ---------------------- |
| **CODICE ANAGRAFICA** | A    | 12        | 71        | Codice anagrafica      |
| **PARTITA IVA**       | N    | 11        | 83        | Partita IVA            |
| **TIPO SOGGETTO**     | N    | 1         | 94        | Tipo soggetto          |
|                       |      |           |           | • 0 = Persona Fisica   |
|                       |      |           |           | • 1 = Soggetto Diverso |

| Campo                             | Tipo | Lunghezza | Posizione | Descrizione                   |
| --------------------------------- | ---- | --------- | --------- | ----------------------------- |
| **DENOMINAZIONE/RAGIONE SOCIALE** | A    | 60        | 95        | Denominazione/ragione sociale |

## Dati Anagrafici Persona Fisica (\*)

| Campo                                  | Tipo | Lunghezza | Posizione | Descrizione                        |
| -------------------------------------- | ---- | --------- | --------- | ---------------------------------- |
| **COGNOME**                            | A    | 20        | 155       | Cognome                            |
| **NOME**                               | A    | 20        | 175       | Nome                               |
| **SESSO**                              | A    | 1         | 195       | Sesso                              |
|                                        |      |           |           | • M = Maschio                      |
|                                        |      |           |           | • F = Femmina                      |
| **DATA DI NASCITA**                    | N    | 8         | 196       | Data di nascita (GGMMAAAA)         |
| **CODICE CATASTALE COMUNE DI NASCITA** | A    | 4         | 204       | Codice catastale comune di nascita |

## Dati Anagrafici Persona Fisica/Sogg. Div.

| Campo                                      | Tipo | Lunghezza | Posizione | Descrizione                                      |
| ------------------------------------------ | ---- | --------- | --------- | ------------------------------------------------ |
| **COD. CAT. COMUNE DI RESID./SEDE LEGALE** | A    | 4         | 208       | Codice catastale comune di residenza/sede legale |
| **CAP DI RESIDENZA/SEDE LEGALE**           | N    | 5         | 212       | CAP di residenza/sede legale                     |
| **INDIRIZZO DI RESIDENZA/SEDE LEGALE**     | A    | 30        | 217       | Indirizzo di residenza/sede legale               |
| **PREFISSO TELEFONO**                      | N    | 4         | 247       | Prefisso telefono                                |
| **NUMERO DI TELEFONO**                     | N    | 11        | 251       | Numero di telefono                               |
| **IDENTIFICATIVO FISCALE ESTERO**          | A    | 20        | 262       | Identificativo fiscale estero                    |
| **CODICE ISO**                             | A    | 2         | 282       | Codice ISO                                       |

### Codici ISO Supportati

| Codice | Paese                 |
| ------ | --------------------- |
| AT     | Austria               |
| BE     | Belgio                |
| CY     | Cipro                 |
| CZ     | Repubblica Ceca       |
| DE     | Germania              |
| DK     | Danimarca             |
| EE     | Estonia               |
| EL     | Grecia                |
| ES     | Spagna                |
| EX     | Extra CEE             |
| FI     | Finlandia             |
| FR     | Francia               |
| GB     | Gran Bretagna         |
| HU     | Ungheria              |
| IE     | Irlanda               |
| IT     | Italia                |
| LT     | Lituania              |
| LU     | Lussemburgo           |
| LV     | Lettonia              |
| MT     | Malta                 |
| NL     | Olanda                |
| PL     | Polonia               |
| PT     | Portogallo            |
| SE     | Svezia                |
| SI     | Slovenia              |
| SK     | Repubblica Slovacca   |
| SM     | Repubblica San Marino |

## Dati per Sottoconto Cliente/Fornitore

| Campo                                    | Tipo | Lunghezza | Posizione | Descrizione                          |
| ---------------------------------------- | ---- | --------- | --------- | ------------------------------------ |
| **CODICE INCASSO/PAGAMENTO (TABELLE)**   | A    | 8         | 284       | Codice incasso/pagamento (tabelle)   |
| **CODICE INC./PAG. CLIENTE (AZIENDA)**   | A    | 8         | 292       | Codice inc./pag. cliente (azienda)   |
| **CODICE INC./PAG. FORNITORE (AZIENDA)** | A    | 8         | 300       | Codice inc./pag. fornitore (azienda) |
| **CODICE VALUTA**                        | A    | 4         | 308       | Codice valuta                        |

## Dati per Sottoconto Fornitore

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione                   |
| ----------------------- | ---- | --------- | --------- | ----------------------------- |
| **GESTIONE DATI 770**   | A    | 1         | 312       | Gestione dati 770 (X)         |
| **SOGGETTO A RITENUTA** | A    | 1         | 313       | Soggetto a ritenuta (X)       |
| **QUADRO 770**          | A    | 1         | 314       | Quadro 770                    |
|                         |      |           |           | • (vuoto) =                   |
|                         |      |           |           | • 0 = Lavoro autonomo         |
|                         |      |           |           | • 1 = Provvigioni             |
|                         |      |           |           | • 2 = Lavoro autonomo imposta |

| Campo                        | Tipo | Lunghezza | Posizione | Descrizione                  |
| ---------------------------- | ---- | --------- | --------- | ---------------------------- |
| **CONTRIBUTO PREVIDENZIALE** | A    | 1         | 315       | Contributo previdenziale (X) |
| **CODICE RITENUTA**          | A    | 5         | 316       | Codice ritenuta              |
| **ENASARCO**                 | A    | 1         | 321       | Enasarco (X)                 |
| **TIPO RITENUTA**            | A    | 1         | 322       | Tipo ritenuta                |
|                              |      |           |           | • (vuoto) =                  |
|                              |      |           |           | • A = a titolo d'acconto     |
|                              |      |           |           | • I = a titolo d'imposta     |
|                              |      |           |           | • M = Manuale                |

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                           |
| ------------------------------------- | ---- | --------- | --------- | ------------------------------------- |
| **SOGGETTO INAIL**                    | A    | 1         | 323       | Soggetto INAIL (X)                    |
| **CONTRIBUTO PREVIDENZIALE L.335/95** | A    | 1         | 324       | Contributo previdenziale L.335/95     |
|                                       |      |           |           | • 0 = Non soggetto                    |
|                                       |      |           |           | • 1 = Soggetto                        |
|                                       |      |           |           | • 2 = Soggetto con imponibile manuale |
|                                       |      |           |           | • 3 = Soggetto con calcolo manuale    |

| Campo                             | Tipo | Lunghezza | Posizione | Descrizione                               |
| --------------------------------- | ---- | --------- | --------- | ----------------------------------------- |
| **ALIQUOTA**                      | N    | 6         | 325       | Aliquota (999.99)                         |
| **% CONTRIBUTO CASSA PREVID.**    | N    | 6         | 331       | % Contributo cassa previdenziale (999.99) |
| **ATTIVITA' PER MENSILIZZAZIONE** | N    | 2         | 337       | Attività per mensilizzazione              |

> **Nota**: Le sezioni contrassegnate da (\*) devono essere impostate se TIPO SOGGETTO è 0 - Persona Fisica.

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 339       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato A_CLIFOR.TXT_
