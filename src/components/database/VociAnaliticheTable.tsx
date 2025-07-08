import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as z from 'zod';
import { VoceAnalitica as VoceAnaliticaType } from '@/types';
import { voceSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { Edit, Trash2 } from 'lucide-react';
import { VoceAnaliticaForm } from './VoceAnaliticaForm';
import { 
    createVoceAnalitica, 
    updateVoceAnalitica, 
    deleteVoceAnalitica 
} from '@/api/vociAnalitiche';

type VoceAnaliticaFormValues = z.infer<typeof voceSchema>;

export const VociAnaliticheTable = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

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
  } = useAdvancedTable<VoceAnaliticaType>({
    endpoint: '/api/voci-analitiche',
    initialSorting: [{ id: 'nome', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    deletingItem,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit: onCrudSubmit,
    handleDelete,
  } = useCrudTable<VoceAnaliticaType, VoceAnaliticaFormValues>({
    schema: voceSchema,
    api: {
        create: createVoceAnalitica,
        update: updateVoceAnalitica,
        delete: deleteVoceAnalitica,
    },
    onDataChange: () => refreshData(),
    resourceName: "Voce Analitica",
    defaultValues: {
      id: "",
      nome: "",
      descrizione: "",
      externalId: "",
    },
    getId: (item) => item.id,
  });

  const onSubmit = async (values: VoceAnaliticaFormValues) => {
    setIsSubmitting(true);
    await onCrudSubmit(values);
    setIsSubmitting(false);
  };

  const columns: ColumnDef<VoceAnaliticaType>[] = [
    {
        accessorKey: "nome",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
        enableHiding: false,
    },
    {
        accessorKey: "descrizione", 
        header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600" 
                        onClick={() => setDeletingItem(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }
  ] as ColumnDef<VoceAnaliticaType>[];
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Voci Analitiche</CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            Aggiungi Voce Analitica
          </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Voce Analitica' : 'Crea Nuova Voce Analitica'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Modifica i dettagli di questa voce analitica.' : 'Aggiungi una nuova voce per la contabilità analitica.'}
            </DialogDescription>
          </DialogHeader>
          <VoceAnaliticaForm 
            onSubmit={onSubmit}
            initialData={editingItem || undefined}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Questo eliminerà permanentemente la voce analitica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};