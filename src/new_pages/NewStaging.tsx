import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Eye, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../new_components/ui/Select';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';
import { Alert, AlertDescription } from '../new_components/ui/Alert';
import { ConfirmDialog } from '../new_components/dialogs/ConfirmDialog';
import { ProgressDialog } from '../new_components/dialogs/ProgressDialog';
import { FinalizationMonitor } from '../new_components/dialogs/FinalizationMonitor';

interface StagingStats {
  tableName: string;
  displayName: string;
  recordCount: number;
  lastUpdated: string;
  status: 'ready' | 'processing' | 'error';
  hasErrors?: boolean;
  errorCount?: number;
}

interface StagingRecord {
  id: string;
  createdAt: string;
  status: 'valid' | 'warning' | 'error';
  validationErrors?: string[];
  [key: string]: unknown;
}

const STAGING_TABLES = [
  { value: 'staging_conti', label: 'Piano dei Conti', icon: '📊', endpoint: 'conti' },
  { value: 'staging_anagrafiche', label: 'Anagrafiche Clienti/Fornitori', icon: '👥', endpoint: 'anagrafiche' },
  { value: 'staging_causali_contabili', label: 'Causali Contabili', icon: '📋', endpoint: 'causali' },
  { value: 'staging_codici_iva', label: 'Codici IVA', icon: '💰', endpoint: 'codici-iva' },
  { value: 'staging_condizioni_pagamento', label: 'Condizioni Pagamento', icon: '💳', endpoint: 'condizioni-pagamento' },
  { value: 'staging_scritture', label: 'Scritture Contabili', icon: '📝', endpoint: 'scritture' },
];

