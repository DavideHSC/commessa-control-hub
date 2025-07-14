import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  Clock,
  DollarSign,
  TrendingDown,
  Target,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SidebarPanelProps {
  kpi: {
    commesseConMargineNegativo: number;
    budgetVsConsuntivo: number;
    movimentiNonAllocati: number;
    margineLordoMedio: number;
    commesseAttive: number;
  };
  commesse: Array<{
    id: string;
    nome: string;
    margine: number;
    ricavi: number;
    cliente: { nome: string };
  }>;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({ kpi, commesse }) => {
  const generatePriorityAlerts = () => {
    const alerts = [];

    // Alert critici
    if (kpi.commesseConMargineNegativo > 0) {
      alerts.push({
        type: 'critical',
        title: 'Commesse in Perdita',
        description: `${kpi.commesseConMargineNegativo} commesse con margine negativo`,
        action: 'Intervieni',
        icon: AlertTriangle,
        color: 'red'
      });
    }

    if (kpi.budgetVsConsuntivo > 100) {
      alerts.push({
        type: 'critical',
        title: 'Budget Superato',
        description: `Sforamento del ${(kpi.budgetVsConsuntivo - 100).toFixed(1)}%`,
        action: 'Analizza',
        icon: Target,
        color: 'red'
      });
    }

    // Alert di attenzione
    if (kpi.movimentiNonAllocati > 5) {
      alerts.push({
        type: 'warning',
        title: 'Allocazioni Pending',
        description: `${kpi.movimentiNonAllocati} movimenti da allocare`,
        action: 'Alloca',
        icon: Clock,
        color: 'yellow'
      });
    }

    if (kpi.margineLordoMedio < 10) {
      alerts.push({
        type: 'warning',
        title: 'Margine Basso',
        description: `Margine medio al ${kpi.margineLordoMedio.toFixed(1)}%`,
        action: 'Ottimizza',
        icon: TrendingDown,
        color: 'yellow'
      });
    }

    return alerts.slice(0, 4); // Max 4 alert
  };

  const getCommesseProblematiche = () => {
    return commesse
      .filter(c => c.margine < 0)
      .sort((a, b) => a.margine - b.margine)
      .slice(0, 3);
  };

  const getQuickStats = () => {
    const totalRicavi = commesse.reduce((acc, c) => acc + c.ricavi, 0);
    const commessePositive = commesse.filter(c => c.margine > 0).length;
    const mediaRicaviPerCommessa = totalRicavi / commesse.length || 0;

    return {
      commessePositive,
      percentualePositive: commesse.length ? (commessePositive / commesse.length) * 100 : 0,
      mediaRicaviPerCommessa
    };
  };

  const alerts = generatePriorityAlerts();
  const commesseProblematiche = getCommesseProblematiche();
  const quickStats = getQuickStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);
  };

  return (
    <div className="space-y-4">
      
      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiche Rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Commesse Positive</span>
            <div className="text-right">
              <div className="font-semibold">{quickStats.commessePositive}/{kpi.commesseAttive}</div>
              <div className="text-xs text-slate-500">{quickStats.percentualePositive.toFixed(0)}%</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Media Ricavi</span>
            <div className="font-semibold text-sm">{formatCurrency(quickStats.mediaRicaviPerCommessa)}</div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${quickStats.percentualePositive}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema Alert */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Alert Prioritari
            </CardTitle>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">{alerts.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-4">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-sm text-green-700 font-medium">Tutto OK!</div>
              <div className="text-xs text-green-600">Nessun alert attivo</div>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <Alert key={index} className={`border-l-4 ${
                alert.color === 'red' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <alert.icon className={`h-4 w-4 mt-0.5 ${
                      alert.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{alert.title}</div>
                      <AlertDescription className="text-xs mt-1">
                        {alert.description}
                      </AlertDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs ml-2">
                    {alert.action}
                  </Button>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>

      {/* Commesse Problematiche */}
      {commesseProblematiche.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Commesse Critiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {commesseProblematiche.map((commessa) => (
              <div key={commessa.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-medium text-red-800 truncate">
                    {commessa.nome.length > 20 ? commessa.nome.substring(0, 17) + '...' : commessa.nome}
                  </div>
                  <Badge variant="destructive" className="text-xs ml-2">
                    {commessa.margine.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-xs text-red-600 mb-2">{commessa.cliente.nome}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-700">
                    Ricavi: {formatCurrency(commessa.ricavi)}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-red-700 hover:text-red-800">
                    Dettagli <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start h-8">
            <Users className="h-4 w-4 mr-2" />
            Gestisci Commesse
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start h-8">
            <FileText className="h-4 w-4 mr-2" />
            Riconciliazione
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start h-8">
            <DollarSign className="h-4 w-4 mr-2" />
            Analisi Costi
          </Button>
        </CardContent>
      </Card>

    </div>
  );
};