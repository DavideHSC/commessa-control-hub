import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  Target,
  Activity,
  Zap,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';

export type CommessaStatus = 'attiva' | 'completata' | 'sospesa' | 'in_corso' | 'iniziale';
export type MarginStatus = 'ottimo' | 'buono' | 'attenzione' | 'critico';
export type ProgressStatus = 'completato' | 'avanzato' | 'in_corso' | 'iniziale';

interface StatusIndicatorsProps {
  margine: number;
  percentualeAvanzamento: number;
  budget: number;
  costi: number;
  ricavi: number;
  size?: 'sm' | 'md' | 'lg';
}

// Utility functions per determinare lo stato
export const getMarginStatus = (margine: number): MarginStatus => {
  if (margine >= 20) return 'ottimo';
  if (margine >= 10) return 'buono';
  if (margine >= 0) return 'attenzione';
  return 'critico';
};

export const getProgressStatus = (percentuale: number): ProgressStatus => {
  if (percentuale >= 100) return 'completato';
  if (percentuale >= 75) return 'avanzato';
  if (percentuale >= 25) return 'in_corso';
  return 'iniziale';
};

export const getCommessaStatus = (margine: number, percentuale: number): CommessaStatus => {
  if (percentuale >= 100) return 'completata';
  if (margine < 0 && percentuale > 50) return 'sospesa';
  if (percentuale > 0) return 'attiva';
  return 'in_corso';
};

// Configurazioni per i diversi stati
const marginConfig = {
  ottimo: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-300',
    icon: TrendingUp,
    label: 'Ottimo'
  },
  buono: { 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-300',
    icon: TrendingUp,
    label: 'Buono'
  },
  attenzione: { 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-300',
    icon: AlertTriangle,
    label: 'Attenzione'
  },
  critico: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-300',
    icon: TrendingDown,
    label: 'Critico'
  }
};

const progressConfig = {
  completato: { 
    color: 'text-green-700', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-300',
    icon: CheckCircle,
    label: 'Completato'
  },
  avanzato: { 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-300',
    icon: TrendingUp,
    label: 'Avanzato'
  },
  in_corso: { 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-300',
    icon: Clock,
    label: 'In Corso'
  },
  iniziale: { 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-50', 
    borderColor: 'border-gray-300',
    icon: PlayCircle,
    label: 'Iniziale'
  }
};

const statusConfig = {
  attiva: { 
    color: 'text-green-700', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-300',
    icon: Activity,
    label: 'Attiva'
  },
  completata: { 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-300',
    icon: CheckCircle,
    label: 'Completata'
  },
  sospesa: { 
    color: 'text-red-700', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-300',
    icon: PauseCircle,
    label: 'Sospesa'
  },
  in_corso: { 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-300',
    icon: Clock,
    label: 'In Corso'
  },
  iniziale: { 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-50', 
    borderColor: 'border-gray-300',
    icon: PlayCircle,
    label: 'Iniziale'
  }
};

// Componenti per singoli indicatori
export const MargineBadge: React.FC<{ margine: number; size?: 'sm' | 'md' | 'lg' }> = ({ margine, size = 'md' }) => {
  const status = getMarginStatus(margine);
  const config = marginConfig[status];
  const Icon = config.icon;
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${config.borderColor} ${config.bgColor} ${textSize}`}
    >
      <Icon className={`${iconSize} mr-1`} />
      {margine >= 0 ? '+' : ''}{margine.toFixed(1)}%
    </Badge>
  );
};

export const ProgressBadge: React.FC<{ percentuale: number; size?: 'sm' | 'md' | 'lg' }> = ({ percentuale, size = 'md' }) => {
  const status = getProgressStatus(percentuale);
  const config = progressConfig[status];
  const Icon = config.icon;
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${config.borderColor} ${config.bgColor} ${textSize}`}
    >
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ margine: number; percentuale: number; size?: 'sm' | 'md' | 'lg' }> = ({ margine, percentuale, size = 'md' }) => {
  const status = getCommessaStatus(margine, percentuale);
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${config.borderColor} ${config.bgColor} ${textSize}`}
    >
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </Badge>
  );
};

// Componente principale con tutti gli indicatori
export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  margine,
  percentualeAvanzamento,
  budget,
  costi,
  ricavi,
  size = 'md'
}) => {
  const healthScore = calculateHealthScore(margine, percentualeAvanzamento, budget, costi, ricavi);
  
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge margine={margine} percentuale={percentualeAvanzamento} size={size} />
      <MargineBadge margine={margine} size={size} />
      <ProgressBadge percentuale={percentualeAvanzamento} size={size} />
      {healthScore && <HealthBadge score={healthScore} size={size} />}
    </div>
  );
};

// Calcola uno score di salute generale
const calculateHealthScore = (margine: number, percentuale: number, budget: number, costi: number, ricavi: number): number => {
  let score = 0;
  
  // Punteggio margine (0-40 punti)
  if (margine >= 20) score += 40;
  else if (margine >= 10) score += 30;
  else if (margine >= 0) score += 20;
  else score += 0;
  
  // Punteggio avanzamento (0-30 punti)
  if (percentuale >= 100) score += 30;
  else if (percentuale >= 75) score += 25;
  else if (percentuale >= 25) score += 20;
  else score += 10;
  
  // Punteggio efficienza budget (0-30 punti)
  const budgetEfficiency = budget > 0 ? (costi / budget) : 0;
  if (budgetEfficiency <= 0.8) score += 30;
  else if (budgetEfficiency <= 0.95) score += 20;
  else if (budgetEfficiency <= 1.1) score += 10;
  else score += 0;
  
  return Math.min(score, 100);
};

export const HealthBadge: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ score, size = 'md' }) => {
  let config;
  let label;
  
  if (score >= 80) {
    config = marginConfig.ottimo;
    label = 'Eccellente';
  } else if (score >= 60) {
    config = marginConfig.buono;
    label = 'Buono';
  } else if (score >= 40) {
    config = marginConfig.attenzione;
    label = 'Medio';
  } else {
    config = marginConfig.critico;
    label = 'Basso';
  }
  
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${config.borderColor} ${config.bgColor} ${textSize}`}
    >
      <Icon className={`${iconSize} mr-1`} />
      {label}
    </Badge>
  );
};

// Utility per ottenere colori per testi e sfondi
export const getMarginColor = (margine: number): string => {
  const status = getMarginStatus(margine);
  return marginConfig[status].color;
};

export const getProgressColor = (percentuale: number): string => {
  const status = getProgressStatus(percentuale);
  return progressConfig[status].color;
};

export const getStatusColor = (margine: number, percentuale: number): string => {
  const status = getCommessaStatus(margine, percentuale);
  return statusConfig[status].color;
};