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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contoSchema } from '@/schemas/database';
import { Conto as ContoType, VoceAnalitica } from '@prisma/client';
import { TipoConto } from '@prisma/client';
import * as z from 'zod';

type ContoFormValues = z.infer<typeof contoSchema>;

interface ContoFormProps {
    vociAnalitiche: VoceAnalitica[];
}

export const ContoForm = ({ vociAnalitiche }: ContoFormProps) => {
  const form = useFormContext<ContoFormValues>();

  return (
    <Accordion type="multiple" defaultValue={['dati_principali', 'classificazione', 'validita', 'collegamenti']}>
      <AccordionItem value="dati_principali">
        <AccordionTrigger>Dati Principali</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice *</FormLabel>
                <FormControl>
                  <Input placeholder="Codice conto" {...field} />
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
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome conto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Conto *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TipoConto).map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="richiedeVoceAnalitica"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Richiede Voce Analitica</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="voceAnaliticaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voce Analitica Collegata</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={!form.watch('richiedeVoceAnalitica')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una voce analitica" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nessuna</SelectItem>
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
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="classificazione">
        <AccordionTrigger>Gerarchia e Classificazione</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="livello" render={({ field }) => (<FormItem><FormLabel>Livello</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="gruppo" render={({ field }) => (<FormItem><FormLabel>Gruppo</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="sigla" render={({ field }) => (<FormItem><FormLabel>Sigla</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="controlloSegno" render={({ field }) => (<FormItem><FormLabel>Controllo Segno</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="codificaFormattata" render={({ field }) => (<FormItem><FormLabel>Codifica Formattata</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="validita">
        <AccordionTrigger>Validità Contabilità</AccordionTrigger>
        <AccordionContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="validoImpresaOrdinaria" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Impresa Ordinaria</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="validoImpresaSemplificata" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Impresa Semplificata</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="validoProfessionistaOrdinario" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Prof. Ordinario</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="validoProfessionistaSemplificato" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Prof. Semplificato</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="collegamenti">
        <AccordionTrigger>Conti Collegati e Gestione Speciale</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contoCostiRicavi" render={({ field }) => (<FormItem><FormLabel>Conto Costi/Ricavi</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contoDareCee" render={({ field }) => (<FormItem><FormLabel>Conto DARE CEE</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contoAvereCee" render={({ field }) => (<FormItem><FormLabel>Conto AVERE CEE</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="naturaConto" render={({ field }) => (<FormItem><FormLabel>Natura Conto</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gestioneBeniAmmortizzabili" render={({ field }) => (<FormItem><FormLabel>Gestione Beni Ammortizzabili</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="dettaglioClienteFornitore" render={({ field }) => (<FormItem><FormLabel>Dettaglio Cliente/Fornitore</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fiscale">
        <AccordionTrigger>Classificazione Fiscale</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="classeIrpefIres" render={({ field }) => (<FormItem><FormLabel>Classe IRPEF/IRES</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="classeIrap" render={({ field }) => (<FormItem><FormLabel>Classe IRAP</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="classeProfessionista" render={({ field }) => (<FormItem><FormLabel>Classe Professionista</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="classeIrapProfessionista" render={({ field }) => (<FormItem><FormLabel>Classe IRAP Prof.</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="classeIva" render={({ field }) => (<FormItem><FormLabel>Classe IVA</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}; 