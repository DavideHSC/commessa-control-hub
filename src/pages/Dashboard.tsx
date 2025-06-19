import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardData } from '@/api/dashboard';
import { CommessaDashboard, DashboardData } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, Layers, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data) {
    return <div className="text-center text-slate-500">Nessun dato da visualizzare.</div>;
  }

  const { kpi, commesse } = data;

  return (
    <div className="space-y-6">
      <Header />
      <KpiSummary 
        commesseAttive={kpi.commesseAttive}
        ricaviTotali={kpi.ricaviTotali}
        costiTotali={kpi.costiTotali}
        margineLordoMedio={kpi.margineLordoMedio}
      />
      <CommesseTable commesse={commesse} />
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
  <div>
    <h1 className="text-3xl font-bold text-slate-900">Dashboard Commesse</h1>
    <p className="text-slate-600 mt-1">
      Panoramica operativa e analisi di redditività delle commesse.
    </p>
  </div>
);

const KpiSummary = ({ commesseAttive, ricaviTotali, costiTotali, margineLordoMedio }: DashboardData['kpi']) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Commesse Attive</CardTitle>
        <Layers className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{commesseAttive}</div>
        <p className="text-xs text-muted-foreground">Numero di commesse in gestione.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ricavi Totali</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(ricaviTotali)}</div>
        <p className="text-xs text-muted-foreground">Ricavi totali generati.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Costi Totali</CardTitle>
        <TrendingDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(costiTotali)}</div>
        <p className="text-xs text-muted-foreground">Costi totali sostenuti.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Margine Lordo Medio</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatPercent(margineLordoMedio / 100)}</div>
        <p className="text-xs text-muted-foreground">Margine medio di profitto.</p>
      </CardContent>
    </Card>
  </div>
);

const CommesseTable = ({ commesse }: { commesse: CommessaDashboard[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Elenco Commesse</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commessa</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Ricavi</TableHead>
            <TableHead className="text-right">Costi</TableHead>
            <TableHead className="text-right">Margine</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commesse.map(commessa => (
            <TableRow key={commessa.id}>
              <TableCell className="font-medium">{commessa.nome}</TableCell>
              <TableCell>{commessa.cliente.nome}</TableCell>
              <TableCell>{commessa.stato}</TableCell>
              <TableCell className="text-right">{formatCurrency(commessa.ricavi)}</TableCell>
              <TableCell className="text-right">{formatCurrency(commessa.costi)}</TableCell>
              <TableCell className="text-right font-medium">{formatPercent(commessa.margine)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

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
