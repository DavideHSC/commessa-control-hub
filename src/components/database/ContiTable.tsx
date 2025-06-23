import React, { useEffect, useState } from 'react';
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createConto, updateConto, deleteConto } from '@/api/conti';
import { Conto, VoceAnalitica } from '@/types';
import { TipoConto } from '@prisma/client';
import { contoSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { getVociAnalitiche } from '@/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type ContoFormValues = z.infer<typeof contoSchema>;

export const ContiTable = () => {
  const [vociAnalitiche, setVociAnalitiche] = useState<VoceAnalitica[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchVoci = async () => {
      try {
        // Carichiamo *tutte* le voci analitiche per la dropdown, quindi usiamo un limite alto
        const result = await getVociAnalitiche({ limit: 1000 }); 
        setVociAnalitiche(result.data);
      } catch (error) {
        console.error("Failed to fetch voci analitiche", error);
      }
    };
    fetchVoci();
  }, []);

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
  } = useAdvancedTable<Conto>({
    endpoint: '/api/conti',
    initialSorting: [{ id: 'codice', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingConto,
    deletingItem: deletingConto,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<Conto, ContoFormValues>({
    schema: contoSchema,
    api: {
        create: (values) => createConto(values as Conto),
        update: updateConto,
        delete: deleteConto,
    },
    onDataChange: () => refreshData(),
    resourceName: "Conto",
    defaultValues: {
      id: "",
      codice: "",
      nome: "",
      tipo: TipoConto.Costo,
      richiedeVoceAnalitica: false,
      voceAnaliticaSuggeritaId: null,
    },
    getId: (conto) => conto.id,
  });

  const handleClearTable = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/system/clear-conti', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Errore durante lo svuotamento dei conti.');
      }
      toast.success('Piano dei Conti svuotato con successo.');
      refreshData();
      queryClient.invalidateQueries({ queryKey: ['databaseStats'] });
    } catch (error) {
      toast.error((error as Error).message || 'Si è verificato un errore sconosciuto.');
    } finally {
      setIsClearing(false);
    }
  };

  const columns: ColumnDef<Conto>[] = [
    {
        accessorKey: "codice",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
        cell: ({ row }) => <Badge variant="secondary">{row.getValue("codice")}</Badge>
    },
    {
        accessorKey: "nome",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    },
    {
        accessorKey: "tipo",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    },
    {
        accessorKey: "richiedeVoceAnalitica",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Richiede Voce Analitica" />,
        cell: ({ row }) => row.getValue("richiedeVoceAnalitica") ? 'Sì' : 'No'
    },
    {
        accessorKey: 'voceAnalitica.nome',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Voce Analitica" />
        ),
        cell: ({ row }) => row.original.voceAnalitica?.nome || 'N/A',
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const conto = row.original;
            return (
                <div className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(conto)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingItem(conto)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    }
  ];
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Piano dei Conti</CardTitle>
          <AlertDialog open={isClearing} onOpenChange={setIsClearing}>
            <Button
              variant="destructive"
              onClick={() => setIsClearing(true)}
              disabled={isClearing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? 'Svuotamento...' : 'Svuota Conti'}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione è irreversibile e cancellerà TUTTI i conti dal
                  Piano dei Conti. Sarà necessario re-importare il file
                  anagrafico per ripristinarli.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsClearing(false)}>
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearTable}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sì, svuota tutto
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            emptyMessage="Nessun conto trovato."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle>{editingConto ? 'Modifica Conto' : 'Nuovo Conto'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="id" render={({ field }) => (
                          <FormItem><FormLabel>ID</FormLabel><FormControl><Input {...field} disabled={!!editingConto} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="codice" render={({ field }) => (
                          <FormItem><FormLabel>Codice</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                    </div>
                    <FormField control={form.control} name="nome" render={({ field }) => (
                        <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="tipo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Conto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {Object.values(TipoConto).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="voceAnaliticaSuggeritaId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voce Analitica Suggerita</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Nessuna" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="">Nessuna</SelectItem>
                              {vociAnalitiche.map(voce => <SelectItem key={voce.id} value={voce.id}>{voce.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                    <FormField control={form.control} name="richiedeVoceAnalitica" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Richiede Voce Analitica</FormLabel>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}/>
                    <DialogFooter>
                      <Button type="submit">Salva</Button>
                    </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingConto} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>Vuoi davvero eliminare il conto "{deletingConto?.nome}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}; 