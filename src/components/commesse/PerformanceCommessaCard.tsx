import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Activity,
  DollarSign,
  Target,
  Calendar,
  Users,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CommessaWithPerformance {
  id: string;
  nome: string;
  descrizione?: string;
  cliente: {
    id: string;
    nome: string;
  };
  parentId?: string;
  stato: string;
  dataInizio?: Date;
  dataFine?: Date;
  // Dati finanziari (da aggiungere via API)
  ricavi: number;
  costi: number;
  budget: number;
  margine: number;
  percentualeAvanzamento: number;
  figlie?: CommessaWithPerformance[];
}

interface PerformanceCommessaCardProps {
  commessa: CommessaWithPerformance;
  onViewDetails: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const getMargineColor = (margine: number) => {
  if (margine > 15) return 'text-green-700 bg-green-100 border-green-200';
  if (margine > 5) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
  if (margine >= 0) return 'text-orange-700 bg-orange-100 border-orange-200';
  return 'text-red-700 bg-red-100 border-red-200';
};

const getStatoColor = (stato: string, margine: number) => {
  if (margine < 0) return 'destructive';
  if (stato === 'Completata') return 'default';
  if (stato === 'In Corso') return 'secondary';
  return 'outline';
};

const getTrendIcon = (margine: number) => {
  if (margine > 10) return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (margine < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Activity className="h-4 w-4 text-yellow-600" />;
};

export const PerformanceCommessaCard: React.FC<PerformanceCommessaCardProps> = ({ 
  commessa, 
  onViewDetails 
}) => {
  const margineAssoluto = commessa.ricavi - commessa.costi;
  const budgetUtilizzato = commessa.budget > 0 ? (commessa.costi / commessa.budget) * 100 : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header con informazioni principali */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          
          {/* Info Commessa */}
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                {commessa.nome}
              </CardTitle>
              <p className="text-sm text-slate-600 mb-2">{commessa.descrizione}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                {commessa.cliente.nome}
              </div>
            </div>
          </div>

          {/* Stato e Azioni */}
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatoColor(commessa.stato, commessa.margine)}>
              {commessa.stato}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(commessa.id)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Dettagli
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* KPI Finanziari */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Ricavi */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">
              {formatCurrency(commessa.ricavi)}
            </div>
            <div className="text-xs text-green-600">Ricavi</div>
          </div>

          {/* Costi */}
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(commessa.costi)}
            </div>
            <div className="text-xs text-red-600">Costi</div>
          </div>

          {/* Margine */}
          <div className={`text-center p-3 rounded-lg border ${getMargineColor(commessa.margine)}`}>
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              {getTrendIcon(commessa.margine)}
              {formatPercent(commessa.margine)}
            </div>
            <div className="text-xs">Margine</div>
          </div>

          {/* Budget Status */}
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className={`text-lg font-bold ${budgetUtilizzato > 100 ? 'text-red-700' : 'text-slate-700'}`}>
              {formatPercent(budgetUtilizzato)}
            </div>
            <div className="text-xs text-slate-600">Budget Utilizzato</div>
          </div>
        </div>

        {/* Progress Bar Avanzamento */}
        {commessa.percentualeAvanzamento !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avanzamento Progetto</span>
              <span className="text-sm text-slate-600">{formatPercent(commessa.percentualeAvanzamento)}</span>
            </div>
            <Progress 
              value={commessa.percentualeAvanzamento} 
              className="h-2"
            />
          </div>
        )}

        {/* Indicatori di Performance */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          
          {/* Profitto/Perdita */}
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${margineAssoluto > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-4 w-4 ${margineAssoluto > 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <div className={`text-sm font-medium ${margineAssoluto > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(margineAssoluto)}
              </div>
              <div className="text-xs text-slate-500">Profitto</div>
            </div>
          </div>

          {/* Budget Status */}
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${budgetUtilizzato > 100 ? 'bg-red-100' : budgetUtilizzato > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <Target className={`h-4 w-4 ${budgetUtilizzato > 100 ? 'text-red-600' : budgetUtilizzato > 80 ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div>
              <div className="text-sm font-medium">{formatCurrency(commessa.budget)}</div>
              <div className="text-xs text-slate-500">Budget</div>
            </div>
          </div>

          {/* Date */}
          {(commessa.dataInizio || commessa.dataFine) && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-slate-100">
                <Calendar className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {commessa.dataFine ? commessa.dataFine.toLocaleDateString('it-IT') : 'In corso'}
                </div>
                <div className="text-xs text-slate-500">Scadenza</div>
              </div>
            </div>
          )}

          {/* Numero Attività */}
          {commessa.figlie && commessa.figlie.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{commessa.figlie.length}</div>
                <div className="text-xs text-slate-500">Attività</div>
              </div>
            </div>
          )}
        </div>

        {/* Alert se ci sono problemi */}
        {(margineAssoluto < 0 || budgetUtilizzato > 100) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div className="text-sm text-red-700">
              {margineAssoluto < 0 && budgetUtilizzato > 100 
                ? "Margine negativo e budget superato"
                : margineAssoluto < 0 
                ? "Margine negativo - rivedere costi"
                : "Budget superato - monitorare spese"
              }
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};