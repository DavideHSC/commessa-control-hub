import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import csv from 'csv-parser';
import clientiRoutes from './routes/clienti';
import fornitoriRoutes from './routes/fornitori';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurazione multer per l'upload dei file
const upload = multer({ dest: 'uploads/' });

// Interfacce per tipizzare i dati CSV
interface CSVRow {
  data: string;
  descrizione: string;
  importo: string;
  codiceConto: string;
  codiceCommessa?: string;
}

// Endpoint per l'importazione di file CSV
app.post('/api/import', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'Nessun file caricato.' });
        return;
    }

    try {
        const results: CSVRow[] = [];
        const filePath = req.file.path;

        // Leggi il file CSV
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: CSVRow) => results.push(data))
            .on('end', async () => {
                try {
                    // Elimina le scritture precedenti con causaleId 'IMPORT'
                    await prisma.scritturaContabile.deleteMany({
                        where: { causaleId: 'IMPORT' }
                    });

                    // Processa ogni riga del CSV
                    for (const row of results) {
                        const { data, descrizione, importo, codiceConto, codiceCommessa } = row;
                        
                        if (!data || !descrizione || !importo || !codiceConto) {
                            continue; // Salta righe incomplete
                        }

                        // Trova o crea il conto
                        let conto = await prisma.conto.findFirst({
                            where: { codice: codiceConto }
                        });

                        if (!conto) {
                            // Crea un nuovo conto se non esiste
                            conto = await prisma.conto.create({
                                data: {
                                    id: `conto_${codiceConto}`,
                                    codice: codiceConto,
                                    nome: `Conto ${codiceConto}`,
                                    tipo: 'Costo'
                                }
                            });
                        }

                        // Trova la commessa se specificata
                        let commessa: { id: string } | null = null;
                        if (codiceCommessa) {
                            commessa = await prisma.commessa.findFirst({
                                where: { nome: codiceCommessa }
                            });
                        }

                        const importoNum = parseFloat(importo);
                        
                        // Crea la scrittura contabile
                        await prisma.scritturaContabile.create({
                            data: {
                                data: new Date(data),
                                descrizione,
                                causaleId: 'IMPORT',
                                righe: {
                                    create: [
                                        // Riga di costo (dare)
                                        {
                                            descrizione: `${descrizione} - Costo`,
                                            dare: importoNum,
                                            avere: 0,
                                            contoId: conto.id,
                                            allocazioni: commessa ? {
                                                create: [{
                                                    commessaId: commessa.id,
                                                    voceAnaliticaId: '2', // Gestione Automezzi come default
                                                    importo: importoNum,
                                                    descrizione: `Allocazione ${descrizione}`
                                                }]
                                            } : undefined
                                        },
                                        // Riga di contropartita (avere) - Cassa
                                        {
                                            descrizione: `${descrizione} - Pagamento`,
                                            dare: 0,
                                            avere: importoNum,
                                            contoId: '1', // Assumiamo che '1' sia il conto Cassa
                                            allocazioni: undefined
                                        }
                                    ]
                                }
                            }
                        });
                    }

                    // Pulisci il file temporaneo
                    fs.unlinkSync(filePath);

                    res.json({ 
                        message: 'Importazione completata con successo',
                        recordsProcessed: results.length
                    });

                } catch (error) {
                    console.error('Errore durante l\'elaborazione del CSV:', error);
                    if (error instanceof PrismaClientKnownRequestError) {
                        if (error.code === 'P2003') {
                            res.status(409).json({ error: `Dato di riferimento non trovato (es. commessa o conto inesistente). Dettagli: ${error.message}` });
                        } else {
                            res.status(400).json({ error: `Errore del database durante l'importazione: ${error.message}` });
                        }
                    } else {
                        res.status(500).json({ error: 'Errore interno del server durante l\'elaborazione del file' });
                    }
                }
            });

    } catch (error) {
        console.error('Errore durante l\'importazione:', error);
        res.status(500).json({ error: 'Errore generico durante l\'importazione. Controlla il file di log del server.' });
    }
});

