import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface StagingAnagrafica {
  id: string;
  tipoSoggetto: string;
  denominazione: string;
  nome: string;
  cognome: string;
  codiceFiscaleClifor: string;
  partitaIva: string;
  indirizzo: string;
  cap: string;
  comuneResidenza: string;
  numeroTelefono: string;
  codiceUnivoco: string;
  sottocontoCliente: string;
  sottocontoFornitore: string;
}

const columns: ColumnDef<StagingAnagrafica>[] = [
  {
    accessorKey: 'tipoSoggetto',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue('tipoSoggetto') === 'C' ? 'default' : 'secondary'}>
        {row.getValue('tipoSoggetto') === 'C' ? 'Cliente' : 'Fornitore'}
      </Badge>
    ),
  },
  {
    accessorKey: 'denominazione',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Denominazione" />,
    enableHiding: false,
  },
  {
    accessorKey: 'nome',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
  },
  {
    accessorKey: 'cognome',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cognome" />,
  },
  {
    accessorKey: 'codiceFiscaleClifor',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Codice Fiscale" />,
  },
  {
    accessorKey: 'partitaIva',
    header: ({ column }) => <DataTableColumnHeader column={column} title="P.IVA" />,
  },
  {
    accessorKey: 'comuneResidenza',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comune" />,
  },
  {
    accessorKey: 'numeroTelefono',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Telefono" />,
  },
  {
    accessorKey: 'codiceUnivoco',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Codice Univoco" />,
  },
];

export function StagingAnagraficheTable() {
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
  } = useAdvancedTable<StagingAnagrafica>({
    endpoint: '/api/staging/anagrafiche',
    initialSorting: [{ id: 'denominazione', desc: false }]
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati di Staging - Anagrafiche</CardTitle>
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