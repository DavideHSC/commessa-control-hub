import React, { useState, useEffect, useMemo } from 'react';
import { Database as DatabaseIcon, RefreshCw, Users, Building, FileText, Landmark, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportTemplatesAdmin from '@/components/admin/ImportTemplatesAdmin';
import { getDatabaseStats } from '@/api';
import { ClientiTable } from '@/components/database/ClientiTable';
import { FornitoriTable } from '@/components/database/FornitoriTable';
import { CausaliTable } from '@/components/database/CausaliTable';
import { CodiciIvaTable } from '@/components/database/CodiciIvaTable';
import { CondizioniPagamentoTable } from '@/components/database/CondizioniPagamentoTable';
import { ContiTable } from '@/components/database/ContiTable';
import { CommesseTable } from '@/components/database/CommesseTable';
import { ScrittureTable } from '@/components/database/ScrittureTable';
import { TabbedViewLayout, TabConfig } from '@/components/layout/TabbedViewLayout';

interface TableStats {
  scritture: number;
  commesse: number;
  clienti: number;
  fornitori: number;
  conti: number;
  causali: number;
  codiciIva: number;
  condizioniPagamento: number;
}

type TableKey = keyof TableStats;

const Database: React.FC = () => {
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const dbStats = await getDatabaseStats();
      setStats({
        scritture: dbStats.totaleScrittureContabili.count,
        commesse: dbStats.totaleCommesse.count,
        clienti: dbStats.totaleClienti.count,
        fornitori: dbStats.totaleFornitori.count,
        conti: dbStats.totaleConti.count,
        causali: dbStats.totaleCausali.count,
        codiciIva: dbStats.totaleCodiciIva.count,
        condizioniPagamento: dbStats.totaleCondizioniPagamento.count,
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Si è verificato un errore imprevisto.';
      toast.error('Errore nel caricamento dei contatori', { description: message });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);
  
  const tableTabs: TabConfig[] = useMemo(() => [
    { key: 'scritture', label: 'Scritture', icon: FileText, component: <ScrittureTable />, count: stats?.scritture },
    { key: 'commesse', label: 'Commesse', icon: Building, component: <CommesseTable />, count: stats?.commesse },
    { key: 'clienti', label: 'Clienti', icon: Users, component: <ClientiTable />, count: stats?.clienti },
    { key: 'fornitori', label: 'Fornitori', icon: Landmark, component: <FornitoriTable />, count: stats?.fornitori },
    { key: 'conti', label: 'Piano dei Conti', icon: Library, component: <ContiTable />, count: stats?.conti },
    { key: 'causali', label: 'Causali', icon: FileText, component: <CausaliTable />, count: stats?.causali },
    { key: 'codiciIva', label: 'Codici IVA', icon: Library, component: <CodiciIvaTable />, count: stats?.codiciIva },
    { key: 'condizioniPagamento', label: 'Condizioni Pagamento', icon: Library, component: <CondizioniPagamentoTable />, count: stats?.condizioniPagamento },
  ], [stats]);


  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <DatabaseIcon className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Amministrazione Database</h1>
        </div>
        <Button onClick={() => fetchCounts()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna Dati
        </Button>
      </header>
      <main className="flex-grow p-4">
        <Tabs defaultValue="data-management">
          <TabsList className="mb-4">
            <TabsTrigger value="data-management">Gestione Dati</TabsTrigger>
            <TabsTrigger value="template-management">Gestione Template Import</TabsTrigger>
          </TabsList>
          <TabsContent value="data-management">
            <TabbedViewLayout 
              tabs={tableTabs}
              defaultSelectedTab="scritture"
              isLoading={loading && !stats}
            />
          </TabsContent>
          <TabsContent value="template-management">
            <ImportTemplatesAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Database;
