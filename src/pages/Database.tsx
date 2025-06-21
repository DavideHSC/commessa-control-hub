import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Database as DatabaseIcon, RefreshCw, Edit, Trash2, Users, Building, FileText, Landmark, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteRegistrazione } from '@/api/registrazioni';
import { useNavigate } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScritturaContabile, Commessa, Cliente, Fornitore, Conto, VoceAnalitica, RigaScrittura, CausaleContabile } from '@/types';
import { CodiceIva } from '@/api/codiciIva';
import { CondizionePagamento } from '@/api/condizioniPagamento';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createCliente, updateCliente, deleteCliente } from '@/api/clienti';
import { createFornitore, updateFornitore, deleteFornitore } from '@/api/fornitori';
import { createVoceAnalitica, deleteVoceAnalitica, updateVoceAnalitica } from '@/api/vociAnalitiche';
import { createConto, deleteConto, updateConto } from '@/api/conti';
import { createCommessa, deleteCommessa, updateCommessa } from '@/api/commesse';
import { createCausale, deleteCausale, updateCausale } from '@/api/causali';
import { createCodiceIva, deleteCodiceIva, updateCodiceIva } from '@/api/codiciIva';
import { createCondizionePagamento, deleteCondizionePagamento, updateCondizionePagamento } from '@/api/condizioniPagamento';
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TipoConto } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportTemplatesAdmin from '@/components/admin/ImportTemplatesAdmin';
import { clearScrittureContabili } from '@/api/database';
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

// Definiamo un'interfaccia aggregata per i dati del database
interface DatabaseData {
  scritture: ScritturaContabile[];
  commesse: Commessa[];
  clienti: Cliente[];
  fornitori: Fornitore[];
  conti: Conto[];
  vociAnalitiche: VoceAnalitica[];
  causali: CausaleContabile[];
  codiciIva: CodiceIva[];
  condizioniPagamento: CondizionePagamento[];
  stats: {
    totaleScrittureContabili: number;
    totaleCommesse: number;
    totaleClienti: number;
    totaleFornitori: number;
    totaleConti: number;
    totaleVociAnalitiche: number;
    totaleCausali: number;
    totaleCodiciIva: number;
    totaleCondizioniPagamento: number;
  };
}

type TableKey = 'scritture' | 'commesse' | 'clienti' | 'fornitori' | 'conti' | 'vociAnalitiche' | 'causali' | 'codiciIva' | 'condizioniPagamento';

const tableConfig: { key: TableKey; label: string; icon: React.ElementType; statsKey: keyof DatabaseData['stats'] }[] = [
    { key: 'scritture', label: 'Scritture', icon: FileText, statsKey: 'totaleScrittureContabili' },
    { key: 'commesse', label: 'Commesse', icon: Building, statsKey: 'totaleCommesse' },
    { key: 'clienti', label: 'Clienti', icon: Users, statsKey: 'totaleClienti' },
    { key: 'fornitori', label: 'Fornitori', icon: Landmark, statsKey: 'totaleFornitori' },
    { key: 'conti', label: 'Piano dei Conti', icon: Library, statsKey: 'totaleConti' },
    { key: 'vociAnalitiche', label: 'Voci Analitiche', icon: Landmark, statsKey: 'totaleVociAnalitiche' },
    { key: 'causali', label: 'Causali', icon: FileText, statsKey: 'totaleCausali' },
    { key: 'codiciIva', label: 'Codici IVA', icon: Library, statsKey: 'totaleCodiciIva' },
    { key: 'condizioniPagamento', label: 'Condizioni Pagamento', icon: Library, statsKey: 'totaleCondizioniPagamento' },
];

const Database: React.FC = () => {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableKey>('scritture');
  const navigate = useNavigate();

  const fetchDatabaseData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const [
        scritture,
        commesse,
        clienti,
        fornitori,
        conti,
        vociAnalitiche,
        causali,
        codiciIva,
        condizioniPagamento
      ] = await Promise.all([
        getScrittureContabili(),
        getCommesse(),
        getClienti(),
        getFornitori(),
        getPianoDeiConti(),
        getVociAnalitiche(),
        getCausaliContabili(),
        getCodiciIva(),
        getCondizioniPagamento(),
      ]);

      setData({
        scritture,
        commesse,
        clienti,
        fornitori,
        conti,
        vociAnalitiche,
        causali,
        codiciIva,
        condizioniPagamento,
        stats: {
          totaleScrittureContabili: scritture.length,
          totaleCommesse: commesse.length,
          totaleClienti: clienti.length,
          totaleFornitori: fornitori.length,
          totaleConti: conti.length,
          totaleVociAnalitiche: vociAnalitiche.length,
          totaleCausali: causali.length,
          totaleCodiciIva: codiciIva.length,
          totaleCondizioniPagamento: condizioniPagamento.length,
        },
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Si è verificato un errore imprevisto.';
      setError(message);
      toast.error('Errore nel caricamento dei dati', { description: message });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const handleDataChange = () => {
    fetchDatabaseData(false); // Ricarica i dati senza mostrare l'indicatore di caricamento principale
  };

  const renderSelectedTable = () => {
    if (!data) return <p>Dati non disponibili.</p>;

    switch (selectedTable) {
        case 'clienti':
            return <ClientiTable data={data.clienti} onDataChange={handleDataChange} />;
        case 'fornitori':
            return <FornitoriTable data={data.fornitori} onDataChange={handleDataChange} />;
        case 'vociAnalitiche':
            return <VociAnaliticheTable data={data.vociAnalitiche} onDataChange={handleDataChange} />;
        case 'conti':
            return <ContiTable data={data.conti} onDataChange={handleDataChange} vociAnalitiche={data.vociAnalitiche} />;
        case 'commesse':
            return <CommesseTable data={data.commesse} onDataChange={handleDataChange} clienti={data.clienti}/>;
        case 'scritture':
             return <ScrittureTable data={data.scritture} onDataChange={handleDataChange} />;
        case 'causali':
            return <CausaliTable data={data.causali} onDataChange={handleDataChange} />;
        case 'codiciIva':
            return <CodiciIvaTable data={data.codiciIva} onDataChange={handleDataChange} />;
        case 'condizioniPagamento':
            return <CondizioniPagamentoTable data={data.condizioniPagamento} onDataChange={handleDataChange} />;
        default:
            return <p>Seleziona una tabella da visualizzare.</p>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <DatabaseIcon className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Amministrazione Database</h1>
        </div>
        <Button onClick={() => fetchDatabaseData()} disabled={loading}>
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
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={20}>
                  <div className="flex h-full flex-col p-4 space-y-2">
                    <h2 className="text-lg font-semibold">Tabelle</h2>
                    {tableConfig.map((table) => (
                      <Button
                        key={table.key}
                        variant={selectedTable === table.key ? 'secondary' : 'ghost'}
                        onClick={() => setSelectedTable(table.key)}
                        className="w-full justify-start"
                      >
                        <table.icon className="mr-2 h-4 w-4" />
                        {table.label}
                        <Badge variant="outline" className="ml-auto">
                          {data?.stats[table.statsKey] ?? 0}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80}>
                  <div className="p-4">
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
