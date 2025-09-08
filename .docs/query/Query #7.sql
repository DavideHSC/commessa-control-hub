SELECT 
r.conto,
c.codice,
c.tipo,
c.descrizione,
c.gruppo
FROM staging_righe_contabili r
LEFT JOIN staging_conti c ON c.codice = r.conto
WHERE r."tipoConto" = '' AND c.gruppo IN ('C', 'R')
ORDER BY r.conto