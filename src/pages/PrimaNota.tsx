import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
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
import { ScritturaContabile } from '@/types';
import { getRegistrazioni, deleteRegistrazione } from '@/api/registrazioni';
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
  const [registrazioni, setRegistrazioni] = useState<ScritturaContabile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrazioneDaEliminare, setRegistrazioneDaEliminare] = useState<ScritturaContabile | null>(null);

  useEffect(() => {
    const fetchRegistrazioni = async () => {
      try {
        const data = await getRegistrazioni();
        setRegistrazioni(data);
      } catch (error) {
        console.error("Failed to fetch registrazioni:", error);
        toast.error("Errore nel caricamento delle registrazioni.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistrazioni();
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

  const getTotaliScrittura = (scrittura: ScritturaContabile) => {
    const totaleDare = scrittura.righe.reduce((sum, riga) => sum + riga.dare, 0);
    const totaleAvere = scrittura.righe.reduce((sum, riga) => sum + riga.avere, 0);
    const sbilancio = Math.abs(totaleDare - totaleAvere);
    return { totale: totaleDare, sbilancio };
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prima Nota</h1>
          <p className="text-muted-foreground">
            Visualizza le registrazioni contabili e crea nuovi movimenti.
          </p>
        </div>
        <Button onClick={() => navigate('/prima-nota/nuova')}>
          <Plus className="mr-2 h-4 w-4" /> Nuova Registrazione
        </Button>
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
                <th className="text-center p-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {registrazioni.map(scrittura => {
                const { totale, sbilancio } = getTotaliScrittura(scrittura);
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
    </div>
  );
};

export default PrimaNota;
