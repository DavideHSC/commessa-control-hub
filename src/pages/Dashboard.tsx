import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Benvenuto in Commessa Control Hub</h1>
        <p className="text-slate-600 mt-1">
          La soluzione centralizzata per il controllo di gestione delle tue commesse.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <Briefcase className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Inizia a gestire le tue commesse</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-6">
          Utilizza la barra laterale per navigare tra le sezioni. Puoi visualizzare l'elenco delle tue commesse o procedere con la creazione di una nuova registrazione contabile.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => navigate('/commesse')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Visualizza Commesse
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/prima-nota/nuova')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Crea Registrazione
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
