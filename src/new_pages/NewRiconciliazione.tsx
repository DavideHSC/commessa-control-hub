import { useState, useEffect, useCallback, useMemo } from 'react';
import { Target, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Input } from '../new_components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../new_components/ui/Select';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../new_components/ui/Dialog';
import { Progress } from '../new_components/ui/Progress';
import { AllocationForm } from '../new_components/forms/AllocationForm';

interface MovimentoContabile {
  id: string;
  numeroDocumento: string;
  dataDocumento: string;
  descrizione: string;
  importo: number;
  conto: { codice: string; nome: string } | null;
  cliente: { nome: string } | null;
  fornitore: { nome: string } | null;
  causale: { descrizione: string } | null;
  allocazioni: Allocazione[];
  importoAllocato: number;
  importoResiduo: number;
  stato: 'non_allocato' | 'parzialmente_allocato' | 'completamente_allocato';
}

interface Allocazione {
  id: string;
  commessaId: string;
  voceAnaliticaId: string;
  importo: number;
  percentuale: number;
  commessa: { nome: string };
  voceAnalitica: { nome: string };
}

interface Commessa {
  id: string;
  nome: string;
  cliente: { nome: string } | null;
  stato: string;
  isAttiva: boolean;
}

interface VoceAnalitica {
  id: string;
  nome: string;
  tipo: 'costo' | 'ricavo';
  isAttiva: boolean;
}

interface AllocationStats {
  totaleMovimenti: number;
  nonAllocati: number;
  parzialmAllocati: number;
  completamenteAllocati: number;
  importoTotale: number;
  importoAllocato: number;
  totale: number;
  percentualeCompletamento: number;
}

