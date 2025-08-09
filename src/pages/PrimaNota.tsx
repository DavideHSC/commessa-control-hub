import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Conto } from '@prisma/client';
import { getRegistrazioni, deleteRegistrazione, ScritturaContabileWithRighe } from '@/api/registrazioni';
import { getPianoDeiConti } from '@/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PrimaNota: React.FC = () => {
  const navigate = useNavigate();
  const [registrazioni, setRegistrazioni] = useState<ScritturaContabileWithRighe[]>([]);
  const [conti, setConti] = useState<Conto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrazioneDaEliminare, setRegistrazioneDaEliminare] = useState<ScritturaContabileWithRighe | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [registrazioniData, contiData] = await Promise.all([
          getRegistrazioni(),
          getPianoDeiConti(),
        ]);
        setRegistrazioni(registrazioniData);
        setConti(contiData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Errore nel caricamento dei dati.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleDelete = async () => {
    if (!registrazioneDaEliminare) return;

    try {
      await deleteRegistrazione(registrazioneDaEliminare.id);
      setRegistrazioni(prev => prev.filter(r => r.id !== registrazioneDaEliminare.id));
      toast.success("Registrazione eliminata con successo.");
    } catch (error) {
      toast.error("Errore durante l'eliminazione della registrazione.");
      console.error(error);
    } finally {
      setRegistrazioneDaEliminare(null);
    }
  };

  const getTotaliScrittura = (scrittura: ScritturaContabileWithRighe) => {
    const totaleDare = scrittura.righe.reduce((sum, riga) => sum + riga.dare, 0);
    const totaleAvere = scrittura.righe.reduce((sum, riga) => sum + riga.avere, 0);
    const sbilancio = Math.abs(totaleDare - totaleAvere);
    return { totale: totaleDare || totaleAvere, sbilancio };
  };

  const checkAllocazioneMancante = (scrittura: ScritturaContabileWithRighe): boolean => {
    return scrittura.righe.some(riga => {
      const conto = conti.find(c => c.id === riga.contoId);
      const richiedeAllocazione = conto && (conto.tipo === 'Costo' || conto.tipo === 'Ricavo');
      return richiedeAllocazione && riga.allocazioni.length === 0;
    });
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <h1 className="text-2xl font-bold">Prima Nota</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate('/prima-nota/nuovo')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuova Registrazione
          </Button>
        </div>
      </header>
      <main className="flex-grow p-4 overflow-auto">
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Visualizza le registrazioni contabili e crea nuovi movimenti.
          </p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Scritture Contabili</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Data</th>
                <th className="text-left p-2">Descrizione</th>
                <th className="text-right p-2">Totale</th>
                <th className="text-center p-2">Stato</th>
                <th className="text-center p-2">Allocazione</th>
                <th className="text-center p-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {registrazioni.map(scrittura => {
                const { totale, sbilancio } = getTotaliScrittura(scrittura);
                const allocazioneMancante = checkAllocazioneMancante(scrittura);
                return (
                  <tr key={scrittura.id} className="border-b">
                    <td className="p-2">{new Date(scrittura.data).toLocaleDateString('it-IT')}</td>
                    <td className="p-2">{scrittura.descrizione}</td>
                    <td className="p-2 text-right">{totale.toFixed(2)} €</td>
                    <td className="p-2 text-center">
                      <Badge variant={sbilancio > 0.01 ? 'destructive' : 'default'} className={sbilancio <= 0.01 ? 'bg-green-600' : ''}>
                        {sbilancio > 0.01 ? 'Sbilanciata' : 'Quadrata'}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      {allocazioneMancante && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Allocazione mancante</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <TooltipProvider>
                        <div className="flex justify-center space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => alert(`Anteprima non implementata.`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Anteprima Scrittura</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/prima-nota/modifica/${scrittura.id}`)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Modifica Registrazione</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setRegistrazioneDaEliminare(scrittura)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Elimina Registrazione</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog open={!!registrazioneDaEliminare} onOpenChange={() => setRegistrazioneDaEliminare(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questa registrazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'eliminazione sarà permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </main>
    </div>
  );
};

export default PrimaNota;
