import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { Input } from '../../new_components/ui/Input';
import { 
  Settings, 
  RefreshCw, 
  Filter,
  TrendingUp,
  Database,
  Eye,
  Play,
  Lightbulb,
  Target,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users,
  BarChart3
} from 'lucide-react';
import { 
  AllocationWorkflowFilters,
  AllocationWorkflowResponse,
  MovimentoAllocabile,
  AllocazioneVirtuale,
  AllocationWorkflowTestResponse,
  StagingAnalysisApiResponse
} from '../types/stagingAnalysisTypes';

// Sub-componenti specializzati
import { MovimentiAllocabiliTable } from './workflow/MovimentiAllocabiliTable';
import { SuggerimentiPanel } from './workflow/SuggerimentiPanel';
import { SimulatoreCanvas } from './workflow/SimulatoreCanvas';
import { ValidationPreview } from './workflow/ValidationPreview';

interface AllocationWorkflowSectionProps {
  refreshTrigger?: number;
}

// Workflow states per gestire il flusso
type WorkflowStep = 'select' | 'suggest' | 'simulate' | 'validate';

export const AllocationWorkflowSection = ({ refreshTrigger }: AllocationWorkflowSectionProps) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AllocationWorkflowResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  
  // Workflow state
  const [selectedMovimento, setSelectedMovimento] = useState<MovimentoAllocabile | null>(null);
  const [allocazioniVirtuali, setAllocazioniVirtuali] = useState<AllocazioneVirtuale[]>([]);
  const [testResults, setTestResults] = useState<AllocationWorkflowTestResponse | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<AllocationWorkflowFilters>({
    page: 1,
    limit: 20,
    stato: 'ALL',
    soloAllocabili: true, // Default a true per questa sezione
    contoRilevante: true
  });
  const [pendingFilters, setPendingFilters] = useState<AllocationWorkflowFilters>(filters);

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchAllocationWorkflow();
    }
  }, [refreshTrigger]);

  // Load data on mount e quando cambiano i filtri
  useEffect(() => {
    fetchAllocationWorkflow();
  }, [filters]);

  const fetchAllocationWorkflow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Parametri base
      if (filters.dataDa) queryParams.append('dataDa', filters.dataDa);
      if (filters.dataA) queryParams.append('dataA', filters.dataA);
      if (filters.soggetto) queryParams.append('soggetto', filters.soggetto);
      if (filters.stato) queryParams.append('stato', filters.stato);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      // Parametri specifici allocation workflow
      if (filters.soloAllocabili) queryParams.append('soloAllocabili', 'true');
      if (filters.contoRilevante) queryParams.append('contoRilevante', 'true');
      if (filters.hasAllocazioniStaging) queryParams.append('hasAllocazioniStaging', 'true');
      if (filters.statoAllocazione) queryParams.append('statoAllocazione', filters.statoAllocazione);

      const response = await fetch(`/api/staging-analysis/allocation-workflow?${queryParams}`);
      const result: StagingAnalysisApiResponse<AllocationWorkflowResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch allocation workflow data');
      }
      
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching allocation workflow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setFilters({ ...pendingFilters, page: 1 }); // Reset to first page when filtering
  };

  const handleResetFilters = () => {
    const resetFilters: AllocationWorkflowFilters = {
      page: 1,
      limit: 20,
      stato: 'ALL',
      soloAllocabili: true,
      contoRilevante: true
    };
    setPendingFilters(resetFilters);
    setFilters(resetFilters);
  };

  const handleMovimentoSelect = (movimento: MovimentoAllocabile) => {
    setSelectedMovimento(movimento);
    setCurrentStep('suggest');
    setAllocazioniVirtuali([]); // Reset allocazioni precedenti
  };

  const handleSuggerimentoApply = (allocazioni: AllocazioneVirtuale[]) => {
    setAllocazioniVirtuali(allocazioni);
    setCurrentStep('simulate');
  };

  const handleSimulazioneComplete = (allocazioni: AllocazioneVirtuale[]) => {
    setAllocazioniVirtuali(allocazioni);
    setCurrentStep('validate');
  };

  const handleTestAllocations = async () => {
    if (!selectedMovimento || allocazioniVirtuali.length === 0) return;
    
    setLoading(true);
    try {
      const testRequest = {
        movimentoId: selectedMovimento.testata.codiceUnivocoScaricamento,
        allocazioniVirtuali: allocazioniVirtuali,
        modalitaTest: 'IMPACT_ANALYSIS' as const
      };

      const response = await fetch('/api/staging-analysis/allocation-workflow/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRequest)
      });

      const result: StagingAnalysisApiResponse<AllocationWorkflowTestResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to test allocations');
      }
      
      setTestResults(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Render workflow steps indicator
  const renderWorkflowSteps = () => {
    const steps = [
      { id: 'select', label: 'Selezione', icon: Database, description: 'Scegli movimento' },
      { id: 'suggest', label: 'Suggerimenti', icon: Lightbulb, description: 'Applica regole' },
      { id: 'simulate', label: 'Simulazione', icon: Play, description: 'Testa allocazioni' },
      { id: 'validate', label: 'Validazione', icon: Target, description: 'Conferma risultati' }
    ];

    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          const IconComponent = step.icon;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-3 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full ${isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <IconComponent size={16} />
                </div>
                <div>
                  <div className="font-medium text-sm">{step.label}</div>
                  <div className="text-xs">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px mx-4 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Errore nel caricamento:</strong> {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAllocationWorkflow}
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
          <Settings className="text-orange-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Test Workflow Allocazione Completo</h3>
            <p className="text-sm text-gray-600">
              Sistema integrato per simulare e testare allocazioni sui movimenti contabili
            </p>
          </div>
        </div>
        <Button 
          onClick={fetchAllocationWorkflow}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Caricando...' : 'Aggiorna'}
        </Button>
      </div>

      {/* Workflow Progress */}
      {renderWorkflowSteps()}

      {/* Filtri (Solo nello step select) */}
      {currentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter size={20} />
              Filtri Movimenti Allocabili
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Riuso i filtri della sezione H ma con aggiunte specifiche */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Data Da</label>
                <Input
                  type="date"
                  value={pendingFilters.dataDa || ''}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, dataDa: e.target.value || undefined }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Data A</label>
                <Input
                  type="date"
                  value={pendingFilters.dataA || ''}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, dataA: e.target.value || undefined }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Stato Allocazione</label>
                <select
                  value={pendingFilters.statoAllocazione || 'ALL'}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, statoAllocazione: e.target.value === 'ALL' ? undefined : e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tutti</option>
                  <option value="non_allocato">Non Allocato</option>
                  <option value="parzialmente_allocato">Parzialmente Allocato</option>
                  <option value="completamente_allocato">Completamente Allocato</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Opzioni</label>
                <div className="space-y-1">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={pendingFilters.hasAllocazioniStaging || false}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, hasAllocazioniStaging: e.target.checked || undefined }))}
                      className="mr-2"
                    />
                    Ha MOVANAC predefinite
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
              <Button onClick={handleApplyFilters}>Applica Filtri</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiche */}
      {data && currentStep === 'select' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Movimenti Allocabili</p>
                  <p className="text-2xl font-bold">{data.statistiche.totalMovimenti}</p>
                </div>
                <Database className="text-gray-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Con Suggerimenti</p>
                  <p className="text-2xl font-bold text-blue-600">{data.statistiche.movimentiConSuggerimenti}</p>
                </div>
                <Lightbulb className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MOVANAC Disponibili</p>
                  <p className="text-2xl font-bold text-green-600">{data.statistiche.allocazioniMOVANACDisponibili}</p>
                </div>
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo Risparmiato</p>
                  <p className="text-xl font-bold text-purple-600">{data.statistiche.potenzialeTempoRisparmiato}h</p>
                </div>
                <BarChart3 className="text-purple-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step Contents */}
      {currentStep === 'select' && data && (
        <MovimentiAllocabiliTable 
          movimenti={data.movimentiAllocabili}
          pagination={data.pagination}
          onMovimentoSelect={handleMovimentoSelect}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          loading={loading}
        />
      )}

      {currentStep === 'suggest' && selectedMovimento && (
        <SuggerimentiPanel 
          movimento={selectedMovimento}
          commesseDisponibili={data?.commesseDisponibili || []}
          vociAnalitiche={data?.vociAnalitiche || []}
          onSuggerimentiApply={handleSuggerimentoApply}
          onBack={() => setCurrentStep('select')}
        />
      )}

      {currentStep === 'simulate' && selectedMovimento && (
        <SimulatoreCanvas 
          movimento={selectedMovimento}
          allocazioniIniziali={allocazioniVirtuali}
          commesseDisponibili={data?.commesseDisponibili || []}
          vociAnalitiche={data?.vociAnalitiche || []}
          onSimulazioneComplete={handleSimulazioneComplete}
          onBack={() => setCurrentStep('suggest')}
        />
      )}

      {currentStep === 'validate' && selectedMovimento && (
        <ValidationPreview 
          movimento={selectedMovimento}
          allocazioniVirtuali={allocazioniVirtuali}
          testResults={testResults}
          onTest={handleTestAllocations}
          onBack={() => setCurrentStep('simulate')}
          onRestart={() => {
            setCurrentStep('select');
            setSelectedMovimento(null);
            setAllocazioniVirtuali([]);
            setTestResults(null);
          }}
          loading={loading}
        />
      )}

      {/* Alert informativo */}
      <Alert className="border-orange-200 bg-orange-50">
        <Settings className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Workflow Integrato:</strong> Questo sistema combina i dati reali dei movimenti contabili 
          con suggerimenti intelligenti basati su MOVANAC e regole DETTANAL, permettendo simulazioni 
          complete prima di applicare le allocazioni al sistema principale.
        </AlertDescription>
      </Alert>
    </div>
  );
};