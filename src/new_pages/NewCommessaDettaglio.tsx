import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, BarChart3, TrendingUp, DollarSign, Calendar, User, Target } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { Progress } from '../new_components/ui/Progress';
import { Badge } from '../new_components/ui/Badge';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../new_components/ui/Dialog';
import { CommessaForm } from '../new_components/forms/CommessaForm';
import { useCommessaContext } from '../new_context/CommessaContext';

interface CommessaDettaglio {
  id: string;
  nome: string;
  descrizione?: string;
  cliente: { nome: string; codice: string } | null;
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
  createdAt: string;
  updatedAt: string;
}

interface Allocazione {
  id: string;
  importo: number;
  percentuale: number;
  dataAllocazione: string;
  voceAnalitica: { nome: string; tipo: 'costo' | 'ricavo' };
  movimento: {
    numeroDocumento: string;
    dataDocumento: string;
    descrizione: string;
    conto: { codice: string; denominazione: string };
  };
}

interface KPI {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export const NewCommessaDettaglio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCommessa, getCommessa } = useCommessaContext();
  
  const [commessa, setCommessa] = useState<CommessaDettaglio | null>(null);
  const [allocazioni, setAllocazioni] = useState<Allocazione[]>([]);
  const [clienti, setClienti] = useState<Array<{ id: string; nome: string; codice: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch commessa details
  useEffect(() => {
    const fetchCommessaDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch commessa details
        const commessaResponse = await fetch(`/api/commesse-performance`);
        if (commessaResponse.ok) {
          const commessaResult = await commessaResponse.json();
          const commesseArray = Array.isArray(commessaResult) ? commessaResult : commessaResult.commesse || [];
          const foundCommessa = commesseArray.find((c: {id: string}) => c.id === id);
          if (foundCommessa) {
            // Apply any updates from context
            const updatedCommessa = getCommessa(id!, foundCommessa);
            setCommessa(updatedCommessa);
          }
        }

        // Fetch allocazioni for this commessa (fallback to empty array for now)
        // const allocazioniResponse = await fetch(`/api/reconciliation/allocazioni?commessaId=${id}`);
        // if (allocazioniResponse.ok) {
        //   const allocazioniData = await allocazioniResponse.json();
        //   setAllocazioni(Array.isArray(allocazioniData) ? allocazioniData : allocazioniData.data || []);
        // }
        setAllocazioni([]); // Temporary until backend endpoint is available

        // Fetch clienti for edit form
        const clientiResponse = await fetch('/api/clienti');
        if (clientiResponse.ok) {
          const clientiData = await clientiResponse.json();
          setClienti(Array.isArray(clientiData) ? clientiData : clientiData.data || []);
        }
      } catch (error) {
        console.error('Error fetching commessa details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommessaDetails();
  }, [id, getCommessa]);

  // Format utilities
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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

  // Calculate KPIs
  const kpis = useMemo((): KPI[] => {
    if (!commessa) return [];

    const margineTrend = commessa.margine >= 20 ? 'up' : commessa.margine >= 10 ? 'stable' : 'down';
    const avanzamentoColor = commessa.percentualeAvanzamento >= 80 ? 'green' : 
                           commessa.percentualeAvanzamento >= 50 ? 'yellow' : 'blue';

    return [
      {
        label: 'Budget Totale',
        value: formatCurrency(commessa.budget),
        icon: DollarSign,
        color: 'blue',
      },
      {
        label: 'Margine',
        value: `${commessa.margine.toFixed(1)}%`,
        trend: margineTrend,
        icon: TrendingUp,
        color: margineTrend === 'up' ? 'green' : margineTrend === 'stable' ? 'yellow' : 'red',
      },
      {
        label: 'Avanzamento',
        value: `${commessa.percentualeAvanzamento.toFixed(1)}%`,
        icon: BarChart3,
        color: avanzamentoColor,
      },
      {
        label: 'Ricavi',
        value: formatCurrency(commessa.ricavi),
        icon: TrendingUp,
        color: 'green',
      },
      {
        label: 'Costi',
        value: formatCurrency(commessa.costi),
        icon: Target,
        color: 'red',
      },
    ];
  }, [commessa, formatCurrency]);

  // Allocazioni table columns
  const allocazioniColumns = useMemo(() => [
    {
      key: 'dataAllocazione' as const,
      label: 'Data',
      render: (data: unknown) => formatDate(data as string),
      sortable: true,
    },
    {
      key: 'movimento' as const,
      label: 'Movimento',
      render: (movimento: unknown) => {
        const mov = movimento as Allocazione['movimento'];
        return (
          <div>
            <div className="font-medium">{mov.numeroDocumento}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">{mov.descrizione}</div>
            <div className="text-xs text-gray-400">
              {mov.conto.codice} - {mov.conto.denominazione}
            </div>
          </div>
        );
      }
    },
    {
      key: 'voceAnalitica' as const,
      label: 'Voce Analitica',
      render: (voce: unknown) => {
        const v = voce as Allocazione['voceAnalitica'];
        return (
          <div className="flex items-center space-x-2">
            <span>{v.nome}</span>
            <Badge variant={v.tipo === 'costo' ? 'destructive' : 'default'}>
              {v.tipo}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'importo' as const,
      label: 'Importo',
      render: (importo: unknown) => (
        <span className="font-medium">{formatCurrency(importo as number)}</span>
      ),
      sortable: true,
    },
    {
      key: 'percentuale' as const,
      label: 'Percentuale',
      render: (perc: unknown) => `${(perc as number).toFixed(1)}%`,
      sortable: true,
    },
  ], [formatDate, formatCurrency]);

  // Handle edit (temporary frontend-only simulation until backend supports PUT)
  const handleEditCommessa = useCallback(async (data: Record<string, unknown>) => {
    if (!commessa) return;
    
    try {
      // Update context with changes (persists across navigation)
      const updates: any = {
        ...data,
        // Ensure dates are properly formatted
        dataInizio: data.dataInizio ? new Date(data.dataInizio as string).toISOString() : commessa.dataInizio,
        dataFine: data.dataFine ? new Date(data.dataFine as string).toISOString() : commessa.dataFine,
      };

      // If clienteId changed, update the nested cliente object
      if (data.clienteId && data.clienteId !== commessa.clienteId) {
        const selectedCliente = clienti.find(c => c.id === data.clienteId);
        if (selectedCliente) {
          updates.cliente = {
            nome: selectedCliente.nome,
            codice: selectedCliente.codice
          };
        }
      }
      
      updateCommessa(commessa.id, updates);
      
      // Update local state with new data
      const updatedCommessa = {
        ...commessa,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      setCommessa(updatedCommessa as CommessaDettaglio);
      setIsEditDialogOpen(false);
      
    } catch (error) {
      console.error('❌ Errore simulazione aggiornamento:', error);
      alert(`Errore nella simulazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }, [commessa, updateCommessa, clienti]);

  // Client options for edit form
  const clientiOptions = useMemo(() => 
    clienti.map(cliente => ({
      label: cliente.nome,
      value: cliente.id,
    }))
  , [clienti]);

  // Get status badge color
  const getStatusBadgeColor = (stato: string) => {
    switch (stato.toLowerCase()) {
      case 'in corso': return 'default';
      case 'completata': return 'default';
      case 'in pausa': return 'secondary';
      case 'annullata': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!commessa) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Commessa non trovata</h2>
        <p className="text-gray-500 mt-2">La commessa richiesta non esiste o non è accessibile.</p>
        <Button onClick={() => navigate('/new/commesse')} className="mt-4">
          Torna alle Commesse
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/new/commesse')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commessa.nome}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={getStatusBadgeColor(commessa.stato)}>
                {commessa.stato}
              </Badge>
              {commessa.cliente && (
                <div className="flex items-center text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  {commessa.cliente.nome}
                </div>
              )}
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(commessa.dataInizio)}
                {commessa.dataFine && ` - ${formatDate(commessa.dataFine)}`}
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Modifica
        </Button>
      </div>

      {/* Description */}
      {commessa.descrizione && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700">{commessa.descrizione}</p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    {kpi.trend && (
                      <div className={`flex items-center ${
                        kpi.trend === 'up' ? 'text-green-500' : 
                        kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {kpi.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                        {kpi.trend === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
                        {kpi.trend === 'stable' && <div className="w-4 h-0.5 bg-current" />}
                      </div>
                    )}
                  </div>
                </div>
                <kpi.icon className={`w-8 h-8 ${
                  kpi.color === 'blue' ? 'text-blue-500' :
                  kpi.color === 'green' ? 'text-green-500' :
                  kpi.color === 'red' ? 'text-red-500' :
                  kpi.color === 'yellow' ? 'text-yellow-500' :
                  'text-purple-500'
                }`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Avanzamento Progetto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completamento</span>
                <span>{commessa.percentualeAvanzamento.toFixed(1)}%</span>
              </div>
              <Progress value={commessa.percentualeAvanzamento} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(commessa.budget)}</div>
                <div className="text-sm text-gray-500">Budget Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(commessa.costi)}</div>
                <div className="text-sm text-gray-500">Costi Sostenuti</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(commessa.ricavi)}</div>
                <div className="text-sm text-gray-500">Ricavi Generati</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocazioni Table */}
      <Card>
        <CardHeader>
          <CardTitle>Allocazioni Movimenti</CardTitle>
          <p className="text-sm text-gray-500">
            {allocazioni.length} allocazioni registrate
          </p>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            data={allocazioni as unknown as Record<string, unknown>[]}
            columns={allocazioniColumns}
            loading={false}
            searchable={true}
            paginated={allocazioni.length > 10}
            emptyMessage="Nessuna allocazione registrata per questa commessa"
            showActions={false}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Commessa</DialogTitle>
            <p className="text-sm text-gray-500">Aggiorna i dettagli della commessa selezionata</p>
          </DialogHeader>
          <CommessaForm
            commessa={{
              ...commessa,
              // Assicuriamoci che il clienteId sia presente
              clienteId: commessa.clienteId || (commessa.cliente && 'id' in commessa.cliente ? commessa.cliente.id : '') || ''
            }}
            onSubmit={handleEditCommessa}
            onCancel={() => setIsEditDialogOpen(false)}
            clientiOptions={clientiOptions}
            hideTitle
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};