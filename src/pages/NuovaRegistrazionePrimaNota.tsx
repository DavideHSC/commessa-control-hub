
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RigaContabile {
  id: string;
  conto: string;
  descrizione: string;
  dare: number;
  avere: number;
  isCommessaRelevant: boolean;
}

interface AssegnazioneCommessa {
  id: string;
  rigaId: string;
  commessa: string;
  tipo: 'importo' | 'percentuale';
  valore: number;
  importoCalcolato: number;
  voceCommessa?: string;
}

const mockConti = [
  { codice: '401001', nome: 'Ricavi da Vendite', isCommessaRelevant: true, tipo: 'ricavo' },
  { codice: '601001', nome: 'Costi per Materiali', isCommessaRelevant: true, tipo: 'costo' },
  { codice: '601002', nome: 'Costi per Manodopera', isCommessaRelevant: true, tipo: 'costo' },
  { codice: '701001', nome: 'Costi Generali', isCommessaRelevant: false, tipo: 'costo' },
  { codice: '120001', nome: 'Clienti', isCommessaRelevant: false, tipo: 'attivo' },
  { codice: '200001', nome: 'Fornitori', isCommessaRelevant: false, tipo: 'passivo' },
];

const mockCommesse = [
  { id: 'COM-2024-001', nome: 'Ristrutturazione Palazzo' },
  { id: 'COM-2024-002', nome: 'Costruzione Villa' },
  { id: 'COM-2024-003', nome: 'Ristrutturazione Uffici' },
];

const mockVociCommessa = {
  'ricavo': ['Fatturazione Lavori', 'Fatturazione Materiali', 'Varianti'],
  'costo': ['Materiali Edili', 'Manodopera', 'Subappalti', 'Attrezzature', 'Trasporti']
};

