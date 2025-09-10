import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { CheckCircle, Play, AlertTriangle, Info, Shield } from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface BusinessValidationSectionProps {
  refreshTrigger?: number;
}

export const BusinessValidationSection = ({ refreshTrigger }: BusinessValidationSectionProps) => {
  const { testBusinessValidations } = useStagingAnalysis();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedRules, setSelectedRules] = useState([
    'HIERARCHY_VALIDATION',
    'BUDGET_VALIDATION', 
    'DELETION_SAFETY',
    'STAGING_DATA_INTEGRITY',
    'ALLOCATION_CONSISTENCY'
  ]);

  const [selectedSeverities, setSelectedSeverities] = useState<('ERROR' | 'WARNING' | 'INFO')[]>([
    'ERROR', 'WARNING', 'INFO'
  ]);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      handleTest();
    }
  }, [refreshTrigger]);

  const availableRules = [
    { value: 'HIERARCHY_VALIDATION', label: 'Validazione Gerarchia Commesse' },
    { value: 'BUDGET_VALIDATION', label: 'Validazione Budget' },
    { value: 'DELETION_SAFETY', label: 'Sicurezza Eliminazione' },
    { value: 'STAGING_DATA_INTEGRITY', label: 'Integrità Dati Staging' },
    { value: 'ALLOCATION_CONSISTENCY', label: 'Consistenza Allocazioni' }
  ];

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testResult = await testBusinessValidations({
        validationRules: selectedRules,
        includeSeverityLevels: selectedSeverities
      });
      
      setResult(testResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = (rule: string) => {
    setSelectedRules(prev => 
      prev.includes(rule) 
        ? prev.filter(r => r !== rule)
        : [...prev, rule]
    );
  };

  const toggleSeverity = (severity: 'ERROR' | 'WARNING' | 'INFO') => {
    setSelectedSeverities(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'ERROR': return <AlertTriangle size={16} className="text-red-600" />;
      case 'WARNING': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'INFO': return <Info size={16} className="text-blue-600" />;
      default: return <Info size={16} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-red-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Test Validazione Business</h3>
            <p className="text-sm text-gray-600">
              Applica le validazioni business sui dati staging per verificare integrità
            </p>
          </div>
        </div>
        <Button onClick={handleTest} disabled={loading} variant="outline" size="sm">
          <Play size={16} />
          {loading ? 'Testing...' : 'Esegui Test'}
        </Button>
      </div>

      {/* Configurazione test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regole di Validazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableRules.map((rule) => (
                <label key={rule.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRules.includes(rule.value)}
                    onChange={() => toggleRule(rule.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{rule.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Livelli di Severità</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(['ERROR', 'WARNING', 'INFO'] as const).map((severity) => (
                <label key={severity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSeverities.includes(severity)}
                    onChange={() => toggleSeverity(severity)}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(severity)}
                    <span className="text-sm">{severity}</span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errore */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Errore:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Risultati */}
      {result && (
        <>
          {/* Statistiche */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{result.totalRulesApplied}</p>
                  <p className="text-sm text-gray-600">Regole Applicate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
                  <p className="text-sm text-gray-600">Errori</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{result.warningCount}</p>
                  <p className="text-sm text-gray-600">Warning</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.infoCount}</p>
                  <p className="text-sm text-gray-600">Info</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista validazioni */}
          <Card>
            <CardHeader>
              <CardTitle>
                Risultati Validazione ({result.validationResults?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.validationResults?.map((validation: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {validation.passed ? 
                        <CheckCircle size={16} className="text-green-600" /> :
                        getSeverityIcon(validation.severity)
                      }
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{validation.rule}</p>
                          <p className="text-sm text-gray-600 mt-1">{validation.message}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            variant="secondary" 
                            className={getSeverityColor(validation.severity)}
                          >
                            {validation.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center">
              <Shield className="animate-pulse mr-3" size={24} />
              <span>Eseguendo validazioni business...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert className="border-red-200 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Validazioni Business:</strong> Queste validazioni riutilizzano la logica esistente 
          del sistema per verificare l'integrità dei dati e prevenire inconsistenze.
        </AlertDescription>
      </Alert>
    </div>
  );
};