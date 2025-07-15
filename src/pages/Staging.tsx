import React, { useState, useEffect, useMemo } from 'react';
import { Database as DatabaseIcon, RefreshCw, FileText, Users, Library, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import { TabbedViewLayout, TabConfig } from '@/components/layout/TabbedViewLayout';

// Importa le tabelle di staging
import { StagingContiTable } from '@/components/database/StagingContiTable';
import { StagingScrittureTable } from '@/components/database/StagingScrittureTable';
import { StagingAnagraficheTable } from '@/components/database/StagingAnagraficheTable';
import { StagingCausaliTable } from '@/components/database/StagingCausaliTable';
import { StagingCodiciIvaTable } from '@/components/database/StagingCodiciIvaTable';
import { StagingCondizioniPagamentoTable } from '@/components/database/StagingCondizioniPagamentoTable';
import { FinalizationStatus } from '@/components/admin/FinalizationStatus';
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog"


interface StagingStats {
  anagrafiche: number;
  causali: number;
  codiciIva: number;
  condizioniPagamento: number;
  conti: number;
  scritture: number;
}

const StagingPage: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<StagingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const fetchCounts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await apiClient.get<StagingStats>('/staging/stats');
      setStats(data);
    } catch (error) {
      toast({
        title: 'Errore nel caricamento delle statistiche di staging',
        description: 'Impossibile recuperare i conteggi delle tabelle di staging.',
        variant: 'destructive',
      });
      console.error("Errore recupero statistiche staging:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleFinalize = async () => {
    setIsFinalizing(true);
    setShowStatusDialog(true);
    try {
      await apiClient.post('/staging/finalize');
      // Non mostrare toast di successo qui, verrà gestito da onComplete
    } catch (error: any) {
      // Se la chiamata iniziale fallisce (es. pre-check), mostra un errore
      const message = error.response?.data?.message || 'Errore imprevisto avvio finalizzazione.';
      toast({
        title: 'Errore Avvio Finalizzazione',
        description: message,
        variant: 'destructive',
      });
      setIsFinalizing(false);
      setShowStatusDialog(false);
    }
  };

  const onFinalizationComplete = () => {
    toast({
        title: "Finalizzazione Completata!",
        description: "Tutti i Dati Provvisori sono stati trasferiti con successo.",
    });
    setIsFinalizing(false);
    setShowStatusDialog(false);
    fetchCounts(false); // Aggiorna i conteggi in background
  };

  const onFinalizationError = () => {
    toast({
        title: "Errore durante la finalizzazione",
        description: "Si è verificato un errore durante il processo. Controlla la console per i dettagli.",
        variant: 'destructive',
    });
    setIsFinalizing(false);
    setShowStatusDialog(false);
  };


  const stagingTabs: TabConfig[] = useMemo(() => [
    { key: 'scritture', label: 'Scritture', icon: FileText, component: <StagingScrittureTable />, count: stats?.scritture },
    { key: 'conti', label: 'Piano dei Conti', icon: Library, component: <StagingContiTable />, count: stats?.conti },
    { key: 'anagrafiche', label: 'Anagrafiche', icon: Users, component: <StagingAnagraficheTable />, count: stats?.anagrafiche },
    { key: 'causali', label: 'Causali', icon: FileText, component: <StagingCausaliTable />, count: stats?.causali },
    { key: 'codiciIva', label: 'Codici IVA', icon: Library, component: <StagingCodiciIvaTable />, count: stats?.codiciIva },
    { key: 'condizioniPagamento', label: 'Condizioni Pagamento', icon: Landmark, component: <StagingCondizioniPagamentoTable />, count: stats?.condizioniPagamento },
  ], [stats]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <DatabaseIcon className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Dati Provvisori</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={() => fetchCounts()} disabled={loading || isFinalizing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Aggiorna Conteggi
            </Button>

            <Button onClick={handleFinalize} disabled={isFinalizing || loading}>
              {isFinalizing ? 'Finalizzazione in corso...' : 'Avvia Finalizzazione'}
            </Button>
        </div>
      </header>
      <main className="flex-grow p-4">
        <TabbedViewLayout
          tabs={stagingTabs}
          defaultSelectedTab="scritture"
          isLoading={loading && !stats}
        />
      </main>

      <AlertDialog open={showStatusDialog} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-2xl">
            <FinalizationStatus 
                onComplete={onFinalizationComplete}
                onError={onFinalizationError}
            />
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default StagingPage; 