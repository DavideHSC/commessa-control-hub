import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Commessa } from '@prisma/client';
import { getCommesse } from '@/api';
import { getCommesseWithPerformance, CommessaWithPerformance } from '@/api/commessePerformance';
import { StatusIndicators, MargineBadge, ProgressBadge, StatusBadge, getMarginColor } from '@/components/commesse/StatusIndicators';
import { CommessaActionMenu, QuickActions } from '@/components/commesse/CommessaActionMenu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Commesse: React.FC = () => {
  const [commesseWithPerformance, setCommesseWithPerformance] = useState<CommessaWithPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommesseWithPerformance = async () => {
      try {
        setIsLoading(true);
        const data = await getCommesseWithPerformance();
        setCommesseWithPerformance(data.commesse);
      } catch (error) {
        console.error("Errore nel caricamento delle commesse con performance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCommesseWithPerformance();
  }, []);

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return 'N/D';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Funzioni helper rimosse - ora utilizzate dal componente StatusIndicators
  
  const handleViewDetails = (id: string) => {
    navigate(`/commesse/${id}`);
  };

  // Handlers per le azioni rapide
  const handleAllocateMovements = (commessa: CommessaWithPerformance) => {
    console.log('Allocating movements for commessa:', commessa.id);
    // TODO: Implementare logica di allocazione movimenti
    // Potrebbe aprire un dialog o navigare a una pagina specifica
  };

  const handleEditBudget = (commessa: CommessaWithPerformance) => {
    console.log('Editing budget for commessa:', commessa.id);
    // TODO: Implementare logica di modifica budget
    // Potrebbe aprire un dialog con form di modifica
  };

  const handleExportReport = (commessa: CommessaWithPerformance, format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting ${format} report for commessa:`, commessa.id);
    // TODO: Implementare logica di esportazione
    // Potrebbe generare e scaricare il report
  };

  const handleAssignUnallocatedCosts = (commessa: CommessaWithPerformance) => {
    console.log('Assigning unallocated costs for commessa:', commessa.id);
    // TODO: Implementare logica di assegnazione costi non allocati
    // Potrebbe aprire un dialog di assegnazione
  };

  const handleQuickAnalysis = (commessa: CommessaWithPerformance) => {
    console.log('Quick analysis for commessa:', commessa.id);
    // TODO: Implementare analisi rapida
    // Potrebbe aprire un modal con grafici e statistiche
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Caricamento dati commesse...</p>
      </div>
    );
  }

  // Le commesse principali sono quelle senza parentId
  const commessePrincipali = commesseWithPerformance.filter(c => !c.parentId);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Elenco Commesse</h1>
          <p className="text-slate-600 mt-1">Visualizza le Commesse e le relative attività.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/analisi-comparative')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analisi Comparative
          </Button>
        </div>
      </div>

      {/* Vista Gerarchica con Accordion e Performance KPI */}
      <Accordion type="multiple" className="w-full space-y-2">
        {commessePrincipali.map(comune => {
          const attivitaAssociate = comune.figlie || [];
          return (
            <AccordionItem key={comune.id} value={comune.id} className="bg-white rounded-lg border border-slate-200 px-4 shadow-sm">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-6 w-6 text-slate-600" />
                    <div className="text-left">
                      <div className="font-bold text-lg text-slate-900">{comune.nome}</div>
                      <div className="text-sm text-slate-500">{comune.descrizione}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <StatusBadge margine={comune.margine} percentuale={comune.percentualeAvanzamento} size="sm" />
                        <span className="text-xs text-slate-600">Cliente: {comune.cliente.nome}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance KPI Row */}
                  <div className="flex items-center gap-6 mr-4">
                    {/* Budget vs Speso */}
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Budget</div>
                      <div className="font-semibold text-sm">{formatCurrency(comune.budget)}</div>
                      <div className="text-xs text-slate-600">Speso: {formatCurrency(comune.costi)}</div>
                    </div>
                    
                    {/* Margine */}
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Margine</div>
                      <div className="mt-1">
                        <MargineBadge margine={comune.margine} size="sm" />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {comune.margine >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                      </div>
                    </div>
                    
                    {/* Avanzamento */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-xs text-slate-500">Avanzamento</div>
                      <div className="mt-1">
                        <ProgressBadge percentuale={comune.percentualeAvanzamento} size="sm" />
                      </div>
                      <Progress value={comune.percentualeAvanzamento} className="w-16 h-2 mt-1" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(comune.id)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Dettagli Commessa
                      </Button>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <CommessaActionMenu
                          commessa={comune}
                          onAllocateMovements={() => handleAllocateMovements(comune)}
                          onEditBudget={() => handleEditBudget(comune)}
                          onExportReport={(format) => handleExportReport(comune, format)}
                          onAssignUnallocatedCosts={() => handleAssignUnallocatedCosts(comune)}
                          onViewDetails={() => handleViewDetails(comune.id)}
                          onQuickAnalysis={() => handleQuickAnalysis(comune)}
                          variant="compact"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                {attivitaAssociate.length > 0 ? (
                  <div className="space-y-2 pl-10">
                    {attivitaAssociate.map(attivita => (
                      <div key={attivita.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium text-slate-800">{attivita.nome}</div>
                            <div className="text-sm text-slate-500">{attivita.descrizione}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <StatusBadge margine={attivita.margine} percentuale={attivita.percentualeAvanzamento} size="sm" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance KPI per attività */}
                        <div className="flex items-center gap-4">
                          <div className="text-right text-xs">
                            <div className="text-slate-500">Budget</div>
                            <div className="font-medium">{formatCurrency(attivita.budget)}</div>
                          </div>
                          <div className="text-right text-xs">
                            <div className="text-slate-500">Margine</div>
                            <div className="mt-1">
                              <MargineBadge margine={attivita.margine} size="sm" />
                            </div>
                          </div>
                          <div className="text-right text-xs min-w-[80px]">
                            <div className="text-slate-500">Avanzamento</div>
                            <div className="mt-1">
                              <ProgressBadge percentuale={attivita.percentualeAvanzamento} size="sm" />
                            </div>
                            <Progress value={attivita.percentualeAvanzamento} className="w-12 h-1 mt-1" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(attivita.id)}
                            >
                              Dettagli Attività
                            </Button>
                            
                            <QuickActions
                              commessa={attivita}
                              onAllocateMovements={() => handleAllocateMovements(attivita)}
                              onEditBudget={() => handleEditBudget(attivita)}
                              onExportReport={(format) => handleExportReport(attivita, format)}
                              onAssignUnallocatedCosts={() => handleAssignUnallocatedCosts(attivita)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-500 py-4 pl-10">Nessuna attività associata a questo comune.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Commesse;
