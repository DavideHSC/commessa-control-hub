import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calculator, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface AssegnazioneCommessa {
  id: string;
  rigaId: string;
  commessa: string;
  tipo: 'importo' | 'percentuale';
  valore: number;
  importoCalcolato: number;
  voceCommessa?: string;
}

const NuovaRegistrazionePrimaNota: React.FC = () => {
  const navigate = useNavigate();

  // Stati per i dati caricati dall'API
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [conti, setConti] = useState<Conto[]>([]);
  const [causali, setCausali] = useState<CausaleContabile[]>([]);
  const [centriDiCosto, setCentriDiCosto] = useState<CentroDiCosto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    }]
  });

  // Dati primari per l'automatismo
  const [datiPrimari, setDatiPrimari] = useState({
    contoPrincipaleId: '', // ID del fornitore o cliente
    totaleDocumento: 0,
  });

  // Stato per i valori visualizzati negli input formattati, per evitare il bug del cursore
  const [displayValues, setDisplayValues] = useState<{ [key: string]: string }>({});

  // Stato per il tipo di conto principale richiesto dalla causale
  const [tipoContoPrincipaleRichiesto, setTipoContoPrincipaleRichiesto] = useState<'Fornitore' | 'Cliente' | null>(null);

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
      const existingAllocations = rigaInAllocazione?.allocazioni || [];

      if (existingAllocations.length > 0) {
        setAllocazioniTemporanee(existingAllocations);
      } else {
        // Proponi una riga vuota per iniziare
        setAllocazioniTemporanee([{
          id: `alloc-${Date.now()}`,
          commessaId: '',
          tipo: 'importo',
          valore: 0,
          importo: 0,
        }]);
      }
    }
  }, [allocazioneRigaId]);

  // Sincronizza lo stato di visualizzazione quando i dati di origine cambiano programmaticamente
  useEffect(() => {
    const newDisplayValues: { [key: string]: string } = {};
    newDisplayValues['totaleDocumento'] = formatNumber(datiPrimari.totaleDocumento);
    registrazione.righe.forEach(riga => {
      newDisplayValues[`${riga.id}-dare`] = formatNumber(riga.dare);
      newDisplayValues[`${riga.id}-avere`] = formatNumber(riga.avere);
    });
    setDisplayValues(newDisplayValues);
  }, [datiPrimari.totaleDocumento, registrazione.righe]);

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

  const handleSave = () => {
    console.log('Salvataggio registrazione:', registrazione);
    navigate('/prima-nota');
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
    return parseFloat(cleanedValue) || 0;
  };

  const handleGeneraScrittura = () => {
    // Leggi sempre il valore più aggiornato dal display state per il totale
    const totaleDocumento = parseFormattedNumber(displayValues['totaleDocumento'] || '0');

    const causaleSelezionata = causali.find(c => c.id === registrazione.causaleId);
    if (!causaleSelezionata || !datiPrimari.contoPrincipaleId || totaleDocumento === 0) {
      // TODO: Usare shadcn/sonner per le notifiche
      console.error("Dati primari mancanti per la generazione automatica.");
      alert("Seleziona una causale, un fornitore/cliente e inserisci un totale documento.");
      return;
    }

    // Per la demo, assumiamo un'aliquota IVA fissa al 22%
    const aliquotaIVA = 0.22;
    const totaleFattura = totaleDocumento;

    // Arrotondiamo i calcoli per evitare errori con i decimali
    const imponibile = parseFloat((totaleFattura / (1 + aliquotaIVA)).toFixed(2));
    const iva = parseFloat((totaleFattura - imponibile).toFixed(2));

    const nuoveRighe: RigaScrittura[] = causaleSelezionata.template.map(templateItem => {
      let contoId = '';
      let importo = 0;

      // Trova il conto corretto
      switch (templateItem.tipoConto) {
        case 'Fornitore':
        case 'Cliente':
          contoId = datiPrimari.contoPrincipaleId;
          break;
        case 'IVA':
          // Usiamo un ID specifico o una ricerca più robusta
          contoId = conti.find(c => c.codice === '45.01.001')?.id || ''; // Assumiamo un codice conto per l'IVA
          break;
        case 'Costo':
        case 'Ricavo':
           // Usiamo il conto suggerito dal template della causale
          contoId = templateItem.contoSuggeritoId || '';
          break;
        case 'Banca':
           // Usiamo un ID specifico o una ricerca più robusta
          contoId = conti.find(c => c.codice === '10.01.001')?.id || ''; // Assumiamo un codice conto per la Banca
          break;
      }

      // Calcola l'importo corretto
      switch (templateItem.tipoImporto) {
        case 'Imponibile':
          importo = imponibile;
          break;
        case 'IVA':
          importo = iva;
          break;
        case 'Totale':
          importo = totaleFattura;
          break;
      }
      
      const conto = conti.find(c => c.id === contoId);

      return {
        id: `riga-${Date.now()}-${Math.random()}`,
        contoId: contoId,
        descrizione: conto?.nome || `Conto per ${templateItem.tipoConto} non trovato`,
        dare: templateItem.segno === 'Dare' ? importo : 0,
        avere: templateItem.segno === 'Avere' ? importo : 0,
        centroDiCostoId: conto?.centroDiCostoSuggeritoId, // Pre-popoliamo il centro di costo
      };
    });

    setRegistrazione(prev => ({
      ...prev,
      righe: nuoveRighe,
    }));
    setAllocazioneRigaId(null);
  };

  const handleCausaleChange = (causaleId: string) => {
    const causale = causali.find(c => c.id === causaleId);
    if (!causale) return;

    // Determina se la causale richiede un Fornitore o un Cliente
    if (causale.template.some(t => t.tipoConto === 'Fornitore')) {
      setTipoContoPrincipaleRichiesto('Fornitore');
    } else if (causale.template.some(t => t.tipoConto === 'Cliente')) {
      setTipoContoPrincipaleRichiesto('Cliente');
    } else {
      setTipoContoPrincipaleRichiesto(null);
    }
    
    setRegistrazione(prev => ({
      ...prev,
      causaleId: causaleId,
      descrizione: causale?.descrizione || '',
    }));

    // Resetta il conto principale selezionato quando la causale cambia
    setDatiPrimari(prev => ({ ...prev, contoPrincipaleId: '' }));
  }

  const rigaInAllocazione = registrazione.righe.find(r => r.id === allocazioneRigaId);
  const importoDaAllocare = rigaInAllocazione?.dare || rigaInAllocazione?.avere || 0;
  const importoAllocato = allocazioniTemporanee.reduce((sum, alloc) => sum + alloc.importo, 0);
  const importoResiduo = importoDaAllocare - importoAllocato;

  const handleSalvaAllocazioni = () => {
    if (importoResiduo !== 0) {
      // alert("L'importo deve essere completamente allocato.");
      console.error("L'importo deve essere completamente allocato.");
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
    setAllocazioneRigaId(null);
  };
  
  const handleUpdateAllocazioneTemp = (index: number, field: keyof Allocazione, value: any) => {
    const importoDaAllocare = rigaInAllocazione?.dare || rigaInAllocazione?.avere || 0;

    setAllocazioniTemporanee(prev => {
      const nuoveAllocazioni = [...prev];
      const allocazioneCorrente = { ...nuoveAllocazioni[index] };
      (allocazioneCorrente[field] as any) = value;

      // Ricalcola l'importo finale in base a tipo e valore
      if (field === 'tipo' || field === 'valore') {
        if (allocazioneCorrente.tipo === 'importo') {
          allocazioneCorrente.importo = allocazioneCorrente.valore;
        } else { // percentuale
          allocazioneCorrente.importo = (importoDaAllocare * allocazioneCorrente.valore) / 100;
        }
      }

      nuoveAllocazioni[index] = allocazioneCorrente;
      return nuoveAllocazioni;
    });
  };
  
  const handleAddAllocazioneTemp = () => {
    setAllocazioniTemporanee(prev => [
      ...prev,
      {
        id: `alloc-${Date.now()}`,
        commessaId: '',
        tipo: 'importo',
        valore: 0,
        importo: 0,
      }
    ]);
  };

  const handleRemoveAllocazioneTemp = (index: number) => {
    const newAllocazioni = [...allocazioniTemporanee];
    newAllocazioni.splice(index, 1);
    setAllocazioniTemporanee(newAllocazioni);
  };

  // --- Gestori per Input Formattati ---
  const handleDisplayValueChange = (key: string, value: string) => {
    // Permetti solo numeri e la virgola per l'input
    const sanitizedValue = value.replace(/[^0-9,]/g, '');
    setDisplayValues(prev => ({ ...prev, [key]: sanitizedValue }));
  };

  const handleDisplayValueBlur = (key: string, type: 'totale' | 'riga', rigaId?: string, field?: 'dare' | 'avere') => {
    const value = displayValues[key] || '';
    const numericValue = parseFormattedNumber(value);

    if (type === 'totale') {
      setDatiPrimari(prev => ({ ...prev, totaleDocumento: numericValue }));
    } else if (type === 'riga' && rigaId && field) {
      updateRigaContabile(rigaId, field, numericValue);
    }
  };

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  // Filtra dinamicamente i conti principali (fornitori/clienti) in base alla causale selezionata
  const contiPrincipaliFiltrati = conti.filter(c => {
    if (!tipoContoPrincipaleRichiesto) return false; // Non mostrare nulla se non richiesto
    return c.tipo === tipoContoPrincipaleRichiesto;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold ml-4">Nuova Registrazione Prima Nota</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Colonna Sinistra - Dati Principali e Generazione */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">1. Dati Registrazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={new Date(registrazione.data).toISOString().split('T')[0]}
                  onChange={e => setRegistrazione(prev => ({ ...prev, data: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="causale">Causale Contabile</Label>
                 <Select value={registrazione.causaleId} onValueChange={handleCausaleChange}>
                  <SelectTrigger id="causale">
                    <SelectValue placeholder="Seleziona una causale..." />
                  </SelectTrigger>
                  <SelectContent>
                    {causali.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">2. Input Automazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                <Label htmlFor="conto-principale">{tipoContoPrincipaleRichiesto || 'Controparte'}</Label>
                <Select
                  value={datiPrimari.contoPrincipaleId}
                  onValueChange={value => setDatiPrimari(prev => ({ ...prev, contoPrincipaleId: value }))}
                  disabled={!tipoContoPrincipaleRichiesto}
                >
                  <SelectTrigger id="conto-principale">
                    <SelectValue placeholder={`Seleziona ${tipoContoPrincipaleRichiesto?.toLowerCase()}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {contiPrincipaliFiltrati.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="totale-documento">Totale Documento (€)</Label>
                <Input
                  id="totale-documento"
                  type="text"
                  placeholder="Es. 1.250,58"
                  className="text-right"
                  value={displayValues['totaleDocumento'] || ''}
                  onChange={e => handleDisplayValueChange('totaleDocumento', e.target.value)}
                  onBlur={() => handleDisplayValueBlur('totaleDocumento', 'totale')}
                />
              </div>
              <Button onClick={handleGeneraScrittura} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Genera Scrittura
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Colonna Destra - Dettaglio Scrittura */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">3. Righe Contabili</CardTitle>
               <Textarea
                placeholder="Descrizione della registrazione..."
                value={registrazione.descrizione}
                onChange={e => setRegistrazione(prev => ({ ...prev, descrizione: e.target.value }))}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              {/* Intestazioni Tabella */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 font-bold text-sm text-muted-foreground p-2">
                <div className="col-span-4">Conto</div>
                <div className="col-span-2">Centro C/R</div>
                <div className="col-span-2 text-right">Dare</div>
                <div className="col-span-2 text-right">Avere</div>
                <div className="col-span-2 text-center">Azioni</div>
              </div>

              {/* Righe Contabili */}
              {registrazione.righe.map((riga, index) => (
                <div key={riga.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 border-b">
                  {/* Riga per Mobile */}
                  <div className="md:hidden col-span-1">
                    <p className="font-bold">Riga {index + 1}</p>
                  </div>

                  {/* Conto */}
                  <div className="col-span-1 md:col-span-4">
                    <Label className="md:hidden">Conto</Label>
                    <Select
                      value={riga.contoId}
                      onValueChange={value => updateRigaContabile(riga.id, 'contoId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona conto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {conti.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Centro di Costo */}
                   <div className="col-span-1 md:col-span-2">
                    <Label className="md:hidden">Centro C/R</Label>
                     <Select
                      value={riga.centroDiCostoId || ''}
                       onValueChange={value => updateRigaContabile(riga.id, 'centroDiCostoId', value)}
                      disabled={!riga.contoId || !conti.find(c => c.id === riga.contoId)?.richiedeCentroDiCosto}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="N/A" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const contoSelezionato = conti.find(c => c.id === riga.contoId);
                          if (!contoSelezionato || !contoSelezionato.centriDiCostoAbilitatiIds) {
                            return centriDiCosto.map(cdc => <SelectItem key={cdc.id} value={cdc.id}>{cdc.nome}</SelectItem>);
                          }
                          const centriFiltrati = centriDiCosto.filter(cdc => contoSelezionato.centriDiCostoAbilitatiIds?.includes(cdc.id));
                          return centriFiltrati.map(cdc => <SelectItem key={cdc.id} value={cdc.id}>{cdc.nome}</SelectItem>);
                        })()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dare */}
                  <div className="col-span-1 md:col-span-2">
                    <Label className="md:hidden">Dare</Label>
                    <Input
                      type="text"
                      className="text-right"
                      placeholder="0,00"
                      value={displayValues[`${riga.id}-dare`] || ''}
                      onChange={e => handleDisplayValueChange(`${riga.id}-dare`, e.target.value)}
                      onBlur={() => handleDisplayValueBlur(`${riga.id}-dare`, 'riga', riga.id, 'dare')}
                      disabled={!isDareEnabled(riga.contoId)}
                    />
                  </div>

                  {/* Avere */}
                  <div className="col-span-1 md:col-span-2">
                    <Label className="md:hidden">Avere</Label>
                    <Input
                      type="text"
                      className="text-right"
                      placeholder="0,00"
                      value={displayValues[`${riga.id}-avere`] || ''}
                      onChange={e => handleDisplayValueChange(`${riga.id}-avere`, e.target.value)}
                      onBlur={() => handleDisplayValueBlur(`${riga.id}-avere`, 'riga', riga.id, 'avere')}
                      disabled={!isAvereEnabled(riga.contoId)}
                    />
                  </div>
                  
                  {/* Azioni */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-center space-x-1">
                     <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAllocazioneRigaId(riga.id)}
                          disabled={!isAllocazioneEnabled(riga.contoId) || (!riga.dare && !riga.avere)}
                          title="Alloca a Commessa"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>

                    <Button variant="outline" size="icon" onClick={() => removeRigaContabile(riga.id)} title="Rimuovi Riga">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                   {riga.allocazioni && riga.allocazioni.length > 0 && (
                    <div className="col-span-full mt-1 text-xs text-muted-foreground">
                      Allocato a: {riga.allocazioni.map(a => `${commesse.find(c=>c.id === a.commessaId)?.nome} (${formatCurrency(a.importo)})`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
              <div>
                <Button onClick={addRigaContabile} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Riga
                </Button>
              </div>

              {/* Totali e Riepilogo */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Totale Dare</span>
                  <span>{formatCurrency(getTotaleDare())}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg mt-2">
                  <span>Totale Avere</span>
                  <span>{formatCurrency(getTotaleAvere())}</span>
                </div>
                <div className="border-t my-2"></div>
                <div className={`flex justify-between items-center font-bold text-lg ${getSbilancio() !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span>Sbilancio</span>
                  <span>{formatCurrency(getSbilancio())}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={getSbilancio() !== 0 || isLoading}
                  size="lg"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Salva Registrazione
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       {/* MODALE DI ALLOCAZIONE */}
       {allocazioneRigaId && rigaInAllocazione && (
         <Dialog open={!!allocazioneRigaId} onOpenChange={(isOpen) => { if (!isOpen) setAllocazioneRigaId(null); }}>
           <DialogContent className="max-w-4xl">
             <DialogHeader>
               <DialogTitle>Allocazione Costo/Ricavo su Commesse</DialogTitle>
                <div className="text-sm text-muted-foreground pt-2">
                  Stai allocando un importo di <span className="font-bold text-primary">{formatCurrency(importoDaAllocare)}</span> per la riga <span className="font-bold text-primary">"{rigaInAllocazione.descrizione}"</span>.
                </div>
             </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-12 gap-4 items-center font-medium text-sm text-muted-foreground px-2">
                <div className="col-span-5">Commessa</div>
                <div className="col-span-3">Tipo</div>
                <div className="col-span-3">Valore</div>
                <div className="col-span-1"></div>
              </div>

              {allocazioniTemporanee.map((alloc, index) => (
                <div key={alloc.id} className="grid grid-cols-12 gap-4 items-center">
                   <Select
                    value={alloc.commessaId}
                    onValueChange={(value) => handleUpdateAllocazioneTemp(index, 'commessaId', value)}
                  >
                    <SelectTrigger className="col-span-5">
                      <SelectValue placeholder="Seleziona commessa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {commesse.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select
                    value={alloc.tipo}
                    onValueChange={(value: 'importo' | 'percentuale') => handleUpdateAllocazioneTemp(index, 'tipo', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="importo">Importo (€)</SelectItem>
                      <SelectItem value="percentuale">Percentuale (%)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Valore"
                    value={alloc.valore || ''}
                    onChange={(e) => handleUpdateAllocazioneTemp(index, 'valore', parseFloat(e.target.value) || 0)}
                    className="col-span-3"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAllocazioneTemp(index)} className="col-span-1">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
             
             <Button onClick={handleAddAllocazioneTemp} variant="outline" size="sm" className="mb-4">
              <Plus className="h-4 w-4 mr-2" /> Aggiungi Allocazione
            </Button>

            <div className="p-4 bg-muted/50 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Importo da Allocare:</span>
                <span className="font-bold">{formatCurrency(importoDaAllocare)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Già Allocato:</span>
                <span className="font-bold">{formatCurrency(importoAllocato)}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className={`flex justify-between font-bold ${importoResiduo !== 0 ? 'text-amber-600' : 'text-green-600'}`}>
                <span>Residuo da Allocare:</span>
                <span>{formatCurrency(importoResiduo)}</span>
              </div>
            </div>

             <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Annulla
                </Button>
              </DialogClose>
               <Button onClick={handleSalvaAllocazioni} disabled={importoResiduo !== 0}>
                Salva Allocazioni
              </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       )}
    </div>
  );
}

export default NuovaRegistrazionePrimaNota;
