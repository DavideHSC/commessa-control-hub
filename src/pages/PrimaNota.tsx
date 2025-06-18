import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
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
import { getRegistrazioni } from '@/api/registrazioni';

const PrimaNota: React.FC = () => {
  const navigate = useNavigate();
  const [registrazioni, setRegistrazioni] = useState<ScritturaContabile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrazioni = async () => {
      try {
        setIsLoading(true);
        const data = await getRegistrazioni();
        setRegistrazioni(data);
      } catch (error) {
        console.error("Errore nel caricamento delle registrazioni", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrazioni();
  }, []);

  const handleNuovaRegistrazione = () => {
    navigate('/prima-nota/nuova');
  };

  const getTotaliScrittura = (scrittura: ScritturaContabile) => {
    const totaleDare = scrittura.righe.reduce((sum, r) => sum + (r.dare || 0), 0);
    const totaleAvere = scrittura.righe.reduce((sum, r) => sum + (r.avere || 0), 0);
    return { totaleDare, totaleAvere };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prima Nota</h1>
          <p className="text-slate-600 mt-1">Visualizza le registrazioni contabili e crea nuovi movimenti.</p>
        </div>
        <Button 
          onClick={handleNuovaRegistrazione}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Registrazione
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Scritture Contabili</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Caricamento registrazioni...</p>
          ) : registrazioni.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold">Nessuna registrazione trovata</h3>
              <p className="text-slate-500 mt-2">Inizia creando la tua prima scrittura contabile.</p>
              <Button onClick={handleNuovaRegistrazione} className="mt-4">
                Crea Registrazione
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead className="text-right">Totale</TableHead>
                  <TableHead className="text-center">Stato</TableHead>
                  <TableHead className="text-center">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrazioni.map((scrittura) => {
                  const { totaleDare, totaleAvere } = getTotaliScrittura(scrittura);
                  const isQuadrata = Math.abs(totaleDare - totaleAvere) < 0.01;

                  return (
                    <TableRow key={scrittura.id}>
                      <TableCell>{new Date(scrittura.data).toLocaleDateString('it-IT')}</TableCell>
                      <TableCell className="font-medium">{scrittura.descrizione}</TableCell>
                      <TableCell className="text-right">{formatCurrency(totaleDare)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isQuadrata ? 'default' : 'destructive'}>
                          {isQuadrata ? 'Quadrata' : 'Sbilanciata'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => alert(`Visualizza dettaglio per ID: ${scrittura.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimaNota;
