
import React from 'react';
import { FileText, Euro, Calendar } from 'lucide-react';

interface PrimaNotaStatsProps {
  registrazioniOggi: number;
  totaleDare: number;
  totaleAvere: number;
}

const PrimaNotaStats: React.FC<PrimaNotaStatsProps> = ({
  registrazioniOggi,
  totaleDare,
  totaleAvere
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const sbilancio = Math.abs(totaleDare - totaleAvere);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Registrazioni Oggi</p>
            <p className="text-2xl font-bold text-slate-900">{registrazioniOggi}</p>
          </div>
          <FileText className="w-8 h-8 text-indigo-600" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Totale Dare</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totaleDare)}
            </p>
          </div>
          <Euro className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Totale Avere</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totaleAvere)}
            </p>
          </div>
          <Euro className="w-8 h-8 text-red-600" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Sbilancio</p>
            <p className={`text-2xl font-bold ${
              sbilancio === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(sbilancio)}
            </p>
          </div>
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
};

export default PrimaNotaStats;
