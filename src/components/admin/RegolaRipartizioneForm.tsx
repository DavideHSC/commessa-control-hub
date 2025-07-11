'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RegolaRipartizione } from '@/types';
import {
  RegolaRipartizioneInput,
  regolaRipartizioneSchema,
} from '@/api/regoleRipartizione';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Lo schema ora è importato, non più definito qui

type ContoSelectItem = { id: string; codice: string | undefined | null; nome: string; };
type SelectItem = { id: string; nome: string | undefined; };

type RegolaRipartizioneFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegolaRipartizioneInput) => void;
  initialData: RegolaRipartizione | null;
  conti: ContoSelectItem[];
  commesse: SelectItem[];
  vociAnalitiche: SelectItem[];
};

export const RegolaRipartizioneForm: React.FC<RegolaRipartizioneFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  conti,
  commesse,
  vociAnalitiche,
}) => {
  const form = useForm<RegolaRipartizioneInput>({
    resolver: zodResolver(regolaRipartizioneSchema),
    defaultValues: initialData
      ? {
          descrizione: initialData.descrizione,
          percentuale: initialData.percentuale,
          contoId: initialData.contoId,
          commessaId: initialData.commessaId,
          voceAnaliticaId: initialData.voceAnaliticaId,
        }
      : {
          descrizione: '',
          percentuale: 0,
          contoId: '',
          commessaId: '',
          voceAnaliticaId: '',
        },
  });

  useEffect(() => {
    form.reset(
      initialData
        ? {
            descrizione: initialData.descrizione,
            percentuale: initialData.percentuale,
            contoId: initialData.contoId,
            commessaId: initialData.commessaId,
            voceAnaliticaId: initialData.voceAnaliticaId,
          }
        : {
            descrizione: '',
            percentuale: 0,
            contoId: '',
            commessaId: '',
            voceAnaliticaId: '',
          }
    );
  }, [initialData, form]);

  // La funzione handleSubmit ora riceve il tipo corretto inferito dallo schema
  const handleSubmit = (values: RegolaRipartizioneInput) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Modifica Regola' : 'Crea Nuova Regola'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="percentuale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentuale</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={event => field.onChange(parseFloat(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Select per Conto */}
            <FormField
              control={form.control}
              name="contoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un conto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conti.map((conto) => (
                        <SelectItem key={conto.id} value={conto.id}>
                          {conto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Select per Commessa */}
            <FormField
              control={form.control}
              name="commessaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commessa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una commessa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commesse.map((commessa) => (
                        <SelectItem key={commessa.id} value={commessa.id}>
                          {commessa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Select per Voce Analitica */}
            <FormField
              control={form.control}
              name="voceAnaliticaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voce Analitica</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una voce analitica" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vociAnalitiche.map((voce) => (
                        <SelectItem key={voce.id} value={voce.id}>
                          {voce.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 