# 📊 REPORT COMPARATIVO: MOVIMENTI CONTABILI

## 🎯 **ANALISI CORRISPONDENZA TRACCIATI ↔ PARSER ↔ SCHEMA**

### **TRACCIATO:** `PNTESTA.TXT` (Testata)
**Lunghezza:** 445 bytes | **Campi documentati:** 68 | **Campi parsati:** 57

#### ✅ **CORRISPONDENZE CORRETTE**
| Tracciato | Parser | Schema Staging | Note |
|-----------|--------|----------------|------|
| CODICE UNIVOCO (21-32) | externalId | codiceUnivocoScaricamento | ✅ |
| CODICE FISCALE AZIENDA (4-19) | codiceFiscaleAzienda | — | ❌ MANCANTE |
| ESERCIZIO (35-39) | esercizio | esercizio | ✅ |
| CODICE CAUSALE (40-45) | causaleId | codiceCausale | ✅ |
| DESCRIZIONE CAUSALE (46-85) | descrizioneCausale | descrizioneCausale | ✅ |
| DATA REGISTRAZIONE (86-93) | dataRegistrazione | dataRegistrazione | ✅ |
| TIPO REGISTRO IVA (96-96) | tipoRegistroIva | tipoRegistroIva | ✅ |
| CLI/FOR CODICE FISCALE (100-115) | clienteFornitoreCodiceFiscale | clienteFornitoreCodiceFiscale | ✅ |
| CLI/FOR SIGLA (117-128) | clienteFornitoreSigla | clienteFornitoreSigla | ✅ |
| DATA DOCUMENTO (129-136) | dataDocumento | dataDocumento | ✅ |
| NUMERO DOCUMENTO (137-148) | numeroDocumento | numeroDocumento | ✅ |
| TOTALE DOCUMENTO (173-184) | totaleDocumento | totaleDocumento | ✅ |
| NOTE MOVIMENTO (193-252) | noteMovimento | noteMovimento | ✅ |
| DATA PLAFOND (253-260) | dataPlafond | dataPlafond | ✅ |
| ANNO PRO-RATA (261-264) | annoProRata | annoProRata | ✅ |
| RITENUTE (265-276) | ritenute | ritenute | ✅ |

#### ❌ **CAMPI MANCANTI IN SCHEMA**
| Campo Tracciato | Campo Parser | Mancante in Schema | Criticità |
|----------------|--------------|-------------------|-----------|
| CODICE FISCALE AZIENDA | codiceFiscaleAzienda | ❌ | BASSA |
| SUBCODICE FISCALE AZIENDA | subcodiceFiscaleAzienda | ❌ | BASSA |
| CODICE ATTIVITA | codiceAttivita | ❌ | BASSA |
| ENASARCO | enasarco | ❌ | MEDIA |
| TOTALE IN VALUTA | totaleInValuta | ❌ | MEDIA |
| CODICE VALUTA | codiceValuta | ❌ | MEDIA |
| STATO | stato | ❌ | ALTA |
| TIPO GESTIONE PARTITE | tipoGestionePartite | ❌ | ALTA |
| CODICE PAGAMENTO | codicePagamento | ❌ | ALTA |

#### ✅ **CAMPI AGGIUNTIVI IN SCHEMA**
| Campo Schema | Fonte | Note |
|-------------|--------|------|
| codiceAzienda | Parser logic | Generato automaticamente |
| importJobId | Sistema | Metadata import |
| createdAt/updatedAt | Sistema | Timestamp |

---

### **TRACCIATO:** `PNRIGCON.TXT` (Righe Contabili)
**Lunghezza:** 312 bytes | **Campi documentati:** 26 | **Campi parsati:** 26

