-- Query per verificare i dati CONTIGEN nel database

-- 1. Verifica che ci siano dati in StagingConto
SELECT COUNT(*) as staging_conti_count FROM staging_conti;

-- 2. Verifica che ci siano dati in Conto  
SELECT COUNT(*) as conti_count FROM "Conto";

-- 3. Cerca il conto 4855000550 negli screenshot
SELECT 
  sc.codice as staging_codice,
  sc.descrizione as staging_descrizione,
  sc.tipo as staging_tipo,
  sc.sigla as staging_sigla,
  sc.gruppo as staging_gruppo
FROM staging_conti sc 
WHERE sc.codice = '4855000550';

-- 4. Cerca il conto 4855000550 in produzione
SELECT 
  c.codice as prod_codice,
  c.nome as prod_nome,
  c."externalId" as external_id
FROM "Conto" c 
WHERE c.codice = '4855000550' OR c."externalId" = '4855000550';

-- 5. Mostra alcuni esempi di dati CONTIGEN
SELECT 
  codice, descrizione, tipo, sigla, gruppo, livello
FROM staging_conti 
WHERE descrizione IS NOT NULL 
AND descrizione != '' 
AND codice LIKE '4855%'
LIMIT 5;