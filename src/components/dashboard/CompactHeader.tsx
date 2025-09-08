import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { FilterControls, type DashboardFilters } from './FilterControls';

interface CompactHeaderProps {
  kpi: {
    commesseAttive: number;
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
    commesseConMargineNegativo: number;
    budgetVsConsuntivo: number;
    movimentiNonAllocati: number;
  };
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  clienti: Array<{ id: string; nome: string }>;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
}

const formatCurrency = (value: number) => {
  return `€${value.toLocaleString('it-IT')}`;
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const CompactHeader: React.FC<CompactHeaderProps> = ({ 
  kpi, 
  filters, 
  onFiltersChange, 
  clienti, 
  isFiltersOpen, 
  onToggleFilters 
}) => {
  const margineBruto = kpi.ricaviTotali - kpi.costiTotali;
  
  return (
    <div className="space-y-4">
      {/* Titolo e timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Commesse</h1>
            <p className="text-sm text-slate-500">Centro di controllo operativo</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <FilterControls
            filters={filters}
            onFiltersChange={onFiltersChange}
            clienti={clienti}
            isOpen={isFiltersOpen}
            onToggle={onToggleFilters}
          />
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="h-4 w-4" />
            {new Date().toLocaleDateString('it-IT', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* KPI compatti in linea */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            
            {/* Commesse Attive */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Layers className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <div className="text-lg font-bold">{kpi.commesseAttive}</div>
                <div className="text-xs text-slate-500">Commesse</div>
              </div>
            </div>

            {/* Ricavi */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-700">{formatCurrency(kpi.ricaviTotali)}</div>
                <div className="text-xs text-slate-500">Ricavi</div>
              </div>
            </div>

            {/* Margine */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.margineLordoMedio > 15 ? 'bg-green-100' : kpi.margineLordoMedio > 5 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-4 w-4 ${kpi.margineLordoMedio > 15 ? 'text-green-600' : kpi.margineLordoMedio > 5 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
              <div>
                <div className={`text-lg font-bold ${kpi.margineLordoMedio > 15 ? 'text-green-700' : kpi.margineLordoMedio > 5 ? 'text-yellow-700' : 'text-red-700'}`}>
                  {formatPercent(kpi.margineLordoMedio)}
                </div>
                <div className="text-xs text-slate-500">Margine</div>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.budgetVsConsuntivo > 100 ? 'bg-red-100' : kpi.budgetVsConsuntivo > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <Target className={`h-4 w-4 ${kpi.budgetVsConsuntivo > 100 ? 'text-red-600' : kpi.budgetVsConsuntivo > 80 ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
              <div>
                <div className={`text-lg font-bold ${kpi.budgetVsConsuntivo > 100 ? 'text-red-700' : kpi.budgetVsConsuntivo > 80 ? 'text-yellow-700' : 'text-green-700'}`}>
                  {formatPercent(kpi.budgetVsConsuntivo)}
                </div>
                <div className="text-xs text-slate-500">Budget</div>
              </div>
            </div>

            {/* Margine Assoluto */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${margineBruto > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-4 w-4 ${margineBruto > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <div className={`text-lg font-bold ${margineBruto > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(margineBruto)}
                </div>
                <div className="text-xs text-slate-500">Profitto</div>
              </div>
            </div>

            {/* Alert Summary */}
            {(kpi.commesseConMargineNegativo > 0 || kpi.movimentiNonAllocati > 0) && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="flex gap-1">
                    {kpi.commesseConMargineNegativo > 0 && (
                      <Badge variant="destructive" className="text-xs">{kpi.commesseConMargineNegativo}</Badge>
                    )}
                    {kpi.movimentiNonAllocati > 0 && (
                      <Badge variant="secondary" className="text-xs">{kpi.movimentiNonAllocati}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">Alert</div>
                </div>
              </div>
            )}

            {/* Performance Indicator */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.margineLordoMedio > 15 && kpi.budgetVsConsuntivo < 90 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Activity className={`h-4 w-4 ${kpi.margineLordoMedio > 15 && kpi.budgetVsConsuntivo < 90 ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {kpi.margineLordoMedio > 15 && kpi.budgetVsConsuntivo < 90 ? '✓' : '!'}
                </div>
                <div className="text-xs text-slate-500">Status</div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};