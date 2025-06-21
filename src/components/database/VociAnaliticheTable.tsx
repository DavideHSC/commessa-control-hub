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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createVoceAnalitica, updateVoceAnalitica, deleteVoceAnalitica } from '@/api/vociAnalitiche';
import { VoceAnalitica } from '@/types';
import { voceSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';

type VoceAnaliticaFormValues = z.infer<typeof voceSchema>;

export const VociAnaliticheTable = () => {
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
  } = useAdvancedTable<VoceAnalitica>({
    endpoint: '/api/voci-analitiche',
    initialSorting: [{ id: 'nome', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingVoce,
    deletingItem: deletingVoce,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<VoceAnalitica, VoceAnaliticaFormValues>({
    schema: voceSchema,
    api: {
      create: (values) => createVoceAnalitica(values as VoceAnalitica),
      update: updateVoceAnalitica,
      delete: deleteVoceAnalitica,
    },
    onDataChange: () => refreshData(),
    resourceName: "Voce analitica",
    defaultValues: { id: "", nome: "", descrizione: "", externalId: "" },
    getId: (voce) => voce.id,
  });

  const columns: ColumnDef<VoceAnalitica>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("id")}</Badge>
    },
    {
      accessorKey: "nome",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    },
    {
      accessorKey: "descrizione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
      cell: ({ row }) => row.getValue("descrizione") || 'N/A'
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
          <CardTitle>Voci Analitiche</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Voce</Button>
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
            emptyMessage="Nessuna voce analitica trovata."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingVoce ? 'Modifica Voce Analitica' : 'Nuova Voce Analitica'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="id"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>ID</FormLabel>
                                  <FormControl>
                                      <Input placeholder="ID Voce (es. COSTI_SOFTWARE)" {...field} disabled={!!editingVoce} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Nome descrittivo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="descrizione"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Descrizione (opzionale)</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Descrizione dettagliata" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <DialogFooter>
                          <Button type="submit">Salva</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingVoce} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero eliminare la voce "{deletingVoce?.nome}"? L'operazione fallirà se la voce è già stata utilizzata.
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