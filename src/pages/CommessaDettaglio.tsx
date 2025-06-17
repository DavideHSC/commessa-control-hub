
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';

const CommessaDettaglio = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dati mock per la demo
  const commessa = {
    id: id,
    nome: "Ristrutturazione Palazzo Centrale",
    cliente: "Immobiliare Milano SRL",
    stato: "in-corso" as const,
    ricavi: 245000,
    costi: 180000,
    margine: 26.5,
    dataInizio: "2024-01-15",
    dataFine: "2024-06-30",
    descrizione: "Ristrutturazione completa del palazzo storico nel centro di Milano, inclusi lavori di consolidamento strutturale e restauro delle facciate."
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

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
            <p className="text-slate-600 mt-1">Commessa #{commessa.id} - {commessa.cliente}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200">
            <Edit className="w-4 h-4 mr-2" />
            Modifica
          </Button>
          <Button variant="outline" className="border-slate-200">
            <FileText className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Stato Commessa</h3>
            <StatusBadge status={commessa.stato} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Periodo</h3>
            <p className="text-slate-900">{commessa.dataInizio} - {commessa.dataFine}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Descrizione</h3>
            <p className="text-slate-700 text-sm">{commessa.descrizione}</p>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Ricavi Allocati</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(commessa.ricavi)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Costi Allocati</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(commessa.costi)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Margine</h3>
          <p className="text-2xl font-bold text-slate-900">{commessa.margine}%</p>
        </div>
      </div>

      {/* Placeholder per altre sezioni */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Registrazioni Contabili</h3>
        <p className="text-slate-600">Sezione in sviluppo - Qui verranno mostrate tutte le registrazioni contabili associate alla commessa.</p>
      </div>
    </div>
  );
};

export default CommessaDettaglio;
