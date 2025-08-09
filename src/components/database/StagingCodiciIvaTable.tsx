import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface StagingCodiceIva {
  id: string;
  codice: string;
  descrizione: string;
  tipoCalcolo: string;
  aliquota: string;
  indetraibilita: string;
  note: string;
  validitaInizio: string;
  validitaFine: string;
  imponibile50Corrispettivi: string;
  imposteIntrattenimenti: string;
  ventilazione: string;
  aliquotaDiversa: string;
}

const columns: ColumnDef<StagingCodiceIva>[] = [
  {
    accessorKey: 'codice',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("codice")}</Badge>
  },
  {
    accessorKey: 'descrizione',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    enableHiding: false,
  },
  {
    accessorKey: 'tipoCalcolo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Calcolo" />,
  },
  {
    accessorKey: 'aliquota',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aliquota" />,
    cell: ({ row }) => {
      const aliquota = row.getValue('aliquota') as string;
      return aliquota ? `${aliquota}%` : 'N/A';
    }
  },
  {
    accessorKey: 'indetraibilita',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Indetraibilità" />,
  },
  {
    accessorKey: 'note',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Note" />,
  },
  {
    accessorKey: 'validitaInizio',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Validità Inizio" />,
  },
  {
    accessorKey: 'validitaFine',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Validità Fine" />,
  },
  {
    accessorKey: 'ventilazione',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ventilazione" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue('ventilazione') === 'S' ? 'default' : 'secondary'}>
        {row.getValue('ventilazione') === 'S' ? 'Sì' : 'No'}
      </Badge>
    ),
  },
];

export function StagingCodiciIvaTable() {
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
  } = useAdvancedTable<StagingCodiceIva>({
    endpoint: '/api/staging/codici-iva',
    initialSorting: [{ id: 'codice', desc: false }]
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Provvisori - Codici IVA</CardTitle>
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