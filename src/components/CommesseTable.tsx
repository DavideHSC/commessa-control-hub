import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Edit, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

interface Commessa {
  id: string;
  nome: string;
  codice: string;
  cliente: string;
  status: 'aperta' | 'in_lavorazione' | 'chiusa' | 'fatturata';
  ricavi: number;
  costi: number;
  margine: number;
}

const mockCommesse: Commessa[] = [
  {
    id: '1',
    nome: 'Ristrutturazione Ufficio Centro',
    codice: 'COM-2024-001',
    cliente: 'Azienda Alpha S.r.l.',
    status: 'in_lavorazione',
    ricavi: 85000,
    costi: 62000,
    margine: 27.1
  },
  {
    id: '2',
    nome: 'Impianto Elettrico Stabilimento',
    codice: 'COM-2024-002',
    cliente: 'Beta Industries S.p.A.',
    status: 'aperta',
    ricavi: 120000,
    costi: 78000,
    margine: 35.0
  },
  {
    id: '3',
    nome: 'Consulenza IT Sistema Gestionale',
    codice: 'COM-2024-003',
    cliente: 'Gamma Tech',
    status: 'chiusa',
    ricavi: 45000,
    costi: 32000,
    margine: 28.9
  },
  {
    id: '4',
    nome: 'Progetto Software CRM',
    codice: 'COM-2024-004',
    cliente: 'Delta Solutions',
    status: 'fatturata',
    ricavi: 95000,
    costi: 58000,
    margine: 38.9
  }
];

const CommesseTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredCommesse = mockCommesse.filter(commessa => {
    const matchesSearch = commessa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commessa.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commessa.codice.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || commessa.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/commesse/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/commesse/${id}/edit`);
  };

  const handleRowClick = (id: string) => {
    handleViewDetails(id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Cerca per nome, cliente o codice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-slate-200">
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="aperta">Aperta</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="chiusa">Chiusa</SelectItem>
                <SelectItem value="fatturata">Fatturata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Commessa</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Cliente</th>
              <th className="text-left py-4 px-6 font-medium text-slate-700 text-sm">Stato</th>
              <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Ricavi</th>
              <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Costi</th>
              <th className="text-right py-4 px-6 font-medium text-slate-700 text-sm">Margine</th>
              <th className="text-center py-4 px-6 font-medium text-slate-700 text-sm">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCommesse.map((commessa) => (
              <tr 
                key={commessa.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(commessa.id)}
              >
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-slate-900">{commessa.nome}</div>
                    <div className="text-sm text-slate-500">{commessa.codice}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-slate-900">{commessa.cliente}</div>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={commessa.status} />
                </td>
                <td className="py-4 px-6 text-right font-medium text-slate-900">
                  {formatCurrency(commessa.ricavi)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-slate-900">
                  {formatCurrency(commessa.costi)}
                </td>
                <td className="py-4 px-6 text-right">
                  <span className={`font-medium ${
                    commessa.margine >= 30 ? 'text-emerald-600' : 
                    commessa.margine >= 20 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {commessa.margine.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(commessa.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Visualizza Dettagli
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(commessa.id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                        <Archive className="w-4 h-4" />
                        Archivia
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCommesse.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 text-sm">Nessuna commessa trovata</div>
        </div>
      )}
    </div>
  );
};

export default CommesseTable;