#### ✅ **CORRISPONDENZE CORRETTE**
| Tracciato | Parser | Schema Staging | Note |
|-----------|--------|----------------|------|
| CODICE UNIVOCO (4-15) | externalId | codiceUnivocoScaricamento | ✅ |
| PROGRESSIVO RIGO (16-18) | progressivoRigo | progressivoRigo | ✅ |
| TIPO CONTO (19-19) | tipoConto | tipoConto | ✅ |
| CLI/FOR CODICE FISCALE (20-35) | clienteFornitoreCodiceFiscale | clienteFornitoreCodiceFiscale | ✅ |
| CLI/FOR SUBCODICE (36-36) | clienteFornitoreSubcodice | clienteFornitoreSubcodice | ✅ |
| CLI/FOR SIGLA (37-48) | clienteFornitoreSigla | clienteFornitoreSigla | ✅ |
| CONTO (49-58) | conto | conto | ✅ |
| IMPORTO DARE (59-70) | importoDare | importoDare | ✅ |
| IMPORTO AVERE (71-82) | importoAvere | importoAvere | ✅ |
| NOTE (83-142) | note | note | ✅ |
| INS. DATI COMPETENZA (143-143) | insDatiCompetenzaContabile | insDatiCompetenzaContabile | ✅ |
| DATA INIZIO COMPETENZA (144-151) | dataInizioCompetenza | dataInizioCompetenza | ✅ |
| DATA FINE COMPETENZA (152-159) | dataFineCompetenza | dataFineCompetenza | ✅ |
| DATA REGISTRAZIONE APERTURA (220-227) | dataRegistrazioneApertura | dataRegistrazioneApertura | ✅ |
| DATA INIZIO COMPETENZA ANALIT (249-256) | dataInizioCompetenzaAnalit | dataInizioCompetenzaAnalit | ✅ |
| DATA FINE COMPETENZA ANALIT (257-264) | dataFineCompetenzaAnalit | dataFineCompetenzaAnalit | ✅ |

#### ❌ **CAMPI MANCANTI IN SCHEMA**
| Campo Tracciato | Campo Parser | Mancante in Schema | Criticità |
|----------------|--------------|-------------------|-----------|
| NOTE DI COMPETENZA | noteCompetenza | ❌ | MEDIA |
| CONTO DA RILEVARE 1 | contoRilevare1 | ❌ | BASSA |
| CONTO DA RILEVARE 2 | contoRilevare2 | ❌ | BASSA |
| INS. DATI STUDI SETTORE | insDatiStudiSettore | ❌ | BASSA |
| STATO MOVIMENTO STUDI | statoMovimentoStudi | ❌ | BASSA |
| ESERCIZIO RILEVANZA FISCALE | esercizioRilevanzaFiscale | ❌ | BASSA |
| DETTAGLIO CLI/FOR | dettaglioCliFor* | ❌ | BASSA |
| SIGLA CONTO | siglaConto | ❌ | MEDIA |

#### ✅ **MAPPING CORRETTO**: 16/26 campi (61.5%)

---

### **TRACCIATO:** `PNRIGIVA.TXT` (Righe IVA)
**Lunghezza:** 173 bytes | **Campi documentati:** 11 | **Campi parsati:** 11 (2 formati)

#### ✅ **CORRISPONDENZE CORRETTE**
| Tracciato | Parser | Schema Staging | Note |
|-----------|--------|----------------|------|
| CODICE UNIVOCO (4-15) | externalId | codiceUnivocoScaricamento | ✅ |
| CODICE IVA (16-19) | codiceIva | codiceIva | ✅ |
| CONTROPARTITA (20-29) | contropartita | contropartita | ✅ |
| IMPONIBILE (30-41) | imponibile | imponibile | ✅ |
| IMPOSTA (42-53) | imposta | imposta | ✅ |
| IMPOSTA NON CONSIDERATA (78-89) | impostaNonConsiderata | impostaNonConsiderata | ✅ |
| IMPORTO LORDO (90-101) | importoLordo | importoLordo | ✅ |
| NOTE (102-161) | note | note | ✅ |
| SIGLA CONTROPARTITA (162-173) | siglaContropartita | siglaContropartita | ✅ |

#### ✅ **CAMPI AGGIUNTIVI IN SCHEMA**
| Campo Schema | Fonte | Note |
|-------------|--------|------|
| rigaIdentifier | Sistema | Chiave univoca per duplicati |
| riga | Parser | Numero sequenziale |
| importJobId | Sistema | Metadata import |

#### ✅ **MAPPING CORRETTO**: 9/11 campi (81.8%)

---

### **TRACCIATO:** `MOVANAC.TXT` (Movimenti Analitici)
**Lunghezza:** 34 bytes | **Campi documentati:** 4 | **Campi parsati:** 4

#### ✅ **CORRISPONDENZE CORRETTE**
| Tracciato | Parser | Schema Staging | Note |
|-----------|--------|----------------|------|
| CODICE UNIVOCO (4-15) | externalId | codiceUnivocoScaricamento | ✅ |
| PROGRESSIVO RIGO (16-18) | progressivoRigo | progressivoNumeroRigoCont | ✅ |
| CENTRO DI COSTO (19-22) | centroDiCosto | centroDiCosto | ✅ |
| PARAMETRO (23-34) | parametro | parametro | ✅ |

