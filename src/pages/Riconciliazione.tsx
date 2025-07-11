import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { ReconciliationResult, runReconciliation } from "@/api/reconciliation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ReconciliationTable } from "@/components/admin/ReconciliationTable";
import { AxiosError } from "axios";

// Type guard per l'errore di Axios
function isAxiosError(error: unknown): error is AxiosError<{ message: string }> {
    return (error as AxiosError<{ message: string }>)?.isAxiosError === true;
}

const Riconciliazione = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReconciliationResult | null>(null);

  const handleRunReconciliation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await runReconciliation();
      setResult(res);
    } catch (err) {
        if (isAxiosError(err)) {
            setError(err.response?.data?.message || err.message);
        } else if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Si è verificato un errore sconosciuto');
        }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuccess = useCallback((rigaId: string) => {
    setResult(prevResult => {
        if (!prevResult) return null;

        const newData = prevResult.data.filter(riga => riga.id !== rigaId);
        const newSummary = {
            ...prevResult.summary,
            needsManualReconciliation: prevResult.summary.needsManualReconciliation - 1,
        };

        return {
            ...prevResult,
            data: newData,
            summary: newSummary,
        };
    });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Riconciliazione Scritture</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Avvia Processo di Riconciliazione</CardTitle>
          <CardDescription>
            Clicca il pulsante per avviare l'analisi delle scritture contabili importate nello staging. 
            Il sistema identificherà le scritture che possono essere allocate automaticamente e quelle che richiedono un intervento manuale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunReconciliation} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Analisi in corso...' : 'Avvia Analisi'}
          </Button>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Risultati dell'Analisi</CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Scritture da Processare</p>
                <p className="text-2xl font-bold">{result.summary.totalScrittureToProcess}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Righe Totali Rilevanti</p>
                <p className="text-2xl font-bold">{result.summary.totalRigheToProcess}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                <p className="text-sm text-green-600 dark:text-green-400">Riconciliate Automaticamente</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{result.summary.reconciledAutomatically}</p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Da Rivedere Manualmente</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{result.summary.needsManualReconciliation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && result.data.length > 0 && (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Righe da Riconciliare Manualmente</CardTitle>
                <CardDescription>
                    Le seguenti righe non hanno potuto essere associate automaticamente. Assegna una commessa e una voce analitica a ciascuna.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReconciliationTable data={result.data} onSaveSuccess={handleSaveSuccess} />
            </CardContent>
        </Card>
      )}

    </div>
  );
};

export default Riconciliazione; 