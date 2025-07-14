import express from 'express';
import { PrismaClient } from '@prisma/client';

// Tipi incollati da src/types/index.ts per risolvere l'errore di rootDir
interface CommessaDashboard {
  id: string;
  nome: string;
  cliente: {
    id: string;
    nome: string;
  };
  stato: string;
  ricavi: number;
  costi: number;
  margine: number;
  budget: number;
  isParent: boolean;
  parentId?: string;
  figlie?: CommessaDashboard[];
}

interface DashboardData {
  commesse: CommessaDashboard[];
  clienti: Array<{ id: string; nome: string; externalId?: string }>;
  kpi: {
    commesseAttive: number;
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
    commesseConMargineNegativo: number;
    budgetVsConsuntivo: number;
    movimentiNonAllocati: number;
    ricaviMeseCorrente: number;
    costiMeseCorrente: number;
  };
  trends: {
    ricaviMensili: Array<{ mese: string; ricavi: number; costi: number; margine: number }>;
    topCommesse: Array<{ nome: string; margine: number; ricavi: number }>;
  };
}

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Carica separatamente clienti e commesse per avere dati più puliti
    const clienti = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        externalId: true
      }
    });

    const commesse = await prisma.commessa.findMany({
      include: {
        parent: true,
        children: true,
        budget: {
          include: {
            voceAnalitica: true,
          },
        },
        allocazioni: {
          include: {
            rigaScrittura: true,
          },
        },
      },
    });

    const scritture = await prisma.scritturaContabile.findMany({
      include: {
        righe: {
          include: {
            conto: true,
            allocazioni: {
              include: {
                commessa: true,
                voceAnalitica: true,
              }
            }
          }
        }
      }
    });

    // Funzione helper per calcolare i totali di una commessa
    const calcolaTotaliCommessa = (commessaId: string) => {
      const costi = scritture.flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Costo' && r.allocazioni.some(a => a.commessaId === commessaId))
        .reduce((acc, r) => acc + (r.dare || 0), 0);

      const ricavi = scritture.flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Ricavo' && r.allocazioni.some(a => a.commessaId === commessaId))
        .reduce((acc, r) => acc + (r.avere || 0), 0);

      return { costi, ricavi };
    };

    // Crea una mappa clienti per lookup veloce
    const clientiMap = new Map(clienti.map(cliente => [cliente.id, cliente]));

    // Prima, creiamo tutte le commesse con i loro dati
    const tutteLeCommesse: CommessaDashboard[] = commesse.map(c => {
      const budgetTotale = c.budget.reduce((acc, b) => acc + b.importo, 0);
      const { costi, ricavi } = calcolaTotaliCommessa(c.id);
      const margine = ricavi > 0 ? ((ricavi - costi) / ricavi) * 100 : 0;

      // Trova il cliente dalla mappa
      const cliente = clientiMap.get(c.clienteId);
      if (!cliente) {
        console.warn(`Cliente non trovato per commessa ${c.id} con clienteId ${c.clienteId}`);
      }

      // Calcola percentuale avanzamento basata sui costi/budget
      const percentualeAvanzamento = budgetTotale > 0 ? Math.min((costi / budgetTotale) * 100, 100) : 0;

      return {
        id: c.id,
        nome: c.nome,
        cliente: {
            id: cliente?.id || c.clienteId,
            nome: cliente?.nome || 'Cliente non trovato',
        },
        stato: 'In Corso',
        ricavi: ricavi,
        costi: costi,
        margine: margine,
        budget: budgetTotale,
        percentualeAvanzamento: percentualeAvanzamento,
        isParent: !c.parentId, // È padre se non ha parentId
        parentId: c.parentId || undefined,
        figlie: []
      };
    });

    // Poi raggruppiamo: solo commesse padre, con le figlie annidate
    const commessePadre = tutteLeCommesse.filter(c => c.isParent);
    const commesseFiglie = tutteLeCommesse.filter(c => !c.isParent);

    // Associamo le figlie ai padri e calcoliamo i totali consolidati
    const commesseDashboard: CommessaDashboard[] = commessePadre.map(padre => {
      const figlieAssociate = commesseFiglie.filter(f => f.parentId === padre.id);
      
      // Calcola i totali consolidati (padre + figlie)
      const ricaviTotali = padre.ricavi + figlieAssociate.reduce((acc, f) => acc + f.ricavi, 0);
      const costiTotali = padre.costi + figlieAssociate.reduce((acc, f) => acc + f.costi, 0);
      const budgetTotale = padre.budget + figlieAssociate.reduce((acc, f) => acc + f.budget, 0);
      const margineConsolidato = ricaviTotali > 0 ? ((ricaviTotali - costiTotali) / ricaviTotali) * 100 : 0;
      
      // Calcola percentuale avanzamento consolidata
      const percentualeAvanzamentoConsolidata = budgetTotale > 0 ? 
        ((padre.percentualeAvanzamento * padre.budget) + 
         figlieAssociate.reduce((acc, f) => acc + (f.percentualeAvanzamento * f.budget), 0)) / budgetTotale : 0;

      return {
        ...padre,
        ricavi: ricaviTotali,
        costi: costiTotali,
        budget: budgetTotale,
        margine: margineConsolidato,
        percentualeAvanzamento: percentualeAvanzamentoConsolidata,
        figlie: figlieAssociate
      };
    });

    const ricaviTotali = commesseDashboard.reduce((acc, c) => acc + c.ricavi, 0);
    const costiTotali = commesseDashboard.reduce((acc, c) => acc + c.costi, 0);
    const margineLordoMedio = ricaviTotali > 0 ? ((ricaviTotali - costiTotali) / ricaviTotali) * 100 : 0;

    // Nuovi KPI avanzati
    const commesseConMargineNegativo = commesseDashboard.filter(c => c.margine < 0).length;
    const budgetTotale = commesseDashboard.reduce((acc, c) => acc + c.budget, 0);
    const budgetVsConsuntivo = budgetTotale > 0 ? ((costiTotali / budgetTotale) * 100) : 0;

    // Calcola movimenti non allocati
    const movimentiNonAllocati = scritture.flatMap(s => s.righe)
      .filter(r => r.allocazioni.length === 0 && r.conto && (r.conto.tipo === 'Costo' || r.conto.tipo === 'Ricavo'))
      .length;

    // Calcola ricavi e costi del mese corrente
    const oraCorrente = new Date();
    const inizioMese = new Date(oraCorrente.getFullYear(), oraCorrente.getMonth(), 1);
    const ricaviMeseCorrente = scritture
      .filter(s => new Date(s.data) >= inizioMese)
      .flatMap(s => s.righe)
      .filter(r => r.conto && r.conto.tipo === 'Ricavo' && r.allocazioni.length > 0)
      .reduce((acc, r) => acc + (r.avere || 0), 0);

    const costiMeseCorrente = scritture
      .filter(s => new Date(s.data) >= inizioMese)
      .flatMap(s => s.righe)
      .filter(r => r.conto && r.conto.tipo === 'Costo' && r.allocazioni.length > 0)
      .reduce((acc, r) => acc + (r.dare || 0), 0);

    // Calcola trend mensili (ultimi 6 mesi)
    const ricaviMensili = [];
    for (let i = 5; i >= 0; i--) {
      const meseInizio = new Date(oraCorrente.getFullYear(), oraCorrente.getMonth() - i, 1);
      const meseFine = new Date(oraCorrente.getFullYear(), oraCorrente.getMonth() - i + 1, 0);
      
      const ricaviMese = scritture
        .filter(s => new Date(s.data) >= meseInizio && new Date(s.data) <= meseFine)
        .flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Ricavo' && r.allocazioni.length > 0)
        .reduce((acc, r) => acc + (r.avere || 0), 0);

      const costiMese = scritture
        .filter(s => new Date(s.data) >= meseInizio && new Date(s.data) <= meseFine)
        .flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Costo' && r.allocazioni.length > 0)
        .reduce((acc, r) => acc + (r.dare || 0), 0);

      const margineMese = ricaviMese > 0 ? ((ricaviMese - costiMese) / ricaviMese) * 100 : 0;

      ricaviMensili.push({
        mese: meseInizio.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        ricavi: ricaviMese,
        costi: costiMese,
        margine: margineMese
      });
    }

    // Top 5 commesse per margine
    const topCommesse = commesseDashboard
      .filter(c => c.ricavi > 0)
      .sort((a, b) => b.margine - a.margine)
      .slice(0, 5)
      .map(c => ({
        nome: c.nome.length > 20 ? c.nome.substring(0, 17) + '...' : c.nome,
        margine: c.margine,
        ricavi: c.ricavi
      }));

    const dashboardData: DashboardData = {
      kpi: {
        commesseAttive: commesse.length,
        ricaviTotali,
        costiTotali,
        margineLordoMedio,
        commesseConMargineNegativo,
        budgetVsConsuntivo,
        movimentiNonAllocati,
        ricaviMeseCorrente,
        costiMeseCorrente,
      },
      trends: {
        ricaviMensili,
        topCommesse,
      },
      commesse: commesseDashboard,
      clienti: clienti,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Errore nel recupero dati per la dashboard:", error);
    res.status(500).json({ message: "Errore interno del server." });
  }
});

export default router; 