import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Landmark, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Commessa, CentroDiCosto } from '@/types';
import { getCommesse, getCentriDiCosto } from '@/api';

const CommessaDettaglio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [commessa, setCommessa] = useState<Commessa | null>(null);
  const [centriDiCosto, setCentriDiCosto] = useState<CentroDiCosto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [commesseData, centriDiCostoData] = await Promise.all([
          getCommesse(),
          getCentriDiCosto()
        ]);
        const currentCommessa = commesseData.find(c => c.id === id);
        setCommessa(currentCommessa || null);
        setCentriDiCosto(centriDiCostoData);
      } catch (error) {
        console.error("Errore nel caricamento dei dati di dettaglio:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };
  
  const getNomeCentroDiCosto = (id: string) => {
    return centriDiCosto.find(c => c.id === id)?.nome || 'N/D';
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Caricamento dettagli commessa...</p></div>;
  }

  if (!commessa) {
    return <div className="text-center py-12"><p>Commessa non trovata.</p></div>;
  }

  const totalBudget = Object.values(commessa.budget).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/commesse')}
            className="border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle Commesse
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{commessa.nome}</h1>
            <p className="text-slate-600 mt-1">Commessa #{commessa.id}</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Descrizione</h3>
            <p className="text-slate-700 text-sm">{commessa.descrizione || 'Nessuna descrizione.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Budget Totale</h3>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
          </div>
        </div>
      </div>

      {/* Dettaglio Budget */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Dettaglio Budget per Centro di Costo</h3>
          <p className="text-sm text-slate-500 mt-1">
            Suddivisione del budget allocato ai diversi centri di costo per questa commessa.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {Object.entries(commessa.budget).map(([cdcId, importo]) => (
            <div key={cdcId} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-800">{getNomeCentroDiCosto(cdcId)}</span>
              </div>
              <div className="flex items-center gap-3">
                 <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-slate-900 text-lg">{formatCurrency(importo)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommessaDettaglio;
