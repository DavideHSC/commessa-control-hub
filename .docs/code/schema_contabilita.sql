-- Schema Database Contabilità Evolution
-- Generato automaticamente dall'analisi delle relazioni

-- Tabella: prime_note
CREATE TABLE prime_note (
    Codice Univoco INTEGER,
    Codice Fiscale INTEGER,
    Data Registrazione VARCHAR(20),
    Descrizione Causale VARCHAR(47),
    Data Documento VARCHAR(20),
    Numero Documento VARCHAR(22),
    Totale Documento DECIMAL(15,2),
    Cliente/Fornitore CF VARCHAR(26),
    Cliente/Fornitore Sigla VARCHAR(22),
    Codice Causale VARCHAR(15),
    Tipo Registro IVA VARCHAR(13),
    Stato VARCHAR(11),
    Tipo Riga VARCHAR(19),
    Prog. Rigo DECIMAL(15,2),
    Tipo Conto VARCHAR(13),
    Conto DECIMAL(15,2),
    CLI/FOR CF Riga VARCHAR(26),
    CLI/FOR Sigla Riga VARCHAR(22),
    Importo Dare DECIMAL(15,2),
    Importo Avere DECIMAL(15,2),
    Note Riga VARCHAR(70),
    Centri di Costo VARCHAR(126),
    Codice IVA VARCHAR(14),
    Contropartita IVA DECIMAL(15,2),
    Sigla Contropartita DECIMAL(15,2),
    Imponibile DECIMAL(15,2),
    Imposta DECIMAL(15,2),
    Imposta Intrattenimenti DECIMAL(15,2),
    Importo Lordo IVA DECIMAL(15,2),
    Note IVA VARCHAR(45)
);

-- Tabella: piano_conti
CREATE TABLE piano_conti (
    Codifica INTEGER,
    Codifica Formattata INTEGER,
    Livello INTEGER,
    Livello Descrizione VARCHAR(20),
    Descrizione VARCHAR(70),
    Tipo VARCHAR(11),
    Tipo Descrizione VARCHAR(24),
    Sigla DECIMAL(15,2),
    Gruppo VARCHAR(13),
    Gruppo Descrizione VARCHAR(30),
    Controllo Segno VARCHAR(13),
    Controllo Segno Desc VARCHAR(25),
    Conto Costi/Ricavi DECIMAL(15,2),
    Conto Dare CEE VARCHAR(22),
    Conto Avere CEE VARCHAR(22),
    Valido Impresa Ordinaria BOOLEAN,
    Valido Impresa Semplificata BOOLEAN,
    Valido Professionista Ordinario BOOLEAN,
    Valido Professionista Semplificato BOOLEAN,
    Classe IRPEF/IRES VARCHAR(20),
    Classe IRAP VARCHAR(20),
    Classe Professionista VARCHAR(20),
    Classe IRAP Professionista VARCHAR(20),
    Classe IVA VARCHAR(20),
    Natura Conto VARCHAR(14),
    Gestione Beni Ammortizzabili VARCHAR(13),
    Percentuale Deduzione Manutenzione DECIMAL(15,2),
    Dettaglio Cliente/Fornitore DECIMAL(15,2),
    Descrizione Bilancio Dare VARCHAR(65),
    Descrizione Bilancio Avere VARCHAR(70),
    Classe Dati Extracontabili VARCHAR(20),
    Colonna Registro Cronologico DECIMAL(15,2),
    Colonna Registro Incassi/Pagamenti DECIMAL(15,2)
);

-- Tabella: anagrafiche
CREATE TABLE anagrafiche (
    Codice Univoco INTEGER,
    Codice Fiscale VARCHAR(26),
    Partita IVA DECIMAL(15,2),
    Codice Anagrafica VARCHAR(22),
    Tipo Conto VARCHAR(11),
    Tipo Conto Descrizione VARCHAR(40),
    Tipo Soggetto INTEGER,
    Tipo Soggetto Descrizione VARCHAR(41),
    Nome Completo VARCHAR(70),
    Denominazione VARCHAR(70),
    Cognome VARCHAR(29),
    Nome VARCHAR(24),
    Sesso VARCHAR(13),
    Sesso Descrizione VARCHAR(17),
    Data Nascita VARCHAR(20),
    Comune Nascita VARCHAR(14),
    Comune Residenza VARCHAR(14),
    CAP DECIMAL(15,2),
    Indirizzo VARCHAR(40),
    Prefisso Telefono DECIMAL(15,2),
    Numero Telefono DECIMAL(15,2),
    Codice ISO VARCHAR(12),
    ID Fiscale Estero VARCHAR(20),
    Sottoconto Attivo VARCHAR(35),
    Sottoconto Cliente DECIMAL(15,2),
    Sottoconto Fornitore DECIMAL(15,2),
    Codice Incasso/Pagamento VARCHAR(17),
    Codice Incasso Cliente DECIMAL(15,2),
    Codice Pagamento Fornitore DECIMAL(15,2),
    Codice Valuta DECIMAL(15,2),
    Soggetto a Ritenuta BOOLEAN,
    Gestione Dati 770 BOOLEAN,
    Quadro 770 DECIMAL(15,2),
    Quadro 770 Descrizione VARCHAR(25),
    Codice Ritenuta DECIMAL(15,2),
    Tipo Ritenuta VARCHAR(13),
    Tipo Ritenuta Descrizione VARCHAR(28),
    Contributo Previdenziale BOOLEAN,
    Enasarco BOOLEAN,
    Soggetto INAIL BOOLEAN,
    Contributo L.335/95 INTEGER,
    Contributo L.335/95 Descrizione VARCHAR(22),
    Aliquota DECIMAL(15,2),
    Percentuale Contributo Cassa DECIMAL(15,2),
    Attività Mensilizzazione DECIMAL(15,2),
    È Persona Fisica BOOLEAN,
    È Cliente BOOLEAN,
    È Fornitore BOOLEAN,
    Ha Partita IVA BOOLEAN
);

