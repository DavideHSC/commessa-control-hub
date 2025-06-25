# Piano di Miglioramento Parser Import - Fase 3

**Data**: 24 Giugno 2025  
**Riferimento Analisi**: [analisi_ui_importazione_20250624.md](../analysis/analisi_ui_importazione_20250624.md)  
**Parser Python di Riferimento**: `.docs/code/parser*.py`

## Obiettivo

Implementare un sistema di importazione robusto e completo basandosi sui parser Python sviluppati, che rappresentano la "bibbia" per schemi dati e tecniche implementative verificate su dati reali.

> **N.B. Contesto Architetturale**: Questo piano opera nel contesto del refactoring definito in `.docs/plans/recovery_plan_v2.md`. Tutta la logica di importazione è stata modularizzata e spostata da `server/routes/importAnagrafiche.ts` a file specifici dentro `server/lib/importers/`. Qualsiasi verifica o modifica deve tenere conto di questa nuova struttura.

---

## Principi Guida Fondamentali per l'Implementazione

A seguito delle difficoltà riscontrate, i seguenti principi diventano **obbligatori e non derogabili** per tutte le fasi successive di questo piano:

**NUOVO PRINCIPIO FONDAMENTALE (0): ADERENZA TOTALE E OBBLIGATORIA**
- **Cosa significa**: Prima di iniziare qualsiasi task di importazione, è obbligatorio analizzare il parser Python di riferimento. **Tutte le colonne, logiche di conversione e tecniche implementative presenti nel parser devono essere replicate fedelmente (1:1)**, senza omissioni o interpretazioni, anche se alcuni campi sembrano non avere rilevanza immediata. Il parser Python è la fonte di verità assoluta e la sua implementazione deve essere completa.
- **Azione richiesta**: Ogni implementazione TypeScript deve mappare il 100% dei campi e delle logiche del rispettivo parser Python. Qualsiasi deviazione deve essere esplicitamente discussa e approvata.

1.  **Il Codice Eseguibile è la Fonte di Verità Assoluta.**
    -   **Cosa significa:** L'analisi non si deve basare sui commenti (`pos 5-8`), ma esclusivamente sul codice operativo (`line[4:8]`). I commenti possono essere obsoleti o imprecisi; il codice eseguibile è l'unica rappresentazione fedele della logica.
    -   **Azione richiesta:** Prima di implementare qualsiasi logica di parsing, è mandatorio eseguire un'analisi dettagliata del codice di slicing, conversione e validazione dello script Python di riferimento.

2.  **Analisi Olistica Prima di Ogni Modifica.**
    -   **Cosa significa:** È vietato procedere con modifiche basate su analisi parziali. L'intero script di riferimento deve essere compreso nel suo flusso logico (dalla lettura del file all'output finale) prima di scrivere una singola riga di codice TypeScript.
    -   **Azione richiesta:** Creare una mappatura punto-punto (come una tabella o un diagramma di flusso comparativo) tra la logica Python e l'implementazione TypeScript *prima* di iniziare a codificare.

3.  **Priorità alla Causa Radice, non ai Sintomi.**
    -   **Cosa significa:** Di fronte a un errore, l'ipotesi di lavoro iniziale deve sempre essere che ci sia un difetto nel punto più fondamentale e profondo del processo (es. il parsing a basso livello), non in layer successivi (es. la logica di business).
    -   **Azione richiesta:** In caso di fallimento dell'import, la prima azione di debug deve essere quella di verificare l'output grezzo del parser e confrontarlo con l'output atteso dallo script Python, mettendo in discussione le assunzioni di base.

4.  **LA REPLICA DEI TIPI DEVE ESSERE ESATTA (Nuova Lezione Appresa)**:
    -   **Cosa significa:** Non basta una logica "simile" a quella Python. La conversione dei tipi, specialmente per i flag booleani, deve essere una replica 1:1.
    -   **Azione richiesta:** Implementare la logica di conversione dei tipi (es. `valore === 'X'`) in modo identico a come appare nello script Python di riferimento, senza interpretazioni o semplificazioni.

