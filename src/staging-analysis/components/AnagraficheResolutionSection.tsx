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

  // Prepare table data with BUSINESS FOCUS
  const tableData = useMemo(() => {
    if (!data?.anagrafiche) return [];

    return data.anagrafiche.map((anagrafica: any, index: number) => ({
      id: `${anagrafica.tipo}-${anagrafica.codiceCliente}-${index}`,
      tipo: anagrafica.tipo,
      codiceCliente: anagrafica.codiceCliente,
      denominazione: anagrafica.denominazione,
      totaleImporti: anagrafica.totaleImporti,
      sourceRows: anagrafica.sourceRows,
      transazioni: anagrafica.transazioni,
      statusImport: anagrafica.matchedEntity ? 'AGGIORNA' : 'CREA',
      matchedEntity: anagrafica.matchedEntity,
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder
    }));
  }, [data]);

  // Table columns configuration - ANAGRAFICA FOCUS (semplificata)
  const tableColumns = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      render: (value: unknown) => {
        const tipo = value as 'CLIENTE' | 'FORNITORE';
        return (
          <Badge 
            variant="secondary" 
            className={tipo === 'CLIENTE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
          >
            {tipo === 'CLIENTE' ? <User size={12} className="mr-1" /> : <Building size={12} className="mr-1" />}
            {tipo}
          </Badge>
        );
      }
    },
    {
      key: 'codiceCliente',
      header: 'Codice Cliente/Fornitore',
      sortable: true,
      render: (value: unknown) => {
        const codice = value as string;
        return (
          <code className="text-sm font-bold bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {codice}
          </code>
        );
      }
    },
    {
      key: 'denominazione',
      header: 'Denominazione / Ragione Sociale',
      sortable: true,
      render: (value: unknown) => {
        const denominazione = value as string;
        return (
          <div className="max-w-xs break-words overflow-wrap-anywhere whitespace-normal">
            <span className="font-medium text-gray-800 block leading-tight text-sm">{denominazione}</span>
          </div>
        );
      }
    },
    {
      key: 'statusImport',
      header: 'Azione Import',
      sortable: true,
      render: (value: unknown) => {
        const status = value as string;
        const isCreate = status === 'CREA';
        return (
          <Badge 
            variant="secondary" 
            className={isCreate ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}
          >
            {isCreate ? 'Da creare' : 'Aggiorna esistente'}
          </Badge>
        );
      }
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
            <h3 className="text-lg font-semibold">Preview Import Anagrafiche</h3>
            <p className="text-sm text-gray-600">
              Analisi predittiva: cosa verrà creato/aggiornato durante la finalizzazione
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
                  <p className="text-sm text-gray-600">Esistenti</p>
                  <p className="text-2xl font-bold text-blue-600">{data.matchedRecords}</p>
                </div>
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nuove da Creare</p>
                  <p className="text-2xl font-bold text-green-600">{data.unmatchedRecords}</p>
                </div>
                <AlertTriangle className="text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ratio Esistenti</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.totalRecords > 0 
                      ? Math.round((data.matchedRecords / data.totalRecords) * 100)
                      : 0
                    }%
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {data.totalRecords > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round((data.matchedRecords / data.totalRecords) * 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Users className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert informativo */}
      <Alert className="border-green-200 bg-green-50">
        <Users className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Preview Import Anagrafiche:</strong> Questa sezione mostra cosa accadrà durante la finalizzazione. 
          Le anagrafiche vengono estratte dai movimenti contabili, arricchite con denominazioni e importi, 
          e confrontate con il database per determinare se verranno <strong>create nuove</strong> o <strong>aggiornate esistenti</strong>.
          {data && (
            <div className="mt-2 text-sm font-medium">
              📊 <strong>Dataset:</strong> {data.totalRecords} anagrafiche con €{data.anagrafiche?.reduce((sum: number, a: any) => sum + (a.totaleImporti || 0), 0)?.toLocaleString('it-IT') || 0} totali
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Tabella dati */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Preview Import Anagrafiche ({tableData.length})</span>
              <div className="flex gap-2 text-sm font-normal">
                {data && (
                  <>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {data.matchedRecords} esistenti
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {data.unmatchedRecords} nuove
                    </Badge>
                  </>
                )}
              </div>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Anagrafiche estratte dai movimenti contabili con denominazioni ufficiali dalle tabelle anagrafiche
            </p>
          </CardHeader>
          <CardContent>
            <UnifiedTable
              data={tableData}
              columns={tableColumns}
              loading={loading}
              searchable={true}
              paginated={true}
              emptyMessage="Nessuna anagrafica trovata nei dati staging"
              className="min-h-[400px]"
              itemsPerPage={25}
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