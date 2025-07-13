import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StagingTestata } from '@prisma/client';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { format, isValid } from 'date-fns';

export const StagingScrittureTable = () => {
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
  } = useAdvancedTable<StagingTestata>({
    endpoint: '/api/staging/scritture',
    initialSorting: [{ id: 'createdAt', desc: true }]
  });

  const columns: ColumnDef<StagingTestata>[] = [
    {
      accessorKey: "codiceUnivocoScaricamento",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID Univoco" />,
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("codiceUnivocoScaricamento")}</Badge>
    },
    {
      accessorKey: "descrizioneCausale",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Causale" />,
      enableHiding: false,
    },
    {
      accessorKey: "dataRegistrazione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Data Reg." />,
      cell: ({ row }) => {
        const value = row.getValue("dataRegistrazione");
        if (typeof value !== 'string') return "N/D";
        const date = new Date(value);
        return isValid(date) ? format(date, "dd/MM/yyyy") : "N/D";
      },
    },
    {
      accessorKey: "numeroDocumento",
      header: ({ column }) => <DataTableColumnHeader column={column} title="N. Doc" />,
    },
    {
      accessorKey: "totaleDocumento",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Totale Doc." />,
    },
    {
      accessorKey: "clienteFornitoreCodiceFiscale",
      header: ({ column }) => <DataTableColumnHeader column={column} title="CF Cliente/Fornitore" />,
    },
    {
      accessorKey: "sourceFileName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="File Origine" />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Importato il" />,
      cell: ({ row }) => {
        const value = row.getValue("createdAt");
        if (typeof value !== 'string') return "N/D";
        const date = new Date(value);
        return isValid(date) ? format(date, "dd/MM/yyyy HH:mm:ss") : "N/D";
      }
    },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati di Staging - Testate Scritture Contabili</CardTitle>
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
}; 