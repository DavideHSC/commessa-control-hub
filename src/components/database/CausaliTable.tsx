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
import { createCausale, updateCausale, deleteCausale } from '@/api/causali';
import { CausaleContabile } from '@prisma/client';
import { causaleSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type CausaleFormValues = z.infer<typeof causaleSchema>;

export const CausaliTable = () => {
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
  } = useAdvancedTable<CausaleContabile>({
    endpoint: '/api/causali',
    initialSorting: [{ id: 'nome', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingCausale,
    deletingItem: deletingCausale,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<CausaleContabile, CausaleFormValues>({
    schema: causaleSchema,
    api: { 
      create: (values) => createCausale(values as CausaleContabile),
      update: updateCausale,
      delete: deleteCausale,
    },
    onDataChange: () => refreshData(),
    resourceName: "Causale",
    defaultValues: { 
      id: "", 
      codice: "",
      nome: "", 
      descrizione: "", 
      externalId: "",
      dataFine: null,
      dataInizio: null,
      noteMovimento: null,
      tipoAggiornamento: null,
      tipoMovimento: null,
      tipoRegistroIva: null,
      tipoMovimentoDesc: null,
      tipoAggiornamentoDesc: null,
      tipoRegistroIvaDesc: null,
      segnoMovimentoIva: null,
      segnoMovimentoIvaDesc: null,
      contoIva: null,
      contoIvaVendite: null,
      generazioneAutofattura: false,
      tipoAutofatturaGenerata: null,
      tipoAutofatturaDesc: null,
      fatturaImporto0: false,
      fatturaValutaEstera: false,
      nonConsiderareLiquidazioneIva: false,
      fatturaEmessaRegCorrispettivi: false,
      ivaEsigibilitaDifferita: null,
      ivaEsigibilitaDifferitaDesc: null,
      gestionePartite: null,
      gestionePartiteDesc: null,
      gestioneIntrastat: false,
      gestioneRitenuteEnasarco: null,
      gestioneRitenuteEnasarcoDesc: null,
      versamentoRitenute: false,
      descrizioneDocumento: null,
      identificativoEsteroClifor: false,
      scritturaRettificaAssestamento: false,
      nonStampareRegCronologico: false,
      movimentoRegIvaNonRilevante: false,
      tipoMovimentoSemplificata: null,
      tipoMovimentoSemplificataDesc: null
    },
    getId: (causale) => causale.id,
  });

  const columns: ColumnDef<CausaleContabile>[] = [
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
        accessorKey: "descrizione",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    },
    {
      accessorKey: "tipoMovimentoDesc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Movimento" />,
      cell: ({ row }) => row.getValue("tipoMovimentoDesc") || 'N/A'
    },
    {
      accessorKey: "tipoRegistroIvaDesc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registro IVA" />,
      cell: ({ row }) => row.getValue("tipoRegistroIvaDesc") || 'N/A'
    },
    {
      accessorKey: "gestionePartiteDesc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gest. Partite" />,
      cell: ({ row }) => row.getValue("gestionePartiteDesc") || 'N/A'
    },
    {
      accessorKey: "segnoMovimentoIvaDesc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Segno IVA" />,
      cell: ({ row }) => <Badge variant={row.original.segnoMovimentoIva === '+' ? 'default' : 'destructive'}>{row.getValue("segnoMovimentoIvaDesc")}</Badge>
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
          <CardTitle>Causali Contabili</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Causale</Button>
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
            emptyMessage="Nessuna causale trovata."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCausale ? 'Modifica Causale' : 'Nuova Causale'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Informazioni Generali</AccordionTrigger>
                <AccordionContent className="space-y-4 p-1">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!!editingCausale} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="codice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
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
                          <Input {...field} value={field.value ?? ''} />
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
                        <FormLabel>Descrizione</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="externalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Esterno</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noteMovimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note Movimento</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataInizio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Inizio Validità</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataFine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Fine Validità</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Gestione IVA</AccordionTrigger>
                <AccordionContent className="space-y-4 p-1">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="tipoRegistroIva" render={({ field }) => (<FormItem><FormLabel>Tipo Registro IVA <small>({form.getValues("tipoRegistroIvaDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="segnoMovimentoIva" render={({ field }) => (<FormItem><FormLabel>Segno Movimento IVA <small>({form.getValues("segnoMovimentoIvaDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="contoIva" render={({ field }) => (<FormItem><FormLabel>Conto IVA</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="contoIvaVendite" render={({ field }) => (<FormItem><FormLabel>Conto IVA Vendite</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="ivaEsigibilitaDifferita" render={({ field }) => (<FormItem><FormLabel>IVA Esigibilità Differita <small>({form.getValues("ivaEsigibilitaDifferitaDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <FormField control={form.control} name="nonConsiderareLiquidazioneIva" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Non considerare in Liquidazione IVA</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="fatturaEmessaRegCorrispettivi" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Fat. Emessa Reg. Corrispettivi</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="movimentoRegIvaNonRilevante" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Mov. IVA non rilevante</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Gestioni Speciali e Tipi Movimento</AccordionTrigger>
                <AccordionContent className="space-y-4 p-1">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="tipoMovimento" render={({ field }) => (<FormItem><FormLabel>Tipo Movimento <small>({form.getValues("tipoMovimentoDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="tipoAggiornamento" render={({ field }) => (<FormItem><FormLabel>Tipo Aggiornamento <small>({form.getValues("tipoAggiornamentoDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="gestionePartite" render={({ field }) => (<FormItem><FormLabel>Gestione Partite <small>({form.getValues("gestionePartiteDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="gestioneRitenuteEnasarco" render={({ field }) => (<FormItem><FormLabel>Gestione Ritenute Enasarco <small>({form.getValues("gestioneRitenuteEnasarcoDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="tipoMovimentoSemplificata" render={({ field }) => (<FormItem><FormLabel>Tipo Movimento Semplificata <small>({form.getValues("tipoMovimentoSemplificataDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="descrizioneDocumento" render={({ field }) => (<FormItem><FormLabel>Descrizione Documento</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <FormField control={form.control} name="gestioneIntrastat" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Gestione Intrastat</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="versamentoRitenute" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Versamento Ritenute</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="item-4">
                <AccordionTrigger>Autofatture e Flags</AccordionTrigger>
                <AccordionContent className="space-y-4 p-1">
                  <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="tipoAutofatturaGenerata" render={({ field }) => (<FormItem><FormLabel>Tipo Autofattura Generata <small>({form.getValues("tipoAutofatturaDesc")})</small></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                    <FormField control={form.control} name="generazioneAutofattura" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Generazione Autofattura</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="fatturaImporto0" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Fattura Importo 0</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="fatturaValutaEstera" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Fattura Valuta Estera</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="identificativoEsteroClifor" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>ID Estero Cli/For</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="scritturaRettificaAssestamento" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Scrittura Rettifica/Assestamento</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="nonStampareRegCronologico" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Non stampare su Reg. Cronologico</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
                <Button type="submit">Salva</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCausale} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà la causale contabile. Questa azione non può essere annullata.
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