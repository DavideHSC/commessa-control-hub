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
  DialogDescription,
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
import { Conto as ContoType, VoceAnalitica } from '@prisma/client';
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
import { ContoForm } from './ContoForm';

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
        setVociAnalitiche(result);
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
  } = useAdvancedTable<ContoType>({
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
  } = useCrudTable<ContoType, ContoFormValues>({
    schema: contoSchema,
    api: {
        create: (values) => createConto(values as ContoType),
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
      voceAnaliticaId: null,
      tabellaItalstudio: null,
      livello: null,
      sigla: null,
      controlloSegno: null,
      contoCostiRicavi: null,
      validoImpresaOrdinaria: false,
      validoImpresaSemplificata: false,
      validoProfessionistaOrdinario: false,
      validoProfessionistaSemplificato: false,
      validoUnicoPf: false,
      validoUnicoSp: false,
      validoUnicoSc: false,
      validoUnicoEnc: false,
      classeIrpefIres: null,
      classeIrap: null,
      classeProfessionista: null,
      classeIrapProfessionista: null,
      classeIva: null,
      contoDareCee: null,
      contoAvereCee: null,
      naturaConto: null,
      gestioneBeniAmmortizzabili: null,
      percDeduzioneManutenzione: null,
      gruppo: null,
      classeDatiExtracontabili: null,
      dettaglioClienteFornitore: null,
      descrizioneBilancioDare: null,
      descrizioneBilancioAvere: null,
      colonnaRegistroCronologico: null,
      colonnaRegistroIncassiPagamenti: null,
      livelloDesc: null,
      gruppoDesc: null,
      controlloSegnoDesc: null,
      codificaFormattata: null,
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

  const columns: ColumnDef<ContoType>[] = [
    {
        accessorKey: "codice",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
        cell: ({ row }) => <Badge variant="secondary">{row.getValue("codice")}</Badge>
    },
    {
        accessorKey: "nome",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
        enableHiding: false,
    },
    {
        accessorKey: "tipo",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
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
      accessorKey: "richiedeVoceAnalitica",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Richiede Voce Analitica" />,
      cell: ({ row }) => (row.getValue("richiedeVoceAnalitica") ? "Sì" : "No"),
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>{editingConto ? 'Modifica Conto' : 'Nuovo Conto'}</DialogTitle>
                  <DialogDescription>
                    {editingConto ? 'Modifica i dettagli del conto selezionato.' : 'Inserisci i dettagli per creare un nuovo conto.'}
                  </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <ContoForm vociAnalitiche={vociAnalitiche} />
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