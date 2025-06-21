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
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createFornitore, updateFornitore, deleteFornitore } from '@/api/fornitori';
import { Fornitore } from '@/types';
import { baseSchema } from '@/schemas/database';
import { useCrudTable } from '@/hooks/useCrudTable';

type FornitoreFormValues = z.infer<typeof baseSchema>;

export const FornitoriTable = ({ data, onDataChange }: { data: Fornitore[], onDataChange: () => void }) => {

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingFornitore,
    deletingItem: deletingFornitore,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  } = useCrudTable<Fornitore, FornitoreFormValues>({
    schema: baseSchema,
    api: { create: createFornitore, update: updateFornitore, delete: deleteFornitore },
    onDataChange,
    resourceName: "Fornitore",
    defaultValues: { nome: "", externalId: "" },
    getId: (fornitore) => fornitore.id,
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fornitori</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Fornitore</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID Esterno</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((fornitore) => (
                <TableRow key={fornitore.id}>
                  <TableCell>{fornitore.nome}</TableCell>
                  <TableCell>{fornitore.externalId || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(fornitore)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingItem(fornitore)}><Trash2 className="h-4 w-4" /></Button>
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
                  <DialogTitle>{editingFornitore ? 'Modifica Fornitore' : 'Nuovo Fornitore'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Nome Fornitore" {...field} />
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
                                  <FormLabel>ID Esterno (opzionale)</FormLabel>
                                  <FormControl>
                                      <Input placeholder="ID del sistema esterno" {...field} />
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
      
      <AlertDialog open={!!deletingFornitore} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero eliminare il fornitore "{deletingFornitore?.nome}"? Questa azione non può essere annullata.
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