SELECT 
t."codiceUnivocoScaricamento",
  cc."codiceCausale",
  cc.descrizione
FROM staging_testate t
LEFT JOIN staging_causali_contabili cc 
  ON t."codiceCausale" = cc."codiceCausale"
GROUP BY t."codiceUnivocoScaricamento", cc."codiceCausale", cc.descrizione