const NuovaRegistrazionePrimaNota: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    causale: '',
    descrizione: '',
  });

  const [righeContabili, setRigheContabili] = useState<RigaContabile[]>([
    { id: '1', conto: '', descrizione: '', dare: 0, avere: 0, isCommessaRelevant: false }
  ]);

  const [assegnazioniCommesse, setAssegnazioniCommesse] = useState<AssegnazioneCommessa[]>([]);
  const [showAssegnazioni, setShowAssegnazioni] = useState(false);

  const addRigaContabile = () => {
    const newId = (righeContabili.length + 1).toString();
    setRigheContabili([...righeContabili, {
      id: newId,
      conto: '',
      descrizione: '',
      dare: 0,
      avere: 0,
      isCommessaRelevant: false
    }]);
  };

  const updateRigaContabile = (id: string, field: keyof RigaContabile, value: any) => {
    setRigheContabili(righe => righe.map(riga => {
      if (riga.id === id) {
        const updated = { ...riga, [field]: value };
        
        if (field === 'conto') {
          const conto = mockConti.find(c => c.codice === value);
          updated.isCommessaRelevant = conto?.isCommessaRelevant || false;
          updated.descrizione = conto?.nome || '';
        }
        
        return updated;
      }
      return riga;
    }));
  };

  const removeRigaContabile = (id: string) => {
    if (righeContabili.length > 1) {
      setRigheContabili(righe => righe.filter(r => r.id !== id));
      setAssegnazioniCommesse(ass => ass.filter(a => a.rigaId !== id));
    }
  };

  const hasCommessaRelevantRows = righeContabili.some(r => r.isCommessaRelevant && (r.dare > 0 || r.avere > 0));

  const addAssegnazioneCommessa = (rigaId: string) => {
    const newId = Date.now().toString();
    setAssegnazioniCommesse([...assegnazioniCommesse, {
      id: newId,
      rigaId,
      commessa: '',
      tipo: 'importo',
      valore: 0,
      importoCalcolato: 0
    }]);
  };

  const updateAssegnazioneCommessa = (id: string, field: keyof AssegnazioneCommessa, value: any) => {
    setAssegnazioniCommesse(ass => ass.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        
        if (field === 'valore' || field === 'tipo') {
          const riga = righeContabili.find(r => r.id === a.rigaId);
          if (riga) {
            const importoTotale = riga.dare || riga.avere;
            if (updated.tipo === 'percentuale') {
              updated.importoCalcolato = (importoTotale * updated.valore) / 100;
            } else {
              updated.importoCalcolato = updated.valore;
            }
          }
        }
        
        return updated;
      }
      return a;
    }));
  };

  const removeAssegnazioneCommessa = (id: string) => {
    setAssegnazioniCommesse(ass => ass.filter(a => a.id !== id));
  };

  const getTotaleDare = () => righeContabili.reduce((sum, r) => sum + (r.dare || 0), 0);
  const getTotaleAvere = () => righeContabili.reduce((sum, r) => sum + (r.avere || 0), 0);
  const getSbilancio = () => Math.abs(getTotaleDare() - getTotaleAvere());

  const handleSave = () => {
    console.log('Salvataggio registrazione:', { formData, righeContabili, assegnazioniCommesse });
    navigate('/prima-nota');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/prima-nota')}
            className="border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Prima Nota
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nuova Registrazione</h1>
            <p className="text-slate-600 mt-1">Crea una nuova registrazione di prima nota</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={getSbilancio() > 0}
        >
          <Save className="w-4 h-4 mr-2" />
          Salva Registrazione
        </Button>
      </div>

      {/* Dati Generali */}
      <Card>
        <CardHeader>
          <CardTitle>Dati Generali</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data">Data Registrazione *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="causale">Causale *</Label>
              <Select value={formData.causale} onValueChange={(value) => setFormData(prev => ({ ...prev, causale: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona causale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fattura Vendita">Fattura Vendita</SelectItem>
                  <SelectItem value="Fattura Acquisto">Fattura Acquisto</SelectItem>
                  <SelectItem value="Pagamento">Pagamento</SelectItem>
                  <SelectItem value="Incasso">Incasso</SelectItem>
                  <SelectItem value="Giroconto">Giroconto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="descrizione">Descrizione *</Label>
              <Input
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
                placeholder="Descrizione della registrazione"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Righe Contabili */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Righe Contabili</CardTitle>
            <Button onClick={addRigaContabile} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Riga
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {righeContabili.map((riga, index) => (
              <div key={riga.id} className="grid grid-cols-12 gap-3 items-end p-4 border border-slate-200 rounded-lg">
                <div className="col-span-3">
                  <Label>Conto</Label>
                  <Select value={riga.conto} onValueChange={(value) => updateRigaContabile(riga.id, 'conto', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona conto" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockConti.map((conto) => (
                        <SelectItem key={conto.codice} value={conto.codice}>
                          <div className="flex items-center gap-2">
                            {conto.codice} - {conto.nome}
                            {conto.isCommessaRelevant && (
                              <Badge variant="secondary" className="text-xs">Commessa</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label>Descrizione</Label>
                  <Input
                    value={riga.descrizione}
                    onChange={(e) => updateRigaContabile(riga.id, 'descrizione', e.target.value)}
                    placeholder="Descrizione movimento"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Dare (€)</Label>
                  <Input
                    type="number"
                    value={riga.dare || ''}
                    onChange={(e) => updateRigaContabile(riga.id, 'dare', parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Avere (€)</Label>
                  <Input
                    type="number"
                    value={riga.avere || ''}
                    onChange={(e) => updateRigaContabile(riga.id, 'avere', parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  {riga.isCommessaRelevant && (riga.dare > 0 || riga.avere > 0) && (
                    <Button
                      onClick={() => addAssegnazioneCommessa(riga.id)}
                      variant="outline"
                      size="sm"
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <Calculator className="w-4 h-4" />
                    </Button>
                  )}
                  {righeContabili.length > 1 && (
                    <Button
                      onClick={() => removeRigaContabile(riga.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totali */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-slate-600">Totale Dare</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(getTotaleDare())}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Totale Avere</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(getTotaleAvere())}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Sbilancio</p>
                <p className={`text-lg font-bold ${getSbilancio() === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(getSbilancio())}
                </p>
              </div>
            </div>
            {getSbilancio() > 0 && (
              <p className="text-center text-sm text-red-600 mt-2">
                La registrazione deve essere in pareggio per poter essere salvata
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assegnazioni Commesse */}
      {hasCommessaRelevantRows && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Assegnazione alle Commesse
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Funzionalità Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assegnazioniCommesse.length === 0 ? (
              <p className="text-slate-600 text-center py-4">
                Clicca sul pulsante calcolatrice nelle righe contabili per assegnare importi alle commesse
              </p>
            ) : (
              <div className="space-y-4">
                {assegnazioniCommesse.map((ass) => {
                  const riga = righeContabili.find(r => r.id === ass.rigaId);
                  const conto = mockConti.find(c => c.codice === riga?.conto);
                  
                  return (
                    <div key={ass.id} className="grid grid-cols-12 gap-3 items-end p-4 border border-green-200 rounded-lg bg-green-50">
                      <div className="col-span-2">
                        <Label>Riga</Label>
                        <p className="text-sm font-medium">{riga?.descrizione}</p>
                      </div>
                      <div className="col-span-2">
                        <Label>Commessa</Label>
                        <Select value={ass.commessa} onValueChange={(value) => updateAssegnazioneCommessa(ass.id, 'commessa', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockCommesse.map((comm) => (
                              <SelectItem key={comm.id} value={comm.id}>
                                {comm.id} - {comm.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Voce Commessa</Label>
                        <Select value={ass.voceCommessa} onValueChange={(value) => updateAssegnazioneCommessa(ass.id, 'voceCommessa', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockVociCommessa[conto?.tipo as keyof typeof mockVociCommessa]?.map((voce) => (
                              <SelectItem key={voce} value={voce}>
                                {voce}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label>Tipo</Label>
                        <Select value={ass.tipo} onValueChange={(value) => updateAssegnazioneCommessa(ass.id, 'tipo', value as 'importo' | 'percentuale')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="importo">€</SelectItem>
                            <SelectItem value="percentuale">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Valore</Label>
                        <Input
                          type="number"
                          value={ass.valore || ''}
                          onChange={(e) => updateAssegnazioneCommessa(ass.id, 'valore', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Importo Calcolato</Label>
                        <p className="text-sm font-medium text-green-700">
                          {formatCurrency(ass.importoCalcolato)}
                        </p>
                      </div>
                      <div className="col-span-1">
                        <Button
                          onClick={() => removeAssegnazioneCommessa(ass.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NuovaRegistrazionePrimaNota;
