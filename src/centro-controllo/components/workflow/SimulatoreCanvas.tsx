import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../new_components/ui/Card';
import { Button } from '../../../new_components/ui/Button';
import { Badge } from '../../../new_components/ui/Badge';
import { Input } from '../../../new_components/ui/Input';
import { Alert, AlertDescription } from '../../../new_components/ui/Alert';
import { 
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  Percent,
  ArrowRight
} from 'lucide-react';
import { 
  MovimentoAllocabile, 
  AllocazioneVirtuale
} from '../../types/stagingAnalysisTypes';

interface SimulatoreCanvasProps {
  movimento: MovimentoAllocabile;
  allocazioniIniziali: AllocazioneVirtuale[];
  commesseDisponibili: Array<{
    id: string;
    nome: string;
    clienteNome: string;
    isAttiva: boolean;
    budgetTotale?: number;
  }>;
  vociAnalitiche: Array<{
    id: string;
    nome: string;
    tipo: string;
    isAttiva: boolean;
  }>;
  onSimulazioneComplete: (allocazioni: AllocazioneVirtuale[]) => void;
  onBack: () => void;
}

export const SimulatoreCanvas = ({
  movimento,
  allocazioniIniziali,
  commesseDisponibili,
  vociAnalitiche,
  onSimulazioneComplete,
  onBack
}: SimulatoreCanvasProps) => {
  const [allocazioni, setAllocazioni] = useState<AllocazioneVirtuale[]>(allocazioniIniziali);
  const [modalitaAllocazione, setModalitaAllocazione] = useState<'importo' | 'percentuale'>('importo');
  const [autoDistribution, setAutoDistribution] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getMovementAmount = () => {
    return Math.max(movimento.totaliDare, movimento.totaliAvere);
  };

  const getTotalAllocatedAmount = () => {
    return allocazioni.reduce((sum, a) => sum + a.importo, 0);
  };

  const getRemainingAmount = () => {
    return getMovementAmount() - getTotalAllocatedAmount();
  };

  const getAllocationPercentage = () => {
    const total = getMovementAmount();
    const allocated = getTotalAllocatedAmount();
    return total > 0 ? (allocated / total) * 100 : 0;
  };

  const isFullyAllocated = () => {
    return Math.abs(getRemainingAmount()) < 0.01;
  };

  const isOverAllocated = () => {
    return getRemainingAmount() < -0.01;
  };

  const addNuovaAllocazione = () => {
    const nuovaAllocazione: AllocazioneVirtuale = {
      id: `manual-${Date.now()}-${Math.random()}`,
      rigaProgressivo: movimento.righeLavorabili[0]?.progressivoRigo || '',
      commessaId: '',
      commessaNome: '',
      voceAnaliticaId: '',
      voceAnaliticaNome: '',
      importo: 0,
      percentuale: 0,
      isFromSuggestion: false,
      validazioni: []
    };
    setAllocazioni([...allocazioni, nuovaAllocazione]);
  };

  const removeAllocazione = (id: string) => {
    setAllocazioni(allocazioni.filter(a => a.id !== id));
  };

  const updateAllocazione = (id: string, field: keyof AllocazioneVirtuale, value: any) => {
    setAllocazioni(allocazioni.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        
        // Se aggiorniamo la commessa, aggiorniamo anche il nome
        if (field === 'commessaId') {
          const commessa = commesseDisponibili.find(c => c.id === value);
          updated.commessaNome = commessa ? commessa.nome : '';
        }
        
        // Se aggiorniamo la voce analitica, aggiorniamo anche il nome
        if (field === 'voceAnaliticaId') {
          const voce = vociAnalitiche.find(v => v.id === value);
          updated.voceAnaliticaNome = voce ? voce.nome : '';
        }
        
        // Calcolo automatico percentuale ↔ importo
        if (field === 'importo' && modalitaAllocazione === 'importo') {
          const totalAmount = getMovementAmount();
          updated.percentuale = totalAmount > 0 ? (updated.importo / totalAmount) * 100 : 0;
        } else if (field === 'percentuale' && modalitaAllocazione === 'percentuale') {
          updated.importo = (updated.percentuale / 100) * getMovementAmount();
        }
        
        return updated;
      }
      return a;
    }));
  };

  const handleAutoDistribute = () => {
    if (allocazioni.length === 0) return;
    
    const remainingAmount = getRemainingAmount();
    const activeAllocations = allocazioni.filter(a => a.commessaId && a.voceAnaliticaId);
    
    if (activeAllocations.length === 0) return;
    
    const amountPerAllocation = remainingAmount / activeAllocations.length;
    
    setAllocazioni(allocazioni.map(a => {
      if (activeAllocations.includes(a)) {
        const newImporto = a.importo + amountPerAllocation;
        const newPercentuale = (newImporto / getMovementAmount()) * 100;
        return { ...a, importo: newImporto, percentuale: newPercentuale };
      }
      return a;
    }));
  };

  const handleQuickSplit = (numberOfSplits: number) => {
    // Rimuove allocazioni esistenti e crea split uniforme
    const baseAmount = getMovementAmount() / numberOfSplits;
    const basePercentage = 100 / numberOfSplits;
    
    const newAllocations: AllocazioneVirtuale[] = [];
    for (let i = 0; i < numberOfSplits; i++) {
      newAllocations.push({
        id: `split-${Date.now()}-${i}`,
        rigaProgressivo: movimento.righeLavorabili[0]?.progressivoRigo || '',
        commessaId: '',
        commessaNome: '',
        voceAnaliticaId: '',
        voceAnaliticaNome: '',
        importo: baseAmount,
        percentuale: basePercentage,
        isFromSuggestion: false,
        validazioni: []
      });
    }
    
    setAllocazioni(newAllocations);
  };

  const validateAllocazioni = () => {
    const errors: string[] = [];
    
    if (allocazioni.length === 0) {
      errors.push('Nessuna allocazione definita');
    }
    
    allocazioni.forEach((alloc, index) => {
      if (!alloc.commessaId) {
        errors.push(`Allocazione ${index + 1}: Commessa non selezionata`);
      }
      if (!alloc.voceAnaliticaId) {
        errors.push(`Allocazione ${index + 1}: Voce analitica non selezionata`);
      }
      if (alloc.importo <= 0) {
        errors.push(`Allocazione ${index + 1}: Importo deve essere maggiore di zero`);
      }
    });
    
    if (isOverAllocated()) {
      errors.push(`Sovra-allocazione di ${formatCurrency(Math.abs(getRemainingAmount()))}`);
    }
    
    return errors;
  };

  const canProceed = () => {
    const errors = validateAllocazioni();
    return errors.length === 0 && allocazioni.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Indietro
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Simulatore Allocazioni</h3>
            <p className="text-sm text-gray-600">
              Movimento: {movimento.testata.numeroDocumento} - {formatCurrency(getMovementAmount())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className={`font-medium ${isOverAllocated() ? 'text-red-600' : isFullyAllocated() ? 'text-green-600' : 'text-blue-600'}`}>
              Allocato: {getAllocationPercentage().toFixed(1)}%
            </div>
            <div className="text-gray-600">
              Rimanente: {formatCurrency(getRemainingAmount())}
            </div>
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isOverAllocated() ? 'bg-red-500' :
                isFullyAllocated() ? 'bg-green-500' : 
                getAllocationPercentage() >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(getAllocationPercentage(), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controlli Rapidi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator size={20} />
            Strumenti di Allocazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Modalità Allocazione */}
            <div>
              <label className="block text-sm font-medium mb-2">Modalità</label>
              <div className="flex gap-2">
                <Button
                  variant={modalitaAllocazione === 'importo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModalitaAllocazione('importo')}
                >
                  <DollarSign size={14} className="mr-1" />
                  Importo
                </Button>
                <Button
                  variant={modalitaAllocazione === 'percentuale' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModalitaAllocazione('percentuale')}
                >
                  <Percent size={14} className="mr-1" />
                  Percentuale
                </Button>
              </div>
            </div>

            {/* Split Rapido */}
            <div>
              <label className="block text-sm font-medium mb-2">Split Rapido</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSplit(2)}
                >
                  50/50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSplit(3)}
                >
                  33/33/33
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSplit(4)}
                >
                  25/25/25/25
                </Button>
              </div>
            </div>

            {/* Azioni */}
            <div>
              <label className="block text-sm font-medium mb-2">Azioni</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoDistribute}
                  disabled={allocazioni.length === 0 || getRemainingAmount() <= 0}
                >
                  <Target size={14} className="mr-1" />
                  Auto Distribuisci
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNuovaAllocazione}
                >
                  <Plus size={14} className="mr-1" />
                  Aggiungi
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Allocazioni */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users size={20} />
            Allocazioni Virtuali ({allocazioni.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocazioni.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nessuna allocazione configurata</p>
              <Button
                variant="outline"
                onClick={addNuovaAllocazione}
                className="mt-3"
              >
                <Plus size={16} className="mr-2" />
                Aggiungi Prima Allocazione
              </Button>
            </div>
          ) : (
            allocazioni.map((allocazione, index) => (
              <div key={allocazione.id} className="p-4 border rounded-lg bg-white">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  {/* Commessa */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Commessa</label>
                    <select
                      value={allocazione.commessaId}
                      onChange={(e) => updateAllocazione(allocazione.id, 'commessaId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona...</option>
                      {commesseDisponibili.map(commessa => (
                        <option key={commessa.id} value={commessa.id}>
                          {commessa.nome} ({commessa.clienteNome})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voce Analitica */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Voce Analitica</label>
                    <select
                      value={allocazione.voceAnaliticaId}
                      onChange={(e) => updateAllocazione(allocazione.id, 'voceAnaliticaId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona...</option>
                      {vociAnalitiche.map(voce => (
                        <option key={voce.id} value={voce.id}>
                          {voce.nome} ({voce.tipo})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Importo */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Importo</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={allocazione.importo}
                      onChange={(e) => updateAllocazione(allocazione.id, 'importo', parseFloat(e.target.value) || 0)}
                      className="font-mono"
                      disabled={modalitaAllocazione === 'percentuale'}
                    />
                  </div>

                  {/* Percentuale */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Percentuale</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={allocazione.percentuale?.toFixed(2) || '0.00'}
                      onChange={(e) => updateAllocazione(allocazione.id, 'percentuale', parseFloat(e.target.value) || 0)}
                      className="font-mono"
                      disabled={modalitaAllocazione === 'importo'}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <div className="flex items-center gap-2">
                      {allocazione.isFromSuggestion && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {allocazione.suggestionType}
                        </Badge>
                      )}
                      {allocazione.commessaId && allocazione.voceAnaliticaId && allocazione.importo > 0 && (
                        <CheckCircle2 size={16} className="text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Azioni */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAllocazione(allocazione.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Validazione */}
      {(() => {
        const errors = validateAllocazioni();
        if (errors.length > 0) {
          return (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Errori di Validazione:</strong>
                <ul className="list-disc list-inside mt-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          );
        }
        
        if (isFullyAllocated()) {
          return (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Allocazione Completa!</strong> Il movimento è completamente allocato e pronto per la validazione.
              </AlertDescription>
            </Alert>
          );
        }
        
        return null;
      })()}

      {/* Riepilogo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target size={20} />
            Riepilogo Simulazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(getMovementAmount())}</div>
              <div className="text-sm text-gray-600">Importo Movimento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(getTotalAllocatedAmount())}</div>
              <div className="text-sm text-gray-600">Totale Allocato</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRemainingAmount() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(getRemainingAmount())}
              </div>
              <div className="text-sm text-gray-600">Rimanente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{allocazioni.length}</div>
              <div className="text-sm text-gray-600">Allocazioni</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigazione */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-600">
          {!canProceed() ? 
            'Completa la configurazione per procedere' : 
            'Simulazione pronta per la validazione'
          }
        </div>
        <Button
          onClick={() => onSimulazioneComplete(allocazioni)}
          disabled={!canProceed()}
          className="flex items-center gap-2"
        >
          <ArrowRight size={16} />
          Procedi alla Validazione
        </Button>
      </div>
    </div>
  );
};
