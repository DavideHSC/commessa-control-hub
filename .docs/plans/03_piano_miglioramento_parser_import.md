# Piano di Miglioramento Parser Import - Fase 3

**Data**: 24 Giugno 2025  
**Riferimento Analisi**: [analisi_ui_importazione_20250624.md](../analysis/analisi_ui_importazione_20250624.md)  
**Parser Python di Riferimento**: `.docs/code/parser*.py`

## Obiettivo

Implementare un sistema di importazione robusto e completo basandosi sui parser Python sviluppati, che rappresentano la "bibbia" per schemi dati e tecniche implementative verificate su dati reali.

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

### Priorità 5.1: Processamento Avanzato
**Riferimento**: Funzioni `process_*` nei parser Python

**File da modificare**: `server/routes/importAnagrafiche.ts`

**Implementazione**:
```typescript
// Basato su parser_causali.py parse_causali_file
async function handleCausaliImport(fileBuffer: Buffer, templateName: string) {
  const lines = await parseWithFallbackEncoding(fileBuffer);
  
  const { data: causaliData, stats } = await processWithErrorHandling(
    lines,
    (line: string, index: number) => {
      // Validazione lunghezza specifica per causali (171 bytes + CRLF)
      const cleanLine = line.replace(/\r?\n$/, '');
      if (cleanLine.length < 171) {
        throw new Error(`Lunghezza insufficiente: ${cleanLine.length} < 171`);
      }
      
      // Parsing con layout verificato
      const record = parseLineWithTemplate(line, 'causali');
      
      // Arricchimento con decodifiche semantiche
      return {
        ...record,
        tipo_movimento_desc: decodeTipoMovimento(record.tipo_movimento),
        tipo_aggiornamento_desc: decodeTipoAggiornamento(record.tipo_aggiornamento),
        tipo_registro_iva_desc: decodeTipoRegistroIva(record.tipo_registro_iva),
        // ... altre decodifiche
      };
    },
    'causali'
  );
  
  // Inserimento database con statistiche
  const insertedCount = await insertCausaliWithDeduplication(causaliData);
  
  return {
    success: true,
    stats: {
      ...stats,
      insertedRecords: insertedCount
    }
  };
}
```

### Priorità 5.2: Statistiche Real-time
**Riferimento**: Funzioni `create_summary_stats` nei parser Python

**File da creare**: `server/lib/importStatistics.ts`

**Implementazione**:
```typescript
// Basato su parser_causali.py create_summary_stats
export function createCausaliStats(causali: any[]): Record<string, number> {
  return {
    'Totale Causali': causali.length,
    'Causali con Codice': causali.filter(c => c.codice_causale !== '').length,
    'Causali Contabili': causali.filter(c => c.tipo_movimento === 'C').length,
    'Causali Contabili/IVA': causali.filter(c => c.tipo_movimento === 'I').length,
    'Causali Acquisti': causali.filter(c => c.tipo_registro_iva === 'A').length,
    'Causali Vendite': causali.filter(c => c.tipo_registro_iva === 'V').length,
    'Con Autofattura': causali.filter(c => c.generazione_autofattura).length,
    'Con Gestione Partite': causali.filter(c => ['A', 'C', 'H'].includes(c.gestione_partite)).length,
    'Con Ritenute/Enasarco': causali.filter(c => ['R', 'E', 'T'].includes(c.gestione_ritenute_enasarco)).length,
    'Con Gestione Intrastat': causali.filter(c => c.gestione_intrastat).length
  };
}

// Implementare stats per tutti gli altri tipi seguendo i pattern Python
```

---

## Fase 6: Testing e Validazione

### Priorità 6.1: Test con Dati Reali
**Riferimento**: Logiche di test implicite nei parser Python

**File da creare**: `tests/import/parser-validation.test.ts`

**Implementazione**:
```typescript
describe('Parser Validation', () => {
  test('Causali - Layout verificato', async () => {
    // Test con dati che rispettano il layout da parser_causali.py
    const testLine = '   1CAUS01CAUSALE TEST                             CI20240101202412310V X   CONTO001  X          ';
    const result = parseLineWithTemplate(testLine, 'causali');
    
    expect(result.codice_causale).toBe('CAUS01');
    expect(result.descrizione_causale).toBe('CAUSALE TEST');
    expect(result.tipo_movimento).toBe('C');
    // ... altri test
  });
  
  test('Codici IVA - Gestione aliquote decimali', async () => {
    // Test basato su parser_codiciiva.py parse_decimal
    const testData = { aliquota_iva: '002200' }; // 22.00%
    const formatted = formatAmount(testData.aliquota_iva);
    expect(formatted).toBe(22.00);
  });
  
  // Test per tutti i parser seguendo i pattern Python
});
```

### Priorità 6.2: Validazione Encoding
**Riferimento**: Test encoding nei parser Python

**Test di fallback encoding**:
```typescript
test('Fallback encoding come Python', async () => {
  // Test sequenza encoding UTF-8 → latin1 → cp1252 → iso-8859-1
  const encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1'];
  
  for (const encoding of encodings) {
    try {
      const result = await parseWithFallbackEncoding(testFile);
      expect(result).toBeDefined();
      break;
    } catch (error) {
      continue;
    }
  }
});
```

---

## Cronologia di Implementazione

### Settimana 1-2: Foundation
- [ ] Estensione schema database (Priorità 1.1-1.5)
- [ ] Migrazione database con campi opzionali
- [ ] Test compatibilità dati esistenti

### Settimana 3-4: Robustezza
- [ ] Implementazione fallback encoding (Priorità 2.1)
- [ ] Validazione lunghezza record (Priorità 2.2)  
- [ ] Gestione errori graceful (Priorità 2.3)

### Settimana 5-6: Business Logic
- [ ] Decodifica semantica (Priorità 3.1)
- [ ] Formattazione dati (Priorità 3.2)
- [ ] Validazioni business (Priorità 3.3)

### Settimana 7-8: Template e Import
- [ ] Aggiornamento template con layout verificati (Priorità 4.1-4.2)
- [ ] Miglioramento logica import (Priorità 5.1-5.2)

### Settimana 9-10: Testing e Validazione
- [ ] Test completi con dati reali (Priorità 6.1-6.2)
- [ ] Validazione performance
- [ ] Documentazione finale

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