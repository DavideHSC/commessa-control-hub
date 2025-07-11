import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Form } from "@/components/ui/form";
import { createCliente, updateCliente, deleteCliente } from '@/api/clienti';
import { Cliente } from '@prisma/client';
import { clienteSchema, ClienteFormValues } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { ClienteForm } from './ClienteForm';

const emptyCliente: ClienteFormValues = {
  nome: '',
  externalId: '',
  piva: '',
  codiceFiscale: '',
  cap: '',
  codicePagamento: '',
  codiceValuta: '',
  cognome: '',
  comune: '',
  comuneNascita: '',
  dataNascita: undefined,
  indirizzo: '',
  nazione: '',
  nomeAnagrafico: '',
  provincia: '',
  sesso: '',
  telefono: '',
  tipoAnagrafica: '',
  codiceAnagrafica: '',
  tipoConto: '',
  tipoContoDesc: '',
  tipoSoggetto: '',
  tipoSoggettoDesc: '',
  denominazione: '',
  sessoDesc: '',
  prefissoTelefono: '',
  codiceIso: '',
  idFiscaleEstero: '',
  sottocontoAttivo: '',
  sottocontoCliente: '',
  sottocontoFornitore: '',
  codiceIncassoCliente: '',
  codicePagamentoFornitore: '',
  ePersonaFisica: false,
  eCliente: true,
  eFornitore: false,
  haPartitaIva: false,
};

export const ClientiTable = () => {

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
  } = useAdvancedTable<Cliente>({
    endpoint: '/api/clienti',
    initialSorting: [{ id: 'nome', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingCliente,
    deletingItem: deletingCliente,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<Cliente, ClienteFormValues>({
    schema: clienteSchema,
    api: { create: createCliente, update: updateCliente, delete: deleteCliente },
    onDataChange: () => refreshData(),
    resourceName: "Cliente",
    defaultValues: emptyCliente,
    getId: (cliente) => cliente.id,
  });

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />
    },
    {
      accessorKey: "externalId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID Esterno" />,
      cell: ({ row }) => row.getValue("externalId") || 'N/A'
    },
    {
        accessorKey: "piva",
        header: ({ column }) => <DataTableColumnHeader column={column} title="P.IVA" />,
        cell: ({ row }) => row.original.piva || 'N/A'
    },
    {
        accessorKey: "codiceFiscale",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Codice Fiscale" />,
        cell: ({ row }) => row.original.codiceFiscale || 'N/A'
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
          <CardTitle>Clienti</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Cliente</Button>
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
            emptyMessage="Nessun cliente trovato."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
              <DialogHeader>
                  <DialogTitle>{editingCliente ? 'Modifica Cliente' : 'Nuovo Cliente'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="max-h-[70vh] overflow-y-auto p-1">
                        <ClienteForm />
                      </div>
                      <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
                          <Button type="submit">Salva</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingCliente} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero eliminare il cliente "{deletingCliente?.nome}"? Questa azione non può essere annullata.
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