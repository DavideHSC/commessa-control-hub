import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Building2, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Input } from '../new_components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../new_components/ui/Select';
import { Badge } from '../new_components/ui/Badge';
import { Progress } from '../new_components/ui/Progress';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { CommessaForm } from '../new_components/forms/CommessaForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../new_components/ui/Dialog';
import { useCommessaContext } from '../new_context/CommessaContext';
import { prepareCommessaForForm } from '../utils/commessaFormUtils';

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
  priorita: string;
  dataInizio: string;
  dataFine?: string;
  isAttiva: boolean;
  figlie?: Commessa[]; // 🔧 AGGIUNTO: Support per gerarchia
  parentId?: string;   // 🔧 AGGIUNTO: Parent reference
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

  const ownBudgetForSelected = useMemo(() => {
    if (!selectedCommessa) return 0;
    if (!selectedCommessa.figlie || selectedCommessa.figlie.length === 0) {
      return selectedCommessa.budget;
    }
    const subCommesseBudget = selectedCommessa.figlie.reduce((acc, figlia) => acc + figlia.budget, 0);
    return selectedCommessa.budget - subCommesseBudget;
  }, [selectedCommessa]);

  const commessaForForm = useMemo(() => {
    if (!selectedCommessa) return undefined;
    return prepareCommessaForForm({
      ...selectedCommessa,
      budget: ownBudgetForSelected,
    });
  }, [selectedCommessa, ownBudgetForSelected]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch commesse con gerarchia (Commesse principali + Sub-commesse)
        const commesseResponse = await fetch('/api/commesse-performance');
        let commesseData: Commessa[] = [];
        if (commesseResponse.ok) {
          const result = await commesseResponse.json();
          // 🔧 MANTENGO STRUTTURA GERARCHICA: commesse padre con figlie annidate
          if (result.commesse && Array.isArray(result.commesse)) {
            // Applico updates dal context mantenendo la gerarchia
            const updatedCommesseData = result.commesse.map((padre: Commessa) => {
              const updatedPadre = getCommessa(padre.id, padre);
              
              // Aggiorna anche le figlie se esistono
              if (padre.figlie && Array.isArray(padre.figlie)) {
                updatedPadre.figlie = padre.figlie.map((figlia: Commessa) => 
                  getCommessa(figlia.id, figlia)
                );
              }
              
              return updatedPadre;
            });
            
            commesseData = updatedCommesseData;
          }
          setCommesse(commesseData);
        }

        // Fetch clienti for filters and forms
        const clientiResponse = await fetch('/api/clienti');
        if (clientiResponse.ok) {
          const clientiData = await clientiResponse.json();
          setClienti(Array.isArray(clientiData) ? clientiData : clientiData.data || []);
        }

        // Calculate stats (solo commesse padre - i totali sono già consolidati)
        console.log('📊 Calculating stats from commesse data. Sample budget:', commesseData[0]?.budget);
        
        const budgetTotale = commesseData.reduce((acc: number, c: Commessa) => {
          let budget = 0;
          
          if (typeof c.budget === 'number') {
            budget = c.budget;
          } else if (Array.isArray(c.budget)) {
            // Se budget è un array (BudgetVoce[]), somma tutti gli importi
            budget = (c.budget as any[]).reduce((sum: number, b: any) => sum + (b.importo || 0), 0);
          }
          
          console.log(`Budget for ${c.nome}: ${budget} (type: ${typeof c.budget}, array length: ${Array.isArray(c.budget) ? (c.budget as any[]).length : 'N/A'})`);
          return acc + budget;
        }, 0);
        
        const statsData: CommesseStats = {
          totale: commesseData.length, // Solo mastri (padre)
          attive: commesseData.filter((c: Commessa) => c.stato === 'In Corso').length,
          completate: commesseData.filter((c: Commessa) => c.stato === 'Completata').length,
          budgetTotale: budgetTotale, // Budget consolidati
        };
        
        console.log('📊 Final stats:', statsData);
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

  // 🔧 NOTA: Rimosso commesseColumns - ora usiamo accordion al posto di UnifiedTable

  // Client options for forms and filters
  const clientiOptions = useMemo(() => 
    clienti.map(cliente => ({
      label: cliente.nome,
      value: cliente.id,
    }))
  , [clienti]);

  // Commesse options for parent selection (exclude current commessa when editing)
  const commesseOptions = useMemo(() => {
    const allCommesse = commesse.flatMap(commessa => [
      commessa,
      ...(commessa.figlie || [])
    ]);
    
    return allCommesse
      .filter(commessa => commessa.id !== selectedCommessa?.id) // Prevent self-reference
      .map(commessa => ({
        label: `${commessa.nome}${commessa.figlie?.length ? ` (${commessa.figlie.length} sub-commesse)` : ''}`,
        value: commessa.id,
      }));
  }, [commesse, selectedCommessa]);

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

  // Handle commessa edit with real API call
  const handleEditCommessa = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedCommessa) return;
    
    try {
      // Define valid Commessa fields that can be updated
      const validFields = [
        'nome', 'descrizione', 'clienteId', 'stato', 'priorita', 'isAttiva', 'parentId', 'externalId', 'budget'
      ];
      
      // Filter data to only include valid Commessa fields
      const filteredData: Record<string, unknown> = {};
      validFields.forEach(field => {
        if (data[field] !== undefined) {
          filteredData[field] = data[field];
        }
      });
      
      // Handle dates separately with proper formatting
      if (data.dataInizio) {
        filteredData.dataInizio = new Date(data.dataInizio as string).toISOString();
      }
      if (data.dataFine) {
        filteredData.dataFine = new Date(data.dataFine as string).toISOString();
      }
      
      console.log('Sending filtered data to API:', filteredData);

      // Make PUT request to backend with filtered data
      const response = await fetch(`/api/commesse/${selectedCommessa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedCommessa = await response.json();
      console.log('📥 Updated commessa from backend:', updatedCommessa);

      // Update context with changes (persists across navigation)
      updateCommessa(selectedCommessa.id, updatedCommessa);
      
      // Refresh the commesse list to get updated data
      console.log('🔄 Refreshing commesse list...');
      const commesseResponse = await fetch('/api/commesse-performance');
      if (commesseResponse.ok) {
        const commesseResult = await commesseResponse.json();
        const commesseData = Array.isArray(commesseResult) ? commesseResult : commesseResult.commesse || [];
        console.log('📊 Refreshed commesse data:', commesseData.find((c: Commessa) => c.id === selectedCommessa.id));
        setCommesse(commesseData);
        
        // Recalculate stats with updated data
        console.log('📊 Recalculating stats after update...');
        const budgetTotale = commesseData.reduce((acc: number, c: Commessa) => {
          let budget = 0;
          
          if (typeof c.budget === 'number') {
            budget = c.budget;
          } else if (Array.isArray(c.budget)) {
            // Se budget è un array (BudgetVoce[]), somma tutti gli importi
            budget = (c.budget as any[]).reduce((sum: number, b: any) => sum + (b.importo || 0), 0);
          }
          
          return acc + budget;
        }, 0);
        
        const updatedStats: CommesseStats = {
          totale: commesseData.length,
          attive: commesseData.filter((c: Commessa) => c.stato === 'In Corso').length,
          completate: commesseData.filter((c: Commessa) => c.stato === 'Completata').length,
          budgetTotale: budgetTotale,
        };
        
        console.log('📊 Updated stats after edit:', updatedStats);
        setStats(updatedStats);
      } else {
        console.error('❌ Failed to refresh commesse list');
      }

      setIsEditDialogOpen(false);
      setSelectedCommessa(null);
      
    } catch (error) {
      console.error('Error editing commessa:', error);
      alert(`Errore nel salvataggio: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }, [selectedCommessa, updateCommessa]);

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
                commesseOptions={commesseOptions}
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

      {/* Commesse Gerarchia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Lista Commesse
          </CardTitle>
          <p className="text-sm text-gray-500">
            {filteredCommesse.length} commesse principali trovate
          </p>
        </CardHeader>
        <CardContent>
          {filteredCommesse.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna commessa trovata</h3>
              <p className="text-gray-500">Crea una nuova commessa o modifica i filtri di ricerca.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full space-y-4">
              {filteredCommesse.map((commessa) => (
                <AccordionItem 
                  key={commessa.id} 
                  value={commessa.id} 
                  className="bg-gray-50 rounded-lg border border-gray-200"
                >
                  <AccordionTrigger className="hover:no-underline px-6 py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      {/* 🏛️ COMMESSA PRINCIPALE */}
                      <div className="flex items-center gap-4">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <div className="text-left">
                          <div className="font-semibold text-lg">{commessa.nome}</div>
                          <div className="text-sm text-gray-600">{commessa.cliente?.nome}</div>
                        </div>
                      </div>

                      {/* KPI Consolidati */}
                      <div className="flex items-center gap-6">
                                                 {/* Budget */}
                         <div className="text-center">
                           <div className="font-medium text-blue-600">
                             €{(() => {
                               let budget = 0;
                               if (typeof commessa.budget === 'number') {
                                 budget = commessa.budget;
                               } else if (Array.isArray(commessa.budget)) {
                                 budget = (commessa.budget as any[]).reduce((sum: number, b: any) => sum + (b.importo || 0), 0);
                               }
                               return budget.toLocaleString('it-IT');
                             })()}
                           </div>
                           <div className="text-xs text-gray-500">Budget</div>
                         </div>

                        {/* Margine */}
                        <div className="text-center">
                          <Badge variant={commessa.margine > 15 ? 'default' : commessa.margine > 5 ? 'secondary' : 'destructive'}>
                            {commessa.margine.toFixed(1)}%
                          </Badge>
                          <div className="text-xs text-gray-500">Margine</div>
                        </div>

                        {/* Avanzamento */}
                        <div className="text-center min-w-[100px]">
                          <Progress value={commessa.percentualeAvanzamento} className="h-2 mb-1" />
                          <div className="text-xs text-gray-600">{commessa.percentualeAvanzamento.toFixed(0)}%</div>
                        </div>

                        {/* Sub-commesse */}
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {commessa.figlie?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">Sub-commesse</div>
                        </div>

                        {/* Azioni */}
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <div
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                            onClick={() => handleView(commessa)}
                            title="Visualizza dettagli"
                          >
                            <Eye className="h-4 w-4" />
                          </div>
                          <div
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                            onClick={() => handleEdit(commessa)}
                            title="Modifica"
                          >
                            <Edit className="h-4 w-4" />
                          </div>
                          <div
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(commessa)}
                            title="Elimina"
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-4">
                    {commessa.figlie && commessa.figlie.length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-100 mt-2">
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <ChevronRight className="h-4 w-4" />
                            Sub-commesse ({commessa.figlie.length})
                          </h4>
                          <div className="space-y-2">
                            {commessa.figlie.map((subCommessa) => (
                              <div 
                                key={subCommessa.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 ml-2"></div>
                                  <div>
                                    <div className="font-medium">{subCommessa.nome}</div>
                                    <div className="text-sm text-gray-600">{subCommessa.descrizione}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                                                     {/* Budget Sottoconto */}
                                   <div className="text-center">
                                     <div className="text-sm font-medium text-blue-600">
                                       €{(() => {
                                         let budget = 0;
                                         if (typeof subCommessa.budget === 'number') {
                                           budget = subCommessa.budget;
                                         } else if (Array.isArray(subCommessa.budget)) {
                                           budget = (subCommessa.budget as any[]).reduce((sum: number, b: any) => sum + (b.importo || 0), 0);
                                         }
                                         return budget.toLocaleString('it-IT');
                                       })()}
                                     </div>
                                     <div className="text-xs text-gray-500">Budget</div>
                                   </div>

                                  {/* Stato */}
                                  <Badge variant="outline" className="text-xs">
                                    {subCommessa.stato}
                                  </Badge>

                                  {/* Azioni Sub-commessa */}
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleView(subCommessa)}
                                      title="Visualizza dettagli"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(subCommessa)}
                                      title="Modifica"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <ChevronRight className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Nessuna sub-commessa configurata</p>
                        <p className="text-sm">Tutti i movimenti saranno associati direttamente alla commessa principale</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
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
              commessa={commessaForForm}
              onSubmit={handleEditCommessa}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedCommessa(null);
              }}
              clientiOptions={clientiOptions}
              commesseOptions={commesseOptions}
              hideTitle
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};