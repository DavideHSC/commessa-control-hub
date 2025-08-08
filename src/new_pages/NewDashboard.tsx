import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TrendingUp, TrendingDown, Target, Plus } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Progress } from '../new_components/ui/Progress';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';

interface CommessaWithPerformance {
  id: string;
  nome: string;
  cliente: { nome: string } | null;
  budget: number;
  costi: number;
  ricavi: number;
  margine: number;
  percentualeAvanzamento: number;
  stato: string;
  dataInizio: string;
  dataFine?: string;
}

interface DashboardData {
  commesseAttive: number;
  ricaviTotali: number;
  costiTotali: number;
  margineComplessivo: number;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const KpiCard = ({ title, value, change, icon: Icon, color }: KpiCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  const valueColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className={`text-2xl font-bold mt-2 ${valueColorClasses[color]}`}>
            {value}
          </p>
          {change && (
            <div className={`text-sm mt-1 ${
              change.trend === 'up' ? 'text-green-600' : 
              change.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '→'} {change.value}%
            </div>
          )}
        </div>
        <Icon className="h-8 w-8" />
      </div>
    </div>
  );
};

export const NewDashboard = () => {
  const navigate = useNavigate();
  const [commesse, setCommesse] = useState<CommessaWithPerformance[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch commesse with performance data
        const commesseResponse = await fetch('/api/commesse-performance');
        if (commesseResponse.ok) {
          const commesseData = await commesseResponse.json();
          setCommesse(commesseData.commesse || []);
        }

        // Fetch dashboard stats
        const dashboardResponse = await fetch('/api/dashboard');
        if (dashboardResponse.ok) {
          const dashboardStats = await dashboardResponse.json();
          setDashboardData(dashboardStats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dati');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate KPI data
  const kpiData = useMemo(() => {
    if (!commesse.length || !dashboardData) {
      return {
        commesseAttive: 0,
        ricaviTotali: 0,
        costiTotali: 0,
        margineComplessivo: 0,
      };
    }

    const commesseAttive = commesse.filter(c => c.stato === 'In Corso').length;
    const ricaviTotali = commesse.reduce((acc, c) => acc + (c.ricavi || 0), 0);
    const costiTotali = commesse.reduce((acc, c) => acc + (c.costi || 0), 0);

    return {
      commesseAttive,
      ricaviTotali,
      costiTotali,
      margineComplessivo: dashboardData.margineComplessivo || 0,
    };
  }, [commesse, dashboardData]);

  // Format utilities
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Table columns configuration
  const commesseColumns = useMemo(() => [
    { key: 'nome' as const, label: 'Nome Commessa', sortable: true },
    { 
      key: 'cliente' as const, 
      label: 'Cliente',
      render: (cliente: unknown) => (cliente as { nome: string } | null)?.nome || 'N/A'
    },
    { 
      key: 'budget' as const, 
      label: 'Budget',
      render: (budget: unknown) => formatCurrency(budget as number),
      sortable: true,
    },
    { 
      key: 'costi' as const, 
      label: 'Costi',
      render: (costi: unknown) => formatCurrency(costi as number),
      sortable: true,
    },
    { 
      key: 'margine' as const, 
      label: 'Margine',
      render: (margine: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          typeof margine === 'number' && margine >= 20 
            ? 'bg-green-100 text-green-800' 
            : typeof margine === 'number' && margine >= 10
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {formatPercentage(margine as number)}
        </span>
      ),
      sortable: true,
    },
    { 
      key: 'percentualeAvanzamento' as const, 
      label: 'Avanzamento',
      render: (perc: unknown) => (
        <div className="flex items-center space-x-2">
          <Progress value={perc as number} className="w-16" />
          <span className="text-sm">{formatPercentage(perc as number)}</span>
        </div>
      ),
    },
  ], []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Errore di Connessione</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Assicurati che il server backend sia in esecuzione su porta 3001
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Panoramica performance commesse</p>
        </div>
        <Button onClick={() => navigate('/new/commesse')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuova Commessa
        </Button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Commesse Attive"
          value={kpiData.commesseAttive}
          icon={Building2}
          color="blue"
        />
        <KpiCard
          title="Ricavi Totali"
          value={formatCurrency(kpiData.ricaviTotali)}
          icon={TrendingUp}
          color="green"
        />
        <KpiCard
          title="Costi Totali"
          value={formatCurrency(kpiData.costiTotali)}
          icon={TrendingDown}
          color="red"
        />
        <KpiCard
          title="Margine Medio"
          value={formatPercentage(kpiData.margineComplessivo)}
          icon={Target}
          color="yellow"
        />
      </div>
      
      {/* Commesse Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commesse Recenti</CardTitle>
          <p className="text-sm text-gray-500">
            Le ultime commesse con performance aggiornate
          </p>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            data={commesse as unknown as Record<string, unknown>[]}
            columns={commesseColumns}
            onView={(commessa) => navigate(`/new/commesse/${(commessa as any).id}`)}
            loading={loading}
            searchable={true}
            paginated={commesse.length > 10}
            emptyMessage="Nessuna commessa trovata"
            showActions={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};