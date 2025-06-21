import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Textarea } from '@/components/ui/textarea';
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
import { createCommessa, updateCommessa, deleteCommessa } from '@/api/commesse';
import { Commessa, Cliente } from '@/types';
import { commessaSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';

type CommessaFormValues = z.infer<typeof commessaSchema>;

export const CommesseTable = ({ data, onDataChange, clienti }: { data: Commessa[], onDataChange: () => void, clienti: Cliente[] }) => {
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingCommessa,
    deletingItem: deletingCommessa,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<Commessa, CommessaFormValues>({
    schema: commessaSchema,
    api: {
      create: createCommessa,
      update: updateCommessa,
      delete: deleteCommessa,
    },
    onDataChange,
    resourceName: "Commessa",
    defaultValues: { id: "", nome: "", descrizione: "", clienteId: "" },
    getId: (commessa) => commessa.id,
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commesse</CardTitle>
          <Button onClick={() => handleOpenDialog()} disabled={clienti.length === 0}>
            Aggiungi Commessa
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((commessa) => (
                <TableRow key={commessa.id}>
                  <TableCell>{commessa.id}</TableCell>
                  <TableCell>{commessa.nome}</TableCell>
                  <TableCell>{clienti.find(c => c.id === commessa.clienteId)?.nome || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(commessa)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingItem(commessa)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingCommessa ? 'Modifica Commessa' : 'Nuova Commessa'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="id" render={({ field }) => (
                          <FormItem>
                              <FormLabel>ID Commessa</FormLabel>
                              <FormControl><Input placeholder="ID Univoco" {...field} disabled={!!editingCommessa} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="nome" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl><Input placeholder="Nome descrittivo della commessa" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="descrizione" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Descrizione (Opzionale)</FormLabel>
                              <FormControl><Textarea placeholder="Dettagli sulla commessa" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="clienteId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleziona un cliente" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {clienti.map(cliente => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <DialogFooter>
                          <Button type="submit">Salva</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingCommessa} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>Vuoi davvero eliminare la commessa "{deletingCommessa?.nome}"?</AlertDialogDescription>
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