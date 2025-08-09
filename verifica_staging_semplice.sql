-- Verifica struttura tabelle staging vs produzione
-- Esegui questi comandi uno per volta

-- 1. Analisi StagingConto vs Conto
SELECT 'StagingConto' as tabella, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'staging_conti' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Conto' as tabella, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Conto' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verifica conteggi critici
SELECT 
  'STAGING' as tipo,
  (SELECT COUNT(*) FROM staging_conti) as conti,
  (SELECT COUNT(*) FROM staging_anagrafiche) as anagrafiche,
  (SELECT COUNT(*) FROM staging_testate) as testate,
  (SELECT COUNT(*) FROM staging_righe_contabili) as righe_contabili,
  (SELECT COUNT(*) FROM staging_righe_iva) as righe_iva;

SELECT 
  'PRODUZIONE' as tipo,
  (SELECT COUNT(*) FROM "Conto") as conti,
  (SELECT COUNT(*) FROM "Cliente") as clienti,
  (SELECT COUNT(*) FROM "Fornitore") as fornitori,
  (SELECT COUNT(*) FROM "ScritturaContabile") as scritture,
  (SELECT COUNT(*) FROM "RigaScrittura") as righe_scrittura,
  (SELECT COUNT(*) FROM "RigaIva") as righe_iva;

-- 3. Analisi duplicazioni (possibile causa moltiplicazione)
SELECT 
  'Duplicati Scritture' as tipo,
  COUNT(*) as totale,
  COUNT(DISTINCT "externalId") as distinct_external_id
FROM "ScritturaContabile" 
WHERE "externalId" IS NOT NULL;

SELECT 
  'Duplicati Righe' as tipo,
  COUNT(*) as totale,
  COUNT(DISTINCT "scritturaContabileId") as distinct_scrittura_id
FROM "RigaScrittura";