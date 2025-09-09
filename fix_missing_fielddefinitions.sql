-- CORREZIONE CRITICA: Aggiunta FieldDefinitions Mancanti per Scritture Contabili
-- Problema: clienteFornitoreSigla e clienteFornitoreSubcodice non vengono importati
-- Root Cause: FieldDefinitions incomplete per template scritture_contabili

-- 1. Verifica template ID
SELECT id, name FROM "ImportTemplate" WHERE name = 'scritture_contabili';

-- 2. Stato attuale FieldDefinitions per clienteFornitoreSigla (dovrebbe essere vuoto)
SELECT f."fieldName", f."fileIdentifier", f.start, f.length, f.end 
FROM "FieldDefinition" f
JOIN "ImportTemplate" t ON f."templateId" = t.id  
WHERE t.name = 'scritture_contabili' 
  AND f."fieldName" ILIKE '%sigla%'
ORDER BY f."fileIdentifier", f.start;

-- 3. AGGIUNTA CAMPI CRITICI MANCANTI
-- Template ID da sostituire con quello reale: cmfbb7l12005iax8fcx8uz72i

-- PNTESTA.TXT - Campi mancanti critici
INSERT INTO "FieldDefinition" ("templateId", "fileIdentifier", "fieldName", start, length, end, format) VALUES
-- Campo clienteFornitoreSubcodice (pos 116, len 1)
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'clienteFornitoreSubcodice', 116, 1, 116, NULL),
-- Campo clienteFornitoreSigla (pos 117-128, len 12) - CRITICO PER GOLDENERGY
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'clienteFornitoreSigla', 117, 12, 128, NULL);

-- PNRIGCON.TXT - Campi mancanti critici  
INSERT INTO "FieldDefinition" ("templateId", "fileIdentifier", "fieldName", start, length, end, format) VALUES
-- Campo clienteFornitoreSubcodice (pos 36, len 1)
('cmfbb7l12005iax8fcx8uz72i', 'PNRIGCON.TXT', 'clienteFornitoreSubcodice', 36, 1, 36, NULL),
-- Campo clienteFornitoreSigla (pos 37-48, len 12) - CRITICO PER LOOKUP
('cmfbb7l12005iax8fcx8uz72i', 'PNRIGCON.TXT', 'clienteFornitoreSigla', 37, 12, 48, NULL);

-- 4. Verifica inserimenti
SELECT f."fieldName", f."fileIdentifier", f.start, f.length, f.end 
FROM "FieldDefinition" f
JOIN "ImportTemplate" t ON f."templateId" = t.id  
WHERE t.name = 'scritture_contabili' 
  AND (f."fieldName" ILIKE '%sigla%' OR f."fieldName" ILIKE '%subcodice%')
ORDER BY f."fileIdentifier", f.start;

-- 5. CAMPI AGGIUNTIVI IMPORTANTI (opzionale - per completezza)
-- Questi non sono critici per il bug GOLDENERGY ma potrebbero essere utili

-- PNTESTA.TXT - Altri campi del tracciato non mappati
INSERT INTO "FieldDefinition" ("templateId", "fileIdentifier", "fieldName", start, length, end, format) VALUES
-- Codice attività (pos 33-34)
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'codiceAttivita', 33, 2, 34, NULL),
-- Esercizio (pos 35-39)  
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'esercizio', 35, 5, 39, NULL),
-- Descrizione causale (pos 46-85)
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'descrizioneCausale', 46, 40, 85, NULL),
-- Tipo registro IVA (pos 96)
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'tipoRegistroIva', 96, 1, 96, NULL),
-- Stato (pos 341)
('cmfbb7l12005iax8fcx8uz72i', 'PNTESTA.TXT', 'stato', 341, 1, 341, NULL);

-- PNRIGCON.TXT - Altri campi importanti
INSERT INTO "FieldDefinition" ("templateId", "fileIdentifier", "fieldName", start, length, end, format) VALUES
-- Flag dati competenza contabile (pos 143)
('cmfbb7l12005iax8fcx8uz72i', 'PNRIGCON.TXT', 'insDatiCompetenzaContabile', 143, 1, 143, NULL),
-- Data inizio competenza (pos 144-151)
('cmfbb7l12005iax8fcx8uz72i', 'PNRIGCON.TXT', 'dataInizioCompetenza', 144, 8, 151, 'date:DDMMYYYY'),
-- Data fine competenza (pos 152-159)
('cmfbb7l12005iax8fcx8uz72i', 'PNRIGCON.TXT', 'dataFineCompetenza', 152, 8, 159, 'date:DDMMYYYY'),
-- Sigla conto (pos 301-312)
('cmfbb7l12005iax8fcx8uz72i', 'PNRIGCON.TXT', 'siglaConto', 301, 12, 312, NULL);

-- 6. VERIFICA FINALE - Tutti i campi cliente/fornitore ora presenti
SELECT 
    f."fieldName", 
    f."fileIdentifier", 
    f.start, 
    f.length, 
    f.end,
    CASE 
        WHEN f."fieldName" ILIKE '%sigla%' THEN '🎯 CRITICO'
        WHEN f."fieldName" ILIKE '%subcodice%' THEN '🎯 CRITICO' 
        ELSE '✅ Esistente'
    END as priorita
FROM "FieldDefinition" f
JOIN "ImportTemplate" t ON f."templateId" = t.id  
WHERE t.name = 'scritture_contabili' 
  AND (
    f."fieldName" ILIKE '%cliente%' OR 
    f."fieldName" ILIKE '%fornitore%'
  )
ORDER BY f."fileIdentifier", f.start;