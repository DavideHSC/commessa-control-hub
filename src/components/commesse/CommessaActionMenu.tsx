import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Target,
  FileText,
  Download,
  TrendingUp,
  Calculator,
  PlusCircle,
  Edit,
  Settings,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  DollarSign,
  PieChart,
  BarChart3
} from 'lucide-react';
import { CommessaWithPerformance } from '@/api/commessePerformance';
import { CommessaDashboard } from '../../../types';

interface CommessaActionMenuProps {
  commessa: CommessaWithPerformance;
  onAllocateMovements: () => void;
  onEditBudget: () => void;
  onExportReport: (format: 'pdf' | 'excel' | 'csv') => void;
  onAssignUnallocatedCosts: () => void;
  onViewDetails?: () => void;
  onQuickAnalysis?: () => void;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export const CommessaActionMenu: React.FC<CommessaActionMenuProps> = ({
  commessa,
  onAllocateMovements,
  onEditBudget,
  onExportReport,
  onAssignUnallocatedCosts,
  onViewDetails,
  onQuickAnalysis,
  variant = 'default',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const renderTrigger = () => {
    const iconSize = getIconSize();
    const buttonSize = getButtonSize();

    if (variant === 'minimal') {
      return (
        <Button variant="ghost" size={buttonSize} className="h-8 w-8 p-0">
          <MoreHorizontal className={iconSize} />
        </Button>
      );
    }

    if (variant === 'compact') {
      return (
        <Button variant="outline" size={buttonSize} className="px-2">
          <MoreHorizontal className={`${iconSize} mr-1`} />
          Azioni
        </Button>
      );
    }

    return (
      <Button variant="outline" size={buttonSize}>
        <MoreHorizontal className={`${iconSize} mr-2`} />
        Azioni Rapide
      </Button>
    );
  };

  // Helper per determinare le azioni prioritarie in base allo stato
  const getPriorityActions = () => {
    const actions = [];
    
    if (commessa.margine < 0) {
      actions.push({
        key: 'critical',
        label: 'Situazione Critica',
        icon: AlertCircle,
        color: 'text-red-600',
        priority: 'high'
      });
    }

    if (commessa.percentualeAvanzamento < 50 && commessa.costi > commessa.budget * 0.8) {
      actions.push({
        key: 'budget_alert',
        label: 'Budget in Esaurimento',
        icon: DollarSign,
        color: 'text-yellow-600',
        priority: 'medium'
      });
    }

    return actions;
  };

  const priorityActions = getPriorityActions();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {renderTrigger()}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {commessa.nome}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Azioni Prioritarie */}
        {priorityActions.length > 0 && (
          <>
            {priorityActions.map((action) => (
              <DropdownMenuItem key={action.key} className="flex items-center gap-2">
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className={action.color}>{action.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {action.priority === 'high' ? 'Urgente' : 'Attenzione'}
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Azioni Principali */}
        <DropdownMenuItem onClick={onAllocateMovements} className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span>Alloca Movimenti</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {commessa.costi > 0 ? 'Disponibile' : 'Vuoto'}
          </Badge>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onEditBudget} className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-green-600" />
          <span>Modifica Budget</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onAssignUnallocatedCosts} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-orange-600" />
          <span>Assegna Costi Non Allocati</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sottomenu Report */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span>Esporta Report</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onExportReport('pdf')} className="flex items-center gap-2">
              <Download className="h-4 w-4 text-red-600" />
              <span>PDF Completo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportReport('excel')} className="flex items-center gap-2">
              <Download className="h-4 w-4 text-green-600" />
              <span>Excel Dati</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportReport('csv')} className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <span>CSV Movimenti</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Azioni Analitiche */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>Analisi Rapida</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={onQuickAnalysis} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Trend Performance</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onQuickAnalysis} className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              <span>Distribuzione Costi</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onQuickAnalysis} className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              <span>Proiezione Budget</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Azioni Secondarie */}
        {onViewDetails && (
          <DropdownMenuItem onClick={onViewDetails} className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <span>Dettagli Completi</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          onClick={() => window.open(`/analisi-comparative?commessa=${commessa.id}`, '_blank')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          <span>Analisi Comparative</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-gray-600" />
          <span>Condividi</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Componente per azioni rapide inline (senza dropdown)
export const QuickActions: React.FC<{
  commessa: CommessaWithPerformance | CommessaDashboard;
  onAllocateMovements: () => void;
  onEditBudget: () => void;
  onExportReport: (format: 'pdf' | 'excel' | 'csv') => void;
  onAssignUnallocatedCosts: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ commessa, onAllocateMovements, onEditBudget, onExportReport, onAssignUnallocatedCosts, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'sm';

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={onAllocateMovements}
        className="h-8 px-2"
        title="Alloca Movimenti"
      >
        <Target className={`${iconSize} text-blue-600`} />
      </Button>
      
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={onEditBudget}
        className="h-8 px-2"
        title="Modifica Budget"
      >
        <Calculator className={`${iconSize} text-green-600`} />
      </Button>
      
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => onExportReport('pdf')}
        className="h-8 px-2"
        title="Esporta Report"
      >
        <Download className={`${iconSize} text-purple-600`} />
      </Button>
      
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={onAssignUnallocatedCosts}
        className="h-8 px-2"
        title="Assegna Costi Non Allocati"
      >
        <PlusCircle className={`${iconSize} text-orange-600`} />
      </Button>
    </div>
  );
};

export default CommessaActionMenu;