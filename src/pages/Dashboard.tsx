import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardData } from '@/api/dashboard';
import { CommessaDashboard, DashboardData } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Errore nel caricamento dei dati della dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <div className="text-center text-slate-500">Nessun dato da visualizzare.</div>;
  }

  const { totaleGenerale, commesse } = data;

  return (
    <div className="space-y-6">
      <Header />
      <TotalSummary 
        budget={totaleGenerale.budget}
        consuntivo={totaleGenerale.consuntivo}
        scostamento={totaleGenerale.scostamento}
      />
      <CommesseSection commesse={commesse} />
    </div>
  );
};

const Header = () => (
  <div>
    <h1 className="text-3xl font-bold text-slate-900">Dashboard di Controllo</h1>
    <p className="text-slate-600 mt-1">
      Analisi aggregata di budget e consuntivo per tutte le commesse.
    </p>
  </div>
);

const ScostamentoIcon = ({ scostamento }: { scostamento: number }) => {
  if (scostamento > 0) return <ArrowDown className="h-4 w-4 text-emerald-600" />;
  if (scostamento < 0) return <ArrowUp className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-slate-500" />;
};

const TotalSummary = ({ budget, consuntivo, scostamento }: { budget: number; consuntivo: number; scostamento: number }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget Totale</CardTitle>
        <span className="text-slate-500">📈</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
        <p className="text-xs text-slate-500">Importo totale previsto a budget.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Consuntivo Totale</CardTitle>
        <span className="text-slate-500">💸</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(consuntivo)}</div>
        <p className="text-xs text-slate-500">Costi e ricavi totali registrati.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Scostamento Totale</CardTitle>
        <ScostamentoIcon scostamento={scostamento} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", scostamento > 0 ? "text-emerald-600" : "text-red-600")}>
          {formatCurrency(scostamento)}
        </div>
        <p className="text-xs text-slate-500">Differenza tra budget e consuntivo.</p>
      </CardContent>
    </Card>
  </div>
);

const CommesseSection = ({ commesse }: { commesse: CommessaDashboard[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Dettaglio Commesse</CardTitle>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible className="w-full">
        {commesse.map(commessa => (
          <AccordionItem value={commessa.commessaId} key={commessa.commessaId}>
            <AccordionTrigger>
              <div className="flex justify-between items-center w-full pr-4">
                <span className="font-semibold text-lg">{commessa.commessaNome}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className={cn(commessa.scostamento >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatCurrency(commessa.scostamento)}
                  </span>
                  <Progress value={commessa.avanzamentoPercentuale} className="w-32" />
                  <span>{commessa.avanzamentoPercentuale.toFixed(2)}%</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voce Analitica</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Consuntivo</TableHead>
                    <TableHead className="text-right">Scostamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commessa.dettagli.map(d => (
                    <TableRow key={d.voceAnaliticaId}>
                      <TableCell>{d.voceAnaliticaNome}</TableCell>
                      <TableCell className="text-right">{formatCurrency(d.budget)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(d.consuntivo)}</TableCell>
                      <TableCell className={cn("text-right font-medium", d.scostamento >= 0 ? 'text-emerald-700' : 'text-red-700')}>
                        {formatCurrency(d.scostamento)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div>
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-5 w-1/2 mt-2" />
    </div>
    {/* Total Summary Skeleton */}
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
      </Card>
    </div>
    {/* Commesse Section Skeleton */}
    <Card>
      <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4 space-y-2">
            <Skeleton className="h-6 w-full" />
        </div>
        <div className="border rounded-md p-4 space-y-2">
            <Skeleton className="h-6 w-full" />
        </div>
        <div className="border rounded-md p-4 space-y-2">
            <Skeleton className="h-6 w-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Dashboard;
