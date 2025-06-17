
import React from 'react';

type StatusType = 'aperta' | 'in_lavorazione' | 'chiusa' | 'fatturata';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig = {
  aperta: {
    label: 'Aperta',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  in_lavorazione: {
    label: 'In Lavorazione',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  chiusa: {
    label: 'Chiusa',
    className: 'bg-slate-50 text-slate-700 border-slate-200'
  },
  fatturata: {
    label: 'Fatturata',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
