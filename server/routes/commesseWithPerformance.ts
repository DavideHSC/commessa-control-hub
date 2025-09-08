import express from 'express';
import { PrismaClient } from '@prisma/client';

interface CommessaWithPerformance {
  id: string;
  nome: string;
  descrizione?: string;
  cliente: {
    id: string;
    nome: string;
  };
  clienteId: string;
  parentId?: string;
  stato: string;
  priorita: string;
  dataInizio?: Date;
  dataFine?: Date;
  isAttiva: boolean;
  ricavi: number;
  costi: number;
  budget: number;
  margine: number;
  percentualeAvanzamento: number;
  figlie?: CommessaWithPerformance[];
}

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Carica clienti e commesse separatamente
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

    // Crea mappa clienti
    const clientiMap = new Map(clienti.map(cliente => [cliente.id, cliente]));

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

    // Calcola percentuale avanzamento basata su allocazioni/movimenti
    const calcolaAvanzamento = (commessaId: string, budgetTotale: number) => {
      if (budgetTotale === 0) return 0;
      
      const { costi } = calcolaTotaliCommessa(commessaId);
      const percentuale = (costi / budgetTotale) * 100;
      
      // Cap al 100% per evitare percentuali strane
      return Math.min(percentuale, 100);
    };

    // Crea tutte le commesse con dati performance
    const tutteLeCommesse: CommessaWithPerformance[] = commesse.map(c => {
      const budgetTotale = Array.isArray(c.budget) ? c.budget.reduce((acc, b) => acc + b.importo, 0) : 0;
      const { costi, ricavi } = calcolaTotaliCommessa(c.id);
      const margine = ricavi > 0 ? ((ricavi - costi) / ricavi) * 100 : 0;
      const percentualeAvanzamento = calcolaAvanzamento(c.id, budgetTotale);

      const cliente = clientiMap.get(c.clienteId);

      return {
        id: c.id,
        nome: c.nome,
        descrizione: c.descrizione || undefined,
        cliente: {
          id: cliente?.id || c.clienteId,
          nome: cliente?.nome || 'Cliente non trovato',
        },
        clienteId: c.clienteId, // Aggiunto per il form
        parentId: c.parentId || undefined,
        stato: c.stato || 'Non Definito', // Usa stato dal database o fallback
        priorita: c.priorita || 'media', // Aggiunto campo priorita
        dataInizio: c.dataInizio || undefined,
        dataFine: c.dataFine || undefined,
        isAttiva: c.isAttiva !== undefined ? c.isAttiva : true, // Aggiunto campo isAttiva
        ricavi,
        costi,
        budget: budgetTotale,
        margine,
        percentualeAvanzamento,
        figlie: []
      };
    });

    // Raggruppa: solo commesse padre con figlie annidate
    const commessePadre = tutteLeCommesse.filter(c => !c.parentId);
    const commesseFiglie = tutteLeCommesse.filter(c => c.parentId);

    // Associa figlie ai padri e consolida totali
    const commesseConPerformance: CommessaWithPerformance[] = commessePadre.map(padre => {
      const figlieAssociate = commesseFiglie.filter(f => f.parentId === padre.id);
      
      // Consolida totali (padre + figlie)
      const ricaviTotali = padre.ricavi + figlieAssociate.reduce((acc, f) => acc + f.ricavi, 0);
      const costiTotali = padre.costi + figlieAssociate.reduce((acc, f) => acc + f.costi, 0);
      const budgetTotale = padre.budget + figlieAssociate.reduce((acc, f) => acc + f.budget, 0);
      const margineConsolidato = ricaviTotali > 0 ? ((ricaviTotali - costiTotali) / ricaviTotali) * 100 : 0;
      
      // Avanzamento medio ponderato
      const avanzamentoMedio = budgetTotale > 0 
        ? ((padre.percentualeAvanzamento * padre.budget) + 
           figlieAssociate.reduce((acc, f) => acc + (f.percentualeAvanzamento * f.budget), 0)) / budgetTotale
        : padre.percentualeAvanzamento;

      return {
        ...padre,
        ricavi: ricaviTotali,
        costi: costiTotali,
        budget: budgetTotale,
        margine: margineConsolidato,
        percentualeAvanzamento: avanzamentoMedio,
        figlie: figlieAssociate
      };
    });

    res.json({
      commesse: commesseConPerformance,
      clienti: clienti.filter(c => !c.externalId?.includes('SYS')) // Escludi clienti di sistema
    });

  } catch (error) {
    console.error("Errore nel recupero commesse con performance:", error);
    res.status(500).json({ message: "Errore interno del server." });
  }
});

export default router;