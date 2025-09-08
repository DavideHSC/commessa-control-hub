-- Query Definitiva di Test e Progettazione per un Singolo Movimento Contabile
-- Sostituisci '012025110002' con il codiceUnivocoScaricamento che vuoi analizzare
WITH "MovimentoBase" AS (
  SELECT * FROM staging_testate WHERE "codiceUnivocoScaricamento" IN ('012025110002', '012025110724')
),
"RigheContabili" AS (
  SELECT * FROM staging_righe_contabili WHERE "codiceUnivocoScaricamento" IN ('012025110002', '012025110724')
),
"RigheIva" AS (
  SELECT * FROM staging_righe_iva WHERE "codiceUnivocoScaricamento" IN ('012025110002', '012025110724')
),
"Allocazioni" AS (
  SELECT * FROM staging_allocazioni WHERE "codiceUnivocoScaricamento" IN ('012025110002', '012025110724')
)

SELECT 
  -- [LIVELLO 1: INFORMAZIONI GENERALI DEL MOVIMENTO]
  b."codiceUnivocoScaricamento",
  b."dataRegistrazione",
  b."numeroDocumento",
  b."dataDocumento",
  b."totaleDocumento",
  b."stato" AS "stato_movimento_cod",
  CASE b."stato"
    WHEN 'D' THEN 'Definitiva'
    WHEN 'P' THEN 'Provvisoria'
    WHEN 'V' THEN 'Da Verificare'
    ELSE 'Sconosciuto'
  END AS "stato_movimento_descr",

  -- Dati arricchiti dalla causale
  b."codiceCausale",
  caus."descrizione" AS "causale_descr",
  caus."tipoMovimento" AS "causale_tipo_mov_cod",
  caus."gestionePartite" AS "causale_gest_partite_cod",
  caus."versamentoRitenute" AS "causale_flag_vers_ritenute",

  -- [LIVELLO 2: SOGGETTO PRINCIPALE DEL MOVIMENTO]
  b."clienteFornitoreSigla" AS "soggetto_cod",
  anag."denominazione" AS "soggetto_descr",
  anag."tipoConto" AS "soggetto_tipo_cod",
  anag."partitaIva",

  -- [LIVELLO 3: DETTAGLIO DELLA RIGA CONTABILE]
  rc."progressivoRigo",
  rc."conto" AS "riga_conto_cod",
  rc."importoDare",
  rc."importoAvere",
  rc."note" AS "riga_note",
  rc."insDatiMovimentiAnalitici" AS "riga_flag_has_analitica",

  -- [LIVELLO 4: ARRICCHIMENTO DELLA RIGA CONTABILE]
  conti."descrizione" AS "riga_conto_descr",
  conti."gruppo" AS "riga_conto_gruppo_cod",
  CASE upper(conti."gruppo")
    WHEN 'A' THEN 'Attività'
    WHEN 'C' THEN 'Costo'
    WHEN 'N' THEN 'Patrimonio Netto'
    WHEN 'P' THEN 'Passività'
    WHEN 'R' THEN 'Ricavo'
    ELSE 'N/D'
  END AS "riga_conto_gruppo_descr",
  
  -- [LIVELLO 5: BUSINESS INTELLIGENCE DERIVATA SULLA RIGA]
  CASE
    WHEN upper(conti."gruppo") IN ('C', 'R') THEN TRUE
    ELSE FALSE
  END AS "is_allocabile",
  
  CASE
    WHEN upper(rc."tipoConto") IN ('C', 'F') THEN TRUE
    ELSE FALSE
  END AS "is_riga_soggetto",
    
  -- [LIVELLO 6: DETTAGLI OPZIONALI - IVA E ANALITICA]
  ri."codiceIva",
  iva."descrizione" AS "iva_descr",
  ri."imponibile",
  ri."imposta",
  alloc."centroDiCosto",
  alloc."parametro" AS "importo_analitica"

FROM 
  "MovimentoBase" b

LEFT JOIN "RigheContabili" rc 
  ON b."codiceUnivocoScaricamento" = rc."codiceUnivocoScaricamento"

LEFT JOIN staging_conti conti 
  ON rc."conto" = conti."codice"

LEFT JOIN staging_causali_contabili caus 
  ON b."codiceCausale" = caus."codiceCausale"

LEFT JOIN staging_anagrafiche anag 
  ON b."clienteFornitoreSigla" = anag."codiceAnagrafica"

LEFT JOIN "RigheIva" ri 
  ON rc."codiceUnivocoScaricamento" = ri."codiceUnivocoScaricamento"
  AND (rc."conto" = ri."contropartita" OR rc."siglaConto" = ri."siglaContropartita")

LEFT JOIN staging_codici_iva iva 
  ON ri."codiceIva" = iva."codice"

LEFT JOIN "Allocazioni" alloc 
  ON rc."codiceUnivocoScaricamento" = alloc."codiceUnivocoScaricamento"
  AND rc."progressivoRigo" = alloc."progressivoRigoContabile"

ORDER BY 
  rc."codiceUnivocoScaricamento", CAST(rc."progressivoRigo" AS INTEGER);
