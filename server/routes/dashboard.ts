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
        .reduce((acc, r) => acc + r.dare, 0);

      const ricavi = scritture.flatMap(s => s.righe)
        .filter(r => r.conto && r.conto.tipo === 'Ricavo' && r.allocazioni.some(a => a.commessaId === c.id))
        .reduce((acc, r) => acc + r.avere, 0);

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

    const dashboardData: DashboardData = {
      kpi: {
        commesseAttive: commesse.length,
        ricaviTotali,
        costiTotali,
        margineLordoMedio,
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