#### ✅ **CAMPI AGGIUNTIVI IN SCHEMA**
| Campo Schema | Fonte | Note |
|-------------|--------|------|
| allocazioneIdentifier | Sistema | Chiave univoca |
| progressivoRigoContabile | Sistema | Alias per progressivoRigo |

#### ✅ **MAPPING CORRETTO**: 4/4 campi (100%)

---

## 📈 **RIEPILOGO PERFORMANCE**

### **COVERAGE GENERALE**
| Tracciato | Campi Documentati | Campi Parsati | Campi in Schema | Coverage % |
|-----------|-------------------|---------------|-----------------|------------|
| PNTESTA.TXT | 68 | 57 | 19 | 27.9% |
| PNRIGCON.TXT | 26 | 26 | 16 | 61.5% |
| PNRIGIVA.TXT | 11 | 11 | 9 | 81.8% |
| MOVANAC.TXT | 4 | 4 | 4 | 100% |

### **PROBLEMI CRITICI IDENTIFICATI**

#### 🔴 **ALTA PRIORITÀ**
1. **Campi mancanti in PNTESTA**: `stato`, `tipoGestionePartite`, `codicePagamento`
2. **Campi finanziari mancanti**: `enasarco`, `totaleInValuta`, `codiceValuta`
3. **Mapping incompleto**: Solo 27.9% dei campi PNTESTA raggiunge lo schema

#### 🟡 **MEDIA PRIORITÀ**
1. **Campi competenza mancanti**: `noteCompetenza` in PNRIGCON
2. **Campi alternativi mancanti**: `siglaConto` in PNRIGCON
3. **Metadati di import**: Mancano alcuni campi audit nei tracciati

#### 🟢 **BASSA PRIORITÀ**
1. **Campi studi settore**: Coverage bassa ma non critica
2. **Campi tecnici**: Dettagli implementativi non essenziali

### **RACCOMANDAZIONI**

#### ✅ **AZIONI IMMEDIATE**
1. **Aggiungere campi mancanti** in `StagingTestata`
2. **Implementare mapping completo** per campi finanziari
3. **Aggiungere validazione** per campi critici

#### 🔄 **AZIONI FUTURE**
1. **Ottimizzare parser** per coverage al 90%+
2. **Implementare fallback** per campi opzionali
3. **Aggiungere audit trail** completo

---

## 🎯 **CONCLUSIONE**

Il sistema di import movimenti contabili è **funzionale ma incompleto**:
- **Parser**: Robust e ben strutturato
- **Schema**: Essenziale ma manca coverage
- **Mapping**: Buono per IVA e analitici, insufficiente per testata

**Priorità**: Completare il mapping per raggiungere coverage >80% su tutti i tracciati.

---

## 🔄 **ANALISI STAGING → PRODUZIONE**

### **MAPPING:** `StagingTestata` → `ScritturaContabile`

#### ✅ **CAMPI MAPPATI CORRETTAMENTE**
| Staging | Produzione | Finalization Logic | Status |
|---------|------------|-------------------|---------|
| codiceUnivocoScaricamento | externalId | Diretto | ✅ |
| dataRegistrazione | data | parseDate(DDMMYYYY) | ✅ |
| descrizioneCausale | descrizione | Diretto | ✅ |
| dataDocumento | dataDocumento | parseDate(DDMMYYYY) | ✅ |
| numeroDocumento | numeroDocumento | Diretto | ✅ |
| codiceCausale | causaleId | Lookup via findFirst | ✅ |
| clienteFornitoreCodiceFiscale | fornitoreId | Lookup via findFirst | ✅ |

#### ❌ **CAMPI PERSI NELLA FINALIZZAZIONE**
| Staging | Mancante in Produzione | Impatto | Priority |
|---------|----------------------|---------|----------|
| esercizio | ❌ | Stored in datiAggiuntivi | MEDIA |
| codiceAzienda | ❌ | Stored in datiAggiuntivi | MEDIA |
| tipoRegistroIva | ❌ | Stored in datiAggiuntivi | MEDIA |
| clienteFornitoreSigla | ❌ | Perso completamente | ALTA |
| totaleDocumento | ❌ | Stored in datiAggiuntivi | MEDIA |
| noteMovimento | ❌ | Stored in datiAggiuntivi | MEDIA |
| dataRegistroIva | ❌ | Perso completamente | MEDIA |
| dataCompetenzaLiquidIva | ❌ | Perso completamente | MEDIA |
| dataCompetenzaContabile | ❌ | Perso completamente | MEDIA |
| dataPlafond | ❌ | Perso completamente | MEDIA |
| annoProRata | ❌ | Perso completamente | MEDIA |
| ritenute | ❌ | Perso completamente | MEDIA |
| protocolloRegistroIva | ❌ | Perso completamente | BASSA |
| esigibilitaIva | ❌ | Perso completamente | BASSA |

