import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Play, CheckCircle2, Split } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Commessa, Conto, CausaleContabile, ScritturaContabile, RigaScrittura, Allocazione, VoceAnalitica } from '@/types';
import { getCommesse, getPianoDeiConti, getCausaliContabili, getVociAnalitiche } from '@/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getRegistrazioni, getRegistrazioneById, addRegistrazione, updateRegistrazione } from '@/api/registrazioni';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NuovaRegistrazionePrimaNota: React.FC = () => {
  const navigate = useNavigate();
  const { id: registrazioneId } = useParams<{ id: string }>();
  const isEditMode = !!registrazioneId;

  // Stati per i dati caricati dall'API
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [conti, setConti] = useState<Conto[]>([]);
  const [causali, setCausali] = useState<CausaleContabile[]>([]);
  const [vociAnalitiche, setVociAnalitiche] = useState<VoceAnalitica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAllocazioneWarning, setShowAllocazioneWarning] = useState(false);
  const [rigaDaAllocareId, setRigaDaAllocareId] = useState<string | null>(null);

  // Stato per la registrazione corrente
  const [registrazione, setRegistrazione] = useState<ScritturaContabile>({
    id: `reg-${Date.now()}`,
    data: new Date().toISOString().split('T')[0],
    descrizione: '',
    causaleId: '',
    righe: [{
      id: `riga-${Date.now()}`,
      contoId: '',
      descrizione: '',
      dare: 0,
      avere: 0,
      allocazioni: [],
    }]
  });

  // Dati primari per l'automatismo
  const [datiPrimari, setDatiPrimari] = useState<{ [key: string]: string | number }>({
    totaleDocumento: 0,
    aliquotaIva: 22,
  });
  
  const [causaleSelezionata, setCausaleSelezionata] = useState<CausaleContabile | null>(null);
  const [displayValues, setDisplayValues] = useState<{ [key: string]: string }>({});
  const [allocazioneRigaId, setAllocazioneRigaId] = useState<string | null>(null);
  const [allocazioniTemporanee, setAllocazioniTemporanee] = useState<Allocazione[]>([]);
  const [isCostoInAllocazione, setIsCostoInAllocazione] = useState<boolean>(false);
  const [clienteSelezionato, setClienteSelezionato] = useState<string | null>(null);

  // Caricamento dati iniziali e della registrazione in modalità modifica
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [commesseData, contiData, causaliData, vociAnaliticheData] = await Promise.all([
          getCommesse(),
          getPianoDeiConti(),
          getCausaliContabili(),
          getVociAnalitiche(),
        ]);
        setCommesse(commesseData);
        setConti(contiData);
        setCausali(causaliData);
        setVociAnalitiche(vociAnaliticheData);

        if (isEditMode && registrazioneId) {
          const regDaModificare = await getRegistrazioneById(registrazioneId);
          if (regDaModificare) {
            setRegistrazione({
              ...regDaModificare,
              data: new Date(regDaModificare.data).toISOString().split('T')[0],
            });
            const causale = causaliData.find(c => c.id === regDaModificare.causaleId);
            setCausaleSelezionata(causale || null);

            if (regDaModificare.datiAggiuntivi) {
              setDatiPrimari({
                totaleDocumento: regDaModificare.datiAggiuntivi.totaleFattura || 0,
                aliquotaIva: regDaModificare.datiAggiuntivi.aliquotaIva || 22,
              });
              setClienteSelezionato(regDaModificare.datiAggiuntivi.clienteId || null);
            }
          } else {
            toast.error("Registrazione non trovata.");
            navigate('/prima-nota');
          }
        }
      } catch (error) {
        toast.error("Errore nel caricamento dei dati.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [registrazioneId, isEditMode, navigate]);

  useEffect(() => {
    if (allocazioneRigaId) {
      const riga = registrazione.righe.find(r => r.id === allocazioneRigaId);
      const conto = conti.find(c => c.id === riga?.contoId);
      setIsCostoInAllocazione(conto?.tipo === 'Costo');
      const existingAllocations = riga?.allocazioni || [];
      if (existingAllocations.length > 0) {
        setAllocazioniTemporanee(existingAllocations);
      } else {
        setAllocazioniTemporanee([{
          id: `alloc-${Date.now()}`,
          commessaId: '',
          voceAnaliticaId: conto?.voceAnaliticaSuggeritaId || '',
          importo: riga?.dare || riga?.avere || 0,
          descrizione: '',
        }]);
      }
    }
  }, [allocazioneRigaId, registrazione.righe, conti]);

  useEffect(() => {
    const newDisplayValues: { [key: string]: string } = {};
    Object.keys(datiPrimari).forEach(key => {
      newDisplayValues[key] = formatNumber(datiPrimari[key] as number);
    });
    registrazione.righe.forEach(riga => {
      newDisplayValues[`${riga.id}-dare`] = formatNumber(riga.dare);
      newDisplayValues[`${riga.id}-avere`] = formatNumber(riga.avere);
    });
    allocazioniTemporanee.forEach((alloc, idx) => {
      newDisplayValues[`alloc-${idx}`] = formatNumber(alloc.importo);
    });
    setDisplayValues(newDisplayValues);
  }, [datiPrimari, registrazione.righe, allocazioniTemporanee]);

  const addRigaContabile = () => {
    setRegistrazione(prev => ({
      ...prev,
      righe: [...prev.righe, {
        id: `riga-${Date.now()}`,
        contoId: '', descrizione: '', dare: 0, avere: 0, allocazioni: [],
      }]
    }));
  };

  const updateRigaContabile = (id: string, field: keyof RigaScrittura, value: string | number) => {
    setRegistrazione(prev => ({
      ...prev,
      righe: prev.righe.map(riga => {
        if (riga.id === id) {
          const updatedRiga = { ...riga };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updatedRiga as any)[field] = value;
          if (field === 'contoId' && typeof value === 'string') {
            const conto = conti.find(c => c.id === value);
            updatedRiga.descrizione = conto?.nome || '';
          }
          return updatedRiga;
        }
        return riga;
      })
    }));
    setAllocazioneRigaId(null);
    toast.success("Allocazioni salvate.");
  };

  const removeRigaContabile = (id: string) => {
    if (registrazione.righe.length <= 1) return;
    setRegistrazione(prev => ({
      ...prev,
      righe: prev.righe.filter(riga => riga.id !== id)
    }));
    setAllocazioneRigaId(null);
    toast.success("Allocazioni salvate.");
  };

  const getTotaleDare = () => registrazione.righe.reduce((sum, r) => sum + (r.dare || 0), 0);
  const getTotaleAvere = () => registrazione.righe.reduce((sum, r) => sum + (r.avere || 0), 0);
  const getSbilancio = () => Math.abs(getTotaleDare() - getTotaleAvere());

  const isDareEnabled = (contoId: string) => {
    const conto = conti.find(c => c.id === contoId);
    return !conto || ['Costo', 'Patrimoniale', 'Fornitore', 'Cliente'].includes(conto.tipo);
  };

  const isAvereEnabled = (contoId: string) => {
    const conto = conti.find(c => c.id === contoId);
    return !conto || ['Ricavo', 'Patrimoniale', 'Fornitore', 'Cliente'].includes(conto.tipo);
  };

  const isAllocazioneEnabled = (contoId: string) => {
    const conto = conti.find(c => c.id === contoId);
    return conto ? ['Costo', 'Ricavo'].includes(conto.tipo) : false;
  };

  const handleSave = async () => {
    // Validazione #1: controlla che tutte le righe abbiano un conto selezionato.
    for (const [index, riga] of registrazione.righe.entries()) {
      if (!riga.contoId) {
        toast.error("Riga incompleta", {
          description: `La riga #${index + 1} non ha un conto selezionato. Rimuovila o completala prima di salvare.`
        });
        return; // Blocca il salvataggio
      }
    }

    // Validazione #2: controlla se una riga di costo/ricavo non è stata allocata.
    for (const riga of registrazione.righe) {
      if (isAllocazioneEnabled(riga.contoId) && riga.allocazioni.length === 0) {
        setRigaDaAllocareId(riga.id);
        setShowAllocazioneWarning(true);
        return; // Blocca il salvataggio e mostra l'avviso
      }
    }

    setIsSaving(true);
    try {
      if (isEditMode && registrazioneId) {
        await updateRegistrazione(registrazione);
        toast.success("Registrazione aggiornata!");
      } else {
        const { id, ...nuovaReg } = registrazione;
        await addRegistrazione(nuovaReg);
        toast.success("Registrazione creata!");
      }
      navigate('/prima-nota');
    } catch (error) {
      toast.error("Errore nel salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatNumber = (amount: number | undefined) => (amount === undefined || isNaN(amount)) ? '' : new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  const parseFormattedNumber = (value: string) => parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;

  const handleGeneraScrittura = () => {
    if (!causaleSelezionata) return;
    const { totaleDocumento, aliquotaIva } = datiPrimari;
    const totale = typeof totaleDocumento === 'number' ? totaleDocumento : 0;
    const ivaPerc = (typeof aliquotaIva === 'number' ? aliquotaIva : 22) / 100;

    const iva = parseFloat((totale / (1 + ivaPerc) * ivaPerc).toFixed(2));
    const imponibile = totale - iva;

    const valori = { totale, iva, imponibile };

    const nuoveRighe = causaleSelezionata.templateScrittura.map(template => {
      const importo = valori[template.formulaImporto as keyof typeof valori] || 0;
      const conto = conti.find(c => c.id === template.contoId);
      return {
        id: `riga-${Date.now()}-${Math.random()}`,
        contoId: template.contoId,
        descrizione: conto?.nome || '',
        dare: template.sezione === 'Dare' ? importo : 0,
        avere: template.sezione === 'Avere' ? importo : 0,
        allocazioni: [],
      };
    });
    setRegistrazione(prev => ({ ...prev, righe: nuoveRighe }));
  };
  
  const handleCausaleChange = (causaleId: string) => {
    const selected = causali.find(c => c.id === causaleId) || null;
    setCausaleSelezionata(selected);
    setRegistrazione(prev => ({ ...prev, causaleId: causaleId, descrizione: selected?.nome || '' }));
    setDatiPrimari({ totaleDocumento: 0, aliquotaIva: 22 });
  };

  const handleDatiPrimariChange = (id: string, value: string | number) => {
    setDatiPrimari(prev => ({ ...prev, [id]: value }));
  };

  const handleSalvaAllocazioni = () => {
    if (!allocazioneRigaId) return;

    // Ignora le righe di allocazione vuote e valida quelle compilate
    const filledAllocations = allocazioniTemporanee.filter(
      alloc => alloc.commessaId || alloc.importo !== 0
    );

    const invalidRow = filledAllocations.find(alloc => !alloc.commessaId);
    if (invalidRow) {
      toast.error("Allocazione incompleta", {
        description: `Una riga di allocazione ha un importo ma non ha una commessa selezionata.`,
      });
      return;
    }

    const riga = registrazione.righe.find(r => r.id === allocazioneRigaId);
    const totaleRiga = riga?.dare || riga?.avere || 0;
    const totaleAllocato = filledAllocations.reduce((sum, alloc) => sum + alloc.importo, 0);

    if (Math.abs(totaleAllocato - totaleRiga) > 0.01) {
      toast.warning("La somma delle allocazioni non corrisponde all'importo della riga.");
      return;
    }

    setRegistrazione(prev => ({
      ...prev,
      righe: prev.righe.map(r =>
        r.id === allocazioneRigaId ? { ...r, allocazioni: filledAllocations } : r
      )
    }));

    setAllocazioneRigaId(null);
    if (filledAllocations.length > 0) {
      toast.success("Allocazioni salvate con successo.");
    }
  };

  const handleUpdateAllocazioneTemp = (index: number, field: keyof Allocazione, value: string | number) => {
    const updatedAllocations = [...allocazioniTemporanee];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updatedAllocations[index] as any)[field] = value;
    setAllocazioniTemporanee(updatedAllocations);
  };
  
  const handleAddAllocazioneTemp = () => {
    const riga = registrazione.righe.find(r => r.id === allocazioneRigaId);
    const totaleRiga = riga?.dare || riga?.avere || 0;
    const totaleAllocato = allocazioniTemporanee.reduce((sum, alloc) => sum + alloc.importo, 0);
    const importoResiduo = totaleRiga - totaleAllocato;
    const ultima = allocazioniTemporanee[allocazioniTemporanee.length - 1];

    setAllocazioniTemporanee(prev => [...prev, {
      id: `alloc-${Date.now()}`,
      commessaId: ultima?.commessaId || '',
      voceAnaliticaId: ultima?.voceAnaliticaId || '',
      importo: importoResiduo,
      descrizione: '',
    }]);
  };

  const handleRemoveAllocazioneTemp = (index: number) => {
    if (allocazioniTemporanee.length <= 1) {
      const newAllocations = [...allocazioniTemporanee];
      newAllocations[index] = { ...newAllocations[index], importo: 0, descrizione: '' };
      setAllocazioniTemporanee(newAllocations);
    } else {
      setAllocazioniTemporanee(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDisplayValueChange = (key: string, value: string) => {
    setDisplayValues(prev => ({ ...prev, [key]: value }));
  };

  const handleDisplayValueBlur = (key: string, type: 'totale' | 'riga' | 'allocazione', rigaId?: string, field?: 'dare' | 'avere', allocIndex?: number) => {
    const numericValue = parseFormattedNumber(displayValues[key]);
    if (type === 'totale') {
      handleDatiPrimariChange(key, numericValue);
    } else if (type === 'riga' && rigaId && field) {
      updateRigaContabile(rigaId, field, numericValue);
    } else if (type === 'allocazione' && allocIndex !== undefined) {
      handleUpdateAllocazioneTemp(allocIndex, 'importo', numericValue);
    }
  };

  const renderDatiPrimari = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="causale">Causale Contabile</Label>
        <Select value={registrazione.causaleId} onValueChange={handleCausaleChange}>
          <SelectTrigger id="causale"><SelectValue placeholder="Seleziona una causale..." /></SelectTrigger>
          <SelectContent>{causali.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {causaleSelezionata?.datiPrimari.map(campo => (
        <div key={campo.id}>
          <Label htmlFor={campo.id}>{campo.label}</Label>
          {campo.tipo === 'select' ? (
            <Combobox
              options={conti.filter(c => c.tipo === campo.riferimentoConto).map(c => ({ value: c.id, label: c.nome }))}
              value={datiPrimari[campo.id] as string || ''}
              onChange={(value) => handleDatiPrimariChange(campo.id, value)}
              placeholder={`Seleziona ${campo.label.toLowerCase()}...`}
            />
          ) : (
            <Input
              id={campo.id}
              type="text"
              className="text-right"
              value={displayValues[campo.id] || ''}
              onChange={(e) => handleDisplayValueChange(campo.id, e.target.value)}
              onBlur={() => handleDisplayValueBlur(campo.id, 'totale')}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderAllocazioneModal = () => {
    const riga = registrazione.righe.find(r => r.id === allocazioneRigaId);
    const totaleDaAllocare = riga?.dare || riga?.avere || 0;
    const totaleAllocato = allocazioniTemporanee.reduce((sum, alloc) => sum + alloc.importo, 0);
    const residuo = totaleDaAllocare - totaleAllocato;

    const vociAnaliticheFiltrate = isCostoInAllocazione
      ? vociAnalitiche.filter(v => {
          const conto = conti.find(c => c.id === riga?.contoId);
          return conto?.vociAnaliticheAbilitateIds?.includes(v.id);
        })
      : [];
      
    return (
      <Dialog open={!!allocazioneRigaId} onOpenChange={(open) => !open && setAllocazioneRigaId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Allocazione Analitica per "{riga?.descrizione}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-12 gap-4 font-semibold px-1">
              <span className="col-span-5">{isCostoInAllocazione ? 'Commessa' : 'Dettaglio Ricavo'}</span>
              <span className="col-span-4">Voce Analitica</span>
              <span className="col-span-2 text-right">Importo</span>
              <span className="col-span-1"></span>
            </div>
            {allocazioniTemporanee.map((alloc, index) => (
              <div key={alloc.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <Combobox
                    options={commesse.map(c => ({ value: c.id, label: c.nome }))}
                    value={alloc.commessaId}
                    onChange={(value) => handleUpdateAllocazioneTemp(index, 'commessaId', value)}
                    placeholder="Seleziona commessa..."
                  />
                </div>
                <div className="col-span-4">
                  <Combobox
                    options={vociAnaliticheFiltrate.map(v => ({ value: v.id, label: v.nome }))}
                    value={alloc.voceAnaliticaId}
                    onChange={(value) => handleUpdateAllocazioneTemp(index, 'voceAnaliticaId', value)}
                    placeholder="Seleziona voce..."
                    disabled={!isCostoInAllocazione || vociAnaliticheFiltrate.length === 0}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="text"
                    className="text-right"
                    value={displayValues[`alloc-${index}`] || ''}
                    onChange={(e) => handleDisplayValueChange(`alloc-${index}`, e.target.value)}
                    onBlur={() => handleDisplayValueBlur(`alloc-${index}`, 'allocazione', undefined, undefined, index)}
                  />
                </div>
                <div className="col-span-1 flex justify-end space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAllocazioneTemp(index)}><Trash2 className="h-4 w-4" /></Button>
                  {index === allocazioniTemporanee.length - 1 && (
                    <Button variant="ghost" size="icon" onClick={handleAddAllocazioneTemp}><Plus className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-end items-center mt-4">
              <div className="text-right">
                <div>Totale Allocato: <span className="font-bold">{formatCurrency(totaleAllocato)}</span></div>
                <div>Residuo da Allocare: <span className={`font-bold ${Math.abs(residuo) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(residuo)}</span></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annulla</Button></DialogClose>
            <Button onClick={handleSalvaAllocazioni}>Salva Allocazioni</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  if (isLoading) return <div className="p-8">Caricamento...</div>;

  return (
    <div className="space-y-6">
      {renderAllocazioneModal()}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Modifica Registrazione' : 'Nuova Registrazione'}</h1>
            <p className="text-slate-600">{isEditMode ? `ID: ${registrazione.id}` : 'Crea una nuova scrittura contabile.'}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || getSbilancio() > 0.01}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvataggio...' : (isEditMode ? 'Salva Modifiche' : 'Crea Registrazione')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Dati Principali</CardTitle></CardHeader>
            <CardContent>{renderDatiPrimari()}</CardContent>
          </Card>

          {!isEditMode && causaleSelezionata?.templateScrittura.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Generazione Automatica</CardTitle></CardHeader>
              <CardContent>
                <Button onClick={handleGeneraScrittura} className="w-full">
                  <Play className="mr-2 h-4 w-4" /> Genera Scrittura
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Righe Scrittura Contabile</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 font-semibold text-sm">
                  <div className="col-span-4">Conto</div>
                  <div className="col-span-3">Descrizione</div>
                  <div className="col-span-2 text-right">Dare</div>
                  <div className="col-span-2 text-right">Avere</div>
                  <div className="col-span-1"></div>
                </div>
                <TooltipProvider>
                  {registrazione.righe.map((riga, index) => (
                    <div key={riga.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <Combobox
                          options={conti.map(c => ({ value: c.id, label: c.codice, description: c.nome }))}
                          value={riga.contoId}
                          onChange={(value) => updateRigaContabile(riga.id, 'contoId', value)}
                          placeholder="Seleziona conto..."
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={riga.descrizione}
                          onChange={(e) => updateRigaContabile(riga.id, 'descrizione', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="text"
                          className="text-right"
                          value={displayValues[`${riga.id}-dare`]}
                          onChange={(e) => handleDisplayValueChange(`${riga.id}-dare`, e.target.value)}
                          onBlur={() => handleDisplayValueBlur(`${riga.id}-dare`, 'riga', riga.id, 'dare')}
                          disabled={!isDareEnabled(riga.contoId)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="text"
                          className="text-right"
                          value={displayValues[`${riga.id}-avere`]}
                          onChange={(e) => handleDisplayValueChange(`${riga.id}-avere`, e.target.value)}
                          onBlur={() => handleDisplayValueBlur(`${riga.id}-avere`, 'riga', riga.id, 'avere')}
                          disabled={!isAvereEnabled(riga.contoId)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-end space-x-1">
                        {isAllocazioneEnabled(riga.contoId) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" className={`h-8 w-8 ${riga.allocazioni.length > 0 ? 'border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50' : ''}`} onClick={() => setAllocazioneRigaId(riga.id)}>
                                {riga.allocazioni.length > 0 ? <CheckCircle2 className="h-4 w-4" /> : <Split className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Gestisci Allocazioni</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRigaContabile(riga.id)}>
                              <Trash2 className="h-4 w-4 text-slate-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Elimina riga</p>
                          </TooltipContent>
                        </Tooltip>
                        {index === registrazione.righe.length - 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addRigaContabile}>
                                <Plus className="h-4 w-4 text-slate-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Aggiungi riga</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-slate-50 p-4 rounded-b-lg">
              <div>
                <Badge variant={getSbilancio() > 0.01 ? "destructive" : "default"} className={getSbilancio() <= 0.01 ? "bg-green-600 hover:bg-green-700" : ""}>
                  {getSbilancio() > 0.01 ? "Sbilanciata" : "Quadrata"}
                </Badge>
              </div>
              <div className="text-right font-semibold">
                <div className="text-sm text-slate-600">Totale Dare: <span className="text-slate-900">{formatCurrency(getTotaleDare())}</span></div>
                <div className="text-sm text-slate-600">Totale Avere: <span className="text-slate-900">{formatCurrency(getTotaleAvere())}</span></div>
                <div className={`text-sm ${getSbilancio() > 0.01 ? 'text-red-600' : 'text-slate-600'}`}>Sbilancio: <span className={getSbilancio() > 0.01 ? 'text-red-600 font-bold' : 'text-slate-900'}>{formatCurrency(getSbilancio())}</span></div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={showAllocazioneWarning} onOpenChange={setShowAllocazioneWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Allocazione Mancante</AlertDialogTitle>
            <AlertDialogDescription>
              Una o più righe di costo/ricavo non sono state allocate a una commessa. 
              Questo è necessario per il controllo di gestione. Vuoi procedere con l'allocazione ora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate('/prima-nota')}>No, torna alla lista</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rigaDaAllocareId) {
                  setAllocazioneRigaId(rigaDaAllocareId);
                }
              }}
            >
              Alloca Ora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NuovaRegistrazionePrimaNota;
