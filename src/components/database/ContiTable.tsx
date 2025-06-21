import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

type ContoFormValues = z.infer<typeof contoSchema>;

export const ContiTable = ({ data, onDataChange, vociAnalitiche }: { data: Conto[], onDataChange: () => void, vociAnalitiche: VoceAnalitica[] }) => {
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
    onDataChange,
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
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Piano dei Conti</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Conto</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Richiede Voce Analitica</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((conto) => (
                <TableRow key={conto.id}>
                  <TableCell><Badge variant="secondary">{conto.codice}</Badge></TableCell>
                  <TableCell>{conto.nome}</TableCell>
                  <TableCell>{conto.tipo}</TableCell>
                  <TableCell>{conto.richiedeVoceAnalitica ? 'Sì' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(conto)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingItem(conto)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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