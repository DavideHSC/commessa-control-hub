import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as z from 'zod';
import { Form } from "@/components/ui/form";
import { createCondizionePagamento, updateCondizionePagamento, deleteCondizionePagamento, CondizionePagamento } from '@/api/condizioniPagamento';
import { condizioneSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { CondizionePagamentoForm } from './CondizionePagamentoForm';

type CondizioneFormValues = z.infer<typeof condizioneSchema>;

const emptyCondizione: CondizioneFormValues = {
  id: "",
  descrizione: "",
  codice: null,
  externalId: null,
  numeroRate: null,
  giorniPrimaScadenza: null,
  giorniTraRate: null,
  dataRiferimento: null,
  suddivisione: null,
  sconto: null,
  banca: null,
  note: null,
  calcolaGiorniCommerciali: false,
  consideraPeriodiChiusura: false,
  suddivisioneDesc: null,
  inizioScadenzaDesc: null,
};

export const CondizioniPagamentoTable = () => {
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
  } = useAdvancedTable<CondizionePagamento>({
    endpoint: '/api/condizioni-pagamento',
    initialSorting: [{ id: 'id', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingCondizione,
    deletingItem: deletingCondizione,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<CondizionePagamento, CondizioneFormValues>({
    schema: condizioneSchema,
    api: {
      create: (values) => createCondizionePagamento(values as CondizionePagamento),
      update: updateCondizionePagamento,
      delete: deleteCondizionePagamento,
    },
    onDataChange: () => refreshData(),
    resourceName: "Condizione di pagamento",
    defaultValues: emptyCondizione,
    getId: (condizione) => condizione.id,
  });

  const columns: ColumnDef<CondizionePagamento>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("id")}</Badge>
    },
    {
      accessorKey: "descrizione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    },
    {
      accessorKey: "numeroRate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="N. Rate" />,
    },
    {
      accessorKey: "codice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cod. Esterno" />,
      cell: ({ row }) => row.getValue("codice") || 'N/A'
    },
    {
      id: "actions",
      cell: ({ row }) => (
          <div className="text-right">
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(row.original)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingItem(row.original)}><Trash2 className="h-4 w-4" /></Button>
          </div>
      )
    }
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Condizioni di Pagamento</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Condizione</Button>
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
            emptyMessage="Nessuna condizione di pagamento trovata."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCondizione ? 'Modifica Condizione' : 'Nuova Condizione'}</DialogTitle>
             <DialogDescription>
                {editingCondizione ? 'Modifica i dettagli della condizione di pagamento.' : 'Inserisci i dettagli per una nuova condizione di pagamento.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CondizionePagamentoForm />
              <DialogFooter>
                <Button type="submit">{editingCondizione ? 'Aggiorna' : 'Crea'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCondizione} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà la condizione di pagamento. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 