export const NewRiconciliazione = () => {
  const [movimenti, setMovimenti] = useState<MovimentoContabile[]>([]);
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [vociAnalitiche, setVociAnalitiche] = useState<VoceAnalitica[]>([]);
  const [stats, setStats] = useState<AllocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovimento, setSelectedMovimento] = useState<MovimentoContabile | null>(null);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statoFilter, setStatoFilter] = useState('all');
  const [contoFilter, setContoFilter] = useState('all');

  // Calculate allocation statistics
  const calculateStats = useCallback((movimentiData: MovimentoContabile[]): AllocationStats => {
    const nonAllocati = movimentiData.filter(m => m.stato === 'non_allocato').length;
    const parzialmAllocati = movimentiData.filter(m => m.stato === 'parzialmente_allocato').length;
    const completamenteAllocati = movimentiData.filter(m => m.stato === 'completamente_allocato').length;
    const totale = movimentiData.length;

    return {
      totaleMovimenti: totale,
      nonAllocati,
      parzialmAllocati,
      completamenteAllocati,
      importoTotale: movimentiData.reduce((sum, m) => sum + (m.importo || 0), 0),
      importoAllocato: movimentiData
        .filter(m => m.stato !== 'non_allocato')
        .reduce((sum, m) => sum + (m.importo || 0), 0),
      totale,
      percentualeCompletamento: totale > 0 ? Math.round((completamenteAllocati / totale) * 100) : 0,
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movimenti with allocation info (usando endpoint esistente)
        const movimentiResponse = await fetch('/api/reconciliation/run', { method: 'POST' });
        let movimentiArray: MovimentoContabile[] = [];
        if (movimentiResponse.ok) {
          const reconciliationData = await movimentiResponse.json();
          // Converti righeDaRiconciliare in formato MovimentoContabile
          const righeDaRiconciliare = reconciliationData.righeDaRiconciliare || [];
          movimentiArray = righeDaRiconciliare.map((riga: any) => ({
            id: riga.id,
            numeroDocumento: riga.externalId,
            dataDocumento: riga.data,
            descrizione: riga.descrizione,
            importo: riga.importo,
            conto: riga.conto,
            cliente: null,
            fornitore: null,
            causale: null,
            allocazioni: [],
            importoAllocato: 0,
            importoResiduo: riga.importo,
            stato: 'non_allocato' as const
          }));
          setMovimenti(movimentiArray);
        }

        // Fetch commesse attive using the select endpoint
        const commesseResponse = await fetch('/api/commesse/select?active=true');
        if (commesseResponse.ok) {
          const commesseData = await commesseResponse.json();
          setCommesse(Array.isArray(commesseData) ? commesseData : []);
        }

        // Fetch voci analitiche attive
        const vociResponse = await fetch('/api/voci-analitiche?active=true');
        if (vociResponse.ok) {
          const vociData = await vociResponse.json();
          setVociAnalitiche(Array.isArray(vociData) ? vociData : vociData.data || []);
        }

        // Calculate stats from loaded data
        const statsData = calculateStats(movimentiArray);
        setStats(statsData);
      } catch (error) {
        console.error('Errore nel caricamento dati:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [calculateStats]);

  // Filter movimenti based on search and filters
  const filteredMovimenti = useMemo(() => {
    return movimenti.filter(movimento => {
      const matchesSearch = !searchTerm || 
        movimento.numeroDocumento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movimento.descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movimento.conto?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStato = statoFilter === 'all' || movimento.stato === statoFilter;
      const matchesConto = contoFilter === 'all' || movimento.conto?.codice === contoFilter;
      
      return matchesSearch && matchesStato && matchesConto;
    });
  }, [movimenti, searchTerm, statoFilter, contoFilter]);

  // Format utilities
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is valid and not Unix epoch (01/01/1970)
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
        return '-';
      }
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }, []);

  // Get allocation progress percentage
  const getAllocationProgress = useCallback((movimento: MovimentoContabile) => {
    if (!movimento.importo || movimento.importo === 0) return 0;
    return Math.round((movimento.importoAllocato / Math.abs(movimento.importo)) * 100);
  }, []);

  // Table columns
  const movimentiColumns = useMemo(() => [
    {
      key: 'numeroDocumento' as const,
      header: 'N. Documento',
      sortable: true,
      render: (numero: unknown, row: unknown) => {
        const movimento = row as MovimentoContabile;
        return (
          <div>
            <div className="font-medium">{numero as string}</div>
            <div className="text-sm text-gray-500 whitespace-nowrap">{formatDate(movimento.dataDocumento)}</div>
          </div>
        );
      }
    },
    {
      key: 'descrizione' as const,
      header: 'Descrizione',
      render: (descrizione: unknown, row: unknown) => {
        const movimento = row as MovimentoContabile;
        return (
          <div>
            <div className="font-medium truncate max-w-xs">{descrizione as string}</div>
            {movimento.conto && (
              <div className="text-sm text-gray-500">
                {movimento.conto.codice} - {movimento.conto.nome}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'importo' as const,
      header: 'Importo',
      render: (importo: unknown) => (
        <span className={`font-medium ${(importo as number) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(importo as number)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'stato' as const,
      header: 'Allocazione',
      render: (stato: unknown, row: unknown) => {
        const movimento = row as MovimentoContabile;
        const progress = getAllocationProgress(movimento);
        
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {stato === 'non_allocato' && <AlertTriangle className="w-4 h-4 text-red-500" />}
              {stato === 'parzialmente_allocato' && <Clock className="w-4 h-4 text-yellow-500" />}
              {stato === 'completamente_allocato' && <CheckCircle className="w-4 h-4 text-green-500" />}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                stato === 'non_allocato' ? 'bg-red-100 text-red-800' :
                stato === 'parzialmente_allocato' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {stato === 'non_allocato' ? 'Non Allocato' :
                 stato === 'parzialmente_allocato' ? 'Parziale' : 'Completo'}
              </span>
            </div>
            <div className="w-full">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(movimento.importoAllocato)} / {formatCurrency(Math.abs(movimento.importo))}
              </div>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'allocazioni' as const,
      header: 'Allocazioni',
      render: (allocazioni: unknown) => {
        const allocs = allocazioni as Allocazione[];
        if (!allocs || allocs.length === 0) return <span className="text-gray-400">Nessuna</span>;
        
        return (
          <div className="space-y-1">
            {allocs.slice(0, 2).map((alloc, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium">{alloc.commessa.nome}</span>
                <span className="text-gray-500"> • {alloc.voceAnalitica.nome}</span>
                <span className="text-blue-600"> ({alloc.percentuale}%)</span>
              </div>
            ))}
            {allocs.length > 2 && (
              <div className="text-xs text-gray-500">
                +{allocs.length - 2} altre...
              </div>
            )}
          </div>
        );
      }
    },
  ], [formatCurrency, formatDate, getAllocationProgress]);

  // Handle allocation
  const handleAllocate = useCallback((movimento: MovimentoContabile) => {
    setSelectedMovimento(movimento);
    setIsAllocationDialogOpen(true);
  }, []);

  const handleAllocationSubmit = useCallback(async (allocationData: Record<string, unknown>) => {
    if (!selectedMovimento) return;

    try {
      const response = await fetch(`/api/reconciliation/allocate/${selectedMovimento.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocationData),
      });

      if (response.ok) {
        // Refresh data
        const movimentiResponse = await fetch('/api/reconciliation/movimenti');
        if (movimentiResponse.ok) {
          const movimentiData = await movimentiResponse.json();
          const newMovimenti = Array.isArray(movimentiData) ? movimentiData : movimentiData.data || [];
          setMovimenti(newMovimenti);
          setStats(calculateStats(newMovimenti));
        }
        setIsAllocationDialogOpen(false);
        setSelectedMovimento(null);
      }
    } catch (error) {
      console.error('Error creating allocation:', error);
    }
  }, [selectedMovimento, calculateStats]);

  // Unique values for filters
  const contiOptions = useMemo(() => {
    const conti = movimenti
      .filter(m => m.conto)
      .map(m => ({ codice: m.conto!.codice, nome: m.conto!.nome }))
      .filter((value, index, self) => 
        self.findIndex(v => v.codice === value.codice) === index
      );
    return conti;
  }, [movimenti]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riconciliazione</h1>
          <p className="text-gray-500">Allocazione movimenti contabili alle commesse</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totaleMovimenti}</div>
              <p className="text-sm text-gray-500">Totale Movimenti</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.nonAllocati}</div>
              <p className="text-sm text-gray-500">Non Allocati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.parzialmAllocati}</div>
              <p className="text-sm text-gray-500">Parziali</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.completamenteAllocati}</div>
              <p className="text-sm text-gray-500">Completati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-bold">
                {stats.importoTotale !== 0 
                  ? Math.round((stats.importoAllocato / Math.abs(stats.importoTotale)) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-500">Allocazione Totale</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca movimenti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statoFilter} onValueChange={setStatoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stato Allocazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="non_allocato">Non Allocato</SelectItem>
                <SelectItem value="parzialmente_allocato">Parzialmente Allocato</SelectItem>
                <SelectItem value="completamente_allocato">Completamente Allocato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contoFilter} onValueChange={setContoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Conto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i conti</SelectItem>
                {contiOptions.map(conto => (
                  <SelectItem key={conto.codice} value={conto.codice}>
                    {conto.codice} - {conto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatoFilter('all');
                setContoFilter('all');
              }}
            >
              Pulisci Filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movimenti Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movimenti Contabili</CardTitle>
          <p className="text-sm text-gray-500">
            {filteredMovimenti.length} movimenti trovati
          </p>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            data={filteredMovimenti as unknown as Record<string, unknown>[]}
            columns={movimentiColumns}
            onEdit={(row) => handleAllocate(row as unknown as MovimentoContabile)}
            loading={loading}
            searchable={false}
            paginated={filteredMovimenti.length > 20}
            emptyMessage="Nessun movimento trovato con i filtri selezionati"
            showActions={true}
            editLabel="Alloca"
            editIcon={Target}
            showDelete={false}
            showView={false}
            rowClassName={(row) => {
              const movimento = row as unknown as MovimentoContabile;
              return movimento.stato === 'completamente_allocato' ? 'bg-green-50' : '';
            }}
          />
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Allocazione Movimento</DialogTitle>
          </DialogHeader>
          {selectedMovimento && (
            <AllocationForm
              movimento={selectedMovimento}
              commesse={commesse}
              vociAnalitiche={vociAnalitiche}
              onSubmit={handleAllocationSubmit}
              onCancel={() => {
                setIsAllocationDialogOpen(false);
                setSelectedMovimento(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};