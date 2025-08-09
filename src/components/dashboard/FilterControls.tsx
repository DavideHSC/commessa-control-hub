import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X,
  Search,
  RefreshCw
} from 'lucide-react';
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export interface DashboardFilters {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  clienteId?: string;
  statoCommessa?: string;
  tipoCommessa?: string;
  margineMin?: number;
  margineMax?: number;
  searchText?: string;
}

interface FilterControlsProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  clienti: Array<{ id: string; nome: string }>;
  isOpen: boolean;
  onToggle: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  clienti,
  isOpen,
  onToggle
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange?.from ? filters.dateRange as DateRange : undefined
  );

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    handleFilterChange('dateRange', range || {});
  };

  const clearAllFilters = () => {
    setDateRange(undefined);
    onFiltersChange({
      dateRange: {},
      clienteId: undefined,
      statoCommessa: undefined,
      tipoCommessa: undefined,
      margineMin: undefined,
      margineMax: undefined,
      searchText: undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.clienteId) count++;
    if (filters.statoCommessa) count++;
    if (filters.tipoCommessa) count++;
    if (filters.margineMin !== undefined || filters.margineMax !== undefined) count++;
    if (filters.searchText) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="relative">
      
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtri
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Filters Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 z-50 w-96 shadow-lg border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtri Dashboard
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            
            {/* Ricerca Testuale */}
            <div className="space-y-2">
              <Label>Ricerca Commesse</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nome commessa o cliente..."
                  value={filters.searchText || ''}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Range Date */}
            <div className="space-y-2">
              <Label>Periodo di Riferimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: it })} -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: it })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: it })
                      )
                    ) : (
                      <span>Seleziona periodo</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    locale={it}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Cliente/Comune</Label>
              <Select 
                value={filters.clienteId || '__all__'} 
                onValueChange={(value) => handleFilterChange('clienteId', value === '__all__' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i clienti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tutti i clienti</SelectItem>
                  {clienti.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stato Commessa */}
            <div className="space-y-2">
              <Label>Stato Commessa</Label>
              <Select 
                value={filters.statoCommessa || '__all__'} 
                onValueChange={(value) => handleFilterChange('statoCommessa', value === '__all__' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tutti gli stati</SelectItem>
                  <SelectItem value="In Corso">In Corso</SelectItem>
                  <SelectItem value="Completata">Completata</SelectItem>
                  <SelectItem value="Sospesa">Sospesa</SelectItem>
                  <SelectItem value="Pianificata">Pianificata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo Commessa */}
            <div className="space-y-2">
              <Label>Tipo Commessa</Label>
              <Select 
                value={filters.tipoCommessa || '__all__'} 
                onValueChange={(value) => handleFilterChange('tipoCommessa', value === '__all__' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tutti i tipi</SelectItem>
                  <SelectItem value="Comune">Comune (Padre)</SelectItem>
                  <SelectItem value="Attività">Attività Specifica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Range Margine */}
            <div className="space-y-2">
              <Label>Filtro per Margine (%)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  value={filters.margineMin || ''}
                  onChange={(e) => handleFilterChange('margineMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  value={filters.margineMax || ''}
                  onChange={(e) => handleFilterChange('margineMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Azioni */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={onToggle}
                className="flex-1"
              >
                Applica Filtri
              </Button>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
};