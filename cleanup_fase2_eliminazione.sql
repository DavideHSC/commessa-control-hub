-- ============================================
-- FASE 2: ELIMINAZIONE DUPLICATI (PERICOLOSO!)
-- ESEGUIRE SOLO DOPO AVER VERIFICATO I BACKUP
-- ============================================

-- Step 1: Elimina duplicati scritture (mantiene la prima)
DELETE FROM "ScritturaContabile" 
WHERE "id" IN (
    SELECT "id" 
    FROM (
        SELECT "id", 
               ROW_NUMBER() OVER (
                   PARTITION BY "externalId" 
                   ORDER BY "createdAt" ASC
               ) as rn
        FROM "ScritturaContabile"
        WHERE "externalId" IS NOT NULL
    ) ranked
    WHERE rn > 1
);

-- Verifica: conta scritture rimaste
SELECT 
    'DOPO CLEANUP SCRITTURE' as fase,
    COUNT(*) as total_scritture,
    COUNT(DISTINCT "externalId") as distinct_external_ids
FROM "ScritturaContabile"
WHERE "externalId" IS NOT NULL;

-- Step 2: Elimina righe orfane
DELETE FROM "RigaScrittura" 
WHERE "scritturaContabileId" NOT IN (
    SELECT "id" FROM "ScritturaContabile"
);

-- Verifica: conta righe rimaste
SELECT 
    'DOPO CLEANUP RIGHE' as fase,
    COUNT(*) as total_righe
FROM "RigaScrittura";

-- Step 3: Elimina duplicati righe IVA
DELETE FROM "RigaIva" 
WHERE "id" IN (
    SELECT "id" 
    FROM (
        SELECT "id", 
               ROW_NUMBER() OVER (
                   PARTITION BY "codiceIvaId", "rigaScritturaId"
                   ORDER BY "id" ASC
               ) as rn
        FROM "RigaIva"
        WHERE "rigaScritturaId" IS NOT NULL
    ) ranked
    WHERE rn > 1
);

-- Verifica: conta righe IVA rimaste
SELECT 
    'DOPO CLEANUP RIGHE IVA' as fase,
    COUNT(*) as total_righe_iva
FROM "RigaIva";

-- Step 4: Elimina duplicati allocazioni
DELETE FROM "Allocazione" 
WHERE "id" IN (
    SELECT "id" 
    FROM (
        SELECT "id", 
               ROW_NUMBER() OVER (
                   PARTITION BY "rigaScritturaId", "commessaId", "voceAnaliticaId"
                   ORDER BY "createdAt" ASC
               ) as rn
        FROM "Allocazione"
    ) ranked
    WHERE rn > 1
);

-- Elimina allocazioni orfane
DELETE FROM "Allocazione" 
WHERE "rigaScritturaId" NOT IN (
    SELECT "id" FROM "RigaScrittura"
);

-- Verifica finale
SELECT 
    'CLEANUP COMPLETATO' as fase,
    (SELECT COUNT(*) FROM "ScritturaContabile") as scritture_finali,
    (SELECT COUNT(*) FROM "RigaScrittura") as righe_finali,
    (SELECT COUNT(*) FROM "RigaIva") as righe_iva_finali,
    (SELECT COUNT(*) FROM "Allocazione") as allocazioni_finali;