import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { 
  Lightbulb,
  RefreshCw,
  Target,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Play,
  BarChart3
} from 'lucide-react';

interface AutoAllocationSuggestionsSectionProps {
  refreshTrigger?: number;
}

interface AllocationSuggestion {
  rigaProgressivo: string;
  voceAnalitica: string;
  descrizioneVoce: string;
  motivazione: string;
  confidenza: number;
  importoSuggerito: number;
}

interface SuggerimentiData {
  totalSuggerimenti: number;
  suggerimentiPerConfidenza: {
    alta: AllocationSuggestion[];
    media: AllocationSuggestion[];
    bassa: AllocationSuggestion[];
  };
  righeProcessate: number;
  risparmioTempoStimato: number;
}

export const AutoAllocationSuggestionsSection = ({ refreshTrigger }: AutoAllocationSuggestionsSectionProps) => {
  const [data, setData] = useState<SuggerimentiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyingTest, setApplyingTest] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/staging-analysis/auto-allocation-suggestions');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Errore nel caricamento suggerimenti');
        }
      } else {
        setError('Errore di connessione API');
      }
    } catch (err) {
      setError('Errore di rete');
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const testApplySuggestions = useCallback(async (minConfidenza: number = 70) => {
    setApplyingTest(true);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/staging-analysis/apply-allocation-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          suggestionIds: [], 
          minConfidenza 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTestResults(result.data);
        } else {
          setError(result.error || 'Errore nell\'applicazione test');
        }
      } else {
        setError('Errore nell\'applicazione test');
      }
    } catch (err) {
      setError('Errore nel test di applicazione');
      console.error('Error applying suggestions test:', err);
    } finally {
      setApplyingTest(false);
    }
  }, []);

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchSuggestions();
    }
  }, [refreshTrigger, fetchSuggestions]);

  // Load data on mount
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Errore:</strong> {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSuggestions}
            className="ml-3"
          >
            Riprova
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="text-yellow-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Suggerimenti Automatici di Allocazione</h3>
            <p className="text-sm text-gray-600">
              Sistema intelligente basato sui pattern del documento esempi-registrazioni.md
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchSuggestions}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generando...' : 'Aggiorna'}
          </Button>
          {data && (
            <Button 
              onClick={() => testApplySuggestions(70)}
              disabled={applyingTest}
              size="sm"
            >
              <Play size={16} className="mr-2" />
              {applyingTest ? 'Testando...' : 'Test Applica'}
            </Button>
          )}
        </div>
      </div>

      {/* Statistiche Principali */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suggerimenti Totali</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.totalSuggerimenti}</p>
                </div>
                <Lightbulb className="text-yellow-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alta Confidenza</p>
                  <p className="text-2xl font-bold text-green-600">{data.suggerimentiPerConfidenza.alta.length}</p>
                  <p className="text-xs text-gray-500">≥ 70%</p>
                </div>
                <Target className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Righe Processate</p>
                  <p className="text-2xl font-bold text-blue-600">{data.righeProcessate}</p>
                </div>
                <BarChart3 className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Risparmio Tempo</p>
                  <p className="text-2xl font-bold text-purple-600">{data.risparmioTempoStimato}</p>
                  <p className="text-xs text-gray-500">ore stimate</p>
                </div>
                <Clock className="text-purple-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dettagli per Confidenza */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alta Confidenza */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="text-green-600" size={20} />
                Alta Confidenza ({data.suggerimentiPerConfidenza.alta.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.suggerimentiPerConfidenza.alta.slice(0, 5).map((sugg, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Riga {sugg.rigaProgressivo}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-200 text-green-900 text-xs">
                        {sugg.confidenza}%
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-green-900">{sugg.voceAnalitica}</div>
                      <div className="text-green-700 text-xs mt-1">{sugg.motivazione}</div>
                      <div className="text-green-600 text-xs mt-1">
                        {formatCurrency(sugg.importoSuggerito)}
                      </div>
                    </div>
                  </div>
                ))}
                {data.suggerimentiPerConfidenza.alta.length > 5 && (
                  <div className="text-center text-xs text-gray-500">
                    ... e altri {data.suggerimentiPerConfidenza.alta.length - 5} suggerimenti
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media Confidenza */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="text-yellow-600" size={20} />
                Media Confidenza ({data.suggerimentiPerConfidenza.media.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.suggerimentiPerConfidenza.media.slice(0, 5).map((sugg, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        Riga {sugg.rigaProgressivo}
                      </Badge>
                      <Badge variant="secondary" className="bg-yellow-200 text-yellow-900 text-xs">
                        {sugg.confidenza}%
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">{sugg.voceAnalitica}</div>
                      <div className="text-yellow-700 text-xs mt-1">{sugg.motivazione}</div>
                      <div className="text-yellow-600 text-xs mt-1">
                        {formatCurrency(sugg.importoSuggerito)}
                      </div>
                    </div>
                  </div>
                ))}
                {data.suggerimentiPerConfidenza.media.length > 5 && (
                  <div className="text-center text-xs text-gray-500">
                    ... e altri {data.suggerimentiPerConfidenza.media.length - 5} suggerimenti
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bassa Confidenza */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                Bassa Confidenza ({data.suggerimentiPerConfidenza.bassa.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.suggerimentiPerConfidenza.bassa.slice(0, 5).map((sugg, index) => (
                  <div key={index} className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                        Riga {sugg.rigaProgressivo}
                      </Badge>
                      <Badge variant="secondary" className="bg-red-200 text-red-900 text-xs">
                        {sugg.confidenza}%
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-red-900">{sugg.voceAnalitica}</div>
                      <div className="text-red-700 text-xs mt-1">{sugg.motivazione}</div>
                      <div className="text-red-600 text-xs mt-1">
                        {formatCurrency(sugg.importoSuggerito)}
                      </div>
                    </div>
                  </div>
                ))}
                {data.suggerimentiPerConfidenza.bassa.length > 5 && (
                  <div className="text-center text-xs text-gray-500">
                    ... e altri {data.suggerimentiPerConfidenza.bassa.length - 5} suggerimenti
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risultati Test Applicazione */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={20} />
              Risultati Test Applicazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResults.applicati}</div>
                <div className="text-sm text-green-800">Applicati con Successo</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResults.errori}</div>
                <div className="text-sm text-red-800">Errori Rilevati</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{testResults.allocazioniVirtuali.length}</div>
                <div className="text-sm text-blue-800">Allocazioni Simulate</div>
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {testResults.allocazioniVirtuali.slice(0, 10).map((alloc: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        alloc.status === 'success' ? 'bg-green-100 text-green-800' : 
                        alloc.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {alloc.status}
                    </Badge>
                    <span className="text-sm">{alloc.voceAnalitica}</span>
                    <span className="text-xs text-gray-500">{formatCurrency(alloc.importo)}</span>
                  </div>
                  <span className="text-xs text-gray-600">{alloc.messaggio}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Informativo */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <Zap className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Suggerimenti Intelligenti:</strong> Il sistema analizza automaticamente i pattern delle scritture contabili 
          e suggerisce voci analitiche basandosi sui mapping del documento esempi-registrazioni.md. 
          I suggerimenti ad alta confidenza (≥70%) possono essere applicati automaticamente con sicurezza.
        </AlertDescription>
      </Alert>

      {/* Loading state */}
      {loading && !data && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin mr-3" size={20} />
              <span>Generando suggerimenti automatici...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};