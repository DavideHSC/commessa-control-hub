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
import { Checkbox } from '@/components/ui/checkbox';
import { FornitoreFormValues } from '@/schemas/database';

export const FornitoreForm = () => {
  const form = useFormContext<FornitoreFormValues>();

  return (
    <Accordion type="multiple" defaultValue={['anagrafica', 'riferimenti', 'ritenute']}>
      {/* SEZIONE ANAGRAFICA */}
      <AccordionItem value="anagrafica">
        <AccordionTrigger>Dati Anagrafici</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome o Ragione Sociale" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cognome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cognome</FormLabel>
                <FormControl>
                  <Input placeholder="Cognome (se persona fisica)" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="denominazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Denominazione Completa</FormLabel>
                <FormControl>
                  <Input placeholder="Denominazione" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nomeAnagrafico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Anagrafico</FormLabel>
                <FormControl>
                  <Input placeholder="Nome per uso anagrafico" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sesso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sesso</FormLabel>
                <FormControl>
                  <Input placeholder="M/F" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sessoDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Sesso</FormLabel>
                <FormControl>
                  <Input placeholder="Maschio/Femmina" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comuneNascita"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comune di Nascita</FormLabel>
                <FormControl>
                  <Input placeholder="Comune di nascita" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoAnagrafica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Anagrafica</FormLabel>
                <FormControl>
                  <Input placeholder="Tipo anagrafica" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE INDIRIZZO */}
      <AccordionItem value="indirizzo">
        <AccordionTrigger>Indirizzo e Residenza</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="indirizzo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo</FormLabel>
                <FormControl>
                  <Input placeholder="Via, Piazza, ecc." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAP</FormLabel>
                <FormControl>
                  <Input placeholder="CAP" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comune"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comune</FormLabel>
                <FormControl>
                  <Input placeholder="Comune di residenza" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input placeholder="Sigla provincia (es. MI)" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazione</FormLabel>
                <FormControl>
                  <Input placeholder="Nazione" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codiceIso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice ISO</FormLabel>
                <FormControl>
                  <Input placeholder="Codice ISO nazione" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE CONTATTI */}
      <AccordionItem value="contatti">
        <AccordionTrigger>Contatti</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="Numero di telefono" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prefissoTelefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prefisso Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="Prefisso internazionale" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE RIFERIMENTI E FISCALI */}
      <AccordionItem value="riferimenti">
        <AccordionTrigger>Riferimenti e Dati Fiscali</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="externalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Esterno</FormLabel>
                <FormControl>
                  <Input placeholder="ID del sistema esterno" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codiceAnagrafica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Anagrafica</FormLabel>
                <FormControl>
                  <Input placeholder="Codice anagrafica interno" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="piva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partita IVA</FormLabel>
                <FormControl>
                  <Input placeholder="Partita IVA" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codiceFiscale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Fiscale</FormLabel>
                <FormControl>
                  <Input placeholder="Codice Fiscale" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idFiscaleEstero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Fiscale Estero</FormLabel>
                <FormControl>
                  <Input placeholder="Identificativo fiscale estero" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE CLASSIFICAZIONE */}
      <AccordionItem value="classificazione">
        <AccordionTrigger>Classificazione</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipoConto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Conto</FormLabel>
                <FormControl>
                  <Input placeholder="C/F/E" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoContoDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Tipo Conto</FormLabel>
                <FormControl>
                  <Input placeholder="Cliente/Fornitore/Entrambi" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoSoggetto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Soggetto</FormLabel>
                <FormControl>
                  <Input placeholder="Tipo soggetto" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoSoggettoDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Tipo Soggetto</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione tipo soggetto" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE RITENUTE E CONTRIBUTI (SPECIFICA FORNITORI) */}
      <AccordionItem value="ritenute">
        <AccordionTrigger>Ritenute e Contributi</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="aliquota"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aliquota</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="Aliquota percentuale" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codiceRitenuta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Ritenuta</FormLabel>
                <FormControl>
                  <Input placeholder="Codice ritenuta" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoRitenuta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Ritenuta</FormLabel>
                <FormControl>
                  <Input placeholder="Tipo ritenuta" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoRitenutaDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Tipo Ritenuta</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione tipo ritenuta" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contributoPrevidenzialeL335"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contributo Previdenziale L.335</FormLabel>
                <FormControl>
                  <Input placeholder="Contributo previdenziale L.335" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contributoPrevid335Desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Contributo L.335</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione contributo L.335" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="percContributoCassaPrev"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Contributo Cassa Prev.</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="Percentuale contributo cassa previdenziale" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attivitaMensilizzazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attività Mensilizzazione</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Codice attività mensilizzazione" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE QUADRO 770 */}
      <AccordionItem value="quadro770">
        <AccordionTrigger>Quadro 770</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quadro770"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quadro 770</FormLabel>
                <FormControl>
                  <Input placeholder="Codice quadro 770" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quadro770Desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione Quadro 770</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione quadro 770" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE PAGAMENTI */}
      <AccordionItem value="pagamenti">
        <AccordionTrigger>Condizioni di Pagamento</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codicePagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Pagamento</FormLabel>
                <FormControl>
                  <Input placeholder="Codice condizione di pagamento" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codiceIncassoCliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Incasso Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Codice incasso cliente" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codicePagamentoFornitore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Pagamento Fornitore</FormLabel>
                <FormControl>
                  <Input placeholder="Codice pagamento fornitore" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codiceValuta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Valuta</FormLabel>
                <FormControl>
                  <Input placeholder="Codice valuta" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* SEZIONE SOTTOCONTI */}
      <AccordionItem value="sottoconti">
        <AccordionTrigger>Sottoconti</AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <FormField
            control={form.control}
            name="sottocontoAttivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sottoconto Attivo</FormLabel>
                <FormControl>
                  <Input placeholder="Sottoconto Attivo" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sottocontoCliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sottoconto Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Sottoconto Cliente" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sottocontoFornitore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sottoconto Fornitore</FormLabel>
                <FormControl>
                  <Input placeholder="Sottoconto Fornitore" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>

      {/* SEZIONE FLAGS */}
      <AccordionItem value="flags">
        <AccordionTrigger>Flags e Indicatori</AccordionTrigger>
        <AccordionContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="ePersonaFisica"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Persona Fisica</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eCliente"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>È un Cliente</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eFornitore"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>È un Fornitore</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="haPartitaIva"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Ha Partita IVA</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contributoPrevidenziale"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Contributo Previdenziale</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="enasarco"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enasarco</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gestione770"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Gestione 770</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soggettoInail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Soggetto INAIL</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soggettoRitenuta"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Soggetto a Ritenuta</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
