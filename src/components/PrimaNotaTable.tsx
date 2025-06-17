
import React from 'react';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface RegistrazionePrimaNota {
  id: string;
  data: string;
  numeroRegistrazione: number;
  causale: string;
  descrizione: string;
  totaleDare: number;
  totaleAvere: number;
  commessa?: string;
  stato: 'bozza' | 'confermata' | 'contabilizzata';
  creatoIl: string;
  creatoDA: string;
}

interface PrimaNotaTableProps {
  registrazioni: RegistrazionePrimaNota[];
  onEdit: (id: string) => void;
}

const PrimaNotaTable: React.FC<PrimaNotaTableProps> = ({
  registrazioni,
  onEdit
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('it-IT');
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'contabilizzata': return 'bg-green-100 text-green-800 border-green-200';
      case 'confermata': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bozza': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'contabilizzata': return 'Contabilizzata';
      case 'confermata': return 'Confermata';
      case 'bozza': return 'Bozza';
      default: return stato;
    }
  };

  const totaleDareSum = registrazioni.reduce((sum, reg) => sum + reg.totaleDare, 0);
  const totaleAvereSum = registrazioni.reduce((sum, reg) => sum + reg.totaleAvere, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">N. Reg.</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Data</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Causale</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Descrizione</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Commessa</th>
              <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Dare</th>
              <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Avere</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Stato</th>
              <th className="text-center py-4 px-6 font-medium text-slate-700 text-sm">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {registrazioni.map((registrazione) => (
              <tr key={registrazione.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-medium text-slate-900">
                    {registrazione.numeroRegistrazione}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-slate-900">{formatDate(registrazione.data)}</div>
                </td>
                <td className="py-4 px-6">
                  <Badge variant="outline" className="border-slate-300">
                    {registrazione.causale}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="text-slate-900 max-w-xs truncate" title={registrazione.descrizione}>
                    {registrazione.descrizione}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDateTime(registrazione.creatoIl)} - {registrazione.creatoDA}
                  </div>
                </td>
                <td className="py-4 px-6">
                  {registrazione.commessa ? (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {registrazione.commessa}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="py-4 px-6 text-right font-medium text-emerald-600">
                  {formatCurrency(registrazione.totaleDare)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-red-600">
                  {formatCurrency(registrazione.totaleAvere)}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatoColor(registrazione.stato)}`}>
                    {getStatoLabel(registrazione.stato)}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(registrazione.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {registrazione.stato === 'bozza' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={5} className="py-4 px-6 font-medium text-slate-900">
                Totali
              </td>
              <td className="py-4 px-6 text-right font-bold text-emerald-600">
                {formatCurrency(totaleDareSum)}
              </td>
              <td className="py-4 px-6 text-right font-bold text-red-600">
                {formatCurrency(totaleAvereSum)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {registrazioni.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-500 text-lg font-medium">Nessuna registrazione trovata</div>
          <div className="text-slate-400 text-sm mt-1">Prova a modificare i filtri di ricerca</div>
        </div>
      )}
    </div>
  );
};

export default PrimaNotaTable;
