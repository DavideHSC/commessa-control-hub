import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { Eye, RefreshCw, DollarSign } from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface UserPresentationSectionProps {
  refreshTrigger?: number;
}

export const UserPresentationSection = ({ refreshTrigger }: UserPresentationSectionProps) => {
  const { fetchUserMovements, getSectionState } = useStagingAnalysis();
  const { loading, error, data, hasData } = getSectionState('movements');

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchUserMovements();
    }
  }, [refreshTrigger, fetchUserMovements]);

  useEffect(() => {
    if (!hasData && !loading) {
      fetchUserMovements();
    }
  }, [hasData, loading, fetchUserMovements]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleRefresh = () => {
    fetchUserMovements();
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          <strong>Errore:</strong> {error}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-3">
            Riprova
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (loading && !hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={24} />
          <p>Caricando presentazione movimenti...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="text-purple-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Presentazione Utente</h3>
            <p className="text-sm text-gray-600">
              Rappresentazione user-friendly dei movimenti contabili
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Aggiorna
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Movimenti Totali</p>
                  <p className="text-2xl font-bold">{data.totalMovimenti}</p>
                </div>
                <Eye className="text-gray-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Costi</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(data.costiTotal)}</p>
                </div>
                <DollarSign className="text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ricavi</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(data.ricaviTotal)}</p>
                </div>
                <DollarSign className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Altri</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(data.altroTotal)}</p>
                </div>
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Alert className="border-purple-200 bg-purple-50">
        <Eye className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Presentazione Intelligente:</strong> I movimenti sono presentati in formato user-friendly 
          con classificazione automatica e informazioni arricchite per una migliore comprensione.
        </AlertDescription>
      </Alert>
    </div>
  );
};