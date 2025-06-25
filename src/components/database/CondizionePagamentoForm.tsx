import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { condizioneSchema } from '@/schemas/database';
import * as z from 'zod';

type CondizioneFormValues = z.infer<typeof condizioneSchema>;

// Helper per estrarre solo le chiavi che corrispondono a un certo tipo di valore
type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U | undefined | null ? K : never }[keyof T];

export const CondizionePagamentoForm = () => {
  const form = useFormContext<CondizioneFormValues>();

  const renderNumberField = (name: KeysOfType<CondizioneFormValues, number>, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const renderTextField = (name: KeysOfType<CondizioneFormValues, string>, label: string, placeholder = '') => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderSwitchField = (name: KeysOfType<CondizioneFormValues, boolean>, label: string) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>{label}</FormLabel>
                </div>
                <FormControl>
                    <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
            </FormItem>
        )}
      />
  );

  return (
    <Accordion type="multiple" defaultValue={['principali', 'dettagli']}>
      <AccordionItem value="principali">
        <AccordionTrigger>Informazioni Principali</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextField('id', 'ID (Codice)')}
          {renderTextField('descrizione', 'Descrizione')}
          {renderTextField('codice', 'Codice Esterno')}
          {renderTextField('note', 'Note')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="dettagli">
        <AccordionTrigger>Dettagli Rate e Scadenze</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderNumberField('numeroRate', 'Numero Rate')}
          {renderNumberField('giorniPrimaScadenza', 'Giorni Prima Scadenza')}
          {renderNumberField('giorniTraRate', 'Giorni Tra Rate')}
          {renderNumberField('sconto', 'Sconto %')}
          {renderTextField('dataRiferimento', 'Data Riferimento')}
          {renderTextField('banca', 'Banca')}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="configurazione">
        <AccordionTrigger>Configurazione Avanzata</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {renderSwitchField('calcolaGiorniCommerciali', 'Calcola Giorni Commerciali')}
            {renderSwitchField('consideraPeriodiChiusura', 'Considera Periodi di Chiusura')}
          </div>
          <div className="space-y-4">
            {renderTextField('suddivisione', 'Cod. Suddivisione')}
            {renderTextField('suddivisioneDesc', 'Desc. Suddivisione')}
            {renderTextField('inizioScadenzaDesc', 'Desc. Inizio Scadenza')}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}; 