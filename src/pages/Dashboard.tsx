import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardData } from '@/api';
import { Badge } from '@/components/ui/badge';
import type { CommessaDashboard, DashboardData } from '../../types';
import { AlertCircle, BarChart3, Activity } from 'lucide-react';

// Nuovi componenti layout professionale
import { CompactHeader } from '@/components/dashboard/CompactHeader';
import { MainChartsSection } from '@/components/dashboard/MainChartsSection';
import { SidebarPanel } from '@/components/dashboard/SidebarPanel';
import { HierarchicalCommesseTable } from '@/components/dashboard/HierarchicalCommesseTable';
import { type DashboardFilters } from '@/components/dashboard/FilterControls';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatPercent = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2 }).format(value);
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {},
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Applica i filtri alle commesse - SPOSTATO PRIMA DI useEffect
  const filteredCommesse = useMemo(() => {
    if (!data?.commesse) return [];

    return data.commesse.filter(commessa => {
      // Filtro per ricerca testuale
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesName = commessa.nome.toLowerCase().includes(searchLower);
        const matchesClient = commessa.cliente.nome.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesClient) return false;
      }

      // Filtro per cliente
      if (filters.clienteId && commessa.cliente.id !== filters.clienteId) {
        return false;
      }

      // Filtro per stato
      if (filters.statoCommessa && commessa.stato !== filters.statoCommessa) {
        return false;
      }

      // Filtro per tipo (padre vs figlio)
      if (filters.tipoCommessa) {
        if (filters.tipoCommessa === 'Comune' && !commessa.isParent) return false;
        if (filters.tipoCommessa === 'Attività' && commessa.isParent) return false;
      }

      // Filtro per margine
      if (filters.margineMin !== undefined && commessa.margine < filters.margineMin) {
        return false;
      }
      if (filters.margineMax !== undefined && commessa.margine > filters.margineMax) {
        return false;
      }

      return true;
    });
  }, [data?.commesse, filters]);

  // Usa i clienti dall'API invece di estrarli dalle commesse
  const clientiUnici = useMemo(() => {
    if (!data?.clienti) return [];
    
    // Filtra solo i clienti che hanno commesse (esclude cliente di sistema)
    const clientiConCommesse = data.clienti.filter(cliente => 
      data.commesse.some(commessa => commessa.cliente.id === cliente.id)
    );
    
    return clientiConCommesse.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [data?.clienti, data?.commesse]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err: any) {
        console.error("Errore nel caricamento dei dati della dashboard:", err);
        setError(err.message || 'Si è verificato un errore imprevisto.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Early returns DOPO tutti gli hooks
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data) {
    return <div className="text-center text-slate-500">Nessun dato da visualizzare.</div>;
  }

  const { kpi, commesse, trends } = data;

  return (
    <div className="space-y-6">
      
      {/* Header compatto con KPI inline */}
      <CompactHeader 
        kpi={kpi} 
        filters={filters}
        onFiltersChange={setFilters}
        clienti={clientiUnici}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
      />
      
      {/* Panoramica Commesse - Subito sotto i KPI */}
      <HierarchicalCommesseTable commesse={filteredCommesse} />
      
      {/* Layout principale a 2 colonne: Sidebar + Grafici */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Sidebar sinistra - Statistiche e Alert - 1/4 della larghezza */}
        <div className="lg:col-span-1">
          <SidebarPanel kpi={kpi} commesse={filteredCommesse} />
        </div>
        
        {/* Contenuto principale - Grafici - 3/4 della larghezza */}
        <div className="lg:col-span-3">
          <MainChartsSection trends={trends} kpi={kpi} />
        </div>
        
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-700">Errore di Caricamento</h2>
        <p className="mt-2 text-slate-600">Impossibile caricare i dati della dashboard.</p>
        <p className="mt-1 text-sm text-slate-500">Dettagli: {message}</p>
    </div>
);

const Header = () => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        Dashboard Commesse
      </h1>
      <p className="text-slate-600 mt-1">
        Centro di controllo operativo per l'analisi finanziaria e gestionale delle commesse.
      </p>
    </div>
    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
      <Activity className="h-4 w-4" />
      Aggiornato: {new Date().toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}
    </div>
  </div>
);


const CommesseTable = ({ commesse }: { commesse: CommessaDashboard[] }) => {
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);
  };

  const getMargineColor = (margine: number) => {
    if (margine > 15) return 'text-green-700 bg-green-50';
    if (margine > 5) return 'text-yellow-700 bg-yellow-50';
    if (margine >= 0) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Panoramica Commesse
          </CardTitle>
          <Badge variant="outline">{commesse.length} progetti</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Commessa</TableHead>
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-right">Ricavi</TableHead>
              <TableHead className="font-semibold text-right">Costi</TableHead>
              <TableHead className="font-semibold text-right">Margine</TableHead>
              <TableHead className="font-semibold text-right">Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commesse.map(commessa => (
              <TableRow key={commessa.id} className="hover:bg-slate-50 cursor-pointer">
                <TableCell>
                  <div className="font-medium text-slate-900">{commessa.nome}</div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-600">{commessa.cliente.nome}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={commessa.margine > 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {commessa.stato}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(commessa.ricavi)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(commessa.costi)}
                </TableCell>
                <TableCell className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMargineColor(commessa.margine)}`}>
                    {formatPercent(commessa.margine)}
                  </div>
                </TableCell>
                <TableCell className="text-right text-slate-600">
                  {formatCurrency(commessa.budget)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {commesse.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <div className="text-lg font-medium">Nessuna commessa trovata</div>
            <div className="text-sm">Importa i dati o crea una nuova commessa per iniziare.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-5 w-1/2 mt-2" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <Card>
      <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default Dashboard;
