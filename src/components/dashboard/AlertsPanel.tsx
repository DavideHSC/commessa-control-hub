import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Activity,
  Target,
  ArrowRight
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  value?: string;
}

interface AlertsPanelProps {
  kpi: {
    commesseConMargineNegativo: number;
    budgetVsConsuntivo: number;
    movimentiNonAllocati: number;
    margineLordoMedio: number;
  };
  commesse: Array<{
    id: string;
    nome: string;
    margine: number;
    ricavi: number;
  }>;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ kpi, commesse }) => {
  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    // Alert per commesse in perdita
    if (kpi.commesseConMargineNegativo > 0) {
      alerts.push({
        id: 'margine-negativo',
        type: 'error',
        title: 'Commesse in Perdita',
        description: `${kpi.commesseConMargineNegativo} commesse hanno margine negativo`,
        action: 'Visualizza dettagli',
        actionUrl: '/commesse?filter=negative-margin',
        value: `${kpi.commesseConMargineNegativo}`
      });
    }

    // Alert per budget sforato
    if (kpi.budgetVsConsuntivo > 100) {
      alerts.push({
        id: 'budget-sforato',
        type: 'error',
        title: 'Budget Superato',
        description: `Il consuntivo supera il budget del ${(kpi.budgetVsConsuntivo - 100).toFixed(1)}%`,
        action: 'Rivedi allocazioni',
        actionUrl: '/riconciliazione',
        value: `${kpi.budgetVsConsuntivo.toFixed(1)}%`
      });
    } else if (kpi.budgetVsConsuntivo > 80) {
      alerts.push({
        id: 'budget-attenzione',
        type: 'warning',
        title: 'Budget in Attenzione',
        description: `Il consuntivo è al ${kpi.budgetVsConsuntivo.toFixed(1)}% del budget`,
        action: 'Monitora situazione',
        value: `${kpi.budgetVsConsuntivo.toFixed(1)}%`
      });
    }

    // Alert per movimenti non allocati
    if (kpi.movimentiNonAllocati > 0) {
      alerts.push({
        id: 'movimenti-pending',
        type: kpi.movimentiNonAllocati > 10 ? 'warning' : 'info',
        title: 'Movimenti da Allocare',
        description: `${kpi.movimentiNonAllocati} movimenti attendono allocazione`,
        action: 'Vai a Riconciliazione',
        actionUrl: '/riconciliazione',
        value: `${kpi.movimentiNonAllocati}`
      });
    }

    // Alert per margine basso
    if (kpi.margineLordoMedio < 10) {
      alerts.push({
        id: 'margine-basso',
        type: 'warning',
        title: 'Margine Complessivo Basso',
        description: `Il margine medio è solo del ${kpi.margineLordoMedio.toFixed(1)}%`,
        action: 'Analizza costi',
        value: `${kpi.margineLordoMedio.toFixed(1)}%`
      });
    }

    // Alert per commesse specifiche con problemi
    const commesseProblematiche = commesse
      .filter(c => c.margine < -10 && c.ricavi > 1000)
      .slice(0, 2);

    commesseProblematiche.forEach((commessa, index) => {
      alerts.push({
        id: `commessa-critica-${index}`,
        type: 'error',
        title: 'Commessa Critica',
        description: `"${commessa.nome}" ha margine ${commessa.margine.toFixed(1)}%`,
        action: 'Vedi dettagli',
        actionUrl: `/commesse/${commessa.id}`,
        value: `${commessa.margine.toFixed(1)}%`
      });
    });

    return alerts;
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <TrendingDown className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertVariant = (type: AlertItem['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Sistema di Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800">Tutto sotto controllo!</h3>
            <p className="text-sm text-green-600 mt-1">
              Non ci sono situazioni che richiedono attenzione immediata.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Sistema di Alert
          </div>
          <Badge variant="outline">{alerts.length} notifiche</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={getAlertVariant(alert.type) === 'destructive' ? 'border-red-200 bg-red-50' : ''}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    {alert.value && (
                      <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                        {alert.value}
                      </Badge>
                    )}
                  </div>
                  <AlertDescription className="text-xs">
                    {alert.description}
                  </AlertDescription>
                </div>
              </div>
              
              {alert.action && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2 h-8"
                  onClick={() => alert.actionUrl && window.location.assign(alert.actionUrl)}
                >
                  {alert.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </Alert>
        ))}
        
        {alerts.length > 3 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              Visualizza tutti gli alert
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};