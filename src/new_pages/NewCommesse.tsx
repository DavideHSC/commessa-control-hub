import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Input } from '../new_components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../new_components/ui/Select';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';
import { CommessaForm } from '../new_components/forms/CommessaForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../new_components/ui/Dialog';
import { useCommessaContext } from '../new_context/CommessaContext';

interface Cliente {
  id: string;
  nome: string;
  codice: string;
}

interface Commessa {
  id: string;
  nome: string;
  descrizione?: string;
  cliente: { nome: string } | null;
  clienteId: string;
  budget: number;
  costi: number;
  ricavi: number;
  margine: number;
  percentualeAvanzamento: number;
  stato: string;
  dataInizio: string;
  dataFine?: string;
  isAttiva: boolean;
}

interface CommesseStats {
  totale: number;
  attive: number;
  completate: number;
  budgetTotale: number;
}

export const NewCommesse = () => {
  const navigate = useNavigate();
  const { updateCommessa, getCommessa } = useCommessaContext();
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [stats, setStats] = useState<CommesseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCommessa, setSelectedCommessa] = useState<Commessa | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clienteFilter, setClienteFilter] = useState('all');


  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch commesse
        const commesseResponse = await fetch('/api/commesse-performance');
        let commesseData: Commessa[] = [];
        if (commesseResponse.ok) {
          const result = await commesseResponse.json();
          // Handle both array and object with commesse property
          if (Array.isArray(result)) {
            commesseData = result;
          } else if (result.commesse && Array.isArray(result.commesse)) {
            commesseData = result.commesse;
          }
          // Apply any updates from context
          const updatedCommesseData = commesseData.map((commessa: Commessa) => 
            getCommessa(commessa.id, commessa)
          );
          setCommesse(updatedCommesseData);
        }

        // Fetch clienti for filters and forms
        const clientiResponse = await fetch('/api/clienti');
        if (clientiResponse.ok) {
          const clientiData = await clientiResponse.json();
          setClienti(Array.isArray(clientiData) ? clientiData : clientiData.data || []);
        }

        // Calculate stats
        const statsData: CommesseStats = {
          totale: commesseData.length,
          attive: commesseData.filter((c: Commessa) => c.stato === 'In Corso').length,
          completate: commesseData.filter((c: Commessa) => c.stato === 'Completata').length,
          budgetTotale: commesseData.reduce((acc: number, c: Commessa) => acc + (c.budget || 0), 0),
        };
        setStats(statsData);
      } catch (error) {
        console.error('Errore nel caricamento dati:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getCommessa]);

  // Filter commesse based on search and filters
  const filteredCommesse = useMemo(() => {
    console.log('🔍 Debug filtri:', { clienteFilter, searchTerm, statusFilter });
    console.log('📊 Commesse data sample:', commesse[0]);
    
    return commesse.filter(commessa => {
      const matchesSearch = !searchTerm || 
        commessa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commessa.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || commessa.stato === statusFilter;
      const matchesCliente = clienteFilter === 'all' || 
        String(commessa.clienteId) === String(clienteFilter) ||
        (commessa.cliente && 'id' in commessa.cliente ? commessa.cliente.id : null) === clienteFilter;
      
      if (clienteFilter !== 'all') {
        console.log(`🔍 Cliente filter for ${commessa.nome}:`, {
          clienteFilter,
          'commessa.clienteId': commessa.clienteId,
          'commessa.cliente?.id': commessa.cliente && 'id' in commessa.cliente ? commessa.cliente.id : null,
          matchesCliente
        });
      }
      
      return matchesSearch && matchesStatus && matchesCliente;
    });
  }, [commesse, searchTerm, statusFilter, clienteFilter]);

  // Format utilities
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('it-IT');
    } catch {
      return '-';
    }
  }, []);

  // Table columns configuration
  const commesseColumns = useMemo(() => [
    { 
      key: 'nome' as const, 
      label: 'Nome Commessa', 
      sortable: true,
      render: (nome: unknown, row: unknown) => {
        const commessa = row as Commessa;
        return (
          <div>
            <div className="font-medium">{nome as string}</div>
            {commessa.descrizione && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {commessa.descrizione}
              </div>
            )}
          </div>
        );
      }
    },
    { 
      key: 'cliente' as const, 
      label: 'Cliente',
      render: (cliente: unknown) => (cliente as { nome: string } | null)?.nome || 'N/A'
    },
    { 
      key: 'stato' as const, 
      label: 'Stato',
      render: (stato: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          stato === 'In Corso' ? 'bg-blue-100 text-blue-800' :
          stato === 'Completata' ? 'bg-green-100 text-green-800' :
          stato === 'In Pausa' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {stato as string}
        </span>
      ),
      sortable: true,
    },
    { 
      key: 'budget' as const, 
      label: 'Budget',
      render: (budget: unknown) => formatCurrency(budget as number),
      sortable: true,
    },
    { 
      key: 'costi' as const, 
      label: 'Costi',
      render: (costi: unknown) => formatCurrency(costi as number),
      sortable: true,
    },
    { 
      key: 'margine' as const, 
      label: 'Margine',
      render: (margine: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          typeof margine === 'number' && margine >= 20 
            ? 'bg-green-100 text-green-800' 
            : typeof margine === 'number' && margine >= 10
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {formatPercentage(margine as number)}
        </span>
      ),
      sortable: true,
    },
    { 
      key: 'percentualeAvanzamento' as const, 
      label: 'Avanzamento',
      render: (perc: unknown) => formatPercentage(perc as number),
      sortable: true,
    },
    { 
      key: 'dataInizio' as const, 
      label: 'Data Inizio',
      render: (data: unknown) => formatDate(data as string),
      sortable: true,
    },
  ], [formatCurrency, formatPercentage, formatDate]);

  // Client options for forms and filters
  const clientiOptions = useMemo(() => 
    clienti.map(cliente => ({
      label: cliente.nome,
      value: cliente.id,
    }))
  , [clienti]);

  // Handle commessa creation
  const handleCreateCommessa = useCallback(async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/commesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Refresh commesse list
        const commesseResponse = await fetch('/api/commesse-performance');
        if (commesseResponse.ok) {
          const commesseResult = await commesseResponse.json();
          setCommesse(Array.isArray(commesseResult) ? commesseResult : commesseResult.commesse || []);
        }
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating commessa:', error);
    }
  }, []);

  // Handle commessa edit (temporary frontend-only simulation until backend supports PUT)
  const handleEditCommessa = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedCommessa) return;
    
    try {
      // Update context with changes (persists across navigation)
      const updates: any = {
        ...data,
        // Ensure dates are properly formatted
        dataInizio: data.dataInizio ? new Date(data.dataInizio as string).toISOString() : selectedCommessa.dataInizio,
        dataFine: data.dataFine ? new Date(data.dataFine as string).toISOString() : selectedCommessa.dataFine,
      };

      // If clienteId changed, update the nested cliente object
      if (data.clienteId && data.clienteId !== selectedCommessa.clienteId) {
        const selectedCliente = clienti.find(c => c.id === data.clienteId);
        if (selectedCliente) {
          updates.cliente = {
            nome: selectedCliente.nome,
            codice: selectedCliente.codice
          };
        }
      }
      
      updateCommessa(selectedCommessa.id, updates);
      
      // Update local state with new data
      const updatedCommessa = {
        ...selectedCommessa,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update in the commesse array
      setCommesse(prev => prev.map(c => c.id === selectedCommessa.id ? updatedCommessa as Commessa : c));
      setIsEditDialogOpen(false);
      setSelectedCommessa(null);
      
    } catch (error) {
      console.error('Error editing commessa:', error);
      alert(`Errore nella simulazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }, [selectedCommessa, updateCommessa, clienti]);

  // Handle table actions
  const handleView = useCallback((commessa: Commessa) => {
    navigate(`/new/commesse/${commessa.id}`);
  }, [navigate]);

  const handleEdit = useCallback((commessa: Commessa) => {
    setSelectedCommessa(commessa);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (commessa: Commessa) => {
    if (!confirm('Sei sicuro di voler eliminare questa commessa?')) return;
    
    try {
      const response = await fetch(`/api/commesse/${commessa.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh commesse list
        const commesseResponse = await fetch('/api/commesse-performance');
        if (commesseResponse.ok) {
          const commesseResult = await commesseResponse.json();
          setCommesse(Array.isArray(commesseResult) ? commesseResult : commesseResult.commesse || []);
        }
      }
    } catch (error) {
      console.error('Error deleting commessa:', error);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commesse</h1>
          <p className="text-gray-500">Gestione e monitoraggio delle commesse aziendali</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuova Commessa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuova Commessa</DialogTitle>
              </DialogHeader>
              <CommessaForm
                onSubmit={handleCreateCommessa}
                onCancel={() => setIsCreateDialogOpen(false)}
                clientiOptions={clientiOptions}
                hideTitle
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Totale Commesse</p>
                  <p className="text-2xl font-bold">{stats.totale}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Commesse Attive</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.attive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completate</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Budget Totale</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.budgetTotale)}</p>
                </div>
              </div>
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
                placeholder="Cerca commesse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="In Corso">In Corso</SelectItem>
                <SelectItem value="Completata">Completata</SelectItem>
                <SelectItem value="In Pausa">In Pausa</SelectItem>
                <SelectItem value="Annullata">Annullata</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clienteFilter} onValueChange={setClienteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i clienti</SelectItem>
                {clienti.map(cliente => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setClienteFilter('all');
              }}
            >
              Pulisci Filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commesse Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Commesse</CardTitle>
          <p className="text-sm text-gray-500">
            {filteredCommesse.length} commesse trovate
          </p>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            data={filteredCommesse as unknown as Record<string, unknown>[]}
            columns={commesseColumns}
            onView={(row) => handleView(row as unknown as Commessa)}
            onEdit={(row) => handleEdit(row as unknown as Commessa)}
            onDelete={(id) => handleDelete({id} as unknown as Commessa)}
            loading={loading}
            searchable={false} // Search is handled by external filters
            paginated={filteredCommesse.length > 20}
            emptyMessage="Nessuna commessa trovata con i filtri selezionati"
            showActions={true}
            rowClassName={(row) => {
              const commessa = row as unknown as Commessa;
              return !commessa.isAttiva ? 'opacity-60' : '';
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Commessa</DialogTitle>
          </DialogHeader>
          {selectedCommessa && (
            <CommessaForm
              commessa={selectedCommessa as unknown as Record<string, unknown>}
              onSubmit={handleEditCommessa}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedCommessa(null);
              }}
              clientiOptions={clientiOptions}
              hideTitle
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};