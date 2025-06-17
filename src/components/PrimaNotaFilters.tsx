
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrimaNotaFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  causaleFilter: string;
  setCausaleFilter: (value: string) => void;
  statoFilter: string;
  setStatoFilter: (value: string) => void;
  dataInizio: string;
  setDataInizio: (value: string) => void;
  dataFine: string;
  setDataFine: (value: string) => void;
}

const PrimaNotaFilters: React.FC<PrimaNotaFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  causaleFilter,
  setCausaleFilter,
  statoFilter,
  setStatoFilter,
  dataInizio,
  setDataInizio,
  dataFine,
  setDataFine
}) => {
  return (
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
  );
};

export default PrimaNotaFilters;