-- Tabella: causali
CREATE TABLE causali (
    codice_causale VARCHAR(16),
    descrizione_causale VARCHAR(50),
    tipo_movimento VARCHAR(11),
    tipo_movimento_desc VARCHAR(23),
    tipo_aggiornamento VARCHAR(11),
    tipo_aggiornamento_desc VARCHAR(27),
    data_inizio_validita DATE,
    data_fine_validita DATE,
    tipo_registro_iva VARCHAR(13),
    tipo_registro_iva_desc VARCHAR(25),
    segno_movimento_iva VARCHAR(13),
    segno_movimento_iva_desc VARCHAR(25),
    conto_iva DECIMAL(15,2),
    generazione_autofattura BOOLEAN,
    tipo_autofattura_generata VARCHAR(11),
    tipo_autofattura_desc VARCHAR(24),
    conto_iva_vendite DECIMAL(15,2),
    fattura_importo_0 BOOLEAN,
    fattura_valuta_estera BOOLEAN,
    non_considerare_liquidazione_iva BOOLEAN,
    iva_esigibilita_differita VARCHAR(11),
    iva_esigibilita_differita_desc VARCHAR(35),
    fattura_emessa_reg_corrispettivi BOOLEAN,
    gestione_partite VARCHAR(11),
    gestione_partite_desc VARCHAR(41),
    gestione_intrastat BOOLEAN,
    gestione_ritenute_enasarco VARCHAR(13),
    gestione_ritenute_enasarco_desc VARCHAR(27),
    versamento_ritenute BOOLEAN,
    note_movimento DECIMAL(15,2),
    descrizione_documento VARCHAR(15),
    identificativo_estero_clifor BOOLEAN,
    scrittura_rettifica_assestamento BOOLEAN,
    non_stampare_reg_cronologico BOOLEAN,
    movimento_reg_iva_non_rilevante BOOLEAN,
    tipo_movimento_semplificata VARCHAR(13),
    tipo_movimento_semplificata_desc VARCHAR(25)
);

-- Tabella: codici_iva
CREATE TABLE codici_iva (
    codice_iva VARCHAR(14),
    descrizione VARCHAR(50),
    tipo_calcolo VARCHAR(11),
    tipo_calcolo_desc VARCHAR(39),
    aliquota_iva DECIMAL(15,2),
    percentuale_indetraibilita DECIMAL(15,2),
    note VARCHAR(50),
    data_inizio_validita DATE,
    data_fine_validita DATE,
    imponibile_50_corrispettivi BOOLEAN,
    imposta_intrattenimenti DECIMAL(15,2),
    imposta_intrattenimenti_desc VARCHAR(25),
    ventilazione_aliquota_diversa BOOLEAN,
    aliquota_diversa DECIMAL(15,2),
    plafond_acquisti VARCHAR(13),
    plafond_acquisti_desc VARCHAR(25),
    monte_acquisti BOOLEAN,
    plafond_vendite VARCHAR(13),
    plafond_vendite_desc VARCHAR(25),
    no_volume_affari_plafond BOOLEAN,
    gestione_pro_rata VARCHAR(11),
    gestione_pro_rata_desc VARCHAR(25),
    acq_operaz_imponibili_occasionali BOOLEAN,
    comunicazione_dati_iva_vendite DECIMAL(15,2),
    comunicazione_dati_iva_vendite_desc VARCHAR(45),
    agevolazioni_subforniture BOOLEAN,
    comunicazione_dati_iva_acquisti DECIMAL(15,2),
    comunicazione_dati_iva_acquisti_desc VARCHAR(46),
    autofattura_reverse_charge BOOLEAN,
    operazione_esente_occasionale BOOLEAN,
    ces_art38_quater_storno_iva BOOLEAN,
    perc_detrarre_export DECIMAL(15,2),
    acquisti_cessioni VARCHAR(13),
    acquisti_cessioni_desc VARCHAR(32),
    percentuale_compensazione DECIMAL(15,2),
    beni_ammortizzabili BOOLEAN,
    indicatore_territoriale_vendite VARCHAR(13),
    indicatore_territoriale_vendite_desc VARCHAR(37),
    provvigioni_dm340_99 BOOLEAN,
    indicatore_territoriale_acquisti VARCHAR(13),
    indicatore_territoriale_acquisti_desc VARCHAR(40),
    metodo_da_applicare VARCHAR(13),
    metodo_da_applicare_desc VARCHAR(27),
    percentuale_forfetaria DECIMAL(15,2),
    percentuale_forfetaria_desc VARCHAR(25),
    analitico_beni_ammortizzabili BOOLEAN,
    quota_forfetaria DECIMAL(15,2),
    quota_forfetaria_desc VARCHAR(27),
    acquisti_intracomunitari BOOLEAN,
    cessione_prodotti_editoriali BOOLEAN
);

