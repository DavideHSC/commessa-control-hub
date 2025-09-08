-- Query Definitiva di Test e Progettazione
-- Utilizza CTE per unire e arricchire gerarchicamente i dati di un singolo movimento
-- Sostituisci '012025110002' con il codiceUnivocoScaricamento che vuoi analizzare

WITH 
-- STEP 1: Isola e arricchisci la Testata del movimento
Testata_Arricchita AS (
  SELECT
    t."codiceUnivocoScaricamento",
    t."dataRegistrazione",
    t."codiceCausale",
    t."numeroDocumento",
    t."dataDocumento",
    t."totaleDocumento",
    t.stato AS "stato_movimento_cod",
    -- Decodifica "enum" per lo stato del movimento (da PNTESTA.md)
    CASE t.stato
      WHEN 'D' THEN 'Definitiva'
      WHEN 'P' THEN 'Provvisoria'
      WHEN 'V' THEN 'Da Verificare'
      ELSE 'Sconosciuto'
    END AS "stato_movimento_descr",
    
    -- Risoluzione Anagrafica Principale
    t."clienteFornitoreSigla" AS "soggetto_cod",
    anag.denominazione AS "soggetto_descr",
    
    -- Risoluzione Causale Contabile
    caus.descrizione AS "causale_descr",
    caus."gestionePartite" AS "causale_info_gestione_partite",
    caus."gestioneRitenuteEnasarco" AS "causale_info_gestione_ritenute",
    caus."versamentoRitenute" AS "causale_info_flag_vers_ritenute"
    
  FROM staging_testate t
  LEFT JOIN staging_causali_contabili caus ON t."codiceCausale" = caus."codiceCausale"
  LEFT JOIN staging_anagrafiche anag ON t."clienteFornitoreSigla" = anag."codiceAnagrafica"
  WHERE t."codiceUnivocoScaricamento" = '012025110002'
),

-- STEP 2: Isola e arricchisci TUTTE le righe contabili del movimento
Righe_Arricchite AS (
  SELECT 
    r."codiceUnivocoScaricamento",
    r."progressivoRigo",
    r."conto",
    r."importoDare",
    r."importoAvere",
    r."note",
    
    -- Risoluzione anagrafica a livello di riga (se presente)
    anag_riga.denominazione AS "riga_soggetto_descr",

    -- Arricchimento dal Piano dei Conti (staging_conti)
    conti.descrizione AS "conto_descr",
    conti.gruppo AS "conto_gruppo_cod",
    conti.tipo AS "conto_tipo_cod",
    
    -- Derivazione della LOGICA DI BUSINESS basata sugli "enum"
    CASE
      WHEN upper(conti.gruppo) IN ('C', 'R') THEN TRUE -- Gruppo 'C' (Costo) o 'R' (Ricavo)
      ELSE FALSE
    END AS "is_allocabile",
    
    CASE
      WHEN upper(r."tipoConto") IN ('C', 'F') THEN TRUE -- tipoConto 'C' (Cliente) o 'F' (Fornitore)
      ELSE FALSE
    END AS "is_riga_soggetto"
    
  FROM staging_righe_contabili r
  LEFT JOIN staging_conti conti ON r.conto = conti.codice
  LEFT JOIN staging_anagrafiche anag_riga ON r."clienteFornitoreSigla" = anag_riga."codiceAnagrafica"
  WHERE r."codiceUnivocoScaricamento" = '012025110002'
),

-- STEP 3: Isola e arricchisci le righe IVA
Righe_IVA_Arricchite AS (
  SELECT
    ri."codiceUnivocoScaricamento",
    ri.contropartita, -- La chiave per collegare alla riga contabile
    ri."codiceIva",
    civa.descrizione AS "iva_descr",
    civa.aliquota,
    ri.imponibile,
    ri.imposta
  FROM staging_righe_iva ri
  LEFT JOIN staging_codici_iva civa ON ri."codiceIva" = civa.codice
  WHERE ri."codiceUnivocoScaricamento" = '012025110002'
),

-- STEP 4: Isola le allocazioni analitiche
Allocazioni_Arricchite AS (
  SELECT 
    a."codiceUnivocoScaricamento",
    a."progressivoRigoContabile", -- La chiave per collegare alla riga contabile
    a."centroDiCosto",
    a.parametro AS "importo_allocato"
  FROM staging_allocazioni a
  WHERE a."codiceUnivocoScaricamento" = '012025110002'
)

-- STEP 5: ASSEMBLAGGIO FINALE - Uniamo gli strati di dati
SELECT 
  t.*, -- Tutte le informazioni arricchite della testata
  
  -- Informazioni arricchite dalla riga
  r."progressivoRigo",
  r.conto,
  r."conto_descr",
  r."riga_soggetto_descr",
  r."conto_gruppo_cod",
  r."conto_tipo_cod",
  r."importoDare",
  r."importoAvere",
  r.note,
  
  -- L'INTELLIGENCE DI BUSINESS che abbiamo derivato
  r."is_allocabile",
  r."is_riga_soggetto",
  
  -- Dettagli arricchiti da IVA e Allocazioni, collegati alla riga specifica
  iva."codiceIva",
  iva.iva_descr,
  iva.aliquota AS "iva_aliquota",
  iva.imponibile AS "iva_imponibile",
  iva.imposta AS "iva_imposta",
  
  alloc."centroDiCosto",
  alloc."importo_allocato"
  
FROM Testata_Arricchita t
JOIN Righe_Arricchite r ON t."codiceUnivocoScaricamento" = r."codiceUnivocoScaricamento"
-- Collega ogni riga contabile ai suoi (eventuali) dettagli IVA e Analitici
LEFT JOIN Righe_IVA_Arricchite iva ON r."codiceUnivocoScaricamento" = iva."codiceUnivocoScaricamento" AND r.conto = iva.contropartita
LEFT JOIN Allocazioni_Arricchite alloc ON r."codiceUnivocoScaricamento" = alloc."codiceUnivocoScaricamento" AND r."progressivoRigo" = alloc."progressivoRigoContabile"
ORDER BY 
  CAST(r."progressivoRigo" AS INTEGER);