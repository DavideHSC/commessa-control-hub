# Analisi dei File di Importazione Cliente

Questo documento analizza i file di testo forniti dal cliente per definire una strategia di importazione dei dati nell'applicazione Commessa Control Hub.

## Visione d'Insieme

Tutti i file forniti sono esportazioni da un sistema contabile (probabilmente basato su AS/400 o simili) e seguono un formato a **larghezza fissa**. Non sono file CSV. Questo implica che per ogni file è necessario sviluppare un **parser specifico** che estragga i dati basandosi sulla posizione e la lunghezza dei campi.

La struttura dei dati è relazionale e ben definita:
- Esistono file di **anagrafica** (Causali, Codici IVA, Clienti/Fornitori, etc.).
- Esistono file di **movimento** (Testate e Righe di Prima Nota) che si collegano tra loro e con le anagrafiche tramite identificativi univoci.

## Strategia di Importazione Unificata

Propongo un approccio incrementale in 3 fasi:

1.  **Creare un Modulo Parser Unificato**: Sviluppare una funzione o una classe in TypeScript in grado di leggere un file a larghezza fissa data una mappa di definizione dei campi (nome, inizio, fine). Questo ci permetterà di riutilizzare la logica di parsing per tutti i file.
2.  **Importare le Anagrafiche di Base**: Creare degli script di importazione (che possono essere eseguiti come "servizi" dalla nostra UI) per popolare le tabelle del nostro database con i dati provenienti da:
    - `Causali.txt`
    - `CodicIva.txt`
    - `CodPagam.txt`
    - `A_CLIFOR.TXT` (Clienti/Fornitori)
3.  **Importare le Scritture Contabili**: Creare uno script di importazione più complesso che orchestri la lettura dei file di prima nota nel seguente ordine:
    - Legge `PNTESTA.TXT` per creare la testata della registrazione.
    - Per ogni testata, legge le righe corrispondenti da `PNRIGCON.TXT` (righe contabili) e `PNRIGIVA.TXT` (righe IVA), collegandole tramite l'ID della registrazione.
    - Per ogni riga contabile, legge le allocazioni analitiche da `MOVANAC.TXT` e le collega alla riga, popolando i dati relativi a commesse e voci analitiche.

## Analisi e Struttura dei Singoli File

Di seguito, la mappatura preliminare dei campi per ogni file analizzato.

---

### Anagrafiche (`.docs/dati_cliente/`)

#### 1. `Causali.txt`
- **Contenuto**: Anagrafica delle causali contabili. Definisce la natura delle operazioni (es. fattura ricevuta, pagamento, giroconto).
- **Struttura (dedotta)**:
  - `[1-8]` **Codice**: Codice univoco della causale (es. `FTRI`).
  - `[9-48]` **Descrizione**: Descrizione estesa della causale.
  - `[49-50]` **Tipo Registro**: `IP` (IVA), `CP` (Contabilità), `CI` (Corrispettivi).
  - Segue una serie di flag e campi di configurazione per il comportamento automatico nel software di origine.

#### 2. `CodPagam.txt`
- **Contenuto**: Anagrafica delle condizioni di pagamento.
- **Struttura (dedotta)**:
  - `[1-8]` **Codice**: Codice del pagamento (es. `01`, `RIBA7`).
  - `[9-48]` **Descrizione**: Descrizione estesa.
  - `[49-60]` **Conto Abbinato**: Eventuale conto contabile di default.
  - `[61-70]` **Flag e parametri vari**.

#### 3. `CodicIva.txt`
- **Contenuto**: Anagrafica dei codici IVA, con tutte le relative specificità (aliquota, indetraibilità, reverse charge, etc.).
- **Struttura (dedotta)**:
  - `[1-5]` **Codice**: Codice IVA (es. `X22`).
  - `[6-50]` **Descrizione**: Descrizione del codice IVA.
  - Segue una complessa serie di flag e parametri che ne definiscono il comportamento fiscale e contabile. **Nota**: per il nostro scopo, probabilmente basterà mappare il codice e l'aliquota percentuale.

---

### Prima Nota e Correlati (`.docs/dati_cliente/prima_nota/`)

#### 1. `A_CLIFOR.TXT` (Clienti e Fornitori)
- **Contenuto**: Anagrafica completa dei soggetti (clienti, fornitori, enti).
- **Struttura (dedotta)**:
  - `[12-22]` **ID Anagrafica**: Identificativo univoco del soggetto.
  - `[23-38]` **Codice Fiscale**.
  - `[39-39]` **Tipo**: `F` (Fornitore), `C` (Cliente).
  - `[40-50]` **Conto Contabile**: Conto mastro/partitario associato.
  - `[51-66]` **Partita IVA**.
  - `[67-116]` **Ragione Sociale**.
  - `[117-146]` **Cognome** (se persona fisica).
  - `[147-176]` **Nome** (se persona fisica).
  - `[210-280]` **Indirizzo**.

#### 2. `PNTESTA.TXT` (Testate Registrazioni)
- **Contenuto**: Le testate di ogni scrittura di prima nota. Fa da "padre" per le righe contabili e IVA.
- **Struttura (dedotta)**:
  - `[12-25]` **ID Registrazione**: **CHIAVE PRIMARIA**. Identificativo univoco della scrittura (es. `012025110001`). Composto da `REGISTRO+ANNO+MESE+NUMERO`.
  - `[26-33]` **Data Registrazione**.
  - `[34-39]` **Codice Causale**: Si collega a `Causali.txt`.
  - `[57-64]` **Data Documento**.
  - `[65-80]` **ID Cliente/Fornitore**: Si collega ad `A_CLIFOR.TXT`.
  - `[97-112]` **Numero Documento**.
  - `[246-281]` **ID Fattura Elettronica**.

