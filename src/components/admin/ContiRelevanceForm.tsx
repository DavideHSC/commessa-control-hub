import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getConfigurableConti, toggleContoRelevance } from '@/api/conti';
import { useToast } from '@/hooks/use-toast';

interface ConfigurableConto {
  id: string;
  codice: string;
  nome: string;
  isRilevantePerCommesse: boolean;
}

const ContiRelevanceForm = () => {
  const [conti, setConti] = useState<ConfigurableConto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConti = async () => {
      try {
        setLoading(true);
        const data = await getConfigurableConti();
        setConti(data);
      } catch (error) {
        toast({
          title: 'Errore',
          description: 'Impossibile caricare i conti per la configurazione.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchConti();
  }, [toast]);

  const handleToggle = async (id: string, isRilevante: boolean) => {
    try {
      await toggleContoRelevance(id, isRilevante);
      setConti(prevConti =>
        prevConti.map(conto =>
          conto.id === id ? { ...conto, isRilevantePerCommesse: isRilevante } : conto
        )
      );
      toast({
        title: 'Successo',
        description: 'La rilevanza del conto è stata aggiornata.',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: "Impossibile aggiornare la rilevanza del conto.",
        variant: 'destructive',
      });
      // Revert UI change on error
      setConti(prevConti =>
        prevConti.map(conto =>
          conto.id === id ? { ...conto, isRilevantePerCommesse: !isRilevante } : conto
        )
      );
    }
  };

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurazione Conti per Analitica</CardTitle>
        <CardDescription>
          Abilita i conti di costo e ricavo che vuoi includere nel processo di riconciliazione delle commesse. 
          Solo i conti abilitati saranno considerati per l'assegnazione.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Codice Conto</TableHead>
                <TableHead>Nome Conto</TableHead>
                <TableHead className="w-[150px] text-right">Rilevante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conti.map(conto => (
                <TableRow key={conto.id}>
                  <TableCell className="font-medium">{conto.codice}</TableCell>
                  <TableCell>{conto.nome}</TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={conto.isRilevantePerCommesse}
                      onCheckedChange={(checked) => handleToggle(conto.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContiRelevanceForm; 