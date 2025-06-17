
import React from 'react';
import { Building2, Euro, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KPICard from '@/components/KPICard';
import CommesseTable from '@/components/CommesseTable';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleNewCommessa = () => {
    navigate('/commesse');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Commesse</h1>
          <p className="text-slate-600 mt-1">Panoramica completa delle commesse aziendali</p>
        </div>
        <Button 
          onClick={handleNewCommessa}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
        >
          + Nuova Commessa
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Commesse Attive"
          value="12"
          icon={Building2}
          trend={{ value: "2", isPositive: true }}
        />
        <KPICard
          title="Ricavi Totali (Anno)"
          value="€ 1.2M"
          icon={Euro}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <KPICard
          title="Costi Totali (Anno)"
          value="€ 800K"
          icon={TrendingUp}
          trend={{ value: "3.1%", isPositive: false }}
        />
        <KPICard
          title="Margine Lordo Medio"
          value="33%"
          icon={Percent}
          trend={{ value: "1.2%", isPositive: true }}
        />
      </div>

      {/* Tabella Commesse */}
      <CommesseTable />
    </div>
  );
};

export default Dashboard;
