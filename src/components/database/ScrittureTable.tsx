import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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
import { deleteRegistrazione } from '@/api/registrazioni';
import { clearScrittureContabili } from '@/api/database';
import { ScritturaContabile, RigaScrittura } from '@/types';

interface ScrittureTableProps {
  data: ScritturaContabile[];
  onDataChange: () => void;
}

export const ScrittureTable: React.FC<ScrittureTableProps> = ({ data, onDataChange }) => {
  const [deletingRegistrazione, setDeletingRegistrazione] = useState<ScritturaContabile | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!deletingRegistrazione) return;
    try {
      await deleteRegistrazione(deletingRegistrazione.id);
      toast.success("Registrazione eliminata con successo.");
      onDataChange();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeletingRegistrazione(null);
    }
  };

  const handleClearTable = async () => {
    try {
      await clearScrittureContabili();
      toast.success("Tutte le scritture sono state eliminate.");
      onDataChange();
    } catch (error) {
      toast.error((error as Error).message);
    }
    finally {
      setIsClearing(false);
    }
  };

  const handleEdit = (registrazione: ScritturaContabile) => {
    navigate(`/app/prima-nota/registrazioni/${registrazione.id}/modifica`);
  };

  const calculateTotal = (righe: RigaScrittura[] = []) => {
    return righe.reduce((acc, riga) => acc + (riga.dare || 0), 0);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scritture Contabili</CardTitle>
            <Button variant="destructive" onClick={() => setIsClearing(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Svuota Scritture
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Causale</TableHead>
                <TableHead>Totale</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((scrittura) => (
                <TableRow key={scrittura.id}>
                  <TableCell>{new Date(scrittura.data).toLocaleDateString()}</TableCell>
                  <TableCell>{scrittura.descrizione}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{scrittura.causaleId}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(calculateTotal(scrittura.righe))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(scrittura)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeletingRegistrazione(scrittura)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingRegistrazione} onOpenChange={() => setDeletingRegistrazione(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà la registrazione contabile e tutte le sue righe e allocazioni. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearing} onOpenChange={setIsClearing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile e cancellerà TUTTE le scritture contabili, 
              incluse le righe e le allocazioni analitiche. Sei sicuro di voler procedere?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearTable} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sì, svuota tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 