export const NewStaging = () => {
  const [stagingStats, setStagingStats] = useState<StagingStats[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<StagingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showFinalizationMonitor, setShowFinalizationMonitor] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState({ title: '', description: '' });
  const [progressSteps, setProgressSteps] = useState<Array<{id: string; label: string; status: 'pending' | 'running' | 'completed' | 'error'; description: string}>>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Fetch staging statistics
  const fetchStagingStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/staging/stats');
      if (response.ok) {
        const data = await response.json();
        // Convert backend format to frontend format
        const stats = [
          {
            tableName: 'staging_anagrafiche',
            displayName: 'Anagrafiche Clienti/Fornitori', 
            recordCount: data.anagrafiche || 0,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_conti',
            displayName: 'Piano dei Conti',
            recordCount: data.conti || 0,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_causali_contabili',
            displayName: 'Causali Contabili',
            recordCount: data.causali || 0,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_codici_iva',
            displayName: 'Codici IVA',
            recordCount: data.codiciIva || 0,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_condizioni_pagamento',
            displayName: 'Condizioni Pagamento',
            recordCount: data.condizioniPagamento || 0,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_scritture',
            displayName: 'Scritture Contabili',
            recordCount: data.scritture || 0,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const,
            hasErrors: false,
            errorCount: 0
          }
        ];
        setStagingStats(stats);
      } else {
        setError('Errore nel caricamento statistiche staging');
      }
    } catch (err) {
      setError('Errore di connessione al server');
      console.error('Error fetching staging stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch table data
  const fetchTableData = useCallback(async (tableName: string) => {
    if (!tableName) return;
    
    const table = STAGING_TABLES.find(t => t.value === tableName);
    if (!table) return;
    
    setTableLoading(true);
    try {
      // Request all records by setting a very high limit
      const response = await fetch(`/api/staging/${table.endpoint}?limit=50000&page=1`);
      if (response.ok) {
        const result = await response.json();
        // The API returns { data: [...], pagination: {...} }
        const data = result.data || [];
        console.log(`🔍 Debug ${tableName}: caricati ${data.length} record su ${result.pagination?.total || 'sconosciuto'} totali`);
        setTableData(data);
      }
    } catch (err) {
      console.error(`Error fetching ${tableName} data:`, err);
    } finally {
      setTableLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchStagingStats();
  }, [fetchStagingStats]);

  // Cleanup SSE connections on unmount
  useEffect(() => {
    return () => {
      // This will be handled by the polling cleanup function
    };
  }, []);

  // Load table data when selection changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, fetchTableData]);

  // Handle single table finalization
  const handleSingleTableFinalize = useCallback(async (tableName: string) => {
    try {
      const endpoint = `/api/staging/${tableName}/finalize`;
      const response = await fetch(endpoint, { method: 'POST' });
      
      if (response.ok) {
        // Show success with proper dialog
        setConfirmMessage({
          title: '✅ Finalizzazione Completata',
          description: 'La finalizzazione è stata completata con successo!'
        });
        setConfirmAction(null);
        setShowConfirmDialog(true);
        
        fetchStagingStats();
        if (selectedTable === tableName) {
          setTableData([]);
        }
      } else {
        // Show error with proper dialog
        setConfirmMessage({
          title: 'Errore Finalizzazione',
          description: 'Si è verificato un errore durante la finalizzazione.'
        });
        setConfirmAction(null);
        setShowConfirmDialog(true);
      }
    } catch (err) {
      console.error('Finalization error:', err);
      setConfirmMessage({
        title: 'Errore di Connessione',
        description: 'Errore di connessione durante la finalizzazione'
      });
      setConfirmAction(null);
      setShowConfirmDialog(true);
    }
  }, [fetchStagingStats, selectedTable]);

  // Finalize staging data with proper dialog confirmations
  const handleFinalize = useCallback(async (tableName?: string) => {
    if (!tableName) {
      // Show "Finalize All" confirmation dialog
      setConfirmMessage({
        title: 'ATTENZIONE: Finalizzazione Completa',
        description: `Finalizzare TUTTI i dati comporta:

1. Eliminazione di TUTTI i dati di produzione esistenti
2. Trasferimento di TUTTI i dati da staging a produzione
3. Processo irreversibile che può richiedere diversi minuti

Sei ASSOLUTAMENTE sicuro di voler procedere?`
      });
      setConfirmAction(() => () => {
        setShowFinalizationMonitor(true);
      });
      setShowConfirmDialog(true);
    } else {
      // Single table finalization confirmation
      const tableLabel = STAGING_TABLES.find(t => t.value === tableName)?.label;
      setConfirmMessage({
        title: 'Conferma Finalizzazione',
        description: `Sei sicuro di voler finalizzare i dati di ${tableLabel}?`
      });
      setConfirmAction(() => () => handleSingleTableFinalize(tableName));
      setShowConfirmDialog(true);
    }
  }, [handleSingleTableFinalize]);

  // Complex finalize all with proper progress dialog
  const handleFinalizeAll = useCallback(async () => {
    try {
      // Start the finalization process
      const response = await fetch('/api/staging/finalize', { method: 'POST' });
      
      if (!response.ok) {
        const errorText = await response.text();
        setConfirmMessage({
          title: '❌ Errore Avvio Processo',
          description: `Errore nell'avvio del processo: ${errorText}`
        });
        setConfirmAction(null);
        setShowConfirmDialog(true);
        return;
      }

      // Setup progress dialog with all finalization steps
      const steps = [
        { id: 'clean_slate', label: 'Eliminazione dati esistenti', status: 'pending' as const, description: 'Pulizia dati di produzione' },
        { id: 'anagrafiche', label: 'Finalizzazione Anagrafiche', status: 'pending' as const, description: 'Clienti e Fornitori' },
        { id: 'causali', label: 'Finalizzazione Causali', status: 'pending' as const, description: 'Causali Contabili' },
        { id: 'codici_iva', label: 'Finalizzazione Codici IVA', status: 'pending' as const, description: 'Codici e aliquote IVA' },
        { id: 'condizioni_pagamento', label: 'Finalizzazione Pagamenti', status: 'pending' as const, description: 'Condizioni di Pagamento' },
        { id: 'conti', label: 'Finalizzazione Piano dei Conti', status: 'pending' as const, description: 'Struttura contabile' },
        { id: 'scritture', label: 'Finalizzazione Scritture', status: 'pending' as const, description: 'Movimenti contabili' },
        { id: 'righe_iva', label: 'Finalizzazione Righe IVA', status: 'pending' as const, description: 'Dettagli IVA' },
        { id: 'allocazioni', label: 'Finalizzazione Allocazioni', status: 'pending' as const, description: 'Allocazioni costi' },
      ];
      
      setProgressSteps(steps);
      setCurrentProgress(0);
      setShowProgressDialog(true);

      // Start polling for progress
      startProgressPolling();
      
    } catch (err) {
      console.error('Finalization error:', err);
      setConfirmMessage({
        title: '❌ Errore di Connessione',
        description: 'Errore di connessione durante l\'avvio del processo di finalizzazione'
      });
      setConfirmAction(null);
      setShowConfirmDialog(true);
    }
  }, []);

  // Enhanced polling with real-time step tracking via SSE
  const startProgressPolling = useCallback(() => {
    const attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let eventSource: EventSource | null = null;
    
    // Setup Server-Sent Events for real-time updates
    try {
      eventSource = new EventSource('/api/staging/events');
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔄 Finalizzazione SSE:', data);
          
          // Update progress steps based on server events
          setProgressSteps(current => 
            current.map(step => {
              if (step.id === data.step) {
                return {
                  ...step,
                  status: data.status || 'running',
                  description: data.message || step.description
                };
              }
              return step;
            })
          );
          
          // Update progress percentage
          if (data.progress !== undefined) {
            setCurrentProgress(data.progress);
          }
          
          // Handle completion
          if (data.step === 'end') {
            setCurrentProgress(100);
            setShowProgressDialog(false);
            eventSource?.close();
            
            setConfirmMessage({
              title: '✅ Finalizzazione Completata',
              description: 'Tutti i dati sono stati trasferiti con successo dalle tabelle di staging a quelle di produzione.'
            });
            setConfirmAction(null);
            setShowConfirmDialog(true);
            
            fetchStagingStats();
            setSelectedTable('');
            setTableData([]);
            return;
          }
          
          // Handle errors
          if (data.step === 'error') {
            setShowProgressDialog(false);
            eventSource?.close();
            
            setConfirmMessage({
              title: 'Errore Finalizzazione',
              description: `Errore durante il processo: ${data.message}`
            });
            setConfirmAction(null);
            setShowConfirmDialog(true);
            return;
          }
          
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource?.close();
        
        // Fallback to simple polling
        startFallbackPolling();
      };
      
    } catch (sseError) {
      console.error('SSE Setup Error:', sseError);
      // Fallback to simple polling
      startFallbackPolling();
    }
    
    // Cleanup function
    return () => {
      eventSource?.close();
    };
  }, [fetchStagingStats]);

  // Fallback polling function when SSE fails - declared before use
  const startFallbackPolling = useCallback(() => {
    const poll = async () => {
      let attempts = 0;
      try {
        const statsResponse = await fetch('/api/staging/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          const totalRecords = Object.values(stats).reduce((sum: number, count: unknown) => sum + Number(count || 0), 0);
          
          // Update progress based on remaining records
          const progressPercentage = Math.min(95, Math.max(10, 100 - (Number(totalRecords) / 100)));
          setCurrentProgress(progressPercentage);
          
          if (totalRecords === 0) {
            setCurrentProgress(100);
            setProgressSteps(current => 
              current.map(step => ({ ...step, status: 'completed' as const }))
            );
            
            setTimeout(() => {
              setShowProgressDialog(false);
              setConfirmMessage({
                title: '✅ Finalizzazione Completata',
                description: 'Tutti i dati di staging sono stati finalizzati con successo nella banca dati di produzione.'
              });
              setConfirmAction(null);
              setShowConfirmDialog(true);
              
              fetchStagingStats();
              setSelectedTable('');
              setTableData([]);
            }, 1000);
            return;
          }
        }
        
        if (attempts < 60) { // Max 5 minutes
          setTimeout(poll, 5000);
        } else {
          setShowProgressDialog(false);
          setConfirmMessage({
            title: '⏰ Timeout Finalizzazione',
            description: 'Il processo di finalizzazione sta impiegando più tempo del previsto. Controlla manualmente lo stato.'
          });
          setConfirmAction(null);
          setShowConfirmDialog(true);
        }
        
      } catch (error) {
        console.error('Error polling finalization:', error);
        if (attempts < 60) {
          setTimeout(poll, 5000);
        }
      }
      attempts++;
    };
    
    // Start polling
    poll();
  }, [fetchStagingStats]);

  // Emergency reset function
  const handleEmergencyReset = useCallback(async () => {
    setConfirmMessage({
      title: '🚨 Reset Emergenza',
      description: 'Questo resetterà il flag di finalizzazione bloccato.\n\nUsa solo se il processo è rimasto appeso.\n\nVuoi procedere?'
    });
    setConfirmAction(() => async () => {
      try {
        const response = await fetch('/api/staging/reset-finalization-flag', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
          setConfirmMessage({
            title: '✅ Reset Completato',
            description: result.message
          });
        } else {
          setConfirmMessage({
            title: '❌ Errore Reset',
            description: result.message
          });
        }
        setConfirmAction(null);
        setShowConfirmDialog(true);
      } catch (error) {
        setConfirmMessage({
          title: '❌ Errore Reset',
          description: 'Errore di connessione durante il reset.'
        });
        setConfirmAction(null);
        setShowConfirmDialog(true);
      }
    });
    setShowConfirmDialog(true);
  }, []);

  // Perform the actual clear operation
  const performClear = useCallback(async (tableName: string) => {
    try {
      const response = await fetch(`/api/staging/${tableName}`, { method: 'DELETE' });
      if (response.ok) {
        setConfirmMessage({
          title: '✅ Eliminazione Completata',
          description: 'Tutti i dati sono stati eliminati con successo.'
        });
        setConfirmAction(null);
        setShowConfirmDialog(true);
        
        fetchStagingStats();
        if (selectedTable === tableName) {
          setTableData([]);
        }
      } else {
        setConfirmMessage({
          title: '❌ Errore Eliminazione',
          description: 'Si è verificato un errore durante l\'eliminazione.'
        });
        setConfirmAction(null);
        setShowConfirmDialog(true);
      }
    } catch (err) {
      console.error('Clear error:', err);
      setConfirmMessage({
        title: '❌ Errore di Connessione',
        description: 'Errore di connessione durante l\'eliminazione.'
      });
      setConfirmAction(null);
      setShowConfirmDialog(true);
    }
  }, [fetchStagingStats, selectedTable]);

  // Clear staging data with proper confirmation
  const handleClear = useCallback(async (tableName: string) => {
    const tableLabel = STAGING_TABLES.find(t => t.value === tableName)?.label;
    
    setConfirmMessage({
      title: '🗑️ Conferma Eliminazione',
      description: `Sei sicuro di voler eliminare tutti i dati di ${tableLabel}?\n\nQuesta operazione non può essere annullata.`
    });
    setConfirmAction(() => () => performClear(tableName));
    setShowConfirmDialog(true);
  }, [performClear]);

  // Table columns based on selected table
  const tableColumns = useMemo(() => {
    if (!selectedTable || !tableData.length) return [];

    // Get sample record to determine columns
    const sampleRecord = tableData[0];
    const columns = [];

    // Add ID column
    columns.push({
      key: 'id' as const,
      label: 'ID',
      render: (id: unknown) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {String(id).substring(0, 8)}...
        </code>
      )
    });

    // Add status column only if status field exists
    if (Object.prototype.hasOwnProperty.call(sampleRecord, 'status')) {
      columns.push({
        key: 'status' as const,
        label: 'Stato',
        render: (status: unknown) => {
          const statusStr = status as string;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusStr === 'valid' ? 'bg-green-100 text-green-800' :
              statusStr === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {statusStr === 'valid' ? 'Valido' :
               statusStr === 'warning' ? 'Warning' : 'Errore'}
            </span>
          );
        }
      });
    } else {
      // Add a default "Imported" status since data is in staging
      columns.push({
        key: 'imported_status' as const,
        label: 'Stato',
        render: () => (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Importato
          </span>
        )
      });
    }

    // Add ALL dynamic columns based on data (except system fields)
    Object.keys(sampleRecord).forEach(key => {
      if (!['id', 'status', 'imported_status'].includes(key)) {
        columns.push({
          key: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          render: (value: unknown) => {
            if (value === null || value === undefined || value === '') return '-';
            
            // Special formatting for dates
            if (key.includes('At') || key.includes('Date')) {
              try {
                return new Date(String(value)).toLocaleString('it-IT');
              } catch {
                return String(value);
              }
            }
            
            const str = String(value);
            return str.length > 50 ? str.substring(0, 50) + '...' : str;
          }
        });
      }
    });

    return columns;
  }, [selectedTable, tableData]);

  // Statistics summary
  const totalRecords = stagingStats.reduce((sum, stat) => sum + stat.recordCount, 0);
  const tablesWithData = stagingStats.filter(stat => stat.recordCount > 0).length;
  const tablesWithErrors = stagingStats.filter(stat => stat.hasErrors).length;

  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Assicurati che il backend sia in esecuzione e che l'API staging sia configurata correttamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staging</h1>
          <p className="text-gray-500">Dati provvisori importati in attesa di finalizzazione</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={fetchStagingStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleEmergencyReset}
            className="text-orange-600 hover:text-orange-700"
          >
            🚨 Reset Flag
          </Button>
          <Button 
            onClick={() => handleFinalize()}
            disabled={totalRecords === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizza Tutto
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Record Totali</p>
                <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
              </div>
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tabelle con Dati</p>
                <p className="text-2xl font-bold text-green-600">{tablesWithData}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tabelle con Errori</p>
                <p className="text-2xl font-bold text-red-600">{tablesWithErrors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staging Tables Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tabelle Staging</CardTitle>
          <p className="text-sm text-gray-500">
            Dati importati per ogni tipologia di tracciato
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAGING_TABLES.map(table => {
              const stats = stagingStats.find(s => s.tableName === table.value);
              const recordCount = stats?.recordCount || 0;
              const hasErrors = stats?.hasErrors || false;
              const isProcessing = stats?.status === 'processing';

              return (
                <div 
                  key={table.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTable === table.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedTable(table.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{table.icon}</span>
                      <h3 className="font-semibold text-gray-900 text-sm">{table.label}</h3>
                    </div>
                    {hasErrors && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {isProcessing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{recordCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">record</p>
                    </div>
                    
                    {recordCount > 0 && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalize(table.value);
                          }}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClear(table.value);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {stats?.lastUpdated && (
                    <p className="text-xs text-gray-400 mt-2">
                      Aggiornato: {new Date(stats.lastUpdated).toLocaleString('it-IT')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table Data Viewer */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Dati: {STAGING_TABLES.find(t => t.value === selectedTable)?.label}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {tableData.length} record visualizzati
                </p>
              </div>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGING_TABLES.map(table => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.icon} {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {tableData.length > 0 ? (
              <UnifiedTable
                data={tableData}
                columns={tableColumns}
                loading={tableLoading}
                searchable={true}
                paginated={true}
                emptyMessage={`Nessun dato trovato per ${STAGING_TABLES.find(t => t.value === selectedTable)?.label}`}
                showActions={false}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nessun dato in staging per questa tabella</p>
                <p className="text-sm mt-1">Importa dei file per vedere i dati qui</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={confirmMessage.title}
        description={confirmMessage.description}
        type={confirmMessage.title.includes('❌') ? 'error' : 
              confirmMessage.title.includes('⚠️') ? 'warning' : 
              confirmMessage.title.includes('✅') ? 'success' : 'info'}
        confirmText={confirmAction ? "Procedi" : "OK"}
        cancelText={confirmAction ? "Annulla" : undefined}
        confirmVariant={confirmMessage.title.includes('⚠️') || confirmMessage.title.includes('🗑️') ? 'destructive' : 'default'}
        onConfirm={confirmAction || (() => {})}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Progress Dialog with Real-time Updates */}
      <ProgressDialog
        open={showProgressDialog}
        title="🔄 Finalizzazione in Corso"
        description={`Il processo di finalizzazione è in esecuzione e viene monitorato in tempo reale.\n\nProgresso: ${currentProgress}% - Questo può richiedere diversi minuti.\n\n📊 Controlla anche i log del server per dettagli tecnici.`}
        steps={progressSteps}
        progress={currentProgress}
        canClose={false}
      >
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Monitoraggio Real-time Attivo</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Gli aggiornamenti vengono ricevuti direttamente dal server.
            In caso di interruzione, il sistema passerà automaticamente al polling.
          </p>
        </div>
      </ProgressDialog>

      {/* Advanced Finalization Monitor */}
      <FinalizationMonitor
        open={showFinalizationMonitor}
        onOpenChange={setShowFinalizationMonitor}
        onComplete={() => {
          setShowFinalizationMonitor(false);
          // Show success dialog
          setConfirmMessage({
            title: '✅ Finalizzazione Completata',
            description: 'Tutti i dati sono stati trasferiti con successo dalle tabelle di staging a quelle di produzione.\n\nLa dashboard e tutte le funzionalità sono ora disponibili con i nuovi dati.'
          });
          setConfirmAction(null);
          setShowConfirmDialog(true);
          
          // Refresh data
          fetchStagingStats();
          setSelectedTable('');
          setTableData([]);
        }}
        onError={(error) => {
          setShowFinalizationMonitor(false);
          setConfirmMessage({
            title: 'Errore Finalizzazione',
            description: `Si è verificato un errore durante il processo:\n\n${error}\n\nControlla i log del server per maggiori dettagli.`
          });
          setConfirmAction(null);
          setShowConfirmDialog(true);
        }}
      />
    </div>
  );
};