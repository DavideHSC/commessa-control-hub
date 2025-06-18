import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, BookMarked } from 'lucide-react';

const PrimaNota: React.FC = () => {
  const navigate = useNavigate();

  const handleNuovaRegistrazione = () => {
    navigate('/prima-nota/nuova');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prima Nota</h1>
          <p className="text-slate-600 mt-1">Visualizza le registrazioni contabili e crea nuovi movimenti.</p>
        </div>
        <Button 
          onClick={handleNuovaRegistrazione}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Registrazione
        </Button>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <BookMarked className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Nessuna registrazione da visualizzare</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-6">
          Questa sezione mostrerà l'elenco di tutte le scritture contabili salvate.
          Al momento, la demo è focalizzata sulla creazione di una nuova registrazione "intelligente".
        </p>
        <Button 
          onClick={handleNuovaRegistrazione}
        >
          Crea la tua prima registrazione
        </Button>
      </div>
    </div>
  );
};

export default PrimaNota;
