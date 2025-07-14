import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface StagingCausaleContabile {
  id: string;
  codiceCausale: string;
  descrizione: string;
  tipoMovimento: string;
  tipoAggiornamento: string;
  dataInizio: string;
  dataFine: string;
  tipoRegistroIva: string;
  segnoMovimentoIva: string;
  contoIva: string;
  gestionePartite: string;
  gestioneIntrastat: string;
  noteMovimento: string;
  descrizioneDocumento: string;
}

const columns: ColumnDef<StagingCausaleContabile>[] = [
  {
    accessorKey: 'codiceCausale',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("codiceCausale")}</Badge>
  },
  {
    accessorKey: 'descrizione',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    enableHiding: false,
  },
  {
    accessorKey: 'tipoMovimento',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Movimento" />,
  },
  {
    accessorKey: 'tipoAggiornamento',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Aggiornamento" />,
  },
  {
    accessorKey: 'tipoRegistroIva',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Registro IVA" />,
  },
  {
    accessorKey: 'segnoMovimentoIva',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Segno Movimento IVA" />,
  },
  {
    accessorKey: 'contoIva',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Conto IVA" />,
  },
  {
    accessorKey: 'gestionePartite',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gestione Partite" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue('gestionePartite') === 'S' ? 'default' : 'secondary'}>
        {row.getValue('gestionePartite') === 'S' ? 'Sì' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'gestioneIntrastat',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gestione Intrastat" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue('gestioneIntrastat') === 'S' ? 'default' : 'secondary'}>
        {row.getValue('gestioneIntrastat') === 'S' ? 'Sì' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'dataInizio',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data Inizio" />,
  },
  {
    accessorKey: 'dataFine',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data Fine" />,
  },
];

export function StagingCausaliTable() {
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
  } = useAdvancedTable<StagingCausaleContabile>({
    endpoint: '/api/staging/causali',
    initialSorting: [{ id: 'descrizione', desc: false }]
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati di Staging - Causali Contabili</CardTitle>
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