#### 🚨 **PROBLEMI CRITICI**
1. **Dati JSON non strutturati**: Molti campi finiscono in `datiAggiuntivi` come blob JSON
2. **Perdita informazioni**: Alcuni campi vengono completamente scartati
3. **Lookup fragili**: La ricerca di causali e fornitori può fallire silenziosamente

---

### **MAPPING:** `StagingRigaContabile` → `RigaScrittura`

#### ✅ **CAMPI MAPPATI CORRETTAMENTE**
| Staging | Produzione | Finalization Logic | Status |
|---------|------------|-------------------|---------|
| codiceUnivocoScaricamento | scritturaContabileId | Via lookup ScritturaContabile | ✅ |
| conto | contoId | Lookup via findFirst | ✅ |
| importoDare | dare | parseFloat + replace(',', '.') | ✅ |
| importoAvere | avere | parseFloat + replace(',', '.') | ✅ |
| conto | descrizione | Fallback se mancante | ✅ |

#### ❌ **CAMPI PERSI NELLA FINALIZZAZIONE**
| Staging | Mancante in Produzione | Impatto | Priority |
|---------|----------------------|---------|----------|
| tipoConto | ❌ | Informazione tipo (C/F) persa | ALTA |
| clienteFornitoreCodiceFiscale | clienteId/fornitoreId | Lookup parziale | ALTA |
| clienteFornitoreSubcodice | ❌ | Perso completamente | MEDIA |
| clienteFornitoreSigla | ❌ | Perso completamente | MEDIA |
| note | ❌ | Perso completamente | ALTA |
| insDatiCompetenzaContabile | ❌ | Flag importante perso | MEDIA |
| dataInizioCompetenza | ❌ | Perso completamente | MEDIA |
| dataFineCompetenza | ❌ | Perso completamente | MEDIA |
| dataInizioCompetenzaAnalit | ❌ | Perso completamente | MEDIA |
| dataFineCompetenzaAnalit | ❌ | Perso completamente | MEDIA |
| dataRegistrazioneApertura | ❌ | Perso completamente | BASSA |
| progressivoRigo | ❌ | Ordine righe perso | MEDIA |

#### 🚨 **PROBLEMI CRITICI**
1. **Perdita associazioni**: clienteId/fornitoreId mapping incompleto
2. **Note perse**: Informazioni descrittive importanti scartate
3. **Date competenza**: Tutte le date di competenza vengono perse
4. **Ordinamento**: Il progressivo riga non viene preservato

---

### **MAPPING:** `StagingRigaIva` → `RigaIva`

#### ✅ **CAMPI MAPPATI CORRETTAMENTE**
| Staging | Produzione | Finalization Logic | Status |
|---------|------------|-------------------|---------|
| codiceIva | codiceIvaId | Lookup via findFirst | ✅ |
| imponibile | imponibile | parseFloat + replace(',', '.') | ✅ |
| imposta | imposta | parseFloat + replace(',', '.') | ✅ |
| codiceUnivocoScaricamento | rigaScritturaId | Via lookup complesso | ✅ |

#### ❌ **CAMPI PERSI NELLA FINALIZZAZIONE**
| Staging | Mancante in Produzione | Impatto | Priority |
|---------|----------------------|---------|----------|
| contropartita | ❌ | Conto contropartita perso | ALTA |
| impostaNonConsiderata | ❌ | Calcolo fiscale perso | MEDIA |
| importoLordo | ❌ | Totale lordo perso | MEDIA |
| note | ❌ | Note specifiche perse | MEDIA |
| siglaContropartita | ❌ | Alternativa contropartita persa | BASSA |
| riga | ❌ | Numero sequenziale perso | BASSA |

#### 🚨 **PROBLEMI CRITICI**
1. **Contropartita mancante**: Campo essenziale per contabilità IVA
2. **Calcoli fiscali**: Informazioni per liquidazione IVA perse
3. **Lookup complesso**: Associazione a RigaScrittura fragile

---

### **MAPPING:** `StagingAllocazione` → `Allocazione`

#### ✅ **CAMPI MAPPATI CORRETTAMENTE**
| Staging | Produzione | Finalization Logic | Status |
|---------|------------|-------------------|---------|
| parametro | importo | parseFloat + replace(',', '.') | ✅ |
| codiceUnivocoScaricamento | rigaScritturaId | Via lookup complesso | ✅ |
| centroDiCosto | commessaId | Lookup centro costo → commessa | ✅ |

