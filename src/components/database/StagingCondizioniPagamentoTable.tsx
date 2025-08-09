import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface StagingCondizionePagamento {
  id: string;
  codicePagamento: string;
  descrizione: string;
  contoIncassoPagamento: string;
  calcolaGiorniCommerciali: string;
  consideraPeriodiChiusura: string;
  suddivisione: string;
  inizioScadenza: string;
  numeroRate: string;
}

const columns: ColumnDef<StagingCondizionePagamento>[] = [
  {
    accessorKey: 'codicePagamento',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("codicePagamento")}</Badge>
  },
  {
    accessorKey: 'descrizione',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    enableHiding: false,
  },
  {
    accessorKey: 'numeroRate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="N° Rate" />,
    cell: ({ row }) => {
      const rate = row.getValue('numeroRate') as string;
      return rate || 'N/A';
    }
  },
  {
    accessorKey: 'contoIncassoPagamento',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Conto Incasso/Pagamento" />,
  },
  {
    accessorKey: 'suddivisione',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Suddivisione" />,
  },
  {
    accessorKey: 'inizioScadenza',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Inizio Scadenza" />,
  },
  {
    accessorKey: 'calcolaGiorniCommerciali',
    header: ({ column }) => <DataTableColumnHeader column={column} title="GG Commerciali" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue('calcolaGiorniCommerciali') === 'S' ? 'default' : 'secondary'}>
        {row.getValue('calcolaGiorniCommerciali') === 'S' ? 'Sì' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'consideraPeriodiChiusura',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Periodi Chiusura" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue('consideraPeriodiChiusura') === 'S' ? 'default' : 'secondary'}>
        {row.getValue('consideraPeriodiChiusura') === 'S' ? 'Sì' : 'No'}
      </Badge>
    ),
  },
];

export function StagingCondizioniPagamentoTable() {
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
  } = useAdvancedTable<StagingCondizionePagamento>({
    endpoint: '/api/staging/condizioni-pagamento',
    initialSorting: [{ id: 'descrizione', desc: false }]
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Provvisori - Condizioni Pagamento</CardTitle>
        <CardDescription>
          Contenuto grezzo importato dai file. Usa la barra di ricerca e la gestione colonne per analizzare i dati.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdvancedDataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          searchValue={search}
          sorting={sorting}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearchChange={onSearchChange}
          onSortingChange={onSortingChange}
        />
      </CardContent>
    </Card>
  );
}