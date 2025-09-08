import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../new_components/ui/Card';
import { Button } from '../../../new_components/ui/Button';
import { Badge } from '../../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../../new_components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../new_components/ui/Table';
import { 
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Play,
  Target,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';
import { 
  MovimentoAllocabile, 
  AllocazioneVirtuale,
  AllocationWorkflowTestResponse,
  ValidationResult,
  BudgetImpact,
  ScritturaContabilePreview
} from '../../types/stagingAnalysisTypes';

interface ValidationPreviewProps {
  movimento: MovimentoAllocabile;
  allocazioniVirtuali: AllocazioneVirtuale[];
  testResults: AllocationWorkflowTestResponse | null;
  onTest: () => void;
  onBack: () => void;
  onRestart: () => void;
  loading: boolean;
}

export const ValidationPreview = ({
  movimento,
  allocazioniVirtuali,
  testResults,
  onTest,
  onBack,
  onRestart,
  loading
}: ValidationPreviewProps) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'validations' | 'budget' | 'preview'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getValidationIcon = (validation: ValidationResult) => {
    if (validation.severity === 'ERROR') return AlertTriangle;
    if (validation.severity === 'WARNING') return AlertTriangle;
    return validation.passed ? CheckCircle2 : Info;
  };

  const getValidationColor = (validation: ValidationResult) => {
    if (validation.severity === 'ERROR') return 'text-red-600';
    if (validation.severity === 'WARNING') return 'text-yellow-600';
    return validation.passed ? 'text-green-600' : 'text-blue-600';
  };

  const getOverallValidationStatus = () => {
    if (!testResults) return null;
    
    const hasErrors = testResults.risultatiValidazione.some(v => v.severity === 'ERROR');
    const hasWarnings = testResults.risultatiValidazione.some(v => v.severity === 'WARNING');
    
    if (hasErrors) return { status: 'error', label: 'Errori Critici', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    if (hasWarnings) return { status: 'warning', label: 'Attenzioni', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { status: 'success', label: 'Validazione Superata', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Riepilogo Allocazioni */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users size={20} />
            Riepilogo Allocazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allocazioniVirtuali.map((allocazione, index) => (
              <div key={allocazione.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Users size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{allocazione.commessaNome}</div>
                    <div className="text-sm text-gray-600">{allocazione.voceAnaliticaNome}</div>
                    {allocazione.isFromSuggestion && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs mt-1">
                        {allocazione.suggestionType}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">{formatCurrency(allocazione.importo)}</div>
                  {allocazione.percentuale && (
                    <div className="text-sm text-gray-600">{allocazione.percentuale.toFixed(1)}%</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiche */}
      {testResults && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Allocato</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(testResults.totalAllocatedAmount)}
                  </p>
                </div>
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rimanente</p>
                  <p className={`text-2xl font-bold ${testResults.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(testResults.remainingAmount)}
                  </p>
                </div>
                <TrendingUp className={testResults.remainingAmount < 0 ? 'text-red-400' : 'text-green-400'} size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Allocazioni</p>
                  <p className="text-2xl font-bold text-purple-600">{testResults.allocazioniProcessate.length}</p>
                </div>
                <Users className="text-purple-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo Stimato</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {testResults.riepilogoOperazioni.tempoElaborazioneStimato}min
                  </p>
                </div>
                <Clock className="text-orange-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderValidationsTab = () => (
    <div className="space-y-4">
      {testResults?.risultatiValidazione.length === 0 ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Nessun errore rilevato!</strong> Tutte le validazioni sono state superate con successo.
          </AlertDescription>
        </Alert>
      ) : (
        testResults?.risultatiValidazione.map((validation, index) => {
          const IconComponent = getValidationIcon(validation);
          const colorClass = getValidationColor(validation);
          
          return (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <IconComponent size={20} className={colorClass} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{validation.rule}</span>
                  <Badge 
                    variant="secondary" 
                    className={
                      validation.severity === 'ERROR' ? 'bg-red-100 text-red-800' :
                      validation.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {validation.severity}
                  </Badge>
                </div>
                <p className="text-gray-700">{validation.message}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderBudgetTab = () => (
    <div className="space-y-4">
      {testResults?.budgetImpacts.length === 0 ? (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Nessun impatto significativo sui budget rilevato.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {testResults?.budgetImpacts.map((impact, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{impact.commessaNome}</div>
                    <div className="text-sm text-gray-600">{impact.voceAnaliticaNome}</div>
                  </div>
                  {impact.isOverBudget && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle size={12} className="mr-1" />
                      Over Budget
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Budget Attuale</div>
                    <div className="font-mono">{formatCurrency(impact.budgetAttuale)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Impatto</div>
                    <div className="font-mono">{formatCurrency(impact.impactImporto)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Nuovo Utilizzo</div>
                    <div className={`font-mono ${impact.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {impact.nuovoPercentualeUtilizzo.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        impact.isOverBudget ? 'bg-red-500' : 
                        impact.nuovoPercentualeUtilizzo >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(impact.nuovoPercentualeUtilizzo, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-4">
      {testResults?.previewScritture?.length === 0 ? (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Le scritture contabili verranno generate al momento dell'applicazione delle allocazioni.
          </AlertDescription>
        </Alert>
      ) : (
        testResults?.previewScritture?.map((scrittura, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={20} />
                {scrittura.descrizione}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Conto</TableHead>
                      <TableHead>Denominazione</TableHead>
                      <TableHead className="text-right">Dare</TableHead>
                      <TableHead className="text-right">Avere</TableHead>
                      <TableHead>Commessa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scrittura.righe.map((riga, rigaIndex) => (
                      <TableRow key={rigaIndex}>
                        <TableCell className="font-mono">{riga.contoCodice}</TableCell>
                        <TableCell>{riga.contoDenominazione}</TableCell>
                        <TableCell className="text-right font-mono">
                          {riga.dare ? formatCurrency(riga.dare) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {riga.avere ? formatCurrency(riga.avere) : '-'}
                        </TableCell>
                        <TableCell>
                          {riga.commessaId && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Commessa
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Riga Totali */}
                    <TableRow className="bg-blue-50 font-bold border-t-2 border-blue-200">
                      <TableCell colSpan={2} className="font-bold text-blue-900">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} />
                          TOTALI:
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-blue-900">
                        {formatCurrency(scrittura.totaliDare)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-blue-900">
                        {formatCurrency(scrittura.totaliAvere)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={scrittura.isQuadrata ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {scrittura.isQuadrata ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                          {scrittura.isQuadrata ? 'Quadrata' : 'Sbilanciata'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const validationStatus = getOverallValidationStatus();

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
            <h3 className="text-lg font-semibold">Validazione e Preview</h3>
            <p className="text-sm text-gray-600">
              Movimento: {movimento.testata.numeroDocumento} - {allocazioniVirtuali.length} allocazioni
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {validationStatus && (
            <Badge variant="secondary" className={`${validationStatus.color} ${validationStatus.bgColor}`}>
              {validationStatus.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Test Button */}
      {!testResults && (
        <Card>
          <CardContent className="p-6 text-center">
            <Target size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Avvia Test di Validazione</h3>
            <p className="text-gray-600 mb-4">
              Testa le allocazioni virtuali per verificare la validità e l'impatto sui budget
            </p>
            <Button
              onClick={onTest}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              {loading ? 'Testando...' : 'Avvia Test Completo'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {testResults && (
        <>
          {/* Status Overview */}
          {validationStatus && (
            <Alert className={`${validationStatus.borderColor} ${validationStatus.bgColor}`}>
              <CheckCircle2 className={`h-4 w-4 ${validationStatus.color}`} />
              <AlertDescription className={validationStatus.color}>
                <strong>{validationStatus.label}:</strong> 
                {validationStatus.status === 'success' && ' Tutte le allocazioni sono valide e pronte per l\'applicazione.'}
                {validationStatus.status === 'warning' && ' Sono presenti alcune attenzioni da verificare.'}
                {validationStatus.status === 'error' && ' Sono presenti errori che devono essere risolti.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b">
            {[
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'validations', label: 'Validazioni', icon: CheckCircle2 },
              { id: 'budget', label: 'Impatto Budget', icon: TrendingUp },
              { id: 'preview', label: 'Preview Scritture', icon: FileText }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon size={16} />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {selectedTab === 'overview' && renderOverviewTab()}
            {selectedTab === 'validations' && renderValidationsTab()}
            {selectedTab === 'budget' && renderBudgetTab()}
            {selectedTab === 'preview' && renderPreviewTab()}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onRestart}
          className="flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Ricomincia Workflow
        </Button>
        
        {testResults && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onTest}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              Ripeti Test
            </Button>
            <Button
              disabled={!testResults.success}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Applica Allocazioni
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