-- Tabella: codici_pagamento
CREATE TABLE codici_pagamento (
    codice_pagamento VARCHAR(18),
    descrizione VARCHAR(27),
    conto_incasso_pagamento DECIMAL(15,2),
    calcola_giorni_commerciali BOOLEAN,
    considera_periodi_chiusura BOOLEAN,
    suddivisione VARCHAR(11),
    suddivisione_desc VARCHAR(26),
    inizio_scadenza VARCHAR(11),
    inizio_scadenza_desc VARCHAR(25),
    numero_rate DECIMAL(15,2)
);

-- Foreign Keys
ALTER TABLE prime_note ADD FOREIGN KEY (Tipo Conto) REFERENCES anagrafiche(Tipo Conto);
ALTER TABLE prime_note ADD FOREIGN KEY (Codice Causale) REFERENCES causali(codice_causale);
ALTER TABLE prime_note ADD FOREIGN KEY (Tipo Registro IVA) REFERENCES causali(tipo_registro_iva);
ALTER TABLE prime_note ADD FOREIGN KEY (Codice IVA) REFERENCES codici_iva(codice_iva);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Impresa Ordinaria) REFERENCES anagrafiche(Contributo Previdenziale);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Impresa Semplificata) REFERENCES anagrafiche(Contributo Previdenziale);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Professionista Ordinario) REFERENCES anagrafiche(Contributo Previdenziale);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Professionista Semplificato) REFERENCES anagrafiche(Contributo Previdenziale);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Impresa Ordinaria) REFERENCES causali(non_considerare_liquidazione_iva);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Impresa Ordinaria) REFERENCES causali(identificativo_estero_clifor);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Impresa Semplificata) REFERENCES causali(non_considerare_liquidazione_iva);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Impresa Semplificata) REFERENCES causali(identificativo_estero_clifor);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Professionista Ordinario) REFERENCES causali(non_considerare_liquidazione_iva);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Professionista Ordinario) REFERENCES causali(identificativo_estero_clifor);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Professionista Semplificato) REFERENCES causali(non_considerare_liquidazione_iva);
ALTER TABLE piano_conti ADD FOREIGN KEY (Valido Professionista Semplificato) REFERENCES causali(identificativo_estero_clifor);
ALTER TABLE anagrafiche ADD FOREIGN KEY (Contributo Previdenziale) REFERENCES causali(non_considerare_liquidazione_iva);
ALTER TABLE anagrafiche ADD FOREIGN KEY (Contributo Previdenziale) REFERENCES causali(identificativo_estero_clifor);
ALTER TABLE prime_note ADD FOREIGN KEY (Tipo Conto) REFERENCES piano_conti(Tipo);
ALTER TABLE anagrafiche ADD FOREIGN KEY (Aliquota) REFERENCES codici_iva(aliquota_iva);
ALTER TABLE anagrafiche ADD FOREIGN KEY (Codice Ritenuta) REFERENCES codici_pagamento(numero_rate);
ALTER TABLE anagrafiche ADD FOREIGN KEY (Ha Partita IVA) REFERENCES causali(non_considerare_liquidazione_iva);
ALTER TABLE anagrafiche ADD FOREIGN KEY (Ha Partita IVA) REFERENCES causali(movimento_reg_iva_non_rilevante);
ALTER TABLE codici_iva ADD FOREIGN KEY (provvigioni_dm340_99) REFERENCES codici_pagamento(considera_periodi_chiusura);
ALTER TABLE prime_note ADD FOREIGN KEY (Descrizione Causale) REFERENCES causali(descrizione_causale);