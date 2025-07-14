import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Eye,
  Search
} from 'lucide-react';
import { getCommesseWithPerformance, CommessaWithPerformance } from '@/api/commessePerformance';
import { ComparativeView } from '@/components/commesse/ComparativeView';
import { StatusBadge, MargineBadge } from '@/components/commesse/StatusIndicators';

const ComparativeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const [commesse, setCommesse] = useState<CommessaWithPerformance[]>([]);
  const [filteredCommesse, setFilteredCommesse] = useState<CommessaWithPerformance[]>([]);
  const [selectedCommesse, setSelectedCommesse] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilter, setClienteFilter] = useState<string>('all');
  const [statoFilter, setStatoFilter] = useState<string>('all');
  const [margineFilter, setMargineFilter] = useState<string>('all');

  // Inizializza con commessa selezionata da URL se presente
  const initialCommessaId = searchParams.get('commessa');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getCommesseWithPerformance();
        setCommesse(data.commesse);
        setFilteredCommesse(data.commesse);
        
        // Seleziona automaticamente le prime 5 commesse o quella specifica dall'URL
        if (initialCommessaId) {
          setSelectedCommesse([initialCommessaId]);
        } else {
          setSelectedCommesse(data.commesse.slice(0, 5).map(c => c.id));
        }
      } catch (error) {
        console.error('Errore nel caricamento delle commesse:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialCommessaId]);

  // Applica filtri
  useEffect(() => {
    let filtered = [...commesse];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (clienteFilter !== 'all') {
      filtered = filtered.filter(c => c.cliente.id === clienteFilter);
    }

    if (statoFilter !== 'all') {
      filtered = filtered.filter(c => {
        if (statoFilter === 'attiva') return c.percentualeAvanzamento > 0 && c.percentualeAvanzamento < 100;
        if (statoFilter === 'completata') return c.percentualeAvanzamento >= 100;
        if (statoFilter === 'critica') return c.margine < 0;
        return true;
      });
    }

    if (margineFilter !== 'all') {
      filtered = filtered.filter(c => {
        if (margineFilter === 'positivo') return c.margine > 0;
        if (margineFilter === 'negativo') return c.margine < 0;
        if (margineFilter === 'alto') return c.margine >= 20;
        if (margineFilter === 'medio') return c.margine >= 10 && c.margine < 20;
        if (margineFilter === 'basso') return c.margine < 10;
        return true;
      });
    }

    setFilteredCommesse(filtered);
  }, [commesse, searchTerm, clienteFilter, statoFilter, margineFilter]);

  const handleCommessaToggle = (commessaId: string) => {
    setSelectedCommesse(prev => 
      prev.includes(commessaId) 
        ? prev.filter(id => id !== commessaId)
        : [...prev, commessaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCommesse.length === filteredCommesse.length) {
      setSelectedCommesse([]);
    } else {
      setSelectedCommesse(filteredCommesse.map(c => c.id));
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    console.log(`Esportazione ${type} per commesse:`, selectedCommesse);
    // TODO: Implementare logica di esportazione
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Ottieni lista clienti unici
  const clientiUnici = Array.from(new Set(commesse.map(c => c.cliente.id)))
    .map(id => commesse.find(c => c.cliente.id === id)?.cliente)
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Caricamento analisi comparative...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analisi Comparative</h1>
          <p className="text-slate-600 mt-1">Confronta performance e andamenti tra commesse</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {selectedCommesse.length} commesse selezionate
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setSelectedCommesse([])}>
            Deseleziona tutto
          </Button>
        </div>
      </div>

      {/* Filtri e Selezione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri e Selezione Commesse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtri */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label className="text-sm font-medium">Ricerca</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Nome commessa o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Cliente</Label>
                <Select value={clienteFilter} onValueChange={setClienteFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i clienti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i clienti</SelectItem>
                    {clientiUnici.map((cliente) => (
                      <SelectItem key={cliente?.id} value={cliente?.id || ''}>
                        {cliente?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Stato</Label>
                <Select value={statoFilter} onValueChange={setStatoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti gli stati" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="attiva">Attive</SelectItem>
                    <SelectItem value="completata">Completate</SelectItem>
                    <SelectItem value="critica">Critiche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Margine</Label>
                <Select value={margineFilter} onValueChange={setMargineFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i margini" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i margini</SelectItem>
                    <SelectItem value="alto">Alto (≥20%)</SelectItem>
                    <SelectItem value="medio">Medio (10-20%)</SelectItem>
                    <SelectItem value="basso">Basso (<10%)</SelectItem>
                    <SelectItem value="positivo">Positivo</SelectItem>
                    <SelectItem value="negativo">Negativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={handleSelectAll} className="w-full">
                  {selectedCommesse.length === filteredCommesse.length ? 'Deseleziona' : 'Seleziona'} Tutto
                </Button>
              </div>
            </div>

            {/* Lista Commesse per Selezione */}
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCommesse.map((commessa) => (
                  <div key={commessa.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                    <Checkbox
                      id={commessa.id}
                      checked={selectedCommesse.includes(commessa.id)}
                      onCheckedChange={() => handleCommessaToggle(commessa.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{commessa.nome}</span>
                        <StatusBadge margine={commessa.margine} percentuale={commessa.percentualeAvanzamento} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{commessa.cliente.nome}</span>
                        <MargineBadge margine={commessa.margine} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiche Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-slate-600">Commesse Totali</div>
                <div className="text-2xl font-bold">{filteredCommesse.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-slate-600">Margine Medio</div>
                <div className="text-2xl font-bold">
                  {formatPercentage(filteredCommesse.reduce((acc, c) => acc + c.margine, 0) / filteredCommesse.length || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-slate-600">Clienti Unici</div>
                <div className="text-2xl font-bold">{clientiUnici.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm text-slate-600">Selezionate</div>
                <div className="text-2xl font-bold">{selectedCommesse.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista Comparativa */}
      {selectedCommesse.length > 0 ? (
        <ComparativeView
          commesse={filteredCommesse.filter(c => selectedCommesse.includes(c.id))}
          selectedCommessaId={initialCommessaId || undefined}
          onExport={handleExport}
        />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nessuna commessa selezionata</h3>
            <p className="text-slate-600">Seleziona almeno una commessa per iniziare l'analisi comparativa.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparativeAnalysis;