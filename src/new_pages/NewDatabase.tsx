import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Database, Trash2, Users, Building, FileText, Landmark, Library, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Alert, AlertDescription } from '../new_components/ui/Alert';
import { ConfirmDialog } from '../new_components/dialogs/ConfirmDialog';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';

interface DatabaseStats {
  tableName: string;
  displayName: string;
  recordCount: number;
  lastUpdated: string;
  icon: string;
  endpoint: string;
}

interface DatabaseRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

const DATABASE_TABLES = [
  { value: 'clienti', label: 'Clienti', icon: '👥', endpoint: 'clienti', tableIcon: Users },
  { value: 'fornitori', label: 'Fornitori', icon: '🏢', endpoint: 'fornitori', tableIcon: Building },
  { value: 'commesse', label: 'Commesse', icon: '📋', endpoint: 'commesse', tableIcon: Building },
  { value: 'scritture', label: 'Scritture Contabili', icon: '📝', endpoint: 'scritture', tableIcon: FileText },
  { value: 'conti', label: 'Piano dei Conti', icon: '📊', endpoint: 'conti', tableIcon: Library },
  { value: 'causali', label: 'Causali Contabili', icon: '📋', endpoint: 'causali', tableIcon: FileText },
  { value: 'codici-iva', label: 'Codici IVA', icon: '💰', endpoint: 'codici-iva', tableIcon: DollarSign },
  { value: 'condizioni-pagamento', label: 'Condizioni Pagamento', icon: '💳', endpoint: 'condizioni-pagamento', tableIcon: CreditCard },
  { value: 'righe-scrittura', label: 'Righe Scrittura', icon: '📄', endpoint: 'righe-scrittura', tableIcon: FileText },
  { value: 'righe-iva', label: 'Righe IVA', icon: '🧾', endpoint: 'righe-iva', tableIcon: DollarSign },
];

