-- Corregge i valori NULL nelle tabelle di staging per permettere la migrazione.

-- Aggiorna la tabella delle righe IVA
UPDATE "public"."ImportScritturaRigaIva" SET 
  "imponibile" = 0
WHERE "imponibile" IS NULL;

UPDATE "public"."ImportScritturaRigaIva" SET 
  "imposta" = 0
WHERE "imposta" IS NULL;

-- Aggiorna la tabella delle testate delle scritture
-- Nota: usiamo valori di default come 'N/D' (Non Disponibile) per i campi stringa
UPDATE "public"."ImportScritturaTestata" SET 
  "codiceCliFor" = 'N/D'
WHERE "codiceCliFor" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "descrizioneCliFor" = 'Dato Mancante'
WHERE "descrizioneCliFor" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "importo" = 0
WHERE "importo" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "numeroRegistrazione" = 'N/D'
WHERE "numeroRegistrazione" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "protocollo" = 'N/D'
WHERE "protocollo" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "protocolloDocumento" = 'N/D'
WHERE "protocolloDocumento" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "dataDocumento" = NOW()
WHERE "dataDocumento" IS NULL;

UPDATE "public"."ImportScritturaTestata" SET 
  "codiceValuta" = 'EUR'
WHERE "codiceValuta" IS NULL; 