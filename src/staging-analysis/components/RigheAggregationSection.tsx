import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { UnifiedTable } from '../../new_components/tables/UnifiedTable';
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface RigheAggregationSectionProps {
  refreshTrigger?: number;
}

export const RigheAggregationSection = ({ refreshTrigger }: RigheAggregationSectionProps) => {
  const { 
    fetchRigheAggregation, 
    getSectionState 
  } = useStagingAnalysis();

  const { loading, error, data, hasData } = getSectionState('righe');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchRigheAggregation();
    }
  }, [refreshTrigger, fetchRigheAggregation]);

  // Load data on mount
  useEffect(() => {
    if (!hasData && !loading) {
      fetchRigheAggregation();
    }
  }, [hasData, loading, fetchRigheAggregation]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Prepare table data
  const tableData = useMemo(() => {
    if (!data?.scritture) return [];

    return data.scritture.map((scrittura: any) => ({
      id: scrittura.codiceUnivocoScaricamento,
      codiceUnivocoScaricamento: scrittura.codiceUnivocoScaricamento,
      dataRegistrazione: scrittura.dataRegistrazione,
      descrizione: scrittura.descrizione,
      causale: scrittura.causale,
      totaliDare: scrittura.totaliDare,
      totaliAvere: scrittura.totaliAvere,
      isQuadrata: scrittura.isQuadrata,
      allocationStatus: scrittura.allocationStatus,
      righeContabiliCount: scrittura.righeContabili?.length || 0,
      righeIvaCount: scrittura.righeIva?.length || 0,
      allocazioniCount: scrittura.allocazioni?.length || 0,
      righeContabili: scrittura.righeContabili || [],
      righeIva: scrittura.righeIva || [],
      allocazioni: scrittura.allocazioni || [],
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder
    }));
  }, [data]);

  // Table columns configuration
  const tableColumns = [
    {
      key: 'expand',
      header: '',
      sortable: false,
      width: '50px',
      render: (_, record: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(record.id)}
          className="p-1"
        >
          {expandedRows.has(record.id) ? 
            <ChevronDown size={16} /> : 
            <ChevronRight size={16} />
          }
        </Button>
      )
    },
    {
      key: 'codiceUnivocoScaricamento',
      header: 'Codice Scrittura',
      sortable: true,
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
          {value}
        </code>
      )
    },
    {
      key: 'dataRegistrazione',
      header: 'Data',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm">{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'descrizione',
      header: 'Descrizione',
      sortable: true,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'totaliDare',
      header: 'Totale Dare',
      sortable: true,
      render: (value: number) => (
        <div className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'totaliAvere',
      header: 'Totale Avere',
      sortable: true,
      render: (value: number) => (
        <div className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'isQuadrata',
      header: 'Quadratura',
      sortable: true,
      render: (value: boolean) => (
        <Badge 
          variant="secondary" 
          className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {value ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
          {value ? 'OK' : 'KO'}
        </Badge>
      )
    },
    {
      key: 'allocationStatus',
      header: 'Allocazione',
      sortable: true,
      render: (status: string) => {
        const statusConfig = {
          'non_allocato': { color: 'bg-red-100 text-red-800', text: 'Non Allocato' },
          'parzialmente_allocato': { color: 'bg-yellow-100 text-yellow-800', text: 'Parziale' },
          'completamente_allocato': { color: 'bg-green-100 text-green-800', text: 'Completo' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { color: 'bg-gray-100 text-gray-800', text: status };
        
        return (
          <Badge variant="secondary" className={config.color}>
            {config.text}
          </Badge>
        );
      }
    },
    {
      key: 'righeContabiliCount',
      header: 'Dettagli',
      sortable: false,
      render: (_, record: any) => (
        <div className="text-xs text-gray-600">
          <div>{record.righeContabiliCount} righe</div>
          <div>{record.righeIvaCount} IVA</div>
          <div>{record.allocazioniCount} alloc.</div>
        </div>
      )
    }
  ];

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Render expanded row content
  const renderExpandedContent = (record: any) => {
    if (!expandedRows.has(record.id)) return null;

    return (
      <div className="bg-gray-50 p-4 border-t">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Righe Contabili */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText size={16} />
              Righe Contabili ({record.righeContabili.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {record.righeContabili.map((riga: any, index: number) => (
                <div key={index} className="bg-white p-2 rounded border text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{riga.conto || riga.siglaConto}</div>
                      <div className="text-gray-600">{riga.note}</div>
                    </div>
                    <div className="text-right">
                      <div>D: {formatCurrency(riga.importoDare)}</div>
                      <div>A: {formatCurrency(riga.importoAvere)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Righe IVA */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Righe IVA ({record.righeIva.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {record.righeIva.map((riga: any, index: number) => (
                <div key={index} className="bg-white p-2 rounded border text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{riga.codiceIva}</div>
                      <div className="text-gray-600">{riga.contropartita}</div>
                    </div>
                    <div className="text-right">
                      <div>Imp: {formatCurrency(riga.imponibile)}</div>
                      <div>IVA: {formatCurrency(riga.imposta)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocazioni */}
          <div>
            <h4 className="font-medium mb-2">
              Allocazioni ({record.allocazioni.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {record.allocazioni.map((alloc: any, index: number) => (
                <div key={index} className="bg-white p-2 rounded border text-xs">
                  <div className="font-medium">{alloc.centroDiCosto}</div>
                  <div className="text-gray-600">{alloc.parametro}</div>
                  <div className="text-xs text-gray-500">Riga: {alloc.progressivoRigoContabile}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleRefresh = () => {
    fetchRigheAggregation();
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
          <FileText className="text-green-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Aggregazione Righe Contabili</h3>
            <p className="text-sm text-gray-600">
              Aggregazione virtuale dei dati staging per formare scritture complete
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
          {loading ? 'Aggregando...' : 'Aggiorna'}
        </Button>
      </div>

      {/* Statistiche */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scritture Totali</p>
                  <p className="text-2xl font-bold">{data.totalScrittureCount}</p>
                </div>
                <FileText className="text-gray-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quadrate</p>
                  <p className="text-2xl font-bold text-green-600">{data.quadrateScrittureCount}</p>
                </div>
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Non Quadrate</p>
                  <p className="text-2xl font-bold text-red-600">{data.nonQuadrateScrittureCount}</p>
                </div>
                <AlertTriangle className="text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Righe Totali</p>
                  <p className="text-2xl font-bold text-blue-600">{data.totalRigheCount}</p>
                </div>
                <FileText className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert informativo */}
      <Alert className="border-green-200 bg-green-50">
        <FileText className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Aggregazione Virtuale:</strong> Le scritture sono formate aggregando righe staging per codice univoco. 
          La quadratura verifica che dare = avere. Cliccare su una riga per espandere i dettagli.
        </AlertDescription>
      </Alert>

      {/* Tabella dati */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Scritture Aggregate ({tableData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedTable
              data={tableData}
              columns={tableColumns}
              loading={loading}
              emptyMessage="Nessuna scrittura trovata nei dati staging"
              className="min-h-[400px]"
              expandedContent={renderExpandedContent}
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
              <span>Aggregando righe contabili da staging...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};