import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { Settings, Play, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface AllocationWorkflowSectionProps {
  refreshTrigger?: number;
}

export const AllocationWorkflowSection = ({ refreshTrigger }: AllocationWorkflowSectionProps) => {
  const { testAllocationWorkflow } = useStagingAnalysis();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [rigaIdentifier, setRigaIdentifier] = useState('TEST001-1');
  const [allocations, setAllocations] = useState([
    {
      commessaExternalId: 'COMMESSA_01',
      voceAnaliticaNome: 'MATERIALI',
      importo: 100
    }
  ]);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testResult = await testAllocationWorkflow({
        rigaScritturaIdentifier: rigaIdentifier,
        proposedAllocations: allocations
      });
      
      setResult(testResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const addAllocation = () => {
    setAllocations([
      ...allocations,
      { commessaExternalId: '', voceAnaliticaNome: '', importo: 0 }
    ]);
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: string, value: any) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    setAllocations(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="text-orange-600" size={24} />
        <div>
          <h3 className="text-lg font-semibold">Test Workflow Allocazione</h3>
          <p className="text-sm text-gray-600">
            Simula il processo di allocazione manuale sui dati staging
          </p>
        </div>
      </div>

      {/* Form di test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurazione Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Identificativo Riga Scrittura
            </label>
            <input
              type="text"
              value={rigaIdentifier}
              onChange={(e) => setRigaIdentifier(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="es. TEST001-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Allocazioni Proposte</label>
              <Button onClick={addAllocation} size="sm" variant="outline">
                + Aggiungi
              </Button>
            </div>
            
            {allocations.map((alloc, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded mb-2">
                <input
                  type="text"
                  value={alloc.commessaExternalId}
                  onChange={(e) => updateAllocation(index, 'commessaExternalId', e.target.value)}
                  placeholder="Commessa ID"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  value={alloc.voceAnaliticaNome}
                  onChange={(e) => updateAllocation(index, 'voceAnaliticaNome', e.target.value)}
                  placeholder="Voce Analitica"
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  value={alloc.importo}
                  onChange={(e) => updateAllocation(index, 'importo', parseFloat(e.target.value) || 0)}
                  placeholder="Importo"
                  className="p-2 border rounded"
                />
                <Button 
                  onClick={() => removeAllocation(index)} 
                  size="sm" 
                  variant="outline"
                  className="text-red-600"
                >
                  Rimuovi
                </Button>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleTest} 
            disabled={loading} 
            className="w-full flex items-center gap-2"
          >
            <Play size={16} />
            {loading ? 'Testando Workflow...' : 'Testa Workflow'}
          </Button>
        </CardContent>
      </Card>

      {/* Risultati */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Errore:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? 
                <CheckCircle className="text-green-600" size={20} /> : 
                <AlertTriangle className="text-red-600" size={20} />
              }
              Risultato Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Successo</p>
                <p className={`font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? 'Sì' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocazioni Virtuali</p>
                <p className="font-bold">{result.virtualAllocations?.length || 0}</p>
              </div>
            </div>

            {result.validations && result.validations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Validazioni</h4>
                <div className="space-y-2">
                  {result.validations.map((validation: any, index: number) => {
                    const IconComponent = validation.severity === 'ERROR' ? AlertTriangle :
                                        validation.severity === 'WARNING' ? AlertTriangle :
                                        validation.passed ? CheckCircle : Info;
                    
                    const colorClass = validation.severity === 'ERROR' ? 'text-red-600' :
                                     validation.severity === 'WARNING' ? 'text-yellow-600' :
                                     validation.passed ? 'text-green-600' : 'text-blue-600';
                    
                    return (
                      <div key={index} className="flex items-start gap-2 p-2 border rounded">
                        <IconComponent size={16} className={colorClass} />
                        <div className="text-sm">
                          <div className="font-medium">{validation.rule}</div>
                          <div className="text-gray-600">{validation.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Alert className="border-orange-200 bg-orange-50">
        <Settings className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Workflow Virtuale:</strong> Questo test simula il processo di allocazione senza 
          creare record reali, permettendo di validare la logica prima dell'applicazione.
        </AlertDescription>
      </Alert>
    </div>
  );
};