5.  **IL LOGGING DEVE PUNTARE ALLA TRANSAZIONE DB (Nuova Lezione Appresa)**:
    -   **Cosa significa:** Per diagnosticare errori di inserimento, il debug deve arrivare fino al layer del database.
    -   **Azione richiesta:** In caso di errori durante l'import, loggare sistematicamente l'esatto payload di dati inviato a Prisma (es. nell'oggetto `create` o `update` di `upsert`) e l'errore specifico restituito dal database.

L'aderenza a questi principi è essenziale per evitare cicli di debug inefficienti e garantire un'implementazione corretta e robusta.

---

## 🛠️ Metodologia di Troubleshooting e Validazione (Nuovo Standard Operativo)

A seguito degli ultimi interventi, abbiamo sviluppato una metodologia di debug infallibile che diventa da oggi il nostro **protocollo standard** per affrontare qualsiasi anomalia durante l'importazione di un nuovo tracciato.

**Quando eseguire questa procedura**: Ogni volta che un'importazione fallisce, produce dati palesemente errati (es. aliquote a 0, campi slittati) o si comporta in modo inatteso.

**Procedura passo-passo:**

1.  **Non fidarsi, Verificare (Python è l'Oracolo)**:
    *   **Azione**: Prendere lo script Python di riferimento (es. `parser_codiciiva.py`).
    *   **Scopo**: Usarlo come fonte di verità assoluta per l'output atteso.

2.  **Creare un "Golden Record" di Debug**:
    *   **Azione**: Modificare temporaneamente lo script Python:
        *   Rimuovere le dipendenze non necessarie (es. `openpyxl` per l'export Excel).
        *   Aggiungere `print()` dettagliati all'interno del ciclo di parsing per stampare a console i valori estratti per i **primi 5-10 record**.
    *   **Scopo**: Generare un output di testo pulito che mostri esattamente come dovrebbero essere i dati dopo il parsing (es. `{'codice': '10', 'aliquota': 10.0, ...}`).

3.  **Eseguire il Test con Dati Reali**:
    *   **Azione**: Lanciare lo script Python modificato sul **file di dati effettivo** (es. `CodicIva.txt`), non sui file di documentazione.
    *   **Scopo**: Ottenere l'output di debug che useremo come metro di paragone.

4.  **Abilitare il Debug su TypeScript**:
    *   **Azione**: Aggiungere `console.log` mirati nel codice TypeScript, in particolare:
        *   In `server/routes/importAnagrafiche.ts` per vedere l'array `parsedData` restituito da `fixedWidthParser`.
        *   Nel gestore specifico (es. `server/lib/importers/codiciIvaImporter.ts`) per vedere il singolo `record` ricevuto.
    *   **Scopo**: Vedere cosa sta producendo *realmente* il nostro codice.

5.  **Il Confronto è la Chiave**:
    *   **Azione**: Mettere fianco a fianco l'output del `print()` di Python e quello del `console.log()` di TypeScript.
    *   **Scopo**: Individuare **immediatamente** la discrepanza. L'errore sarà evidente (es. Python produce `'10'`, TypeScript produce `'0  I'`). Questo punta in modo inequivocabile alla causa radice, quasi sempre un errore di indicizzazione (1-based vs 0-based) o di lunghezza nel template di `seed.ts`.

6.  **Risolvere e Pulire**:
    *   **Azione**: Correggere il bug identificato. Una volta che l'importazione funziona, **rimuovere tutti i log di debug** sia da Python che da TypeScript.
    *   **Scopo**: Mantenere la codebase pulita.

---

## 🎯 STATO ATTUALE - AGGIORNAMENTO 25 GIUGNO 2025 (POST-REFACTORING)

### ✅ COMPLETATO: Parser Codici IVA (CRITICO)

**Risultato**: **100% FUNZIONANTE** - Allineato, testato e validato con la nuova metodologia.

**Problemi Risolti (Lezione Fondamentale)**:
- **Errore di Indicizzazione 1-based vs 0-based**: Il problema critico era nel `fixedWidthParser.ts` che non sottraeva `1` all'indice `start` del template, causando uno sfasamento completo di tutti i campi. La nuova metodologia di debug ha permesso di identificarlo immediatamente confrontando l'output Python e TypeScript.

**Metriche di Successo**:
- ✅ **816/816 record** processati e visualizzati correttamente.
- ✅ **Aliquote, codici e descrizioni** perfettamente allineati all'output del parser Python.

### 🟡 DA RIVERIFICARE: Parser Causali Contabili (ALTA PRIORITÀ)

**Stato**: **Da Riverificare**. L'implementazione originale era considerata completa, ma deve essere testata di nuovo seguendo il nuovo protocollo di validazione per garantire che non soffra dello stesso errore di indicizzazione o di altri bug latenti.

### 🟡 DA RIVERIFICARE: `parser_a_clifor.py` - Clienti/Fornitori (ALTA PRIORITÀ)

**Stato**: **Da Riverificare**. Stessa situazione delle Causali Contabili. L'implementazione deve essere validata contro l'output del parser Python di riferimento.

### 🔄 PROSSIMI PARSER DA ALLINEARE (Priorità Decrescente)

1.  **`parser_contigen.py`** - Piano dei Conti (MEDIA PRIORITÀ)
    -   Struttura gerarchica complessa
    -   Validazioni business specifiche

2. **`parser_codpagam.py`** - Condizioni Pagamento (BASSA PRIORITÀ)
   - Parser più semplice
   - Meno campi da gestire

### 📋 METODOLOGIA CONSOLIDATA

**Per ogni parser successivo, seguire rigorosamente**:
1. **Analisi Codice Python**: Studiare slicing, conversioni, validazioni
2. **Verifica Template**: Confrontare definizioni seed.ts con logica Python  
3. **Test con Log Debug**: Verificare estrazione e conversione dati
4. **Validazione E2E**: Test completo import → database → UI
5. **Documentazione**: Aggiornare piano con risultati e lezioni

---

## Riferimenti Tecnici Primari

### Parser Python (Bibbia Implementativa)
- **`parser.py`** - Parser master scritture contabili (428 linee)
- **`parser_causali.py`** - Causali contabili specializzato (379 linee)  
- **`parser_codiciiva.py`** - Codici IVA avanzato (482 linee)
- **`parser_a_clifor.py`** - Clienti/Fornitori completo (433 linee)
- **`parser_contigen.py`** - Piano dei conti gerarchico (333 linee)
- **`parser_codpagam.py`** - Condizioni pagamento (312 linee)

### Documentazione di Riferimento
- **Analisi Completa**: `analisi_ui_importazione_20250624.md`
- **Mapping Campi**: Sezione "Confronto Colonne Parser Python vs Campi Database"
- **Correlazioni**: Sezione "Correlazione Parser Python vs TypeScript"

---

## Fase 1: Estensione Schema Database (Foundation)

### Priorità 1.1: Codici IVA (Critica)
**Riferimento**: `parser_codiciiva.py` linee 250-350

**Campi da aggiungere al model `CodiceIva`**:
```prisma
model CodiceIva {
  // ... campi esistenti
  
  // Gestione Plafond
  plafondAcquisti              String?
  plafondAcquistiDesc          String?
  monteAcquisti                Boolean?
  plafondVendite               String?
  plafondVenditeDesc           String?
  noVolumeAffariPlafond        Boolean?
  
  // Pro-rata e Compensazioni
  gestioneProRata              String?
  gestioneProRataDesc          String?
  percentualeCompensazione     Float?
  
  // Reverse Charge e Operazioni Speciali
  autofatturaReverseCharge     Boolean?
  operazioneEsenteOccasionale  Boolean?
  cesArt38QuaterStornoIva      Boolean?
  agevolazioniSubforniture     Boolean?
  
  // Territorialità
  indicatoreTerritorialeVendite     String?
  indicatoreTerritorialeVenditeDesc String?
  indicatoreTerritorialeAcquisti    String?
  indicatoreTerritorialeAcquistiDesc String?
  
  // Beni Ammortizzabili
  beniAmmortizzabili           Boolean?
  analiticoBeniAmmortizzabili  Boolean?
  
  // Comunicazioni Dati IVA
  comunicazioneDatiIvaVendite     String?
  comunicazioneDatiIvaVenditeDesc String?
  comunicazioneDatiIvaAcquisti    String?
  comunicazioneDatiIvaAcquistiDesc String?
  
  // Altri Campi Fiscali
  imponibile50Corrispettivi    Boolean?
  imposteIntrattenimenti       String?
  imposteIntrattenimentiDesc   String?
  ventilazione                 Boolean?
  aliquotaDiversa              Float?
  percDetrarreExport           Float?
  acquistiCessioni             String?
  acquistiCessioniDesc         String?
  metodoDaApplicare            String?
  metodoDaApplicareDesc        String?
  percentualeForfetaria        String?
  percentualeForfetariaDesc    String?
  quotaForfetaria              String?
  quotaForfetariaDesc          String?
  acquistiIntracomunitari      Boolean?
  cessioneProdottiEditoriali   Boolean?
  provvigioniDm34099           Boolean?
  acqOperazImponibiliOccasionali Boolean?
}
```

### Priorità 1.2: Piano dei Conti (Critica)
**Riferimento**: `parser_contigen.py` linee 200-250

**Campi da aggiungere al model `Conto`**:
```prisma
model Conto {
  // ... campi esistenti
  
  // Gerarchia e Classificazione
  livello                      String?
  livelloDesc                  String?
  sigla                        String?
  gruppo                       String?
  gruppoDesc                   String?
  controlloSegno               String?
  controlloSegnoDesc           String?
  codificaFormattata           String?
  
  // Validità per Tipo Contabilità
  validoImpresaOrdinaria       Boolean?
  validoImpresaSemplificata    Boolean?
  validoProfessionistaOrdinario Boolean?
  validoProfessionistaSemplificato Boolean?
  
  // Classi Fiscali
  classeIrpefIres              String?
  classeIrap                   String?
  classeProfessionista         String?
  classeIrapProfessionista     String?
  classeIva                    String?
  
  // Conti Collegati
  contoCostiRicavi             String?
  contoDareCee                 String?
  contoAvereCee                String?
  
  // Gestione Speciale
  naturaConto                  String?
  gestioneBeniAmmortizzabili   String?
  percDeduzioneManutenzione    Float?
  dettaglioClienteFornitore    String?
  
  // Descrizioni Bilancio
  descrizioneBilancioDare      String?
  descrizioneBilancioAvere     String?
  
  // Dati Extracontabili
  classeDatiExtracontabili     String?
  
  // Registri Professionisti
  colonnaRegistroCronologico   String?
  colonnaRegistroIncassiPagamenti String?
}
```

### Priorità 1.3: Causali Contabili (Alta)
**Riferimento**: `parser_causali.py` linee 150-200

**Campi da aggiungere al model `CausaleContabile`**:
```prisma
model CausaleContabile {
  // ... campi esistenti
  
  // Descrizioni Decodificate
  tipoMovimentoDesc            String?
  tipoAggiornamentoDesc        String?
  tipoRegistroIvaDesc          String?
  
  // Gestione IVA
  segnoMovimentoIva            String?
  segnoMovimentoIvaDesc        String?
  contoIva                     String?
  contoIvaVendite              String?
  
  // Autofatture
  generazioneAutofattura       Boolean?
  tipoAutofatturaGenerata      String?
  tipoAutofatturaDesc          String?
  
  // Gestione Fatture
  fatturaImporto0              Boolean?
  fatturaValutaEstera          Boolean?
  nonConsiderareLiquidazioneIva Boolean?
  fatturaEmessaRegCorrispettivi Boolean?
  
  // IVA Esigibilità
  ivaEsigibilitaDifferita      String?
  ivaEsigibilitaDifferitaDesc  String?
  
  // Gestioni Speciali
  gestionePartite              String?
  gestionePartiteDesc          String?
  gestioneIntrastat            Boolean?
  gestioneRitenuteEnasarco     String?
  gestioneRitenuteEnasarcoDesc String?
  versamentoRitenute           Boolean?
  
  // Documenti e Registrazioni
  descrizioneDocumento         String?
  identificativoEsteroClifor   Boolean?
  scritturaRettificaAssestamento Boolean?
  nonStampareRegCronologico    Boolean?
  movimentoRegIvaNonRilevante  Boolean?
  
  // Contabilità Semplificata
  tipoMovimentoSemplificata    String?
  tipoMovimentoSemplificataDesc String?
}
```

### Priorità 1.4: Clienti/Fornitori (Media)
**Riferimento**: `parser_a_clifor.py` linee 270-320

**Campi da aggiungere ai model `Cliente` e `Fornitore`**:
```prisma
// Per entrambi Cliente e Fornitore
codiceAnagrafica             String?
tipoConto                    String?
tipoContoDesc                String?
tipoSoggetto                 String?
tipoSoggettoDesc             String?
denominazione                String?
sessoDesc                    String?
prefissoTelefono             String?
codiceIso                    String?
idFiscaleEstero              String?

// Sottoconti
sottocontoAttivo             String?
sottocontoCliente            String?
sottocontoFornitore          String?

// Codici Pagamento Specifici
codiceIncassoCliente         String?
codicePagamentoFornitore     String?

// Flags Calcolati
ePersonaFisica               Boolean?
eCliente                     Boolean?
eFornitore                   Boolean?
haPartitaIva                 Boolean?

// Per Fornitore - Descrizioni aggiuntive
quadro770Desc               String?
tipoRitenuraDesc             String?
contributoPrevid335Desc      String?
```

### Priorità 1.5: Condizioni Pagamento (Bassa)
**Riferimento**: `parser_codpagam.py` linee 60-130

**Campi da aggiungere al model `CondizionePagamento`**:
```prisma
model CondizionePagamento {
  // ... campi esistenti
  
  calcolaGiorniCommerciali     Boolean?
  consideraPeriodiChiusura     Boolean?
  suddivisioneDesc             String?
  inizioScadenzaDesc           String?
}
```

---

## Fase 2: Miglioramento Parser Base (Robustezza)

### Priorità 2.1: Fallback Encoding Robusto
**Riferimento**: `parser_causali.py` linee 80-95

**File da modificare**: `server/lib/fixedWidthParser.ts`

**Implementazione**:
```typescript
// Implementare sequenza encoding come in Python
const encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1'];

async function parseWithFallbackEncoding(filePath: string): Promise<string[]> {
  for (const encoding of encodings) {
    try {
      const content = await fs.readFile(filePath, { encoding: encoding as BufferEncoding });
      console.log(`File aperto con encoding: ${encoding}`);
      return content.split(/\r?\n/);
    } catch (error) {
      console.warn(`Encoding ${encoding} fallito, provo il prossimo...`);
      continue;
    }
  }
  throw new Error('Nessun encoding supportato ha funzionato');
}
```

### Priorità 2.2: Validazione Lunghezza Record
**Riferimento**: Tutti i parser Python - pattern di validazione

**Implementazione**:
```typescript
interface RecordValidation {
  expectedLength: number;
  tolerance?: number;
  required: boolean;
}

const RECORD_VALIDATIONS: Record<string, RecordValidation> = {
  'causali': { expectedLength: 171, required: true },
  'codici_iva': { expectedLength: 162, required: true },
  'anagrafica_clifor': { expectedLength: 338, required: true },
  'piano_dei_conti': { expectedLength: 388, required: true },
  'condizioni_pagamento': { expectedLength: 68, required: true }
};

function validateRecordLength(line: string, templateName: string, lineNumber: number): boolean {
  const validation = RECORD_VALIDATIONS[templateName];
  if (!validation) return true;
  
  const actualLength = line.replace(/\r?\n$/, '').length;
  if (actualLength < validation.expectedLength) {
    console.warn(`Riga ${lineNumber}: lunghezza insufficiente (${actualLength} < ${validation.expectedLength})`);
    return !validation.required;
  }
  return true;
}
```

### Priorità 2.3: Gestione Errori Graceful
**Riferimento**: Pattern comune in tutti i parser Python

**File da modificare**: `server/routes/importAnagrafiche.ts`

**Implementazione**:
```typescript
interface ImportStats {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  warnings: string[];
  errors: string[];
}

async function processWithErrorHandling<T>(
  records: string[],
  processor: (line: string, index: number) => T,
  templateName: string
): Promise<{ data: T[], stats: ImportStats }> {
  const stats: ImportStats = {
    totalRecords: records.length,
    successfulRecords: 0,
    errorRecords: 0,
    warnings: [],
    errors: []
  };
  
  const data: T[] = [];
  
  for (let i = 0; i < records.length; i++) {
    const line = records[i];
    stats.totalRecords++;
    
    try {
      if (!validateRecordLength(line, templateName, i + 1)) {
        stats.warnings.push(`Riga ${i + 1}: lunghezza record non valida`);
        continue;
      }
      
      const result = processor(line, i);
      data.push(result);
      stats.successfulRecords++;
      
      // Log ogni 100 record come in Python
      if (stats.successfulRecords % 100 === 0) {
        console.log(`Elaborati ${stats.successfulRecords} record...`);
      }
      
    } catch (error) {
      stats.errorRecords++;
      const errorMsg = `Errore riga ${i + 1}: ${error.message}`;
      stats.errors.push(errorMsg);
      console.error(errorMsg);
      
      // Continue processing invece di fermarsi
      continue;
    }
  }
  
  return { data, stats };
}
```

---

## Fase 3: Implementazione Logica Business

### Priorità 3.1: Decodifica Semantica
**Riferimento**: Funzioni `decode_*` in tutti i parser Python

**File da creare**: `server/lib/businessDecoders.ts`

**Implementazione**:
```typescript
// Basato su parser_causali.py decode_tipo_movimento
export function decodeTipoMovimento(code: string): string {
  const mapping: Record<string, string> = {
    'C': 'Solo Contabile',
    'I': 'Contabile e IVA',
    '': 'Non specificato'
  };
  return mapping[code.trim()] || `Codice sconosciuto: ${code}`;
}

// Basato su parser_codiciiva.py decode_tipo_calcolo  
export function decodeTipoCalcolo(code: string): string {
  const mapping: Record<string, string> = {
    'O': 'Normale',
    'S': 'Scorporo',
    'E': 'Esente/Non imponibile', 
    'A': 'Solo Imposta',
    'V': 'Ventilazione',
    '': 'Non specificato'
  };
  return mapping[code.trim()] || `Codice sconosciuto: ${code}`;
}

// Basato su parser_a_clifor.py get_tipo_conto_descrizione
export function decodeTipoConto(tipo: string): string {
  const mapping: Record<string, string> = {
    'C': 'Cliente',
    'F': 'Fornitore', 
    'E': 'Cliente/Fornitore',
    '': 'Non specificato'
  };
  return mapping[tipo.trim()] || `Tipo sconosciuto: ${tipo}`;
}

// Implementare tutte le altre funzioni decode_* dai parser Python
```

### Priorità 3.2: Formattazione Dati
**Riferimento**: Funzioni `format_*` e `parse_*` nei parser Python

**File da creare**: `server/lib/dataFormatters.ts`

**Implementazione**:
```typescript
// Basato su parser.py format_date
export function formatDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '' || dateStr === '00000000') {
    return null;
  }
  
  const cleaned = dateStr.trim();
  if (cleaned.length === 8) {
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    return `${day}/${month}/${year}`;
  }
  
  return null;
}

// Basato su parser.py format_amount
export function formatAmount(amountStr: string): number | null {
  if (!amountStr || amountStr.trim() === '') {
    return null;
  }
  
  let cleaned = amountStr.trim();
  
  // Gestione segno negativo
  const isNegative = cleaned.startsWith('-');
  if (isNegative) {
    cleaned = cleaned.substring(1);
  }
  
  // Rimuovi zeri iniziali ma mantieni almeno una cifra
  cleaned = cleaned.replace(/^0+/, '') || '0';
  
  // Converti in numero con 2 decimali
  const amount = parseInt(cleaned, 10) / 100;
  
  return isNegative ? -amount : amount;
}

// Basato su pattern comune nei parser Python
export function parseBooleanFlag(char: string): boolean {
  return char.trim().toUpperCase() === 'X';
}

// Basato su parser_a_clifor.py format_codice_fiscale
export function formatCodiceFiscale(cf: string): string {
  if (!cf) return '';
  return cf.trim().toUpperCase();
}

// Basato su parser_a_clifor.py format_partita_iva
export function formatPartitaIva(piva: string): string {
  if (!piva) return '';
  const cleaned = piva.trim().replace(/\D/g, '');
  return cleaned.length === 11 ? cleaned : '';
}
```

### Priorità 3.3: Validazioni Business
**Riferimento**: Logiche di validazione nei parser Python

**File da creare**: `server/lib/businessValidators.ts`

**Implementazione**:
```typescript
// Basato su logiche di validazione nei parser Python
export function validateCodiceFiscale(cf: string): boolean {
  if (!cf) return false;
  const cleaned = cf.trim().toUpperCase();
  
  // Persona fisica: 16 caratteri alfanumerici
  if (cleaned.length === 16) {
    return /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(cleaned);
  }
  
  // Persona giuridica: 11 cifre
  if (cleaned.length === 11) {
    return /^[0-9]{11}$/.test(cleaned);
  }
  
  return false;
}

export function validatePartitaIva(piva: string): boolean {
  if (!piva) return false;
  const cleaned = piva.trim().replace(/\D/g, '');
  return cleaned.length === 11 && /^[0-9]{11}$/.test(cleaned);
}

export function validateAliquotaIva(aliquota: number): boolean {
  return aliquota >= 0 && aliquota <= 100;
}

export function validateImporto(importo: number): boolean {
  return !isNaN(importo) && isFinite(importo);
}
```

---

## Fase 4: Aggiornamento Template Import

### Priorità 4.1: Layout Verificati
**Riferimento**: Definizioni layout in tutti i parser Python

**File da modificare**: `prisma/seed.ts`

**Implementazione basata su `parser_causali.py`**:
```typescript
// Template Causali con posizioni verificate
{
  name: 'causali',
  modelName: 'CausaleContabile',
  fieldDefinitions: [
    { fieldName: 'codice_causale', start: 5, length: 6, format: 'string' },
    { fieldName: 'descrizione_causale', start: 11, length: 40, format: 'string' },
    { fieldName: 'tipo_movimento', start: 51, length: 1, format: 'string' },
    { fieldName: 'tipo_aggiornamento', start: 52, length: 1, format: 'string' },
    { fieldName: 'data_inizio_validita', start: 53, length: 8, format: 'date' },
    { fieldName: 'data_fine_validita', start: 61, length: 8, format: 'date' },
    { fieldName: 'tipo_registro_iva', start: 69, length: 1, format: 'string' },
    { fieldName: 'segno_movimento_iva', start: 70, length: 1, format: 'string' },
    { fieldName: 'conto_iva', start: 71, length: 10, format: 'string' },
    { fieldName: 'generazione_autofattura', start: 81, length: 1, format: 'boolean' },
    { fieldName: 'tipo_autofattura_generata', start: 82, length: 1, format: 'string' },
    { fieldName: 'conto_iva_vendite', start: 83, length: 10, format: 'string' },
    { fieldName: 'fattura_importo_0', start: 93, length: 1, format: 'boolean' },
    { fieldName: 'fattura_valuta_estera', start: 94, length: 1, format: 'boolean' },
    { fieldName: 'non_considerare_liquidazione_iva', start: 95, length: 1, format: 'boolean' },
    { fieldName: 'iva_esigibilita_differita', start: 96, length: 1, format: 'string' },
    { fieldName: 'fattura_emessa_reg_corrispettivi', start: 97, length: 1, format: 'boolean' },
    { fieldName: 'gestione_partite', start: 98, length: 1, format: 'string' },
    { fieldName: 'gestione_intrastat', start: 99, length: 1, format: 'boolean' },
    { fieldName: 'gestione_ritenute_enasarco', start: 100, length: 1, format: 'string' },
    { fieldName: 'versamento_ritenute', start: 101, length: 1, format: 'boolean' },
    { fieldName: 'note_movimento', start: 102, length: 60, format: 'string' },
    { fieldName: 'descrizione_documento', start: 162, length: 5, format: 'string' },
    { fieldName: 'identificativo_estero_clifor', start: 167, length: 1, format: 'boolean' },
    { fieldName: 'scrittura_rettifica_assestamento', start: 168, length: 1, format: 'boolean' },
    { fieldName: 'non_stampare_reg_cronologico', start: 169, length: 1, format: 'boolean' },
    { fieldName: 'movimento_reg_iva_non_rilevante', start: 170, length: 1, format: 'boolean' },
    { fieldName: 'tipo_movimento_semplificata', start: 171, length: 1, format: 'string' }
  ]
}
```

### Priorità 4.2: Template Completi per Altri Parser
**Riferimenti**: Layout specifici da ogni parser Python

Implementare template completi per:
- **Codici IVA**: Basato su `parser_codiciiva.py` (162 bytes)
- **Clienti/Fornitori**: Basato su `parser_a_clifor.py` (338 bytes)  
- **Piano Conti**: Basato su `parser_contigen.py` (388 bytes)
- **Condizioni Pagamento**: Basato su `parser_codpagam.py` (68 bytes)

---

## Fase 5: Miglioramento Logica Import

### 🚧 **IN CORSO - Prossimi Passi**

#### **Fase 5.1: Correzione Architetturale Critica** - **🚨 PRIORITÀ MASSIMA**

**💡 SCHEMA OPERATIVO CICLICO (da ripetere per ogni model):**
1.  **Audit & Gap Analysis**: Analisi di un singolo model per identificare le discrepanze.
2.  **Correzione Schema DB**: Modifica dello `schema.prisma` e creazione della migrazione.
3.  **Allineamento Tipi & API**: Aggiornamento delle interfacce TypeScript e delle rotte API impattate.
4.  **Allineamento Completo UI**: Modifica dei componenti React (tabelle, form) per visualizzare e gestire i nuovi campi.
5.  **Verifica Funzionale E2E**: Test manuale dell'intero flusso per confermare che non ci siano regressioni.
6.  **Aggiornamento Piano**: Documentazione di tutte le azioni svolte e dello stato di allineamento del model.

---

### **Ciclo 1: `CausaleContabile`**

- [x] **Audit & Gap Analysis**:
  - **Stato**: Completato.
  - **Gap Rilevato**: ❌ Manca il campo `codice`.
- [x] **Correzione Schema DB**:
  - **Stato**: Completato.
  - **Azione Svolta**: ✅ Aggiunto campo `codice: String? @unique` e creata migrazione.
- [x] **Allineamento Tipi & API**:
  - **Stato**: Completato.
  - **Azione Svolta**: ✅ Aggiornata l'interfaccia `CausaleContabile` in `src/types/index.ts`.
- [ ] **Allineamento Completo UI**:
  - **Stato**: **Da iniziare**.
  - **Azione da Svolgere**: Modificare `CausaliTable.tsx` per includere il campo `codice` e gli altri 24 campi estesi nel form e, dove sensato, nella tabella.
- [ ] **Verifica Funzionale E2E**:
  - **Stato**: Da iniziare.
- [ ] **Aggiornamento Piano a Fine Ciclo**:
  - **Stato**: Da completare.

---

### **Ciclo 2: `Conto`**

- [ ] **Audit & Gap Analysis**:
  - **Stato**: Da iniziare.

---
*Il resto della vecchia struttura delle sequenze verrà rimosso una volta completati i cicli per ogni model.*

---

## Metriche di Successo

### Robustezza
- **Target**: 95% successo parsing con encoding fallback
- **Baseline**: 70% attuale
- **Riferimento**: Pattern Python testati su dati reali

### Completezza Dati
- **Target**: 90%+ campi popolati correttamente
- **Baseline**: 36% attuale (71/198 campi)
- **Riferimento**: Mapping completo da analisi

### Accuratezza Business
- **Target**: 98%+ decodifiche semantiche corrette
- **Baseline**: Decodifiche manuali/assenti
- **Riferimento**: Logiche verificate nei parser Python

### Performance
- **Target**: Mantenere performance attuali con dati 10x più ricchi
- **Baseline**: 2-5 sec anagrafiche, 10-30 sec scritture
- **Riferimento**: Ottimizzazioni da parser Python

---

## Note di Implementazione

1. **Tutti i campi aggiunti sono opzionali** - garantisce compatibilità
2. **Parser Python sono la fonte di verità** - layout, validazioni, decodifiche
3. **Implementazione incrementale** - ogni fase testabile indipendentemente  
4. **Backward compatibility** - dati esistenti continuano a funzionare
5. **Monitoring continuo** - statistiche come nei parser Python

**Riferimenti Costanti**:
- Analisi: `analisi_ui_importazione_20250624.md`
- Parser Python: `.docs/code/parser*.py`
- Testing: Dati reali cliente come baseline

---

## 🔍 **SISTEMA TIPI DATI - RIFERIMENTO COMPLETO**

### **MAPPING TIPI CROSS-LAYER GIÀ IMPLEMENTATO:**

| **Parser Python** | **Seed.ts Format** | **Prisma Type** | **Esempio Campo** |
|-------------------|-------------------|-----------------|-------------------|
| `.strip()` | `'string'` | `String?` | `codiceCausale`, `descrizione` |
| `parse_date()` | `'date:DDMMYYYY'` | `String?` | `dataInizio`, `dataFine` |
| `parse_boolean_flag()` | `boolean` | `Boolean?` | `generazioneAutofattura` |
| N/A | `'number'` | `Int?` | `numeroRate` |
| N/A | `'number:decimal'` | `Float?` | `aliquota`, `percDetrarreExport` |

### **✅ SISTEMA COERENTE E FUNZIONANTE:**

1. **Parser Python**: Definisce logica conversione dati
2. **Seed.ts**: Specifica format per ogni campo nel template
3. **Schema Prisma**: Definisce tipi database corrispondenti
4. **DataFormatters**: Implementa conversioni concrete

### **📋 NESSUNA IMPLEMENTAZIONE AGGIUNTIVA NECESSARIA:**
Il sistema di tipizzazione è già completo e allineato tra tutti i layer dell'architettura.

---

## 🚨 **RIEPILOGO CRITICO FASE 5.1 - CORREZIONE ARCHITETTURALE**

### **PROBLEMA ROOT CAUSE:**
Durante l'implementazione delle Fasi 1-4, si è verificata una **disconnessione sistemica** tra i diversi layer dell'architettura:

1. **Parser Python** (VERITÀ) → Esportano con nomi `snake_case`
2. **Seed Templates** → Convertono a `camelCase`

---