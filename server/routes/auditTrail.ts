import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/allocation/audit - Recupera log di audit con paginazione
router.get('/', async (req, res) => {
    try {
        const { 
            page = '1', 
            limit = '25', 
            search = '',
            sortBy = 'timestamp',
            sortOrder = 'desc'
        } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * pageSize;
        const take = pageSize;

        // Simuliamo i dati di audit (in un sistema reale questi sarebbero memorizzati in una tabella dedicata)
        const mockAuditData = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minuti fa
                userId: 'user1',
                userName: 'Mario Rossi',
                action: 'CREATE',
                entityType: 'ALLOCATION',
                entityId: 'alloc_001',
                oldValues: null,
                newValues: {
                    commessaId: 'comm_123',
                    voceAnaliticaId: 'voce_456',
                    importo: 1500.00,
                    tipoMovimento: 'COSTO_EFFETTIVO'
                },
                description: 'Creata nuova allocazione per commessa PROGETTO-WEB-2024',
                canRollback: true,
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 ora fa
                userId: 'user2',
                userName: 'Laura Bianchi',
                action: 'UPDATE',
                entityType: 'ALLOCATION',
                entityId: 'alloc_002',
                oldValues: {
                    importo: 1200.00,
                    voceAnaliticaId: 'voce_123'
                },
                newValues: {
                    importo: 1350.00,
                    voceAnaliticaId: 'voce_456'
                },
                description: 'Aggiornato importo e voce analitica per allocazione',
                canRollback: true,
                ipAddress: '192.168.1.101',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 ore fa
                userId: 'system',
                userName: 'Sistema Automatico',
                action: 'CREATE',
                entityType: 'RULE',
                entityId: 'rule_001',
                oldValues: null,
                newValues: {
                    contoId: 'conto_789',
                    commessaId: 'comm_456',
                    percentuale: 75,
                    attiva: true
                },
                description: 'Creata regola automatica per conto 60010001 - MATERIALI',
                canRollback: true,
                ipAddress: '127.0.0.1',
                userAgent: 'Sistema/1.0'
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 ore fa
                userId: 'user1',
                userName: 'Mario Rossi',
                action: 'DELETE',
                entityType: 'ALLOCATION',
                entityId: 'alloc_003',
                oldValues: {
                    commessaId: 'comm_789',
                    voceAnaliticaId: 'voce_123',
                    importo: 800.00,
                    tipoMovimento: 'COSTO_EFFETTIVO'
                },
                newValues: null,
                description: 'Eliminata allocazione errata per commessa MANUTENZIONE-2024',
                canRollback: true,
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 ore fa
                userId: 'user3',
                userName: 'Giuseppe Verdi',
                action: 'ROLLBACK',
                entityType: 'ALLOCATION',
                entityId: 'alloc_004',
                oldValues: {
                    importo: 2000.00,
                    voceAnaliticaId: 'voce_789'
                },
                newValues: {
                    importo: 1800.00,
                    voceAnaliticaId: 'voce_456'
                },
                description: 'Rollback allocazione: ripristinati valori precedenti',
                canRollback: false,
                ipAddress: '192.168.1.102',
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
            }
        ];

        // Filtro per ricerca
        let filteredData = mockAuditData;
        if (search) {
            const searchLower = search.toString().toLowerCase();
            filteredData = mockAuditData.filter(entry => 
                entry.userName.toLowerCase().includes(searchLower) ||
                entry.action.toLowerCase().includes(searchLower) ||
                entry.description.toLowerCase().includes(searchLower) ||
                entry.entityType.toLowerCase().includes(searchLower)
            );
        }

        // Ordinamento
        filteredData.sort((a, b) => {
            const aValue = a[sortBy as keyof typeof a];
            const bValue = b[sortBy as keyof typeof b];
            
            // Gestisce valori null/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            
            if (sortOrder === 'desc') {
                return aValue > bValue ? -1 : 1;
            } else {
                return aValue < bValue ? -1 : 1;
            }
        });

        // Paginazione
        const paginatedData = filteredData.slice(skip, skip + take);
        const totalCount = filteredData.length;

        res.json({
            data: paginatedData,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
            }
        });
    } catch (error) {
        console.error('Errore nel recupero audit log:', error);
        res.status(500).json({ error: 'Errore nel recupero del log di audit.' });
    }
});

// GET /api/allocation/audit/stats - Statistiche audit
router.get('/stats', async (req, res) => {
    try {
        // In un sistema reale, queste statistiche verrebbero calcolate dal database
        const stats = {
            totalEntries: 147,
            recentActions: 12, // Ultime 24 ore
            rollbacksAvailable: 8
        };

        res.json(stats);
    } catch (error) {
        console.error('Errore nel recupero statistiche audit:', error);
        res.status(500).json({ error: 'Errore nel recupero delle statistiche.' });
    }
});

// POST /api/allocation/audit/rollback - Esegue rollback di una modifica
router.post('/rollback', async (req, res) => {
    try {
        const { auditLogId, entityType, entityId } = req.body;

        console.log(`[Audit Rollback] Esecuzione rollback per audit ${auditLogId}, entity ${entityType}:${entityId}`);

        // Simulazione del rollback
        // In un sistema reale:
        // 1. Verificare che il rollback sia ancora possibile
        // 2. Recuperare i valori precedenti dal log di audit
        // 3. Applicare i valori precedenti all'entità
        // 4. Creare una nuova voce di audit per il rollback
        
        const mockRollback = {
            id: `rollback_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: 'user1', // Da recuperare dalla sessione
            userName: 'Mario Rossi',
            action: 'ROLLBACK',
            entityType,
            entityId,
            description: `Rollback eseguito per audit log ${auditLogId}`,
            success: true
        };

        // Simulazione del ripristino
        setTimeout(() => {
            console.log(`[Audit Rollback] Rollback completato:`, mockRollback);
        }, 1000);

        res.json({
            message: 'Rollback eseguito con successo',
            rollback: mockRollback
        });
    } catch (error) {
        console.error('Errore durante il rollback:', error);
        res.status(500).json({ error: 'Errore durante l\'esecuzione del rollback.' });
    }
});

// POST /api/allocation/audit/log - Crea una nuova voce di audit (per uso interno)
router.post('/log', async (req, res) => {
    try {
        const { 
            userId, 
            userName, 
            action, 
            entityType, 
            entityId, 
            oldValues, 
            newValues, 
            description,
            ipAddress,
            userAgent 
        } = req.body;

        const auditEntry = {
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId,
            userName,
            action,
            entityType,
            entityId,
            oldValues,
            newValues,
            description,
            canRollback: action !== 'ROLLBACK' && action !== 'DELETE',
            ipAddress,
            userAgent
        };

        // In un sistema reale, salvare nel database
        console.log(`[Audit Log] Nuova voce di audit creata:`, auditEntry);

        res.json({
            message: 'Voce di audit creata con successo',
            auditEntry
        });
    } catch (error) {
        console.error('Errore nella creazione audit log:', error);
        res.status(500).json({ error: 'Errore nella creazione della voce di audit.' });
    }
});

export default router;