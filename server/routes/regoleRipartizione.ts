import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET all partition rules
router.get('/', async (req, res) => {
  try {
    const rules = await prisma.regolaRipartizione.findMany({
      include: {
        conto: true,
        commessa: true,
        voceAnalitica: true,
      },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching partition rules' });
  }
});

// GET a single partition rule by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rule = await prisma.regolaRipartizione.findUnique({
      where: { id },
      include: {
        conto: true,
        commessa: true,
        voceAnalitica: true,
      },
    });
    if (rule) {
      res.json(rule);
    } else {
      res.status(404).json({ error: 'Partition rule not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching partition rule' });
  }
});

// POST a new partition rule
router.post('/', async (req, res) => {
  try {
    const newRule = await prisma.regolaRipartizione.create({
      data: req.body,
    });
    res.status(201).json(newRule);
  } catch (error) {
    res.status(400).json({ error: 'Error creating partition rule' });
  }
});

// PUT to update a partition rule
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRule = await prisma.regolaRipartizione.update({
      where: { id },
      data: req.body,
    });
    res.json(updatedRule);
  } catch (error) {
    res.status(400).json({ error: 'Error updating partition rule' });
  }
});

// DELETE a partition rule
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.regolaRipartizione.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting partition rule' });
  }
});

export default router;