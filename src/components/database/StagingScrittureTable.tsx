import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StagingTestata } from '@prisma/client';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { format, isValid } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resetStagingScritture } from '@/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const StagingScrittureTable = () => {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  
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
  } = useAdvancedTable<StagingTestata>({
    endpoint: '/api/staging/scritture',
    initialSorting: [{ id: 'createdAt', desc: true }]
  });

  const handleResetScritture = async () => {
    setIsResetting(true);
    try {
      const result = await resetStagingScritture();
      toast({
        title: 'Reset Completato',
        description: result.message,
      });
      // Aggiorna la tabella dopo il reset
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Errore Reset',
        description: error.message || 'Errore durante il reset delle scritture staging.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <CardTitle>Dati di Staging - Testate Scritture Contabili</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isResetting || loading}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isResetting ? 'Reset in corso...' : 'Reset Scritture'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resettare le scritture staging?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione cancellerà solo i dati delle scritture contabili nelle tabelle staging. 
                  Le anagrafiche, conti e causali rimarranno intatte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetScritture}>Reset Scritture</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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