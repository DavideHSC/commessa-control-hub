
import React, { useState } from 'react';
import { Plus, Search, Calendar, FileText, Euro, Edit, Trash2, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface RegistrazionePrimaNota {
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

  const handleNuovaRegistrazione = () => {
    navigate('/prima-nota/nuova');
  };

  const handleEdit = (id: string) => {
    navigate(`/prima-nota/${id}/edit`);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Registrazioni Oggi</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockRegistrazioni.filter(r => r.data === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Totale Dare</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totaleDareSum)}
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
                {formatCurrency(totaleAvereSum)}
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
                totaleDareSum - totaleAvereSum === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(totaleDareSum - totaleAvereSum))}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cerca per descrizione, numero o commessa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <Select value={causaleFilter} onValueChange={setCausaleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Causale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le causali</SelectItem>
                <SelectItem value="Fattura Vendita">Fattura Vendita</SelectItem>
                <SelectItem value="Fattura Acquisto">Fattura Acquisto</SelectItem>
                <SelectItem value="Giroconto">Giroconto</SelectItem>
                <SelectItem value="Pagamento">Pagamento</SelectItem>
                <SelectItem value="Incasso">Incasso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statoFilter} onValueChange={setStatoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="bozza">Bozza</SelectItem>
                <SelectItem value="confermata">Confermata</SelectItem>
                <SelectItem value="contabilizzata">Contabilizzata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabella Registrazioni */}
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
              {filteredRegistrazioni.map((registrazione) => (
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
                        onClick={() => handleEdit(registrazione.id)}
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

        {filteredRegistrazioni.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-500 text-lg font-medium">Nessuna registrazione trovata</div>
            <div className="text-slate-400 text-sm mt-1">Prova a modificare i filtri di ricerca</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrimaNota;
