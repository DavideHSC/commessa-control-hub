import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toggleContoRelevance } from '@/api/conti';
import { useToast } from '@/hooks/use-toast';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ConfigurableConto {
  id: string;
  codice: string;
  nome: string;
  tipo: string;
  isRilevantePerCommesse: boolean;
}

const ContiRelevanceForm = () => {
  const { toast } = useToast();
  const [tipo, setTipo] = useState('');

  const filters = useMemo(() => ({ 
    tipo: tipo === 'all' || tipo === '' ? undefined : tipo 
  }), [tipo]);

  const {
    data,
    totalCount,
    page,
    pageSize,
    search,
    sorting,
    loading,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortingChange,
    fetchData,
  } = useAdvancedTable<ConfigurableConto>({
    endpoint: '/api/conti',
    initialPageSize: 10,
    filters, // Mostra tutti i conti per permettere la configurazione
  });

  const columns: ColumnDef<ConfigurableConto>[] = useMemo(
    () => [
      {
        accessorKey: 'codice',
        header: 'Codice Conto',
        cell: ({ row }) => <div className="w-[150px]">{row.getValue('codice')}</div>,
      },
      {
        accessorKey: 'nome',
        header: 'Nome Conto',
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => <div className="w-[100px]">{row.getValue('tipo')}</div>,
      },
      {
        id: 'isRilevantePerCommesse',
        accessorKey: 'isRilevantePerCommesse',
        header: () => <div className="text-right">Rilevante</div>,
        cell: ({ row }) => {
          const conto = row.original;

          const handleToggle = async (isRilevante: boolean) => {
            try {
              await toggleContoRelevance(conto.id, isRilevante);
              // Instead of updating local state, we refetch the data to ensure consistency
              fetchData();
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
            }
          };

          return (
            <div className="text-right">
              <Switch
                checked={conto.isRilevantePerCommesse}
                onCheckedChange={handleToggle}
              />
            </div>
          );
        },
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchData]
  );
  
  const filterComponent = (
    <div className="flex items-center space-x-2">
      <Select value={tipo} onValueChange={setTipo}>
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Filtra per tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti i tipi</SelectItem>
          <SelectItem value="Costo">Costo</SelectItem>
          <SelectItem value="Ricavo">Ricavo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

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
        <AdvancedDataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          searchValue={search}
          onSearchChange={onSearchChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          loading={loading}
          toolbarButtons={filterComponent}
        />
      </CardContent>
    </Card>
  );
};

export default ContiRelevanceForm; 