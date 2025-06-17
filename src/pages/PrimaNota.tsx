
import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PrimaNotaStats from '@/components/PrimaNotaStats';
import PrimaNotaFilters from '@/components/PrimaNotaFilters';
import PrimaNotaTable, { RegistrazionePrimaNota } from '@/components/PrimaNotaTable';

const mockRegistrazioni: RegistrazionePrimaNota[] = [
  {
    id: '1',
    data: '2024-06-15',
    numeroRegistrazione: 1001,
    causale: 'Fattura Vendita',
    descrizione: 'Fattura n. 2024/001 - Commessa Ristrutturazione',
    totaleDare: 85000,
    totaleAvere: 85000,
    commessa: 'COM-2024-001',
    stato: 'contabilizzata',
    creatoIl: '2024-06-15T10:30:00',
    creatoDA: 'Mario Rossi'
  },
  {
    id: '2',
    data: '2024-06-14',
    numeroRegistrazione: 1002,
    causale: 'Fattura Acquisto',
    descrizione: 'Fattura acquisto materiali edili',
    totaleDare: 12000,
    totaleAvere: 12000,
    commessa: 'COM-2024-001',
    stato: 'confermata',
    creatoIl: '2024-06-14T14:15:00',
    creatoDA: 'Laura Bianchi'
  },
  {
    id: '3',
    data: '2024-06-13',
    numeroRegistrazione: 1003,
    causale: 'Giroconto',
    descrizione: 'Allocazione costi generali',
    totaleDare: 5000,
    totaleAvere: 5000,
    stato: 'bozza',
    creatoIl: '2024-06-13T16:45:00',
    creatoDA: 'Giuseppe Verdi'
  }
];

const PrimaNota: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [causaleFilter, setCausaleFilter] = useState<string>('all');
  const [statoFilter, setStatoFilter] = useState<string>('all');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  const navigate = useNavigate();

  const filteredRegistrazioni = mockRegistrazioni.filter(reg => {
    const matchesSearch = reg.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.numeroRegistrazione.toString().includes(searchTerm) ||
                         reg.commessa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCausale = causaleFilter === 'all' || reg.causale === causaleFilter;
    const matchesStato = statoFilter === 'all' || reg.stato === statoFilter;
    
    return matchesSearch && matchesCausale && matchesStato;
  });

  const handleNuovaRegistrazione = () => {
    navigate('/prima-nota/nuova');
  };

  const handleEdit = (id: string) => {
    navigate(`/prima-nota/${id}/edit`);
  };

  const registrazioniOggi = mockRegistrazioni.filter(
    r => r.data === new Date().toISOString().split('T')[0]
  ).length;

  const totaleDareSum = filteredRegistrazioni.reduce((sum, reg) => sum + reg.totaleDare, 0);
  const totaleAvereSum = filteredRegistrazioni.reduce((sum, reg) => sum + reg.totaleAvere, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prima Nota</h1>
          <p className="text-slate-600 mt-1">Gestione registrazioni contabili e movimenti di prima nota</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200">
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          <Button 
            onClick={handleNuovaRegistrazione}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuova Registrazione
          </Button>
        </div>
      </div>

      {/* Statistiche */}
      <PrimaNotaStats
        registrazioniOggi={registrazioniOggi}
        totaleDare={totaleDareSum}
        totaleAvere={totaleAvereSum}
      />

      {/* Filtri */}
      <PrimaNotaFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        causaleFilter={causaleFilter}
        setCausaleFilter={setCausaleFilter}
        statoFilter={statoFilter}
        setStatoFilter={setStatoFilter}
        dataInizio={dataInizio}
        setDataInizio={setDataInizio}
        dataFine={dataFine}
        setDataFine={setDataFine}
      />

      {/* Tabella Registrazioni */}
      <PrimaNotaTable
        registrazioni={filteredRegistrazioni}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default PrimaNota;
