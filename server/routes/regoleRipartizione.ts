import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = express.Router();

// Schema di validazione per la creazione e l'aggiornamento di una RegolaRipartizione
const regolaRipartizioneSchema = z.object({
  descrizione: z.string().min(1, 'La descrizione è obbligatoria.'),
  percentuale: z.number().min(0).max(100, 'La percentuale deve essere tra 0 e 100.'),
  contoId: z.string().min(1, 'Selezionare un conto.'),
  commessaId: z.string().min(1, 'Selezionare una commessa.'),
  voceAnaliticaId: z.string().min(1, "Selezionare una voce analitica."),
});

// GET all Regole di Ripartizione
router.get('/', async (req, res) => {
  try {
    const regole = await prisma.regolaRipartizione.findMany({
      include: {
        conto: true,
        commessa: true,
        voceAnalitica: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    res.json(regole);
  } catch (error) {
    console.error("Errore nel recuperare le regole di ripartizione:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
});

// POST a new Regola di Ripartizione
router.post('/', async (req, res) => {
  try {
    const data = regolaRipartizioneSchema.parse(req.body);

    // Controlla che la somma delle percentuali per un dato conto non superi 100
    const existingRules = await prisma.regolaRipartizione.findMany({
      where: {
        contoId: data.contoId,
      },
    });

    const totalPercentage = existingRules.reduce((acc, rule) => acc + rule.percentuale, 0);

    if (totalPercentage + data.percentuale > 100) {
      return res.status(400).json({ error: `La somma delle percentuali per questo conto supererebbe il 100%. Percentuale attuale: ${totalPercentage}%.` });
    }

    const { contoId, commessaId, voceAnaliticaId, ...rest } = data;

    const nuovaRegola = await prisma.regolaRipartizione.create({
      data: {
        ...rest,
        conto: { connect: { id: contoId } },
        commessa: { connect: { id: commessaId } },
        voceAnalitica: { connect: { id: voceAnaliticaId } },
      },
      include: {
        conto: true,
        commessa: true,
        voceAnalitica: true,
      }
    });
    res.status(201).json(nuovaRegola);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Errore nella creazione della regola di ripartizione:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
});

// PUT (Update) a Regola di Ripartizione
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = regolaRipartizioneSchema.parse(req.body);

    const ruleToUpdate = await prisma.regolaRipartizione.findUnique({ where: { id } });
    if (!ruleToUpdate) {
        return res.status(404).json({ error: 'Regola non trovata.' });
    }
    
    const otherRules = await prisma.regolaRipartizione.findMany({
        where: { 
            contoId: data.contoId,
            id: { not: id } 
        },
    });

    const totalPercentage = otherRules.reduce((acc, rule) => acc + rule.percentuale, 0);

    if (totalPercentage + data.percentuale > 100) {
      return res.status(400).json({ error: `La somma delle percentuali per questo conto supererebbe il 100%. Percentuale attuale (esclusa questa regola): ${totalPercentage}%.` });
    }
    
    const { contoId, commessaId, voceAnaliticaId, ...rest } = data;

    const regolaAggiornata = await prisma.regolaRipartizione.update({
      where: { id },
      data: {
        ...rest,
        conto: { connect: { id: contoId } },
        commessa: { connect: { id: commessaId } },
        voceAnalitica: { connect: { id: voceAnaliticaId } },
      },
       include: {
        conto: true,
        commessa: true,
        voceAnalitica: true,
      }
    });
    res.json(regolaAggiornata);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(`Errore nell'aggiornare la regola ${id}:`, error);
    res.status(500).json({ error: "Errore interno del server." });
  }
});

// DELETE a Regola di Ripartizione
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.regolaRipartizione.delete({
      where: { id },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error(`Errore nell'eliminare la regola ${id}:`, error);
    res.status(500).json({ error: "Errore interno del server." });
  }
});


export default router; 