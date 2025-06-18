import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Commessa } from '@/types';
import { getCommesse } from '@/api';

const Commesse: React.FC = () => {
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommesse = async () => {
      try {
        setIsLoading(true);
        const data = await getCommesse();
        setCommesse(data);
      } catch (error) {
        console.error("Errore nel caricamento delle commesse:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCommesse();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateTotalBudget = (budget: { [key: string]: number }) => {
    return Object.values(budget).reduce((sum, value) => sum + value, 0);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/commesse/${id}`);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <p>Caricamento dati commesse...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Elenco Commesse</h1>
          <p className="text-slate-600 mt-1">Visualizza le commesse attive e il loro budget.</p>
        </div>
      </div>

      {/* Tabella Commesse */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Nome Commessa</th>
                <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Budget Totale</th>
                <th className="text-center py-4 px-6 font-medium text-slate-700 text-sm">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {commesse.map((commessa) => (
                <tr key={commessa.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900">{commessa.nome}</div>
                    <div className="text-sm text-slate-500">{commessa.id}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="font-medium text-slate-900">
                      {formatCurrency(calculateTotalBudget(commessa.budget))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(commessa.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Dettagli
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Commesse;
