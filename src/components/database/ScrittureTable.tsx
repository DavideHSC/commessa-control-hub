import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteRegistrazione } from '@/api/registrazioni';
import { clearScrittureContabili } from '@/api/database';
import { ScritturaContabile, RigaScrittura, Prisma } from '@prisma/client';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { CommesseTable } from "./CommesseTable";
import { ContiTable } from "./ContiTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const scritturaWithRelations = Prisma.validator<Prisma.ScritturaContabileDefaultArgs>()({
  include: { 
    righe: true,
    fornitore: true,
    causale: true 
  },
});
type ScritturaWithRelations = Prisma.ScritturaContabileGetPayload<typeof scritturaWithRelations>;

const consolidateScritture = async () => {
  const response = await fetch('/api/system/consolidate-scritture', { method: 'POST' });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Errore durante il consolidamento delle scritture');
  }
  return response.json();
};

export const ScrittureTable: React.FC = () => {
  const [deletingRegistrazione, setDeletingRegistrazione] = useState<ScritturaWithRelations | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    fetchData: refreshData,
  } = useAdvancedTable<ScritturaWithRelations>({
    endpoint: '/api/registrazioni',
    initialSorting: [{ id: 'data', desc: true }]
  });

  const consolidateMutation = useMutation({
    mutationFn: consolidateScritture,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["scritture"] });
      queryClient.invalidateQueries({ queryKey: ["databaseStats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (!deletingRegistrazione) return;
    try {
      await deleteRegistrazione(deletingRegistrazione.id);
      toast.success("Registrazione eliminata con successo.");
      refreshData();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeletingRegistrazione(null);
    }
  };

  const handleClearTable = async () => {
    try {
      await clearScrittureContabili();
      toast.success("Tutte le scritture sono state eliminate.");
      refreshData();
    } catch (error) {
      toast.error((error as Error).message);
    }
    finally {
      setIsClearing(false);
    }
  };

  const handleEdit = (registrazione: ScritturaWithRelations) => {
    navigate(`/prima-nota/modifica/${registrazione.id}`);
  };

  const calculateTotal = (righe: RigaScrittura[] = []) => {
    return righe.reduce((acc, riga) => acc + (riga.dare || 0), 0);
  };

  const columns: ColumnDef<ScritturaWithRelations>[] = [
    {
      accessorKey: "data",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
      cell: ({ row }) => new Date(row.getValue("data")).toLocaleDateString()
    },
    {
      accessorKey: "descrizione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    },
    {
      accessorKey: "causale",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Causale" />,
      cell: ({ row }) => {
        const causale = row.original.causale;
        return <Badge variant="outline">{causale ? causale.nome : 'N/A'}</Badge>;
      }
    },
    {
        accessorKey: 'fornitore.nome',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fornitore" />,
        cell: ({ row }) => row.original.fornitore?.nome || 'N/A'
    },
    {
      id: "totale",
      header: "Totale",
      cell: ({ row }) => {
        const total = calculateTotal(row.original.righe);
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(total);
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingRegistrazione(row.original)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scritture Contabili</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => consolidateMutation.mutate()}
                disabled={consolidateMutation.isPending}
              >
                {consolidateMutation.isPending ? "Consolidamento..." : "Consolida Import"}
              </Button>
              <Button variant="destructive" onClick={() => setIsClearing(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Svuota Scritture
              </Button>
            </div>
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
            emptyMessage="Nessuna scrittura trovata."
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingRegistrazione} onOpenChange={() => setDeletingRegistrazione(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà la registrazione contabile e tutte le sue righe e allocazioni. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearing} onOpenChange={setIsClearing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile e cancellerà TUTTE le scritture contabili, 
              incluse le righe e le allocazioni analitiche. Sei sicuro di voler procedere?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearTable} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sì, svuota tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 