#### ❌ **CAMPI PERSI NELLA FINALIZZAZIONE**
| Staging | Mancante in Produzione | Impatto | Priority |
|---------|----------------------|---------|----------|
| centroDiCosto | ❌ | Codice centro costo originale | ALTA |
| progressivoNumeroRigoCont | ❌ | Associazione specifica riga | MEDIA |

#### ➕ **CAMPI AGGIUNTI IN PRODUZIONE**
| Produzione | Fonte | Logic | Status |
|-----------|-------|-------|---------|
| voceAnaliticaId | Sistema | Mapping fisso/default | ❌ Hardcoded |
| dataMovimento | Sistema | data della scrittura | ✅ |
| tipoMovimento | Sistema | Default/derivato | ❌ Hardcoded |
| note | Sistema | Vuoto | ❌ |

#### 🚨 **PROBLEMI CRITICI**
1. **Mapping centro costo → commessa**: Logica non implementata
2. **VoceAnalitica hardcoded**: Nessuna logica di mapping
3. **TipoMovimento hardcoded**: Dovrebbe essere derivato
4. **Centro costo originale perso**: Informazione importante

---

## 📊 **RIEPILOGO FINALIZZAZIONE**

### **PERFORMANCE MAPPING STAGING → PRODUZIONE**
| Tabella | Campi Staging | Campi Produzione | Campi Mappati | Coverage % |
|---------|---------------|------------------|---------------|------------|
| StagingTestata → ScritturaContabile | 19 | 7 | 7 | 100% |
| StagingRigaContabile → RigaScrittura | 16 | 7 | 5 | 71.4% |
| StagingRigaIva → RigaIva | 11 | 4 | 4 | 100% |
| StagingAllocazione → Allocazione | 8 | 8 | 3 | 37.5% |

### **PROBLEMI CRITICI FINALIZZAZIONE**

#### 🔴 **ALTA PRIORITÀ**
1. **Perdita informazioni essenziali**: Note, tipo conto, contropartite
2. **Mapping allocazioni incompleto**: Centro costo → commessa non implementato
3. **Lookup fragili**: Molte associazioni possono fallire silenziosamente
4. **Date competenza**: Tutte le date di competenza vengono scartate

#### 🟡 **MEDIA PRIORITÀ**
1. **Dati in JSON**: Molti campi finiscono in blob non strutturato
2. **Metadata persi**: Progressivi, flag, codici aggiuntivi
3. **Calcoli fiscali**: Informazioni IVA specializzate perse

#### 🟢 **BASSA PRIORITÀ**
1. **Campi tecnici**: Protocolli, identificatori secondari
2. **Campi opzionali**: Informazioni non essenziali

---

## 🎯 **CONCLUSIONE FINALE**

### **CATENA COMPLETA: TRACCIATO → STAGING → PRODUZIONE**

| Fase | Coverage | Problemi Principali |
|------|----------|-------------------|
| **Tracciato → Staging** | 27.9% - 100% | Campi mancanti in staging |
| **Staging → Produzione** | 37.5% - 100% | Perdita informazioni essenziali |
| **Coverage Totale** | ~20% - 80% | Doppia perdita informazioni |

### **IMPATTO BUSINESS**
- **Contabilità**: Dati essenziali persi (note, competenze)
- **Fiscale**: Informazioni IVA incomplete
- **Analitica**: Allocazioni non funzionali
- **Audit**: Tracciabilità compromessa

### **RACCOMANDAZIONI URGENTI**
1. **Completare catena PARSER → STAGING → PRODUZIONE** per campi critici:
   - Aggiungere parsing per campi mancanti (es. stato, tipoGestionePartite)
   - Estendere schema staging per accogliere i nuovi campi
   - Aggiornare schema produzione per preservare informazioni essenziali
   - Implementare mapping completo in finalizzazione
2. **Implementare mapping allocazioni** completo:
   - Logica centro costo → commessa
   - Mapping dinamico voceAnaliticaId
   - Derivazione corretta tipoMovimento
3. **Preservare informazioni essenziali** lungo tutta la catena:
   - Note delle righe contabili
   - Contropartite IVA
   - Date di competenza
   - Progressivi e ordinamenti
4. **Aggiungere validazione robusta** per lookup:
   - Fallback per causali non trovate
   - Gestione errori per fornitori mancanti
   - Logging dettagliato per debugging
5. **Implementare rollback transazionale** in caso di errori mapping

**PRIORITÀ ASSOLUTA**: Completare il mapping allocazioni per rendere funzionale la contabilità analitica.