import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { UnifiedTable } from '../../new_components/tables/UnifiedTable';
import { 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  User,
  Building
} from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface AnagraficheResolutionSectionProps {
  refreshTrigger?: number;
}

export const AnagraficheResolutionSection = ({ refreshTrigger }: AnagraficheResolutionSectionProps) => {
  const { 
    fetchAnagraficheResolution, 
    getSectionState 
  } = useStagingAnalysis();

  const { loading, error, data, hasData } = getSectionState('anagrafiche');

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchAnagraficheResolution();
    }
  }, [refreshTrigger, fetchAnagraficheResolution]);

  // Load data on mount
  useEffect(() => {
    if (!hasData && !loading) {
      fetchAnagraficheResolution();
    }
  }, [hasData, loading, fetchAnagraficheResolution]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (!data?.anagrafiche) return [];

    return data.anagrafiche.map((anagrafica: any, index: number) => ({
      id: `${anagrafica.tipo}-${anagrafica.codiceFiscale}-${index}`,
      tipo: anagrafica.tipo,
      codiceFiscale: anagrafica.codiceFiscale,
      sigla: anagrafica.sigla,
      subcodice: anagrafica.subcodice,
      matchedEntity: anagrafica.matchedEntity,
      matchConfidence: anagrafica.matchConfidence,
      sourceRows: anagrafica.sourceRows,
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder
    }));
  }, [data]);

  // Table columns configuration
  const tableColumns = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      render: (value: 'CLIENTE' | 'FORNITORE') => (
        <Badge 
          variant="secondary" 
          className={value === 'CLIENTE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
        >
          {value === 'CLIENTE' ? <User size={12} className="mr-1" /> : <Building size={12} className="mr-1" />}
          {value}
        </Badge>
      )
    },
    {
      key: 'codiceFiscale',
      header: 'Codice Fiscale',
      sortable: true,
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {value || 'N/A'}
        </code>
      )
    },
    {
      key: 'sigla',
      header: 'Sigla',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value || 'N/A'}</span>
      )
    },
    {
      key: 'matchedEntity',
      header: 'Entità Matchata',
      sortable: false,
      render: (entity: any) => {
        if (!entity) {
          return (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <AlertTriangle size={12} className="mr-1" />
              Non matchata
            </Badge>
          );
        }
        
        return (
          <div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 mb-1">
              <CheckCircle2 size={12} className="mr-1" />
              Matchata
            </Badge>
            <div className="text-xs text-gray-600">{entity.nome}</div>
          </div>
        );
      }
    },
    {
      key: 'matchConfidence',
      header: 'Confidence',
      sortable: true,
      render: (confidence: number) => {
        const percentage = Math.round(confidence * 100);
        const colorClass = confidence >= 0.8 ? 'text-green-600' : 
                          confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600';
        
        return (
          <span className={`font-medium ${colorClass}`}>
            {percentage}%
          </span>
        );
      }
    },
    {
      key: 'sourceRows',
      header: 'Righe Staging',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline" className="text-xs">
          {value} righe
        </Badge>
      )
    }
  ];

  const handleRefresh = () => {
    fetchAnagraficheResolution();
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
            onClick={handleRefresh}
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
      {/* Header con statistiche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Risoluzione Anagrafica Staging</h3>
            <p className="text-sm text-gray-600">
              Interpretazione diretta dei dati staging per identificare clienti e fornitori
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Caricamento...' : 'Aggiorna'}
        </Button>
      </div>

      {/* Statistiche */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Records</p>
                  <p className="text-2xl font-bold">{data.totalRecords}</p>
                </div>
                <Users className="text-gray-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Matchati</p>
                  <p className="text-2xl font-bold text-green-600">{data.matchedRecords}</p>
                </div>
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Non Matchati</p>
                  <p className="text-2xl font-bold text-red-600">{data.unmatchedRecords}</p>
                </div>
                <AlertTriangle className="text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tasso Match</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.totalRecords > 0 
                      ? Math.round((data.matchedRecords / data.totalRecords) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <Users className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Logica Interpretativa:</strong> Questa sezione analizza i dati staging per identificare 
          anagrafiche uniche e tentare il match con entità esistenti nel database, senza creare record fake. 
          La confidence indica la probabilità di match corretto.
        </AlertDescription>
      </Alert>

      {/* Tabella dati */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Anagrafiche Risolte ({tableData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedTable
              data={tableData}
              columns={tableColumns}
              loading={loading}
              emptyMessage="Nessuna anagrafica trovata nei dati staging"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && !hasData && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin mr-3" size={20} />
              <span>Analizzando dati staging anagrafiche...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};