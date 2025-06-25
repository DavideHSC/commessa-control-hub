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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createCodiceIva, updateCodiceIva, deleteCodiceIva, CodiceIva } from '@/api/codiciIva';
import { codiceIvaSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';

type CodiceIvaFormValues = z.infer<typeof codiceIvaSchema>;

export const CodiciIvaTable = () => {

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
  } = useAdvancedTable<CodiceIva>({
    endpoint: '/api/codici-iva',
    initialSorting: [{ id: 'codice', desc: false }]
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingCodice,
    deletingItem: deletingCodice,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<CodiceIva, CodiceIvaFormValues>({
    schema: codiceIvaSchema,
    api: { 
      create: (values) => createCodiceIva(values as CodiceIva),
      update: updateCodiceIva,
      delete: deleteCodiceIva,
    },
    onDataChange: () => refreshData(),
    resourceName: "Codice IVA",
    defaultValues: { 
      id: "", 
      codice: "",
      descrizione: "", 
      aliquota: null, 
      externalId: "",
      note: "",
      tipoCalcolo: "",
      indetraibilita: null,
      percentualeCompensazione: null,
      aliquotaDiversa: null,
      percDetrarreExport: null
      // tutti gli altri campi verranno inizializzati a null/undefined/false di default da Zod
    },
    getId: (codice) => codice.id,
  });

  const columns: ColumnDef<CodiceIva>[] = [
    {
      accessorKey: "codice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("codice")}</Badge>
    },
    {
      accessorKey: "descrizione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    },
    {
      accessorKey: "aliquota",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Aliquota" />,
      cell: ({ row }) => {
        const aliquota = row.getValue("aliquota");
        return aliquota !== null && aliquota !== undefined ? `${aliquota}%` : 'N/A';
      }
    },
    {
      accessorKey: "tipoCalcolo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Calcolo" />,
      cell: ({ row }) => row.getValue("tipoCalcolo") || 'N/A'
    },
    {
      accessorKey: "externalId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID Esterno" />,
      cell: ({ row }) => row.getValue("externalId") || 'N/A'
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
          <CardTitle>Codici IVA</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Codice IVA</Button>
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
            emptyMessage="Nessun codice IVA trovato."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCodice ? 'Modifica Codice IVA' : 'Nuovo Codice IVA'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Dati Base</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="codice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
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
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="descrizione"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aliquota"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aliquota (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="indetraibilita"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indetraibilità (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="tipoCalcolo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Calcolo</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Flags Fiscali</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      
                      <FormField
                        control={form.control}
                        name="splitPayment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Split Payment</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nonImponibile"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Non Imponibile</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="esente"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Esente</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reverseCharge"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Reverse Charge</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autofatturaReverseCharge"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Autofattura Reverse Charge</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ventilazione"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Ventilazione</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acquistiIntracomunitari"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Acquisti Intracomunitari</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="beniAmmortizzabili"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Beni Ammortizzabili</FormLabel>
                          </FormItem>
                        )}
                      />

                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Plafond e Compensazioni</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="plafondAcquisti"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plafond Acquisti</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="plafondVendite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plafond Vendite</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gestioneProRata"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gestione Pro-Rata</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="percentualeCompensazione"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentuale Compensazione (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Territorialità e Comunicazioni</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="indicatoreTerritorialeVendite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indicatore Territoriale Vendite</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="indicatoreTerritorialeAcquisti"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indicatore Territoriale Acquisti</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="comunicazioneDatiIvaVendite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comunicazione Dati IVA Vendite</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="comunicazioneDatiIvaAcquisti"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comunicazione Dati IVA Acquisti</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Configurazioni Avanzate</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aliquotaDiversa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aliquota Diversa (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="percDetrarreExport"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Perc. Detrarre Export (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="acquistiCessioni"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Acquisti Cessioni</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metodoDaApplicare"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Metodo da Applicare</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <DialogFooter>
                <Button type="submit">{editingCodice ? 'Aggiorna' : 'Crea'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCodice} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà il codice IVA. Questa azione non può essere annullata.
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