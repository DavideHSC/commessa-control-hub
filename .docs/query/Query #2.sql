SELECT 
  t."codiceUnivocoScaricamento" AS "movimento", 
  r.conto AS "conto_movimento",
  c.descrizione AS "conto_movimento_descr",

  -- descrizione per r."tipoConto"
  CASE
    WHEN trim(coalesce(r."tipoConto", '')) = '' THEN 'Sottoconto'
    WHEN upper(trim(r."tipoConto")) = 'C' THEN 'Cliente'
    WHEN upper(trim(r."tipoConto")) = 'F' THEN 'Fornitore'
    ELSE r."tipoConto"
  END AS "tipo_da_tighe",

  -- descrizione per c.tipo
  CASE
    WHEN upper(trim(c.tipo)) = 'P' THEN 'Patrimoniale'
    WHEN upper(trim(c.tipo)) = 'E' THEN 'Economico'
    WHEN upper(trim(c.tipo)) = 'O' THEN 'Conto d''ordine'
    WHEN upper(trim(c.tipo)) = 'C' THEN 'Cliente'
    WHEN upper(trim(c.tipo)) = 'F' THEN 'Fornitore'
    ELSE c.tipo
  END AS "tipo_da_conti",

  -- colonna GRUPPO con codice e descrizione
  c.gruppo AS "gruppo_codice",
  CASE
    WHEN trim(coalesce(c.gruppo, '')) = '' THEN '(vuoto)'
    WHEN upper(c.gruppo) = 'A' THEN 'Attività'
    WHEN upper(c.gruppo) = 'C' THEN 'Costo'
    WHEN upper(c.gruppo) = 'N' THEN 'Patrimonio Netto'
    WHEN upper(c.gruppo) = 'P' THEN 'Passività'
    WHEN upper(c.gruppo) = 'R' THEN 'Ricavo'
    WHEN upper(c.gruppo) = 'V' THEN 'Rettifiche di Costo'
    WHEN upper(c.gruppo) = 'Z' THEN 'Rettifiche di Ricavo'
    ELSE c.gruppo
  END AS "gruppo_descrizione",

  r."importoDare",
  r."importoAvere",
  a."codiceAnagrafica",
  t."clienteFornitoreSigla",
  a.denominazione AS "ragione_sociale",
  cc."codiceCausale",
  cc.descrizione,
  ri."codiceIva",
  ci.codice,
  ci.descrizione
FROM staging_testate t
LEFT JOIN staging_righe_contabili r 
  ON t."codiceUnivocoScaricamento" = r."codiceUnivocoScaricamento"
LEFT JOIN staging_conti c 
  ON r.conto = c.codice
LEFT JOIN staging_anagrafiche a 
  ON t."clienteFornitoreSigla" = a."codiceAnagrafica"
LEFT JOIN staging_causali_contabili cc 
  ON t."codiceCausale" = cc."codiceCausale"
     AND trim(coalesce(r."tipoConto", '')) <> ''
LEFT JOIN staging_righe_iva ri 
  ON t."codiceUnivocoScaricamento" = ri."codiceUnivocoScaricamento"
LEFT JOIN staging_codici_iva ci 
  ON ri."codiceIva" = ci."codice"
ORDER BY t."codiceUnivocoScaricamento"
LIMIT	20
