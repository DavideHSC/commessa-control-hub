-- ============================================
-- SCRIPT CLEANUP DATABASE - ELIMINAZIONE DUPLICATI
-- ESEGUIRE NELL'ORDINE SPECIFICATO
-- ============================================

-- FASE 1: BACKUP DATI CRITICI
-- Crea tabelle di backup prima del cleanup
CREATE TABLE IF NOT EXISTS backup_scritture AS 
SELECT * FROM "ScritturaContabile";

CREATE TABLE IF NOT EXISTS backup_righe AS 
SELECT * FROM "RigaScrittura";

CREATE TABLE IF NOT EXISTS backup_allocazioni AS 
SELECT * FROM "Allocazione";

-- FASE 2: IDENTIFICAZIONE DUPLICATI
-- Verifica duplicati nelle scritture
SELECT 
    "externalId", 
    COUNT(*) as count_duplicates,
    STRING_AGG("id", ', ') as ids_duplicati
FROM "ScritturaContabile" 
WHERE "externalId" IS NOT NULL
GROUP BY "externalId"
HAVING COUNT(*) > 1
ORDER BY count_duplicates DESC;

-- Verifica duplicati nelle righe IVA
SELECT 
    COUNT(*) as total_righe_iva,
    COUNT(DISTINCT ("codiceIvaId", "rigaScritturaId")) as distinct_combinations
FROM "RigaIva";

-- FASE 3: ELIMINAZIONE DUPLICATI SCRITTURE
-- Mantiene solo la prima occorrenza per ogni externalId
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

-- FASE 4: ELIMINAZIONE DUPLICATI RIGHE SCRITTURA
-- Elimina righe orfane (scritture non esistenti)
DELETE FROM "RigaScrittura" 
WHERE "scritturaContabileId" NOT IN (
    SELECT "id" FROM "ScritturaContabile"
);

-- FASE 5: ELIMINAZIONE DUPLICATI RIGHE IVA
-- Elimina righe IVA duplicate mantenendo la prima per combinazione
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

-- FASE 6: ELIMINAZIONE DUPLICATI ALLOCAZIONI
-- Elimina allocazioni duplicate per stessa riga+commessa+voce
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

-- FASE 7: ELIMINAZIONE ALLOCAZIONI ORFANE
-- Elimina allocazioni per righe non esistenti
DELETE FROM "Allocazione" 
WHERE "rigaScritturaId" NOT IN (
    SELECT "id" FROM "RigaScrittura"
);

-- FASE 8: VERIFICA POST-CLEANUP
-- Verifica conteggi finali
SELECT 
    'POST-CLEANUP' as stato,
    (SELECT COUNT(*) FROM "ScritturaContabile") as scritture,
    (SELECT COUNT(*) FROM "RigaScrittura") as righe_scrittura,
    (SELECT COUNT(*) FROM "RigaIva") as righe_iva,
    (SELECT COUNT(*) FROM "Allocazione") as allocazioni;

-- Verifica che non ci siano più duplicati
SELECT 
    'Duplicati rimasti' as check_type,
    COUNT(*) as count
FROM (
    SELECT "externalId" 
    FROM "ScritturaContabile" 
    WHERE "externalId" IS NOT NULL
    GROUP BY "externalId"
    HAVING COUNT(*) > 1
) duplicates;

-- FASE 9: REINDEX E VACUUM
-- Ottimizza database dopo cleanup
REINDEX DATABASE "commessa-control-hub";
VACUUM ANALYZE;