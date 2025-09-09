import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Eye, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../new_components/ui/Select';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';
import { Alert, AlertDescription } from '../new_components/ui/Alert';
import { ConfirmDialog } from '../new_components/dialogs/ConfirmDialog';

import { FinalizationMonitor } from '../new_components/dialogs/FinalizationMonitor';
import { ScrittureContabiliMasterDetail } from '../new_components/tables/ScrittureContabiliMasterDetail';

interface StagingStats {
  tableName: string;
  displayName: string;
  recordCount: number;
  lastUpdated: string;
  status: 'pronto' | 'in elaborazione' | 'errore';
  hasErrors?: boolean;
  errorCount?: number;
}

interface StagingRecord {
  id: string;
  createdAt: string;
  status: 'valido' | 'avviso' | 'errore';
  validationErrors?: string[];
  [key: string]: unknown;
}

const STAGING_TABLES = [
  { value: 'staging_conti', label: 'Piano dei Conti', icon: '📊', endpoint: 'conti' },
  { value: 'staging_anagrafiche', label: 'Anagrafiche Clienti/Fornitori', icon: '👥', endpoint: 'anagrafiche' },
  { value: 'staging_causali_contabili', label: 'Causali Contabili', icon: '📋', endpoint: 'causali' },
  { value: 'staging_codici_iva', label: 'Codici IVA', icon: '💰', endpoint: 'codici-iva' },
  { value: 'staging_condizioni_pagamento', label: 'Condizioni Pagamento', icon: '💳', endpoint: 'condizioni-pagamento' },
  { value: 'staging_centri_costo', label: 'Centri di Costo', icon: '🎯', endpoint: 'centri-costo' },
  { value: 'staging_scritture', label: 'Scritture Contabili', icon: '📝', endpoint: 'scritture' },
  { value: 'staging_scritture_master_detail', label: 'Scritture Contabili (Master-Detail)', icon: '🔗', endpoint: 'scritture-complete' },
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
  const [showFinalizationMonitor, setShowFinalizationMonitor] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState({ title: '', description: '' });

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
            status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_conti',
            displayName: 'Piano dei Conti',
            recordCount: data.conti || 0,
            lastUpdated: new Date().toISOString(),
            status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_causali_contabili',
            displayName: 'Causali Contabili',
            recordCount: data.causali || 0,
            lastUpdated: new Date().toISOString(),
            status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_codici_iva',
            displayName: 'Codici IVA',
            recordCount: data.codiciIva || 0,
            lastUpdated: new Date().toISOString(),
            status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_condizioni_pagamento',
            displayName: 'Condizioni Pagamento',
            recordCount: data.condizioniPagamento || 0,
            lastUpdated: new Date().toISOString(),
            status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_centri_costo',
            displayName: 'Centri di Costo',
            recordCount: data.centriCosto || 0,
            lastUpdated: new Date().toISOString(),
            status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_scritture',
            displayName: 'Scritture Contabili',
            recordCount: data.scritture || 0,
            lastUpdated: new Date().toISOString(),
              status: 'pronto' as const,
            hasErrors: false,
            errorCount: 0
          },
          {
            tableName: 'staging_scritture_master_detail',
            displayName: 'Scritture Contabili (Master-Detail)',
            recordCount: data.scritture || 0,
            lastUpdated: new Date().toISOString(),
            status: 'pronto' as const,
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
        title: '⚠️ ATTENZIONE: Finalizzazione Intelligente',
        description: `🔄 IL SISTEMA RILEVERÀ AUTOMATICAMENTE LA MODALITÀ OPERATIVA:

🔧 SETUP INIZIALE (se primo utilizzo):
   • Reset completo del database di produzione
   • Trasferimento completo dati da staging
   • Operazione sicura per inizializzazione

🔄 OPERATIVITÀ CICLICA (se dati utente esistenti):
   • ✅ PRESERVA commesse create manualmente
   • ✅ PRESERVA allocazioni e budget configurati
   • ❌ Aggiorna SOLO dati da importazioni periodiche
   • Protezione automatica dati critici utente

⏱️ Durata stimata: 2-5 minuti
🔒 Processo completamente automatizzato e sicuro

Procedere con la finalizzazione intelligente?`
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
    // Just open the FinalizationMonitor - it will handle starting the process
    // This eliminates the race condition where both components try to start finalization
    setShowFinalizationMonitor(true);
  }, []);

  // Note: Enhanced polling logic moved to FinalizationMonitor component
  // This eliminates race conditions and duplicate SSE connections


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
      header: 'ID',
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
        header: 'Stato',
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
        header: 'Stato',
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
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
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
          <h1 className="text-3xl font-bold text-gray-900">Dati Importati</h1>
          <p className="text-gray-500">Gestione e Visualizzazione dei Dati Importati</p>
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
          <CardTitle>Tabelle</CardTitle>
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
              const isProcessing = stats?.status === 'in elaborazione';

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
            {selectedTable === 'staging_scritture_master_detail' ? (
              <ScrittureContabiliMasterDetail />
            ) : tableData.length > 0 ? (
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