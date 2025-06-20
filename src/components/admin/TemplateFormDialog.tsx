"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImportTemplate, FieldDefinition } from '@/types';
import { createImportTemplate, updateImportTemplate } from '@/api/importTemplates';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Trash2, PlusCircle } from 'lucide-react';

interface TemplateFormDialogProps {
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  template: ImportTemplate | null;
}

const fieldSchema = z.object({
  id: z.string().optional(),
  nomeCampo: z.string().min(1, "Il nome del campo è obbligatorio."),
  start: z.coerce.number().min(0, "L'inizio deve essere non negativo."),
  length: z.coerce.number().min(1, "La lunghezza deve essere almeno 1."),
  type: z.enum(['string', 'number', 'date']),
  fileIdentifier: z.string().optional().nullable(),
});

const templateSchema = z.object({
  nome: z.string().min(2, "Il nome del template è obbligatorio."),
  fields: z.array(fieldSchema).min(1, "Deve esserci almeno un campo."),
});


export const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({ isOpen, onClose, template }) => {
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      nome: '',
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields"
  });

  useEffect(() => {
    if (template) {
      form.reset({
        nome: template.nome,
        fields: template.fields.map(f => ({...f, id: f.id || undefined }))
      });
    } else {
      form.reset({
        nome: '',
        fields: [{ nomeCampo: '', start: 0, length: 1, type: 'string', fileIdentifier: '' }],
      });
    }
  }, [template, form]);

  const onSubmit = async (values: z.infer<typeof templateSchema>) => {
    try {
        if (template) {
            await updateImportTemplate(template.id, values as Omit<ImportTemplate, 'id'>);
            toast.success("Template aggiornato con successo.");
        } else {
            await createImportTemplate(values as any); // any to match the API signature
            toast.success("Template creato con successo.");
        }
        onClose(true);
    } catch (error) {
        toast.error((error as Error).message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template ? 'Modifica Template' : 'Nuovo Template'}</DialogTitle>
          <DialogDescription>
            Definisci il nome del template e i campi a larghezza fissa.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Template</FormLabel>
                        <FormControl>
                            <Input placeholder="Es. clienti_fornitori" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    <Label>Campi del Template</Label>
                    <div className="space-y-4 mt-2">
                        {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end space-x-2 p-3 border rounded-md">
                            <FormField
                                control={form.control}
                                name={`fields.${index}.nomeCampo`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Nome Campo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`fields.${index}.start`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Inizio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`fields.${index}.length`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Lunghezza</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`fields.${index}.type`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="string">Testo</SelectItem>
                                            <SelectItem value="number">Numero</SelectItem>
                                            <SelectItem value="date">Data</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage /></FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`fields.${index}.fileIdentifier`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>ID File (Opz.)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => append({ nomeCampo: '', start: 0, length: 1, type: 'string', fileIdentifier: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Aggiungi Campo
                    </Button>
                </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onClose(false)}>Annulla</Button>
              <Button type="submit">Salva Template</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 