"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { ImportTemplate, FieldDefinition } from '@prisma/client';

// Tipo esteso per includere le relazioni
export type ImportTemplateWithRelations = ImportTemplate & {
    fieldDefinitions: FieldDefinition[];
};

const fieldSchema = z.object({
  id: z.string().optional(),
  fieldName: z.string().min(1, 'Obbligatorio'),
  start: z.number().min(0),
  length: z.number().min(0),
  end: z.number().min(0),
  fileIdentifier: z.string().optional(),
  format: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Il nome del template è obbligatorio'),
  modelName: z.string().min(1, 'Il nome del modello è obbligatorio'),
  fileIdentifier: z.string().optional(),
  fieldDefinitions: z.array(fieldSchema),
});

type TemplateFormData = z.infer<typeof formSchema>;

interface TemplateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TemplateFormData>) => void;
  initialData: ImportTemplateWithRelations | null;
}

export const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { control, handleSubmit, reset } = useForm<TemplateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      modelName: '',
      fileIdentifier: '',
      fieldDefinitions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fieldDefinitions',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        modelName: initialData.modelName,
        fileIdentifier: initialData.fileIdentifier ?? '',
        fieldDefinitions: initialData.fieldDefinitions,
      });
    } else {
      reset({ name: '', modelName: '', fileIdentifier: '', fieldDefinitions: [] });
    }
  }, [initialData, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifica Template' : 'Nuovo Template'}</DialogTitle>
          <DialogDescription>Configura i campi per il parsing del file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Nome Template</Label>
              <Controller name="name" control={control} render={({ field }) => <Input {...field} id="name" />} />
            </div>
            <div>
              <Label htmlFor="modelName">Nome Modello</Label>
              <Controller name="modelName" control={control} render={({ field }) => <Input {...field} id="modelName" />} />
            </div>
             <div>
              <Label htmlFor="fileIdentifier">Identificativo File (Opzionale)</Label>
              <Controller name="fileIdentifier" control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} id="fileIdentifier" />} />
            </div>
          </div>
          
          <div className='space-y-2'>
            <Label>Definizione Campi</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md">
                <div className="col-span-3">
                  <Controller name={`fieldDefinitions.${index}.fieldName`} control={control} render={({ field }) => <Input {...field} placeholder="Nome Campo"/>} />
                </div>
                <div className="col-span-2">
                  <Controller name={`fieldDefinitions.${index}.start`} control={control} render={({ field }) => <Input {...field} type="number" placeholder="Inizio" onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />} />
                </div>
                <div className="col-span-2">
                  <Controller name={`fieldDefinitions.${index}.length`} control={control} render={({ field }) => <Input {...field} type="number" placeholder="Lunghezza" onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />} />
                </div>
                <div className="col-span-2">
                  <Controller name={`fieldDefinitions.${index}.end`} control={control} render={({ field }) => <Input {...field} type="number" placeholder="Fine" onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />} />
                </div>
                <div className="col-span-2">
                  <Controller name={`fieldDefinitions.${index}.format`} control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Formato" />} />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => append({ fieldName: '', start: 0, length: 0, end: 0 })}>Aggiungi Campo</Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 