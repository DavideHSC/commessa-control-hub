import React, { useState, useEffect } from 'react';
import { Database as DatabaseIcon, RefreshCw, Users, Building, FileText, Landmark, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportTemplatesAdmin from '@/components/admin/ImportTemplatesAdmin';
import {
  getCommesse,
  getClienti,
  getFornitori,
  getPianoDeiConti,
  getVociAnalitiche,
  getScrittureContabili,
  getCausaliContabili,
  getCodiciIva,
  getCondizioniPagamento,
} from '@/api';
import { ClientiTable } from '@/components/database/ClientiTable';
import { FornitoriTable } from '@/components/database/FornitoriTable';
import { CausaliTable } from '@/components/database/CausaliTable';
import { CodiciIvaTable } from '@/components/database/CodiciIvaTable';
import { CondizioniPagamentoTable } from '@/components/database/CondizioniPagamentoTable';
import { VociAnaliticheTable } from '@/components/database/VociAnaliticheTable';
import { ContiTable } from '@/components/database/ContiTable';
import { CommesseTable } from '@/components/database/CommesseTable';
import { ScrittureTable } from '@/components/database/ScrittureTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TableStats {
  scritture: number;
  commesse: number;
  clienti: number;
  fornitori: number;
  conti: number;
  vociAnalitiche: number;
  causali: number;
  codiciIva: number;
  condizioniPagamento: number;
}

type TableKey = keyof TableStats;

const tableConfig: { key: TableKey; label: string; icon: React.ElementType }[] = [
    { key: 'scritture', label: 'Scritture', icon: FileText },
    { key: 'commesse', label: 'Commesse', icon: Building },
    { key: 'clienti', label: 'Clienti', icon: Users },
    { key: 'fornitori', label: 'Fornitori', icon: Landmark },
    { key: 'conti', label: 'Piano dei Conti', icon: Library },
    { key: 'vociAnalitiche', label: 'Voci Analitiche', icon: Landmark },
    { key: 'causali', label: 'Causali', icon: FileText },
    { key: 'codiciIva', label: 'Codici IVA', icon: Library },
    { key: 'condizioniPagamento', label: 'Condizioni Pagamento', icon: Library },
];

const Database: React.FC = () => {
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableKey>('scritture');

  const fetchCounts = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const results = await Promise.all([
        getScrittureContabili({ limit: 1 }),
        getCommesse({ limit: 1 }),
        getClienti({ limit: 1 }),
        getFornitori({ limit: 1 }),
        getPianoDeiConti({ limit: 1 }),
        getVociAnalitiche({ limit: 1 }),
        getCausaliContabili({ limit: 1 }),
        getCodiciIva({ limit: 1 }),
        getCondizioniPagamento({ limit: 1 }),
      ]);

      setStats({
        scritture: results[0].pagination.total,
        commesse: results[1].pagination.total,
        clienti: results[2].pagination.total,
        fornitori: results[3].pagination.total,
        conti: results[4].pagination.total,
        vociAnalitiche: results[5].pagination.total,
        causali: results[6].pagination.total,
        codiciIva: results[7].pagination.total,
        condizioniPagamento: results[8].pagination.total,
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

  const renderSelectedTable = () => {
    switch (selectedTable) {
        case 'clienti': return <ClientiTable />;
        case 'fornitori': return <FornitoriTable />;
        case 'vociAnalitiche': return <VociAnaliticheTable />;
        case 'conti': return <ContiTable />;
        case 'commesse': return <CommesseTable />;
        case 'scritture': return <ScrittureTable />;
        case 'causali': return <CausaliTable />;
        case 'codiciIva': return <CodiciIvaTable />;
        case 'condizioniPagamento': return <CondizioniPagamentoTable />;
        default: return <p>Seleziona una tabella</p>;
    }
  };

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
            {loading && !stats ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Tabelle</h2>
                    <nav className="flex flex-col space-y-1">
                      {tableConfig.map(table => (
                        <Button
                          key={table.key}
                          variant={selectedTable === table.key ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedTable(table.key)}
                        >
                          <table.icon className="mr-2 h-4 w-4" />
                          <span>{table.label}</span>
                          {stats && (
                            <Badge variant="outline" className="ml-auto">
                              {stats[table.key]}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </nav>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80}>
                  <div className="p-4 h-full overflow-auto">
                    {renderSelectedTable()}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
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
