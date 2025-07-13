import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Layers,
  Activity,
  Target,
  Calendar
} from 'lucide-react';

interface KpiWidgetProps {
  title: string;
  value: string | number;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  icon?: React.ReactNode;
  badge?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatPercent = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);
};

export const KpiWidget: React.FC<KpiWidgetProps> = ({
  title,
  value,
  description,
  trend,
  variant = 'default',
  icon,
  badge
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'destructive':
        return 'border-red-200 bg-red-50';
      default:
        return '';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {badge && (
            <Badge variant={variant === 'destructive' ? 'destructive' : 'secondary'}>
              {badge}
            </Badge>
          )}
          {icon || <Activity className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            {typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
          </div>
          {getTrendIcon()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

interface KpiGridProps {
  kpi: {
    commesseAttive: number;
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
    commesseConMargineNegativo: number;
    budgetVsConsuntivo: number;
    movimentiNonAllocati: number;
    ricaviMeseCorrente: number;
    costiMeseCorrente: number;
  };
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpi }) => {
  const margineMeseCorrente = kpi.ricaviMeseCorrente > 0 
    ? ((kpi.ricaviMeseCorrente - kpi.costiMeseCorrente) / kpi.ricaviMeseCorrente) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Commesse Attive */}
      <KpiWidget
        title="Commesse Attive"
        value={kpi.commesseAttive}
        description="Progetti in gestione"
        icon={<Layers className="h-4 w-4 text-muted-foreground" />}
      />

      {/* Ricavi Totali */}
      <KpiWidget
        title="Ricavi Totali"
        value={kpi.ricaviTotali}
        description="Fatturato complessivo"
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
        trend="up"
      />

      {/* Margine Lordo Medio */}
      <KpiWidget
        title="Margine Lordo Medio"
        value={formatPercent(kpi.margineLordoMedio)}
        description="Redditività complessiva"
        variant={kpi.margineLordoMedio > 20 ? 'success' : kpi.margineLordoMedio > 10 ? 'warning' : 'destructive'}
        icon={<DollarSign className="h-4 w-4" />}
        trend={kpi.margineLordoMedio > 15 ? 'up' : 'down'}
      />

      {/* Budget vs Consuntivo */}
      <KpiWidget
        title="Budget vs Consuntivo"
        value={formatPercent(kpi.budgetVsConsuntivo)}
        description="Avanzamento budget"
        variant={kpi.budgetVsConsuntivo > 100 ? 'destructive' : kpi.budgetVsConsuntivo > 80 ? 'warning' : 'success'}
        icon={<Target className="h-4 w-4" />}
        badge={kpi.budgetVsConsuntivo > 100 ? 'SFORATO' : undefined}
      />

      {/* Commesse con Margine Negativo */}
      <KpiWidget
        title="Commesse in Perdita"
        value={kpi.commesseConMargineNegativo}
        description="Progetti con margine negativo"
        variant={kpi.commesseConMargineNegativo > 0 ? 'destructive' : 'success'}
        icon={<AlertTriangle className="h-4 w-4" />}
        badge={kpi.commesseConMargineNegativo > 0 ? 'ATTENZIONE' : undefined}
      />

      {/* Movimenti Non Allocati */}
      <KpiWidget
        title="Movimenti da Allocare"
        value={kpi.movimentiNonAllocati}
        description="Operazioni in sospeso"
        variant={kpi.movimentiNonAllocati > 10 ? 'warning' : 'success'}
        icon={<Activity className="h-4 w-4" />}
        badge={kpi.movimentiNonAllocati > 0 ? 'PENDING' : undefined}
      />

      {/* Performance Mese Corrente */}
      <KpiWidget
        title="Performance Mensile"
        value={formatPercent(margineMeseCorrente)}
        description="Margine mese corrente"
        variant={margineMeseCorrente > 15 ? 'success' : margineMeseCorrente > 5 ? 'warning' : 'destructive'}
        icon={<Calendar className="h-4 w-4" />}
        trend={margineMeseCorrente > 10 ? 'up' : 'down'}
      />

      {/* Ricavi Mese Corrente */}
      <KpiWidget
        title="Ricavi Mensili"
        value={kpi.ricaviMeseCorrente}
        description="Fatturato mese corrente"
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
      />
    </div>
  );
};