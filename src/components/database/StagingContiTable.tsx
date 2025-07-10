import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StagingConto } from '@prisma/client';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { format } from 'date-fns';

export const StagingContiTable = () => {
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
  } = useAdvancedTable<StagingConto>({
    endpoint: '/api/staging/conti',
    initialSorting: [{ id: 'importedAt', desc: true }]
  });

  const columns: ColumnDef<StagingConto>[] = [
    {
      accessorKey: "codice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("codice")}</Badge>
    },
    {
      accessorKey: "descrizione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
      enableHiding: false,
    },
    {
      accessorKey: "codiceFiscaleAzienda",
      header: ({ column }) => <DataTableColumnHeader column={column} title="CF Azienda" />,
    },
    {
      accessorKey: "livello",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Livello" />,
    },
    {
      accessorKey: "gruppo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gruppo" />,
    },
    {
      accessorKey: "tipo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    },
    {
      accessorKey: "sourceFileName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="File Origine" />,
    },
    {
      accessorKey: "importedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Importato il" />,
      cell: ({ row }) => format(new Date(row.getValue("importedAt")), "dd/MM/yyyy HH:mm:ss"),
    },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati di Staging - Piano dei Conti</CardTitle>
      </CardHeader>
      <CardContent>
        <AdvancedDataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          search={search}
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
}; 