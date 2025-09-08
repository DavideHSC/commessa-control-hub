-- Check for old "185" records in staging data
SELECT 'StagingRigaIva codiceIva distribution' as table_name;
SELECT codiceIva, COUNT(*) as count 
FROM "StagingRigaIva" 
GROUP BY codiceIva 
ORDER BY COUNT(*) DESC 
LIMIT 10;

SELECT 'StagingTestata count' as info;
SELECT COUNT(*) as total_testate FROM "StagingTestata";

SELECT 'StagingRigaContabile count' as info;
SELECT COUNT(*) as total_righe FROM "StagingRigaContabile";

SELECT 'Recent import timestamps' as info;
SELECT DISTINCT dataRegistrazione 
FROM "StagingTestata" 
ORDER BY dataRegistrazione DESC 
LIMIT 5;