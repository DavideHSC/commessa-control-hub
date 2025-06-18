import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Commessa, Conto, CausaleContabile, ScritturaContabile, RigaScrittura, Allocazione, CentroDiCosto } from '@/types';
import { getCommesse, getPianoDeiConti, getCausaliContabili, getCentriDiCosto } from '@/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { salvaRegistrazione } from '@/api/registrazioni';
import { Combobox } from '@/components/ui/combobox';

const NuovaRegistrazionePrimaNota: React.FC = () => {
  const navigate = useNavigate();

  // Stati per i dati caricati dall'API
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [conti, setConti] = useState<Conto[]>([]);
  const [causali, setCausali] = useState<CausaleContabile[]>([]);
  const [centriDiCosto, setCentriDiCosto] = useState<CentroDiCosto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Stato per la registrazione corrente
  const [registrazione, setRegistrazione] = useState<ScritturaContabile>({
    id: `reg-${Date.now()}`,
    data: new Date(),
    causaleId: '',
    descrizione: '',
    righe: [{
      id: `riga-${Date.now()}`,
      contoId: '',
      descrizione: '',
      dare: 0,
      avere: 0,
      allocazioni: [],
    }]
  });

  // Dati primari per l'automatismo. Semplificato per contenere solo i valori necessari.
  const [datiPrimari, setDatiPrimari] = useState<{ [key: string]: any }>({
    totaleDocumento: 0,
    fornitoreId: '',
    clienteId: '',
    // altri campi dinamici verranno aggiunti qui
  });
  
  // Stato per la causale attualmente selezionata
  const [causaleSelezionata, setCausaleSelezionata] = useState<CausaleContabile | null>(null);

  // Stato per i valori visualizzati negli input formattati, per evitare il bug del cursore
  const [displayValues, setDisplayValues] = useState<{ [key: string]: string }>({});

  // Stato per la modale di allocazione
  const [allocazioneRigaId, setAllocazioneRigaId] = useState<string | null>(null);
  const [allocazioniTemporanee, setAllocazioniTemporanee] = useState<Allocazione[]>([]);

  // Caricamento dati iniziali
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [commesseData, contiData, causaliData, centriDiCostoData] = await Promise.all([
          getCommesse(),
          getPianoDeiConti(),
          getCausaliContabili(),
          getCentriDiCosto(),
        ]);
        setCommesse(commesseData);
        setConti(contiData);
        setCausali(causaliData);
        setCentriDiCosto(centriDiCostoData);
      } catch (error) {
        console.error("Errore nel caricamento dei dati iniziali", error);
        // Gestire l'errore, magari con una notifica
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Quando apriamo la modale, popoliamo le allocazioni temporanee con quelle esistenti
    // o con una riga vuota se non ce ne sono.
    if (allocazioneRigaId) {
      const rigaInAllocazione = registrazione.righe.find(r => r.id === allocazioneRigaId);
      const contoRiga = conti.find(c => c.id === rigaInAllocazione?.contoId);
      
      let commessaSuggeritaId = '';
      // Se è una riga di ricavo e abbiamo un cliente nei dati primari, tentiamo di pre-selezionare la commessa
      if (contoRiga?.tipo === 'Ricavo' && datiPrimari.clienteId) {
        const commessaAssociata = commesse.find(c => c.clienteId === datiPrimari.clienteId);
        if (commessaAssociata) {
          commessaSuggeritaId = commessaAssociata.id;
        }
      }

      const existingAllocations = rigaInAllocazione?.allocazioni || [];

      if (existingAllocations.length > 0) {
        setAllocazioniTemporanee(existingAllocations);
      } else {
        // Proponi una riga vuota per iniziare, con la commessa pre-selezionata se trovata
        setAllocazioniTemporanee([{
          id: `alloc-${Date.now()}`,
          commessaId: commessaSuggeritaId,
          centroDiCostoId: '',
          importo: 0,
        }]);
      }
    }
  }, [allocazioneRigaId, registrazione.righe, conti, commesse, datiPrimari.clienteId]);

  // Sincronizza lo stato di visualizzazione quando i dati di origine cambiano programmaticamente
  useEffect(() => {
    const newDisplayValues: { [key: string]: string } = {};
    newDisplayValues['totaleDocumento'] = formatNumber(datiPrimari.totaleDocumento);
    registrazione.righe.forEach(riga => {
      newDisplayValues[`${riga.id}-dare`] = formatNumber(riga.dare);
      newDisplayValues[`${riga.id}-avere`] = formatNumber(riga.avere);
    });
    // Sincronizza anche i valori delle allocazioni temporanee
    allocazioniTemporanee.forEach((alloc, idx) => {
        newDisplayValues[`alloc-${idx}`] = formatNumber(alloc.importo);
    });
    setDisplayValues(newDisplayValues);
  }, [datiPrimari.totaleDocumento, registrazione.righe, allocazioniTemporanee]);

  const addRigaContabile = () => {
    setRegistrazione(prev => ({
      ...prev,
      righe: [
        ...prev.righe,
        {
          id: `riga-${Date.now()}`,
          contoId: '',
          descrizione: '',
          dare: 0,
          avere: 0,
          allocazioni: [],
        }
      ]
    }));
  };

  const updateRigaContabile = (id: string, field: keyof RigaScrittura, value: any) => {
    setRegistrazione(prev => ({
      ...prev,
      righe: prev.righe.map(riga => {
        if (riga.id === id) {
          const updatedRiga = { ...riga, [field]: value };
          // Piccolo automatismo: se cambio il conto, aggiorno la descrizione
          if (field === 'contoId') {
            const contoSelezionato = conti.find(c => c.id === value);
            updatedRiga.descrizione = contoSelezionato?.nome || '';
          }
          return updatedRiga;
        }
        return riga;
      })
    }));
  };

  const removeRigaContabile = (id: string) => {
    if (registrazione.righe.length <= 1) return; // Non rimuovere l'ultima riga
    setRegistrazione(prev => ({
      ...prev,
      righe: prev.righe.filter(riga => riga.id !== id)
    }));
  };

  const getTotaleDare = () => registrazione.righe.reduce((sum, r) => sum + (r.dare || 0), 0);
  const getTotaleAvere = () => registrazione.righe.reduce((sum, r) => sum + (r.avere || 0), 0);
  const getSbilancio = () => Math.abs(getTotaleDare() - getTotaleAvere());

  const isDareEnabled = (contoId: string): boolean => {
    const conto = conti.find(c => c.id === contoId);
    if (!conto) return true; // Abilitato se nessun conto è selezionato
    return conto.tipo === 'Costo' || conto.tipo === 'Patrimoniale' || conto.tipo === 'Fornitore' || conto.tipo === 'Cliente';
  };

  const isAvereEnabled = (contoId: string): boolean => {
    const conto = conti.find(c => c.id === contoId);
    if (!conto) return true; // Abilitato se nessun conto è selezionato
    return conto.tipo === 'Ricavo' || conto.tipo === 'Patrimoniale' || conto.tipo === 'Fornitore' || conto.tipo === 'Cliente';
  };

  const isAllocazioneEnabled = (contoId: string): boolean => {
    const conto = conti.find(c => c.id === contoId);
    if (!conto) return false;
    return conto.tipo === 'Costo' || conto.tipo === 'Ricavo';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await salvaRegistrazione(registrazione);
      toast.success("Registrazione salvata con successo!", {
        description: `La registrazione "${registrazione.descrizione}" è stata salvata.`,
      });
      navigate('/prima-nota');
    } catch (error) {
      console.error("Errore durante il salvataggio della registrazione", error);
      toast.error("Errore nel salvataggio", {
        description: "Si è verificato un problema durante il salvataggio della registrazione."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (amount: number | undefined): string => {
    if (amount === undefined || isNaN(amount) || amount === 0) return '';
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const parseFormattedNumber = (value: string): number => {
    if (!value) return 0;
    // Rimuove i separatori delle migliaia (punti) e sostituisce la virgola decimale con un punto
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? 0 : number;
  };

  const handleGeneraScrittura = () => {
    if (!causaleSelezionata || !causaleSelezionata.templateScrittura) {
      toast.error("Errore di generazione", { description: "Seleziona una causale valida con un template prima di generare la scrittura." });
      return;
    }
    
    // Validazione dei dati primari richiesti dalla causale
    for (const campo of causaleSelezionata.datiPrimari) {
      if (!datiPrimari[campo.id] || datiPrimari[campo.id] === 0) {
        toast.error("Dati primari mancanti", { description: `Il campo "${campo.label}" è obbligatorio per questa causale.` });
        return;
      }
    }

    const { totaleDocumento, aliquotaIva = 22 } = datiPrimari;
    const totale = typeof totaleDocumento === 'string' ? parseFormattedNumber(totaleDocumento) : totaleDocumento;

    const imponibile = parseFloat((totale / (1 + aliquotaIva / 100)).toFixed(2));
    const iva = parseFloat((totale - imponibile).toFixed(2));

    const valoriCalcolati: { [key: string]: number } = {
      totale: totale,
      imponibile: imponibile,
      iva: iva,
    };
    
    const nuoveRighe: RigaScrittura[] = causaleSelezionata.templateScrittura.map((voce, index) => {
      const conto = conti.find(c => c.id === voce.contoId);
      if (!conto) {
        console.error(`Conto con id ${voce.contoId} non trovato!`);
        return null;
      }

      // Se la voce del template si riferisce a un fornitore o cliente, usiamo l'ID dai dati primari
      let contoIdEffettivo = conto.id;
      if (conto.tipo === 'Fornitore' && datiPrimari.fornitoreId) {
        contoIdEffettivo = datiPrimari.fornitoreId;
      } else if (conto.tipo === 'Cliente' && datiPrimari.clienteId) {
        contoIdEffettivo = datiPrimari.clienteId;
      }
      
      const contoEffettivo = conti.find(c => c.id === contoIdEffettivo);

      const importo = valoriCalcolati[voce.formulaImporto] || 0;

      return {
        id: `riga-gen-${Date.now()}-${index}`,
        contoId: contoIdEffettivo,
        descrizione: contoEffettivo?.nome || 'Conto non trovato',
        dare: voce.sezione === 'Dare' ? importo : 0,
        avere: voce.sezione === 'Avere' ? importo : 0,
        allocazioni: [],
      };
    }).filter((riga): riga is RigaScrittura => riga !== null);

    if (nuoveRighe.length > 0) {
      setRegistrazione(prev => ({
        ...prev,
        righe: nuoveRighe,
        descrizione: prev.descrizione || causaleSelezionata.nome,
      }));
      toast.success("Scrittura generata!", {
        description: `Create ${nuoveRighe.length} righe contabili basate sulla causale "${causaleSelezionata.nome}".`
      });
    }
  };

  const handleCausaleChange = (causaleId: string) => {
    const selected = causali.find(c => c.id === causaleId) || null;
    setCausaleSelezionata(selected);
    
    setRegistrazione(prev => ({ ...prev, causaleId: causaleId, righe: [] }));
    
    // Resetta i dati primari quando la causale cambia
    const nuoviDatiPrimari: { [key: string]: any } = {};
    if (selected) {
      selected.datiPrimari.forEach(campo => {
        nuoviDatiPrimari[campo.id] = campo.tipo === 'number' ? 0 : '';
      });
    }
    setDatiPrimari(nuoviDatiPrimari);

    // Se la nuova causale non ha un template, aggiungi una riga vuota per l'inserimento manuale
    if (!selected || !selected.templateScrittura || selected.templateScrittura.length === 0) {
      addRigaContabile();
    }
  };

  const handleDatiPrimariChange = (id: string, value: any) => {
    setDatiPrimari(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSalvaAllocazioni = () => {
    if (!allocazioneRigaId) return;

    // Validazione: la somma delle allocazioni deve corrispondere all'importo della riga
    const riga = registrazione.righe.find(r => r.id === allocazioneRigaId);
    if (!riga) return;

    const importoRiga = riga.dare || riga.avere;
    const totaleAllocato = allocazioniTemporanee.reduce((sum, alloc) => sum + (alloc.importo || 0), 0);

    if (Math.abs(importoRiga - totaleAllocato) > 0.01) { // Tolleranza per errori di floating point
        toast.error("Errore di allocazione", {
            description: `La somma delle allocazioni (${formatCurrency(totaleAllocato)}) non corrisponde all'importo della riga (${formatCurrency(importoRiga)}).`
        });
        return;
    }

    setRegistrazione(prev => ({
      ...prev,
      righe: prev.righe.map(r => {
        if (r.id === allocazioneRigaId) {
          return { ...r, allocazioni: allocazioniTemporanee };
        }
        return r;
      })
    }));
    setAllocazioneRigaId(null); // Chiude la modale
    toast.success("Allocazioni salvate", {
        description: `Le allocazioni per la riga "${riga.descrizione}" sono state salvate temporaneamente.`
    });
  };

  const handleUpdateAllocazioneTemp = (index: number, field: keyof Allocazione, value: any) => {
    setAllocazioniTemporanee(prev => {
      const newAllocations = [...prev];
      const allocazione = { ...newAllocations[index], [field]: value };
      
      if (field === 'importo') {
        const importoValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
        allocazione.importo = importoValue;
      }

      newAllocations[index] = allocazione;
      return newAllocations;
    });
  };

  const handleAddAllocazioneTemp = () => {
    setAllocazioniTemporanee(prev => [
      ...prev,
      {
        id: `alloc-${Date.now()}`,
        commessaId: '',
        centroDiCostoId: '',
        importo: 0,
      }
    ]);
  };

  const handleRemoveAllocazioneTemp = (index: number) => {
    setAllocazioniTemporanee(prev => prev.filter((_, i) => i !== index));
  };

  const handleDisplayValueChange = (key: string, value: string) => {
    // Permetti solo numeri e la virgola per l'input
    const regex = /^[0-9,]*$/;
    if (regex.test(value)) {
        setDisplayValues(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleDisplayValueBlur = (key: string, type: 'totale' | 'riga' | 'allocazione', rigaId?: string, field?: 'dare' | 'avere', allocIndex?: number) => {
    const numericValue = parseFormattedNumber(displayValues[key] || '0');
    
    if (type === 'totale') {
      handleDatiPrimariChange('totaleDocumento', numericValue);
    } else if (type === 'riga' && rigaId && field) {
      updateRigaContabile(rigaId, field, numericValue);
      // Se si modifica una riga, azzerare l'altra sezione per la stessa riga
      updateRigaContabile(rigaId, field === 'dare' ? 'avere' : 'dare', 0);
    } else if (type === 'allocazione' && allocIndex !== undefined) {
        handleUpdateAllocazioneTemp(allocIndex, 'importo', numericValue);
    }
  };

  const renderDatiPrimari = () => {
    if (!causaleSelezionata || causaleSelezionata.datiPrimari.length === 0) {
      return null;
    }

    return (
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Dati Primari per: {causaleSelezionata.nome}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {causaleSelezionata.datiPrimari.map(campo => {
            const commonProps = {
              id: campo.id,
              value: datiPrimari[campo.id] || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleDatiPrimariChange(campo.id, e.target.value),
            };

            if (campo.tipo === 'select') {
              const contiFiltrati = conti.filter(c => c.tipo === campo.riferimentoConto);
              return (
                <div key={campo.id}>
                  <Label htmlFor={campo.id} className="text-blue-900">{campo.label}</Label>
                  <Select
                    value={datiPrimari[campo.id] || ''}
                    onValueChange={(value) => handleDatiPrimariChange(campo.id, value)}
                  >
                    <SelectTrigger id={campo.id}>
                      <SelectValue placeholder={`Seleziona ${campo.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {contiFiltrati.map(conto => (
                        <SelectItem key={conto.id} value={conto.id}>{conto.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            if (campo.id === 'totaleDocumento') {
                return (
                    <div key={campo.id}>
                        <Label htmlFor={campo.id} className="text-blue-900">{campo.label}</Label>
                        <Input
                            id={campo.id}
                            type="text" // Usiamo text per la formattazione
                            className="text-right"
                            value={displayValues['totaleDocumento'] || ''}
                            onChange={(e) => handleDisplayValueChange('totaleDocumento', e.target.value)}
                            onBlur={() => handleDisplayValueBlur('totaleDocumento', 'totale')}
                            placeholder="0,00"
                        />
                    </div>
                );
            }
            
            // Input generico per altri tipi
            return (
              <div key={campo.id}>
                <Label htmlFor={campo.id} className="text-blue-900">{campo.label}</Label>
                <Input
                  type={campo.tipo}
                  step={campo.tipo === 'number' ? '0.01' : undefined}
                  {...commonProps}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-lg">Caricamento dati in corso...</p>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrazione Prima Nota</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Caricamento dati...</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={registrazione.data.toISOString().split('T')[0]}
                  onChange={(e) => setRegistrazione(p => ({ ...p, data: new Date(e.target.value) }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="causale">Causale Contabile</Label>
                <Select onValueChange={handleCausaleChange} value={registrazione.causaleId}>
                  <SelectTrigger id="causale">
                    <SelectValue placeholder="Seleziona una causale" />
                  </SelectTrigger>
                  <SelectContent>
                    {causali.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {causaleSelezionata && (
              <div className="mb-6">
                {renderDatiPrimari()}
                <Button onClick={handleGeneraScrittura} type="button" className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Play className="mr-2 h-4 w-4" />
                  Genera Scrittura
                </Button>
              </div>
            )}

            <div className="mb-6">
                <Label htmlFor="descrizione-generale">Descrizione Generale</Label>
                <Textarea 
                    id="descrizione-generale"
                    placeholder="Descrizione generale della registrazione..."
                    value={registrazione.descrizione}
                    onChange={(e) => setRegistrazione(p => ({ ...p, descrizione: e.target.value }))}
                />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Righe Scrittura</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-semibold">Conto</th>
                      <th className="p-2 text-left font-semibold">Descrizione</th>
                      <th className="p-2 text-right font-semibold">Dare</th>
                      <th className="p-2 text-right font-semibold">Avere</th>
                      <th className="p-2 text-center font-semibold">Allocazione</th>
                      <th className="p-2 text-center font-semibold">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrazione.righe.map((riga) => (
                      <tr key={riga.id} className="border-b">
                        <td className="p-2" style={{ minWidth: '250px' }}>
                          <Combobox
                            options={conti.map(conto => ({
                              value: conto.id,
                              label: `(${conto.codice}) ${conto.nome}`
                            }))}
                            value={riga.contoId}
                            onChange={(value) => {
                              const selectedConto = conti.find(c => c.id === value);
                              setRegistrazione(prev => ({
                                ...prev,
                                righe: prev.righe.map(r => 
                                  r.id === riga.id 
                                    ? { ...r, contoId: value, descrizione: selectedConto?.nome || '' } 
                                    : r
                                )
                              }));
                            }}
                            placeholder="Seleziona conto..."
                            searchPlaceholder="Cerca conto..."
                            emptyPlaceholder="Nessun conto trovato."
                          />
                        </td>
                        <td className="p-2" style={{ minWidth: '250px' }}>
                          <Input
                            value={riga.descrizione}
                            onChange={(e) => updateRigaContabile(riga.id, 'descrizione', e.target.value)}
                            placeholder="Descrizione riga"
                          />
                        </td>
                        <td className="p-2 text-right" style={{ minWidth: '120px' }}>
                          <Input
                            type="text"
                            className="text-right"
                            value={displayValues[`${riga.id}-dare`] || ''}
                            onChange={(e) => handleDisplayValueChange(`${riga.id}-dare`, e.target.value)}
                            onBlur={() => handleDisplayValueBlur(`${riga.id}-dare`, 'riga', riga.id, 'dare')}
                            disabled={!isDareEnabled(riga.contoId) || !!riga.avere}
                            placeholder="0,00"
                          />
                        </td>
                        <td className="p-2 text-right" style={{ minWidth: '120px' }}>
                          <Input
                            type="text"
                            className="text-right"
                            value={displayValues[`${riga.id}-avere`] || ''}
                            onChange={(e) => handleDisplayValueChange(`${riga.id}-avere`, e.target.value)}
                            onBlur={() => handleDisplayValueBlur(`${riga.id}-avere`, 'riga', riga.id, 'avere')}
                            disabled={!isAvereEnabled(riga.contoId) || !!riga.dare}
                            placeholder="0,00"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Dialog open={allocazioneRigaId === riga.id} onOpenChange={(open) => !open && setAllocazioneRigaId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAllocazioneRigaId(riga.id)}
                                disabled={!isAllocazioneEnabled(riga.contoId) || (!riga.dare && !riga.avere)}
                              >
                                {riga.allocazioni && riga.allocazioni.length > 0 ? `${riga.allocazioni.length} alloc.` : 'Alloca'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Allocazione per riga: {riga.descrizione} ({formatCurrency(riga.dare || riga.avere)})
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className="py-4">
                                <div className="grid grid-cols-5 gap-4 font-semibold border-b pb-2 mb-2">
                                  <div className="col-span-2">Commessa</div>
                                  <div>Centro di Costo</div>
                                  <div>Descrizione</div>
                                  <div className="text-right">Importo</div>
                                  <div></div>
                                </div>
                                {allocazioniTemporanee.map((alloc, idx) => {
                                  const contoRiga = conti.find(c => c.id === riga.contoId);
                                  const centriDiCostoFiltrati = contoRiga?.centriDiCostoAbilitatiIds
                                    ? centriDiCosto.filter(cdc => contoRiga.centriDiCostoAbilitatiIds?.includes(cdc.id))
                                    : centriDiCosto;

                                  return (
                                    <div key={idx} className="grid grid-cols-5 gap-4 items-center mb-2">
                                      <Combobox
                                        options={commesse.map(c => ({ value: c.id, label: c.nome }))}
                                        value={alloc.commessaId}
                                        onChange={(v) => handleUpdateAllocazioneTemp(idx, 'commessaId', v)}
                                        placeholder="Commessa..."
                                        searchPlaceholder="Cerca commessa..."
                                        emptyPlaceholder="Nessuna commessa trovata."
                                        className="col-span-2"
                                      />
                                      <Combobox
                                        options={centriDiCostoFiltrati.map(cdc => ({ value: cdc.id, label: cdc.nome }))}
                                        value={alloc.centroDiCostoId}
                                        onChange={(v) => handleUpdateAllocazioneTemp(idx, 'centroDiCostoId', v)}
                                        placeholder="C.d.C..."
                                        searchPlaceholder="Cerca C.d.C..."
                                        emptyPlaceholder="Nessun C.d.C. trovato."
                                      />
                                      <Input 
                                          placeholder="Descrizione allocazione..."
                                          value={alloc.descrizione || ''}
                                          onChange={(e) => handleUpdateAllocazioneTemp(idx, 'descrizione', e.target.value)}
                                      />
                                       <Input
                                          type="text"
                                          className="text-right"
                                          placeholder="0,00"
                                          value={displayValues[`alloc-${idx}`] || ''}
                                          onChange={(e) => handleDisplayValueChange(`alloc-${idx}`, e.target.value)}
                                          onBlur={() => handleDisplayValueBlur(`alloc-${idx}`, 'allocazione', undefined, undefined, idx)}
                                      />
                                      <Button variant="ghost" size="icon" onClick={() => handleRemoveAllocazioneTemp(idx)}>
                                          <Trash2 className="h-4 w-4 text-red-500"/>
                                      </Button>
                                    </div>
                                  );
                                })}
                                <Button variant="outline" size="sm" onClick={handleAddAllocazioneTemp} className="mt-2">
                                    <Plus className="mr-2 h-4 w-4"/> Aggiungi Allocazione
                                </Button>
                                <div className="mt-4 text-right font-bold">
                                    Totale Allocato: {formatCurrency(allocazioniTemporanee.reduce((sum, a) => sum + (a.importo || 0), 0))}
                                    <br/>
                                    Da Allocare: {
                                        (() => {
                                            const rigaCorrente = registrazione.righe.find(r => r.id === allocazioneRigaId);
                                            const importoRiga = rigaCorrente?.dare || rigaCorrente?.avere || 0;
                                            const totaleAllocato = allocazioniTemporanee.reduce((sum, a) => sum + (a.importo || 0), 0);
                                            return formatCurrency(importoRiga - totaleAllocato);
                                        })()
                                    }
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Annulla</Button>
                                </DialogClose>
                                <Button onClick={handleSalvaAllocazioni}>Salva Allocazioni</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRigaContabile(riga.id)}
                            disabled={registrazione.righe.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={addRigaContabile}
              >
                <Plus className="mr-2 h-4 w-4" /> Aggiungi Riga
              </Button>
            </div>

            <Card className="mt-6">
              <CardContent className="p-4 grid grid-cols-3 gap-4 text-right">
                <div>
                  <p className="text-sm text-gray-500">Totale Dare</p>
                  <p className="font-bold text-lg">{formatCurrency(getTotaleDare())}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Totale Avere</p>
                  <p className="font-bold text-lg">{formatCurrency(getTotaleAvere())}</p>
                </div>
                <div>
                  <p className={`text-sm ${getSbilancio() > 0.01 ? 'text-red-500' : 'text-gray-500'}`}>Sbilancio</p>
                  <p className={`font-bold text-lg ${getSbilancio() > 0.01 ? 'text-red-600' : ''}`}>{formatCurrency(getSbilancio())}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={() => navigate('/prima-nota')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Annulla
              </Button>
              <Button type="submit" disabled={getSbilancio() > 0.01 || isSaving}>
                {isSaving ? 'Salvataggio...' : 'Salva Registrazione'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default NuovaRegistrazionePrimaNota;