// Endpoint per la dashboard
app.get('/api/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Recupero dati dashboard dal database...');
    
    const commesse = await prisma.commessa.findMany({
      include: {
        cliente: true,
        allocazioni: {
          include: {
            rigaScrittura: {
              include: {
                scritturaContabile: true
              }
            }
          }
        }
      }
    });

    console.log(`Trovate ${commesse.length} commesse`);

    const dashboardData = {
      commesse: commesse.map(commessa => {
        const ricavi = commessa.allocazioni.reduce((sum, alloc) => {
          return sum + (alloc.rigaScrittura.avere > 0 ? alloc.importo : 0);
        }, 0);

        const costi = commessa.allocazioni.reduce((sum, alloc) => {
          return sum + (alloc.rigaScrittura.dare > 0 ? alloc.importo : 0);
        }, 0);

        const margine = ricavi > 0 ? ((ricavi - costi) / ricavi) * 100 : 0;

        return {
          id: commessa.id,
          nome: commessa.nome,
          cliente: commessa.cliente.nome,
          stato: 'In Lavorazione',
          ricavi,
          costi,
          marginePercentuale: margine
        };
      }),
      kpi: {
        commesseAttive: commesse.length,
        ricaviTotali: commesse.reduce((sum, c) => {
          const ricavi = c.allocazioni.reduce((sum, alloc) => {
            return sum + (alloc.rigaScrittura.avere > 0 ? alloc.importo : 0);
          }, 0);
          return sum + ricavi;
        }, 0),
        costiTotali: commesse.reduce((sum, c) => {
          const costi = c.allocazioni.reduce((sum, alloc) => {
            return sum + (alloc.rigaScrittura.dare > 0 ? alloc.importo : 0);
          }, 0);
          return sum + costi;
        }, 0),
        margineLordoMedio: 25.5
      }
    };

    console.log('Dashboard data preparata:', JSON.stringify(dashboardData, null, 2));
    res.json(dashboardData);
  } catch (error) {
    console.error(`Errore nel recupero dati per la dashboard:`, error);
    res.status(500).json({ error: 'Impossibile caricare i dati per la dashboard.' });
  }
});

// Endpoint per ottenere tutte le scritture contabili
app.get('/api/registrazioni', async (req: Request, res: Response): Promise<void> => {
  try {
    const registrazioni = await prisma.scritturaContabile.findMany({
      include: {
        righe: {
          include: {
            conto: true,
            allocazioni: {
              include: {
                commessa: true,
                voceAnalitica: true
              }
            }
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    res.json(registrazioni);
  } catch (error) {
    console.error('Errore nel recupero delle registrazioni:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per ottenere una singola registrazione
app.get('/api/registrazioni/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const registrazione = await prisma.scritturaContabile.findUnique({
      where: { id: req.params.id },
      include: {
        righe: {
          include: {
            conto: true,
            allocazioni: {
              include: {
                commessa: true,
                voceAnalitica: true
              }
            }
          }
        }
      }
    });

    if (!registrazione) {
      res.status(404).json({ error: 'Registrazione non trovata' });
      return;
    }

    res.json(registrazione);
  } catch (error) {
    console.error(`Errore nel recupero della registrazione ${req.params.id}:`, error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per creare una nuova registrazione
app.post('/api/registrazioni', async (req: Request, res: Response): Promise<void> => {
  try {
    const nuovaRegistrazione = await prisma.scritturaContabile.create({
      data: req.body,
      include: {
        righe: {
          include: {
            conto: true,
            allocazioni: {
              include: {
                commessa: true,
                voceAnalitica: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(nuovaRegistrazione);
  } catch (error) {
    console.error('Errore nella creazione della registrazione:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per aggiornare una registrazione
app.put('/api/registrazioni/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { righe, ...scrittura } = req.body;

    const registrazioneAggiornata = await prisma.scritturaContabile.update({
      where: { id },
      data: scrittura,
      include: {
        righe: {
          include: {
            conto: true,
            allocazioni: {
              include: {
                commessa: true,
                voceAnalitica: true
              }
            }
          }
        }
      }
    });

    res.json(registrazioneAggiornata);
  } catch (error) {
    console.error(`Errore nell'aggiornamento della registrazione ${req.params.id}:`, error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per eliminare una registrazione
app.delete('/api/registrazioni/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.scritturaContabile.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Errore nell'eliminazione della registrazione ${req.params.id}:`, error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per visualizzare i dati del database (admin/debug)
app.get('/api/database', async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      scritture,
      commesse,
      clienti,
      fornitori,
      conti,
      vociAnalitiche
    ] = await Promise.all([
      prisma.scritturaContabile.findMany({
        include: {
          righe: {
            include: {
              conto: true,
              allocazioni: true
            }
          }
        }
      }),
      prisma.commessa.findMany({
        include: {
          cliente: true
        }
      }),
      prisma.cliente.findMany(),
      prisma.fornitore.findMany(),
      prisma.conto.findMany(),
      prisma.voceAnalitica.findMany()
    ]);

    const stats = {
      totaleScrittureContabili: scritture.length,
      totaleCommesse: commesse.length,
      totaleClienti: clienti.length,
      totaleFornitori: fornitori.length,
      totaleConti: conti.length,
      totaleVociAnalitiche: vociAnalitiche.length,
    };

    res.json({
      scritture,
      commesse,
      clienti,
      fornitori,
      conti,
      vociAnalitiche,
      stats
    });
  } catch (error) {
    console.error('Errore nel recupero dati database:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.use('/api', clientiRoutes);
app.use('/api', fornitoriRoutes);

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
}); 