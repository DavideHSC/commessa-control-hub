import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, Euro, Calendar, Users, AlertCircle, Eye, Edit, Trash2, MoreHorizontal, Building2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';

interface Commessa {
  id: string;
  codice: string;
  nome: string;
  cliente: string;
  responsabile: string;
  dataInizio: string;
  dataFine: string;
  status: 'aperta' | 'in_lavorazione' | 'chiusa' | 'fatturata';
  ricaviPrevisti: number;
  ricaviEffettivi: number;
  costiPrevisti: number;
  costiEffettivi: number;
  ore: number;
  categoria: string;
  priorita: 'bassa' | 'media' | 'alta';
  avanzamento: number;
}

const mockCommesse: Commessa[] = [
  {
    id: '1',
    codice: 'COM-2024-001',
    nome: 'Ristrutturazione Ufficio Centro',
    cliente: 'Azienda Alpha S.r.l.',
    responsabile: 'Mario Rossi',
    dataInizio: '2024-01-15',
    dataFine: '2024-06-30',
    status: 'in_lavorazione',
    ricaviPrevisti: 100000,
    ricaviEffettivi: 65000,
    costiPrevisti: 70000,
    costiEffettivi: 48000,
    ore: 320,
    categoria: 'Edilizia',
    priorita: 'alta',
    avanzamento: 65
  },
  {
    id: '2',
    codice: 'COM-2024-002',
    nome: 'Impianto Elettrico Stabilimento',
    cliente: 'Beta Industries S.p.A.',
    responsabile: 'Laura Bianchi',
    dataInizio: '2024-02-01',
    dataFine: '2024-08-15',
    status: 'aperta',
    ricaviPrevisti: 150000,
    ricaviEffettivi: 0,
    costiPrevisti: 95000,
    costiEffettivi: 12000,
    ore: 80,
    categoria: 'Impiantistica',
    priorita: 'media',
    avanzamento: 15
  },
  {
    id: '3',
    codice: 'COM-2024-003',
    nome: 'Consulenza IT Sistema Gestionale',
    cliente: 'Gamma Tech',
    responsabile: 'Giuseppe Verdi',
    dataInizio: '2024-01-01',
    dataFine: '2024-03-31',
    status: 'chiusa',
    ricaviPrevisti: 50000,
    ricaviEffettivi: 52000,
    costiPrevisti: 35000,
    costiEffettivi: 33000,
    ore: 280,
    categoria: 'IT',
    priorita: 'bassa',
    avanzamento: 100
  },
  {
    id: '4',
    codice: 'COM-2024-004',
    nome: 'Progetto Software CRM',
    cliente: 'Delta Solutions',
    responsabile: 'Anna Neri',
    dataInizio: '2024-03-01',
    dataFine: '2024-05-30',
    status: 'fatturata',
    ricaviPrevisti: 80000,
    ricaviEffettivi: 85000,
    costiPrevisti: 50000,
    costiEffettivi: 48000,
    ore: 340,
    categoria: 'Software',
    priorita: 'alta',
    avanzamento: 100
  }
];

const Commesse: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const navigate = useNavigate();

  const filteredCommesse = mockCommesse.filter(commessa => {
    const matchesSearch = commessa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commessa.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commessa.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commessa.responsabile.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || commessa.status === statusFilter;
    const matchesCategoria = categoriaFilter === 'all' || commessa.categoria === categoriaFilter;
    
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getPrioritaColor = (priorita: string) => {
    switch (priorita) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bassa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNewCommessa = () => {
    navigate('/commesse/nuova');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/commesse/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/commesse/${id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestione Commesse</h1>
          <p className="text-slate-600 mt-1">Gestisci e monitora tutte le commesse aziendali</p>
        </div>
        <Button 
          onClick={handleNewCommessa}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Commessa
        </Button>
      </div>

      {/* Statistiche Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Commesse Attive</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockCommesse.filter(c => c.status === 'aperta' || c.status === 'in_lavorazione').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ricavi YTD</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(mockCommesse.reduce((sum, c) => sum + c.ricaviEffettivi, 0))}
              </p>
            </div>
            <Euro className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ore Lavorate</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockCommesse.reduce((sum, c) => sum + c.ore, 0).toLocaleString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Margine Medio</p>
              <p className="text-2xl font-bold text-slate-900">
                {((mockCommesse.reduce((sum, c) => sum + (c.ricaviEffettivi - c.costiEffettivi), 0) / 
                   mockCommesse.reduce((sum, c) => sum + c.ricaviEffettivi, 0)) * 100).toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cerca per nome, cliente, codice o responsabile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="aperta">Aperta</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="chiusa">Chiusa</SelectItem>
                <SelectItem value="fatturata">Fatturata</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                <SelectItem value="Edilizia">Edilizia</SelectItem>
                <SelectItem value="Impiantistica">Impiantistica</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabella Commesse */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Commessa</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Cliente</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Responsabile</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Stato</th>
                <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Priorità</th>
                <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Avanzamento</th>
                <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Ricavi</th>
                <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Margine</th>
                <th className="text-center py-4 px-6 font-medium text-slate-700 text-sm">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCommesse.map((commessa) => {
                const margine = commessa.ricaviEffettivi > 0 ? 
                  ((commessa.ricaviEffettivi - commessa.costiEffettivi) / commessa.ricaviEffettivi) * 100 : 0;
                
                return (
                  <tr key={commessa.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="py-4 px-6" onClick={() => handleViewDetails(commessa.id)}>
                      <div>
                        <div className="font-medium text-slate-900">{commessa.nome}</div>
                        <div className="text-sm text-slate-500">{commessa.codice}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {formatDate(commessa.dataInizio)} - {formatDate(commessa.dataFine)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-900">{commessa.cliente}</div>
                      <div className="text-sm text-slate-500">{commessa.categoria}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900">{commessa.responsabile}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={commessa.status} />
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPrioritaColor(commessa.priorita)}`}>
                        {commessa.priorita.charAt(0).toUpperCase() + commessa.priorita.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${commessa.avanzamento}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{commessa.avanzamento}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-medium text-slate-900">
                        {formatCurrency(commessa.ricaviEffettivi)}
                      </div>
                      <div className="text-sm text-slate-500">
                        / {formatCurrency(commessa.ricaviPrevisti)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-medium ${
                        margine >= 30 ? 'text-emerald-600' : 
                        margine >= 15 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {margine.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            className="flex items-center gap-2"
                            onClick={() => handleViewDetails(commessa.id)}
                          >
                            <Eye className="w-4 h-4" />
                            Visualizza Dettagli
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2"
                            onClick={() => handleEdit(commessa.id)}
                          >
                            <Edit className="w-4 h-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Genera Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCommesse.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-500 text-lg font-medium">Nessuna commessa trovata</div>
            <div className="text-slate-400 text-sm mt-1">Prova a modificare i filtri di ricerca</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commesse;
