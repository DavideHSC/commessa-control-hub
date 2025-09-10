import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { UnifiedTable } from '../../new_components/tables/UnifiedTable';
import { 
  FileSearch, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  User,
  Building,
  Eye
} from 'lucide-react';
import { apiClient } from '../../api/index';

interface AnagraficaPreviewRecord {
  id: string;
  codiceTestata: string;
  codiceAnagrafica: string | null;
  denominazione: string | null;
  sottocontoCliente: string | null;
  sottocontoFornitore: string | null;
  tipoAnagrafica: 'CLIENTE' | 'FORNITORE';
  hasMatch: boolean;
  testataId: string;
  anagraficaId: string | null;
}

interface AnagrafichePreviewData {
  records: AnagraficaPreviewRecord[];
  totalTestate: number;
  matchedCount: number;
  unmatchedCount: number;
  clientiCount: number;
  fornitoriCount: number;
}

interface AnagrafichePreviewSectionProps {
  refreshTrigger?: number;
}

export const AnagrafichePreviewSection = ({ refreshTrigger }: AnagrafichePreviewSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnagrafichePreviewData | null>(null);
  const [hasData, setHasData] = useState(false);

  // Fetch data function
  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching anagrafiche preview...');
      const response = await apiClient.get('/centro-controllo/anagrafiche-preview');
      
      if (response.data.success) {
        setData(response.data.data);
        setHasData(true);
        console.log('✅ Anagrafiche preview fetched successfully:', response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch anagrafiche preview');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching anagrafiche preview:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchPreview();
    }
  }, [refreshTrigger, fetchPreview]);

  // Load data on mount SOLO una volta
  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (!data?.records) return [];

    return data.records.map((record) => ({
      id: record.id,
      codiceTestata: record.codiceTestata,
      codiceAnagrafica: record.codiceAnagrafica,
      denominazione: record.denominazione,
      sottocontoCliente: record.sottocontoCliente,
      sottocontoFornitore: record.sottocontoFornitore,
      tipoAnagrafica: record.tipoAnagrafica,
      hasMatch: record.hasMatch,
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder
    }));
  }, [data]);

  // Table columns configuration
  const tableColumns = [
    {
      key: 'tipoAnagrafica' as keyof typeof tableData[0],
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
      key: 'codiceTestata' as keyof typeof tableData[0],
      header: 'Codice in Testate',
      sortable: true,
      render: (value: unknown) => {
        const codice = value as string;
        return (
          <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded border">
            {codice}
          </code>
        );
      }
    },
    {
      key: 'codiceAnagrafica' as keyof typeof tableData[0],
      header: 'Codice in Anagrafiche',
      sortable: true,
      render: (value: unknown) => {
        const codice = value as string | null;
        return codice ? (
          <code className="text-sm font-mono bg-green-100 px-2 py-1 rounded border border-green-300">
            {codice}
          </code>
        ) : (
          <span className="text-gray-400 italic">Non trovato</span>
        );
      }
    },
    {
      key: 'denominazione' as keyof typeof tableData[0],
      header: 'Denominazione',
      sortable: true,
      render: (value: unknown) => {
        const denominazione = value as string | null;
        return denominazione ? (
          <span className="font-medium text-gray-900">{denominazione}</span>
        ) : (
          <span className="text-gray-400 italic">N/A</span>
        );
      }
    },
    {
      key: 'sottocontoCliente' as keyof typeof tableData[0],
      header: 'Sottoconto Cliente',
      sortable: true,
      render: (value: unknown) => {
        const sottoconto = value as string | null;
        return sottoconto ? (
          <code className="text-xs bg-blue-50 px-1 py-0.5 rounded">{sottoconto}</code>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    {
      key: 'sottocontoFornitore' as keyof typeof tableData[0],
      header: 'Sottoconto Fornitore',
      sortable: true,
      render: (value: unknown) => {
        const sottoconto = value as string | null;
        return sottoconto ? (
          <code className="text-xs bg-green-50 px-1 py-0.5 rounded">{sottoconto}</code>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    {
      key: 'hasMatch' as keyof typeof tableData[0],
      header: 'Corrispondenza',
      sortable: true,
      render: (value: unknown) => {
        const hasMatch = value as boolean;
        return hasMatch ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 size={12} className="mr-1" />
            Trovato
          </Badge>
        ) : (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Non trovato
          </Badge>
        );
      }
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <FileSearch className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Preview Import Anagrafiche</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Verifica corrispondenza tra testate e anagrafiche staging
              </p>
            </div>
          </div>
          
          <Button 
            onClick={fetchPreview}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Caricamento...' : 'Aggiorna'}</span>
          </Button>
        </div>

        {/* Statistics */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.totalTestate}</div>
              <div className="text-sm text-blue-800">Totale Record</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.matchedCount}</div>
              <div className="text-sm text-green-800">Con Corrispondenza</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{data.unmatchedCount}</div>
              <div className="text-sm text-red-800">Senza Corrispondenza</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.clientiCount}</div>
              <div className="text-sm text-blue-800">Clienti</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.fornitoriCount}</div>
              <div className="text-sm text-green-800">Fornitori</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              Errore durante il caricamento: {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Caricamento preview import anagrafiche...</span>
          </div>
        )}

        {hasData && data && (
          <>
            <div className="mb-4">
              <Alert className="border-orange-200 bg-orange-50">
                <Eye className="h-4 w-4" />
                <AlertDescription className="text-orange-800">
                  <strong>Come leggere la tabella:</strong> Ogni riga mostra un codice anagrafica trovato nelle testate. 
                  La colonna "Corrispondenza" indica se questo codice è stato trovato anche nelle anagrafiche importate. 
                  I record "Non trovato" indicano anagrafiche che dovranno essere create durante l'importazione.
                </AlertDescription>
              </Alert>
            </div>

            <UnifiedTable
              data={tableData}
              columns={tableColumns}
              searchable={true}
              paginated={true}
              className="w-full"
            />
          </>
        )}

        {!hasData && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <FileSearch className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Nessun dato disponibile</p>
            <p className="text-sm">Clicca su "Aggiorna" per caricare i dati</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};