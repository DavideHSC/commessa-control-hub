import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../new_components/ui/Card';
import { Button } from '../../../new_components/ui/Button';
import { Badge } from '../../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../../new_components/ui/Alert';
import { 
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  Database,
  TrendingUp,
  Play,
  Target,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { 
  MovimentoAllocabile, 
  AllocazioneVirtuale,
  AllocationSuggestion 
} from '../../types/stagingAnalysisTypes';

interface SuggerimentiPanelProps {
  movimento: MovimentoAllocabile;
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
  onSuggerimentiApply: (allocazioni: AllocazioneVirtuale[]) => void;
  onBack: () => void;
}

export const SuggerimentiPanel = ({
  movimento,
  commesseDisponibili,
  vociAnalitiche,
  onSuggerimentiApply,
  onBack
}: SuggerimentiPanelProps) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [allocazioniVirtuali, setAllocazioniVirtuali] = useState<AllocazioneVirtuale[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getConfidenceColor = (confidenza: number) => {
    if (confidenza >= 70) return 'bg-green-100 text-green-800';
    if (confidenza >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidenza: number) => {
    if (confidenza >= 70) return 'Alta';
    if (confidenza >= 40) return 'Media';
    return 'Bassa';
  };

  const getSuggestionIcon = (tipo: string) => {
    switch (tipo) {
      case 'MOVANAC':
        return CheckCircle2;
      case 'REGOLA_DETTANAL':
        return Database;
      case 'PATTERN_STORICO':
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  const getSuggestionDescription = (tipo: string) => {
    switch (tipo) {
      case 'MOVANAC':
        return 'Allocazione predefinita dai dati di staging';
      case 'REGOLA_DETTANAL':
        return 'Regola di ripartizione automatica configurata';
      case 'PATTERN_STORICO':
        return 'Suggerimento basato su pattern storici simili';
      default:
        return 'Suggerimento generico';
    }
  };

  const handleSuggestionToggle = (suggestion: AllocationSuggestion, rigaProgressivo: string) => {
    const suggestionId = `${suggestion.tipo}-${suggestion.commessaId}-${suggestion.voceAnaliticaId}`;
    
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
        // Rimuovi l'allocazione virtuale corrispondente
        setAllocazioniVirtuali(current => 
          current.filter(a => 
            !(a.commessaId === suggestion.commessaId && 
              a.voceAnaliticaId === suggestion.voceAnaliticaId &&
              a.rigaProgressivo === rigaProgressivo)
          )
        );
      } else {
        newSet.add(suggestionId);
        // Aggiungi l'allocazione virtuale
        const nuovaAllocazione: AllocazioneVirtuale = {
          id: `virtual-${Date.now()}-${Math.random()}`,
          rigaProgressivo,
          commessaId: suggestion.commessaId,
          commessaNome: suggestion.commessaNome,
          voceAnaliticaId: suggestion.voceAnaliticaId,
          voceAnaliticaNome: suggestion.voceAnaliticaNome,
          importo: suggestion.importoSuggerito,
          percentuale: suggestion.percentualeSuggerita,
          isFromSuggestion: true,
          suggestionType: suggestion.tipo,
          validazioni: []
        };
        setAllocazioniVirtuali(current => [...current, nuovaAllocazione]);
      }
      return newSet;
    });
  };

  const handleApplyAllHighConfidence = () => {
    const highConfidenceSuggestions = movimento.suggerimentiRegole.filter(s => s.confidenza >= 70);
    
    highConfidenceSuggestions.forEach((suggestion) => {
      // Trova la riga più adatta per questa allocazione
      const rigaAdatta = movimento.righeLavorabili.find(r => 
        // Logica per matchare riga con suggerimento
        r.isAllocabile === true
      );
      
      if (rigaAdatta) {
        handleSuggestionToggle(suggestion, rigaAdatta.progressivoRigo);
      }
    });
  };

  const getTotalAllocatedAmount = () => {
    return allocazioniVirtuali.reduce((sum, a) => sum + a.importo, 0);
  };

  const getMovementAmount = () => {
    return Math.max(movimento.totaliDare, movimento.totaliAvere);
  };

  const getAllocationPercentage = () => {
    const total = getMovementAmount();
    const allocated = getTotalAllocatedAmount();
    return total > 0 ? (allocated / total) * 100 : 0;
  };

  const canProceed = () => {
    return allocazioniVirtuali.length > 0;
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
            <h3 className="text-lg font-semibold">Suggerimenti Intelligenti</h3>
            <p className="text-sm text-gray-600">
              Movimento: {movimento.testata.numeroDocumento} - {formatCurrency(getMovementAmount())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium">Allocato: {getAllocationPercentage().toFixed(1)}%</div>
            <div className="text-gray-600">{formatCurrency(getTotalAllocatedAmount())} di {formatCurrency(getMovementAmount())}</div>
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                getAllocationPercentage() >= 100 ? 'bg-green-500' : 
                getAllocationPercentage() >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(getAllocationPercentage(), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Azioni rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target size={20} />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleApplyAllHighConfidence}
              className="flex items-center gap-2"
              disabled={movimento.suggerimentiRegole.filter(s => s.confidenza >= 70).length === 0}
            >
              <CheckCircle2 size={16} />
              Applica Tutti Alta Confidenza
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSuggestions(new Set());
                setAllocazioniVirtuali([]);
              }}
              disabled={selectedSuggestions.size === 0}
            >
              Deseleziona Tutti
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggerimenti MOVANAC */}
      {movimento.suggerimentiMOVANAC.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={20} />
              Allocazioni MOVANAC Predefinite ({movimento.suggerimentiMOVANAC.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {movimento.suggerimentiMOVANAC.map((movanac, index) => (
              <div key={index} className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{movanac.centroDiCosto}</div>
                      <div className="text-sm text-gray-600">
                        Parametro: {movanac.parametro}
                      </div>
                      {movanac.matchedCommessa && (
                        <div className="text-sm text-blue-600">
                          → {movanac.matchedCommessa.nome}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Predefinita
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggerimenti Regole */}
      {movimento.suggerimentiRegole.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="text-blue-600" size={20} />
              Regole di Allocazione ({movimento.suggerimentiRegole.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {movimento.suggerimentiRegole.map((suggestion, index) => {
              const IconComponent = getSuggestionIcon(suggestion.tipo);
              const suggestionId = `${suggestion.tipo}-${suggestion.commessaId}-${suggestion.voceAnaliticaId}`;
              const isSelected = selectedSuggestions.has(suggestionId);
              
              return (
                <div key={index} className={`p-4 border rounded-lg transition-all ${
                  isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        suggestion.tipo === 'MOVANAC' ? 'bg-green-100' :
                        suggestion.tipo === 'REGOLA_DETTANAL' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <IconComponent size={16} className={
                          suggestion.tipo === 'MOVANAC' ? 'text-green-600' :
                          suggestion.tipo === 'REGOLA_DETTANAL' ? 'text-blue-600' : 'text-purple-600'
                        } />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{suggestion.commessaNome}</span>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.voceAnaliticaNome}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {getSuggestionDescription(suggestion.tipo)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {suggestion.reasoning}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="text-sm">
                            <span className="text-gray-600">Importo: </span>
                            <span className="font-mono font-medium">{formatCurrency(suggestion.importoSuggerito)}</span>
                          </div>
                          {suggestion.percentualeSuggerita && (
                            <div className="text-sm">
                              <span className="text-gray-600">Percentuale: </span>
                              <span className="font-mono font-medium">{suggestion.percentualeSuggerita}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant="secondary" 
                        className={getConfidenceColor(suggestion.confidenza)}
                      >
                        {getConfidenceLabel(suggestion.confidenza)} ({suggestion.confidenza}%)
                      </Badge>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          // Trova la prima riga allocabile per questo suggerimento
                          const rigaTarget = movimento.righeLavorabili[0]; // Semplificazione
                          if (rigaTarget) {
                            handleSuggestionToggle(suggestion, rigaTarget.progressivoRigo);
                          }
                        }}
                      >
                        {isSelected ? 'Selezionato' : 'Seleziona'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Riepilogo Allocazioni Selezionate */}
      {allocazioniVirtuali.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="text-purple-600" size={20} />
              Allocazioni Virtuali Selezionate ({allocazioniVirtuali.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allocazioniVirtuali.map((allocazione) => (
                <div key={allocazione.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-purple-100">
                      <Users size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{allocazione.commessaNome}</div>
                      <div className="text-xs text-gray-600">{allocazione.voceAnaliticaNome}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">{formatCurrency(allocazione.importo)}</div>
                    {allocazione.percentuale && (
                      <div className="text-xs text-gray-600">{allocazione.percentuale}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stato e Navigazione */}
      {movimento.suggerimentiMOVANAC.length === 0 && movimento.suggerimentiRegole.length === 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Nessun suggerimento disponibile</strong> per questo movimento. 
            Puoi procedere alla simulazione manuale per creare allocazioni personalizzate.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <div className="text-sm text-gray-600">
          {allocazioniVirtuali.length === 0 ? 
            'Seleziona dei suggerimenti per procedere' : 
            `${allocazioniVirtuali.length} allocazioni pronte per la simulazione`
          }
        </div>
        <Button
          onClick={() => onSuggerimentiApply(allocazioniVirtuali)}
          disabled={!canProceed()}
          className="flex items-center gap-2"
        >
          <Play size={16} />
          Procedi alla Simulazione
        </Button>
      </div>
    </div>
  );
};
