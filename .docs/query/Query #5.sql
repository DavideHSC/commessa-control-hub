-- Query Avanzata per Vista Movimento Contabile Arricchito

SELECT
  -- [Info Movimento]
  t."codiceUnivocoScaricamento" AS "id_movimento",
  t."dataRegistrazione",
  
  -- [Info Causale Arricchita]
  t."codiceCausale" AS "causale_cod",
  cc.descrizione AS "causale_descr",

  -- [Info Documento]
  t."numeroDocumento",
  t."dataDocumento",
  
  -- [Info Soggetto Arricchita]
  t."clienteFornitoreSigla" AS "soggetto_cod",
  a.denominazione AS "soggetto_descr",
  a."tipoSoggetto" AS "soggetto_tipo", -- Es. 'PF' (Persona Fisica), 'PNF' (Non Fisica)

  -- [Info Riga Contabile]
  r."progressivoRigo",
  r.conto AS "conto_cod",
  c.descrizione AS "conto_descr",

  -- [CLASSIFICAZIONE CONTO - La parte più importante]
  c.gruppo AS "conto_gruppo_cod",
  CASE
    WHEN upper(c.gruppo) = 'A' THEN 'Attività'
    WHEN upper(c.gruppo) = 'C' THEN 'Costo'
    WHEN upper(c.gruppo) = 'N' THEN 'Patrimonio Netto'
    WHEN upper(c.gruppo) = 'P' THEN 'Passività'
    WHEN upper(c.gruppo) = 'R' THEN 'Ricavo'
    ELSE 'Non Definito'
  END AS "conto_gruppo_descr",
  
  c.tipo AS "conto_tipo_cod",
  CASE
    WHEN upper(c.tipo) = 'P' THEN 'Patrimoniale'
    WHEN upper(c.tipo) = 'E' THEN 'Economico'
    WHEN upper(c.tipo) = 'O' THEN 'Ordine'
    WHEN upper(c.tipo) = 'C' THEN 'Cliente'
    WHEN upper(c.tipo) = 'F' THEN 'Fornitore'
    ELSE 'Non Definito'
  END AS "conto_tipo_descr",

  -- [Flag di Business Logic Derivata]
  -- Identifica se la riga è un costo/ricavo e quindi candidata all'allocazione
  CASE
    WHEN upper(c.gruppo) IN ('C', 'R') THEN TRUE
    ELSE FALSE
  END AS "is_allocabile",

  -- Identifica se la riga rappresenta un Cliente o Fornitore
  CASE
    WHEN upper(r."tipoConto") IN ('C', 'F') THEN TRUE
    ELSE FALSE
  END AS "is_riga_anagrafica",

  -- [Valori Monetari]
  r."importoDare",
  r."importoAvere",
  r.note AS "note_riga"

FROM 
  staging_testate t

-- JOIN con le righe è obbligatoria
INNER JOIN staging_righe_contabili r 
  ON t."codiceUnivocoScaricamento" = r."codiceUnivocoScaricamento"

-- JOIN con i conti è fondamentale ma può fallire per righe Cli/For, quindi LEFT
LEFT JOIN staging_conti c 
  ON r.conto = c.codice

-- JOIN con le anagrafiche. Usiamo la SIGLA sulla RIGA se presente, altrimenti quella sulla TESTATA.
-- Questo gestisce casi dove una singola scrittura ha più fornitori (raro ma possibile).
LEFT JOIN staging_anagrafiche a 
  ON COALESCE(NULLIF(TRIM(r."clienteFornitoreSigla"), ''), NULLIF(TRIM(t."clienteFornitoreSigla"), '')) = a."codiceAnagrafica"

-- JOIN con le causali
LEFT JOIN staging_causali_contabili cc 
  ON t."codiceCausale" = cc."codiceCausale"
  
WHERE
  t."codiceUnivocoScaricamento" IN ('012025110001', '012025110002', '012025110004') -- Esempio per limitare i risultati
  
ORDER BY 
  t."codiceUnivocoScaricamento", 
  CAST(r."progressivoRigo" AS INTEGER);