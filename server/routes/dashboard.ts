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
}

interface DashboardData {
  commesse: CommessaDashboard[];
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
    const commesse = await prisma.commessa.findMany({
      include: {
        cliente: true,
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

    const commesseDashboard: CommessaDashboard[] = commesse.map(c => {
      const budgetTotale = c.budget.reduce((acc, b) => acc + b.importo, 0);
      
      const costi = scritture.flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Costo' && r.allocazioni.some(a => a.commessaId === c.id))
        .reduce((acc, r) => acc + (r.dare || 0), 0);

      const ricavi = scritture.flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Ricavo' && r.allocazioni.some(a => a.commessaId === c.id))
        .reduce((acc, r) => acc + (r.avere || 0), 0);

      const margine = ricavi > 0 ? ((ricavi - costi) / ricavi) * 100 : 0;

      return {
        id: c.id,
        nome: c.nome,
        cliente: {
            id: c.cliente.id,
            nome: c.cliente.nome,
        },
        stato: 'In Corso',
        ricavi: ricavi,
        costi: costi,
        margine: margine,
        budget: budgetTotale
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
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Errore nel recupero dati per la dashboard:", error);
    res.status(500).json({ message: "Errore interno del server." });
  }
});

export default router; 