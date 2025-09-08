import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { PieChart, RefreshCw, TrendingUp } from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface AllocationStatusSectionProps {
  refreshTrigger?: number;
}

export const AllocationStatusSection = ({ refreshTrigger }: AllocationStatusSectionProps) => {
  const { fetchAllocationStatus, getSectionState } = useStagingAnalysis();
  const { loading, error, data, hasData } = getSectionState('allocations');

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchAllocationStatus();
    }
  }, [refreshTrigger, fetchAllocationStatus]);

  useEffect(() => {
    if (!hasData && !loading) {
      fetchAllocationStatus();
    }
  }, [hasData, loading, fetchAllocationStatus]);

  const handleRefresh = () => {
    fetchAllocationStatus();
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
          <p>Calcolando stati di allocazione...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="text-yellow-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Calcolo Stato Allocazione</h3>
            <p className="text-sm text-gray-600">
              Stati di allocazione calcolati direttamente dai dati staging
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Aggiorna
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Non Allocato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {data.allocationsByStatus?.non_allocato || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Parzialmente Allocato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {data.allocationsByStatus?.parzialmente_allocato || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Completamente Allocato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {data.allocationsByStatus?.completamente_allocato || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Alert className="border-yellow-200 bg-yellow-50">
        <TrendingUp className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Calcolo Real-time:</strong> Gli stati sono calcolati interpretando direttamente i dati staging, 
          confrontando allocazioni esistenti con importi delle righe contabili.
        </AlertDescription>
      </Alert>
    </div>
  );
};