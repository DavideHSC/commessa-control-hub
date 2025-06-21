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

type VoceAnaliticaFormValues = z.infer<typeof voceSchema>;

export const VociAnaliticheTable = ({ data, onDataChange }: { data: VoceAnalitica[], onDataChange: () => void }) => {
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
    onDataChange,
    resourceName: "Voce analitica",
    defaultValues: { id: "", nome: "", descrizione: "", externalId: "" },
    getId: (voce) => voce.id,
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Voci Analitiche</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Voce</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((voce) => (
                <TableRow key={voce.id}>
                  <TableCell>
                    <Badge variant="outline">{voce.id}</Badge>
                  </TableCell>
                  <TableCell>{voce.nome}</TableCell>
                  <TableCell>{voce.descrizione || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(voce)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingItem(voce)}><Trash2 className="h-4 w-4" /></Button>
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