import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { voceSchema } from '@/schemas/database';
import { VoceAnalitica } from '@prisma/client';

type VoceAnaliticaFormValues = z.infer<typeof voceSchema>;

interface VoceAnaliticaFormProps {
  onSubmit: (values: VoceAnaliticaFormValues) => void;
  initialData?: Partial<VoceAnalitica>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const VoceAnaliticaForm: React.FC<VoceAnaliticaFormProps> = ({ onSubmit, initialData, onCancel, isSubmitting }) => {
  const form = useForm<VoceAnaliticaFormValues>({
    resolver: zodResolver(voceSchema),
    defaultValues: {
      id: initialData?.id || '',
      nome: initialData?.nome || '',
      descrizione: initialData?.descrizione || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Es. Manodopera Diretta" {...field} />
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
                <Textarea
                  placeholder="Descrivi a cosa serve questa voce analitica..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 