export const NewDatabase = () => {
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<DatabaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState({ title: '', description: '' });

  // Fetch database statistics using the existing API
  const fetchDatabaseStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the existing getDatabaseStats function
      const { getDatabaseStats } = await import('../api');
      const data = await getDatabaseStats();
      console.log('Database stats raw:', data);
      
      // Map API response to our format - use correct property names from server/routes/database.ts
      const stats: DatabaseStats[] = [
        {
          tableName: 'clienti',
          displayName: 'Clienti',
          recordCount: typeof data.totaleClienti === 'number' ? data.totaleClienti : (data.totaleClienti?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '👥',
          endpoint: 'clienti'
        },
        {
          tableName: 'fornitori',
          displayName: 'Fornitori',
          recordCount: typeof data.totaleFornitori === 'number' ? data.totaleFornitori : (data.totaleFornitori?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '🏢',
          endpoint: 'fornitori'
        },
        {
          tableName: 'commesse',
          displayName: 'Commesse',
          recordCount: typeof data.totaleCommesse === 'number' ? data.totaleCommesse : (data.totaleCommesse?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '📋',
          endpoint: 'commesse'
        },
        {
          tableName: 'scritture',
          displayName: 'Scritture Contabili',
          recordCount: typeof data.totaleScrittureContabili === 'number' ? data.totaleScrittureContabili : (data.totaleScrittureContabili?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '📝',
          endpoint: 'scritture'
        },
        {
          tableName: 'conti',
          displayName: 'Piano dei Conti',
          recordCount: typeof data.totaleConti === 'number' ? data.totaleConti : (data.totaleConti?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '📊',
          endpoint: 'conti'
        },
        {
          tableName: 'causali',
          displayName: 'Causali Contabili',
          recordCount: typeof data.totaleCausali === 'number' ? data.totaleCausali : (data.totaleCausali?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '📋',
          endpoint: 'causali'
        },
        {
          tableName: 'codici-iva',
          displayName: 'Codici IVA',
          recordCount: typeof data.totaleCodiciIva === 'number' ? data.totaleCodiciIva : (data.totaleCodiciIva?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '💰',
          endpoint: 'codici-iva'
        },
        {
          tableName: 'condizioni-pagamento',
          displayName: 'Condizioni Pagamento',
          recordCount: typeof data.totaleCondizioniPagamento === 'number' ? data.totaleCondizioniPagamento : (data.totaleCondizioniPagamento?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '💳',
          endpoint: 'condizioni-pagamento'
        },
        {
          tableName: 'righe-scrittura',
          displayName: 'Righe Scrittura',
          recordCount: typeof data.totaleRigheScrittura === 'number' ? data.totaleRigheScrittura : (data.totaleRigheScrittura?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '📄',
          endpoint: 'righe-scrittura'
        },
        {
          tableName: 'righe-iva',
          displayName: 'Righe IVA',
          recordCount: typeof data.totaleRigheIva === 'number' ? data.totaleRigheIva : (data.totaleRigheIva?.count || 0),
          lastUpdated: new Date().toISOString(),
          icon: '🧾',
          endpoint: 'righe-iva'
        }
      ];
      
      setDatabaseStats(stats);
    } catch (err) {
      setError('Errore nel caricamento statistiche database');
      console.error('Error fetching database stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch table data
  const fetchTableData = useCallback(async (tableName: string) => {
    if (!tableName) return;
    
    const table = DATABASE_TABLES.find(t => t.value === tableName);
    if (!table) return;
    
    setTableLoading(true);
    try {
      // Use appropriate API endpoints for each table type
      let apiUrl = '';
      switch(table.endpoint) {
        case 'clienti':
        case 'fornitori':
        case 'commesse':
        case 'conti':
        case 'causali':
        case 'codici-iva':
        case 'condizioni-pagamento':
          apiUrl = `/api/${table.endpoint}?limit=100&page=1`;
          break;
        case 'scritture':
          apiUrl = `/api/registrazioni?limit=100&page=1`;
          break;
        case 'righe-scrittura':
        case 'righe-iva':
          // Get data directly from database endpoint since these are not paginated separately  
          apiUrl = `/api/database/`;
          break;
        default:
          apiUrl = `/api/database/${table.endpoint}?limit=100&page=1`;
      }
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const result = await response.json();
        
        // Handle different response formats based on endpoint
        let data: DatabaseRecord[] = [];
        if (table.endpoint === 'righe-scrittura') {
          data = result.righeScrittura || [];
        } else if (table.endpoint === 'righe-iva') {
          data = result.righeIva || [];
        } else {
          data = Array.isArray(result) ? result : (result.data || result.items || []);
        }
        
        // Limit to first 100 records for display
        if (data.length > 100) {
          data = data.slice(0, 100);
        }
        
        console.log(`🔍 Debug ${tableName}: caricati ${data.length} record`);
        setTableData(data);
      }
    } catch (err) {
      console.error(`Error fetching ${tableName} data:`, err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchDatabaseStats();
  }, [fetchDatabaseStats]);

  // Load table data when selection changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, fetchTableData]);

  // Perform the actual clear operation
  const performClearTable = useCallback(async (tableName: string) => {
    const tableInfo = DATABASE_TABLES.find(t => t.value === tableName);
    if (!tableInfo) return;

    try {
      // Use specific API endpoints for clearing each table
      let apiUrl = '';
      const method = 'DELETE';
      
      switch(tableInfo.endpoint) {
        case 'scritture':
          apiUrl = `/api/database/scritture`;
          break;
        case 'codici-iva':
          apiUrl = `/api/database/codici-iva`;
          break;
        case 'condizioni-pagamento':
          apiUrl = `/api/database/condizioni-pagamento`;
          break;
        case 'righe-scrittura':
          apiUrl = `/api/database/righe-scrittura`;
          break;
        case 'righe-iva':
          apiUrl = `/api/database/righe-iva`;
          break;
        default:
          // For tables not yet implemented in database.ts, show not implemented message
          setConfirmMessage({
            title: '⚠️ Funzionalità Non Implementata',
            description: `La funzionalità di eliminazione per la tabella "${tableInfo.label}" non è ancora implementata nel backend.`
          });
          setConfirmAction(null);
          setShowConfirmDialog(true);
          return;
      }
      
      const response = await fetch(apiUrl, { method });
      if (response.ok) {
        setConfirmMessage({
          title: '✅ Eliminazione Completata',
          description: `Tutti i record della tabella "${tableInfo.label}" sono stati eliminati con successo.`
        });
        
        // Refresh stats and clear table view
        fetchDatabaseStats();
        if (selectedTable === tableName) {
          setTableData([]);
        }
      } else {
        const errorText = await response.text();
        setConfirmMessage({
          title: '❌ Errore Eliminazione',
          description: `Errore durante l'eliminazione: ${errorText}`
        });
      }
    } catch (err) {
      console.error('Clear table error:', err);
      setConfirmMessage({
        title: '❌ Errore di Connessione',
        description: 'Errore di connessione durante l\'eliminazione.'
      });
    }
    
    setConfirmAction(null);
    setShowConfirmDialog(true);
  }, [selectedTable, fetchDatabaseStats]);

  // Clear table data with confirmation
  const handleClearTable = useCallback(async (tableName: string) => {
    const tableInfo = DATABASE_TABLES.find(t => t.value === tableName);
    if (!tableInfo) return;
    
    setConfirmMessage({
      title: '🗑️ Conferma Eliminazione',
      description: `⚠️ ATTENZIONE: Stai per eliminare TUTTI i record dalla tabella "${tableInfo.label}".\n\nQuesta operazione è IRREVERSIBILE e cancellerà definitivamente tutti i dati.\n\nSei ASSOLUTAMENTE sicuro di voler procedere?`
    });
    setConfirmAction(() => () => performClearTable(tableName));
    setShowConfirmDialog(true);
  }, [performClearTable]);

  // Generate table columns based on data
  const tableColumns = useCallback(() => {
    if (!selectedTable || !tableData.length) return [];

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

    // Add dynamic columns based on data
    Object.keys(sampleRecord).forEach(key => {
      if (!['id'].includes(key) && sampleRecord[key] !== null) {
        columns.push({
          key: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          render: (value: unknown) => {
            if (value === null || value === undefined || value === '') return '-';
            
            // Format dates
            if (key.includes('At') || key.includes('Date') || key.toLowerCase().includes('data')) {
              try {
                return new Date(String(value)).toLocaleString('it-IT');
              } catch {
                return String(value);
              }
            }
            
            // Format long text
            const str = String(value);
            return str.length > 50 ? str.substring(0, 50) + '...' : str;
          }
        });
      }
    });

    return columns;
  }, [selectedTable, tableData]);

  // Statistics summary
  const totalRecords = databaseStats.reduce((sum, stat) => sum + stat.recordCount, 0);
  const tablesWithData = databaseStats.filter(stat => stat.recordCount > 0).length;
  const totalTables = databaseStats.length;

  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}. Assicurati che il backend sia in esecuzione e che le API siano configurate correttamente.
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
          <h1 className="text-3xl font-bold text-gray-900">Database</h1>
          <p className="text-gray-500">Gestione e visualizzazione dati di produzione</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={fetchDatabaseStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
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
              <Database className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-gray-500">Tabelle Totali</p>
                <p className="text-2xl font-bold text-blue-600">{totalTables}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Tables Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tabelle Database</CardTitle>
          <p className="text-sm text-gray-500">
            Dati di produzione per ogni tipologia
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATABASE_TABLES.map(table => {
              const stats = databaseStats.find(s => s.tableName === table.value);
              const recordCount = stats?.recordCount || 0;
              const TableIcon = table.tableIcon;

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
                    <TableIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{recordCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">record</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchDatabaseStats();
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Aggiorna statistiche"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                      {recordCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearTable(table.value);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Svuota tabella"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
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
                  Dati: {DATABASE_TABLES.find(t => t.value === selectedTable)?.label}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {tableData.length} record visualizzati
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tableData.length > 0 ? (
              <UnifiedTable
                data={tableData}
                columns={tableColumns()}
                loading={tableLoading}
                searchable={true}
                paginated={true}
                emptyMessage={`Nessun dato trovato per ${DATABASE_TABLES.find(t => t.value === selectedTable)?.label}`}
                showActions={false}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nessun dato per questa tabella</p>
                <p className="text-sm mt-1">La tabella è vuota o non esistente</p>
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
              confirmMessage.title.includes('⚠️') || confirmMessage.title.includes('🗑️') ? 'warning' : 
              confirmMessage.title.includes('✅') ? 'success' : 'info'}
        confirmText={confirmAction ? "Elimina Tutto" : "OK"}
        cancelText={confirmAction ? "Annulla" : undefined}
        confirmVariant={confirmMessage.title.includes('🗑️') ? 'destructive' : 'default'}
        onConfirm={confirmAction || (() => {})}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};