#### 3. `PNRIGCON.TXT` (Righe Contabili)
- **Contenuto**: Le righe "Dare" e "Avere" di ogni scrittura.
- **Struttura (dedotta)**:
  - `[1-15]` **ID Registrazione + Riga**: **CHIAVE PRIMARIA** (es. `0120251100011`). I primi 14 caratteri sono l'ID di `PNTESTA.TXT`.
  - `[16-16]` **Tipo Riga**: `F` (riga fornitore/cliente), ` ` (riga conto generico).
  - `[17-32]` **Riferimento Cliente/Fornitore**.
  - `[33-48]` **Codice Conto**: Il conto del piano dei conti movimentato.
  - `[49-64]` **Importo in Dare** (se presente).
  - `[65-80]` **Importo in Avere** (se presente).
  - `[145-225]` **Descrizione riga**.

#### 4. `PNRIGIVA.TXT` (Righe IVA)
- **Contenuto**: Dettagli IVA per le righe che la movimentano.
- **Struttura (dedotta)**:
  - `[1-15]` **ID Registrazione + Riga**: Si collega a `PNRIGCON.TXT`.
  - `[16-20]` **Codice IVA**: Si collega a `CodicIva.txt`.
  - `[21-36]` **Codice Conto Associato**.
  - `[37-52]` **Imponibile**.
  - `[53-68]` **Imposta**.

#### 5. `MOVANAC.TXT` (Movimenti Analitici / Commesse)
- **Contenuto**: **File cruciale**. Contiene le allocazioni delle righe di costo/ricavo ai centri di responsabilità (le nostre commesse/voci analitiche).
- **Struttura (dedotta)**:
  - `[1-15]` **ID Registrazione + Riga**: Si collega a `PNRIGCON.TXT`.
  - `[16-27]` **Codice Centro C/R**: Il codice della nostra "Commessa".
  - `[28-43]` **Importo allocato** o **Percentuale**.

## Prossimi Passi
1.  **Validare la Struttura**: Confermare con il cliente (se possibile) la mappatura dei campi.
2.  **Implementare il Parser**: Iniziare a scrivere il codice per il parsing.
3.  **Definire il Modello Dati di Staging**: Creare le tabelle nel nostro database per accogliere questi dati importati prima di trasformarli nel nostro modello di dominio finale.

---

## Analisi del Database e Modifiche Proposte

Dopo aver analizzato i file di importazione, è necessario verificare che lo schema del database corrente (`prisma/schema.prisma`) sia in grado di ospitare i nuovi dati.

### Stato Attuale del Database

Lo schema attuale prevede già modelli per:
- `Cliente` e `Fornitore`
- `Commessa` e `VoceAnalitica`
- `ScritturaContabile`, `RigaScrittura`, e `Allocazione`

Tutti i modelli principali dispongono di un campo `externalId` che è ideale per memorizzare gli ID provenienti dal sistema del cliente, garantendo la tracciabilità.

### Lacune e Modifiche Necessarie

Dall'analisi emergono alcune lacune da colmare per poter importare e relazionare correttamente tutti i dati:

1.  **Gestione IVA**: Manca un'anagrafica per i codici IVA e una struttura per collegare i dettagli IVA (imponibile, imposta) alle righe delle scritture.
2.  **Anagrafiche Mancanti**: Non è presente un modello per le condizioni di pagamento.
3.  **Campi Mancanti**:
    - `ScritturaContabile` non ha `dataDocumento` e `numeroDocumento`.
    - `Cliente` e `Fornitore` non hanno il `codiceFiscale`.
    - Il modello `CausaleContabile` attuale è troppo complesso per un'importazione diretta e andrà semplificato o gestito tramite un modello di "staging".

### Piano di Modifica per `schema.prisma`

Si propone di aggiornare lo schema come segue:

#### 1. Aggiungere Nuovi Modelli

```prisma
// Anagrafica Codici IVA da CodicIva.txt
model CodiceIva {
  id          String  @id
  externalId  String? @unique
  descrizione String
  aliquota    Float
  
  righeIva    RigaIva[]
}

// Anagrafica Condizioni di Pagamento da CodPagam.txt
model CondizionePagamento {
  id          String  @id
  externalId  String? @unique
  descrizione String
  // da valutare se aggiungere altri campi come il conto abbinato
}

// Tabella per i dettagli IVA delle righe contabili
model RigaIva {
  id              String  @id @default(cuid())
  imponibile      Float
  imposta         Float

  codiceIvaId     String
  codiceIva       CodiceIva @relation(fields: [codiceIvaId], references: [id])

  rigaScritturaId String
  rigaScrittura   RigaScrittura @relation(fields: [rigaScritturaId], references: [id], onDelete: Cascade)
}
```

#### 2. Aggiornare i Modelli Esistenti

```prisma
// in Cliente e Fornitore
model Cliente {
  // ... campi esistenti
  codiceFiscale String?
}

model Fornitore {
  // ... campi esistenti
  codiceFiscale String?
}

// in ScritturaContabile
model ScritturaContabile {
  // ... campi esistenti
  dataDocumento   DateTime?
  numeroDocumento String?
}

// in RigaScrittura
model RigaScrittura {
  // ... campi esistenti
  righeIva      RigaIva[]
}
```

Queste modifiche prepareranno il database a ricevere la struttura completa dei dati forniti dal cliente, ponendo le basi per gli script di importazione. 