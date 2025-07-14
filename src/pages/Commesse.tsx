import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Commessa } from '@prisma/client';
import { getCommesse } from '@/api';
import { getCommesseWithPerformance, CommessaWithPerformance } from '@/api/commessePerformance';
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

  const getStatoBadge = (commessa: CommessaWithPerformance) => {
    if (commessa.percentualeAvanzamento >= 100) {
      return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Completato</Badge>;
    } else if (commessa.percentualeAvanzamento > 75) {
      return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50"><TrendingUp className="w-3 h-3 mr-1" />Quasi Completato</Badge>;
    } else if (commessa.percentualeAvanzamento > 25) {
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50"><Clock className="w-3 h-3 mr-1" />In Corso</Badge>;
    } else {
      return <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50"><AlertTriangle className="w-3 h-3 mr-1" />Iniziale</Badge>;
    }
  };

  const getMargineColor = (margine: number) => {
    if (margine >= 20) return 'text-green-600';
    if (margine >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const handleViewDetails = (id: string) => {
    navigate(`/commesse/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Caricamento dati commesse...</p>
      </div>
    );
  }

  // Separiamo le commesse principali (genitori) da quelle secondarie (figlie)
  const commessePrincipali = commesseWithPerformance.filter(c => !c.parentId);
  const commesseFiglie = commesseWithPerformance.filter(c => c.parentId);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Elenco Commesse</h1>
          <p className="text-slate-600 mt-1">Visualizza i comuni e le relative attività.</p>
        </div>
      </div>

      {/* Vista Gerarchica con Accordion e Performance KPI */}
      <Accordion type="multiple" className="w-full space-y-2">
        {commessePrincipali.map(comune => {
          const attivitaAssociate = commesseFiglie.filter(c => c.parentId === comune.id);
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
                        {getStatoBadge(comune)}
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
                      <div className={`font-semibold text-sm ${getMargineColor(comune.margine)}`}>
                        {comune.margine >= 0 ? '+' : ''}{formatPercentage(comune.margine)}
                      </div>
                      <div className="text-xs text-slate-600">
                        {comune.margine >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                      </div>
                    </div>
                    
                    {/* Avanzamento */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-xs text-slate-500">Avanzamento</div>
                      <div className="font-semibold text-sm">{formatPercentage(comune.percentualeAvanzamento)}</div>
                      <Progress value={comune.percentualeAvanzamento} className="w-16 h-2 mt-1" />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(comune.id)
                      }}
                      className="ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Dettagli Comune
                    </Button>
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
                              {getStatoBadge(attivita)}
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
                            <div className={`font-medium ${getMargineColor(attivita.margine)}`}>
                              {formatPercentage(attivita.margine)}
                            </div>
                          </div>
                          <div className="text-right text-xs min-w-[80px]">
                            <div className="text-slate-500">Avanzamento</div>
                            <div className="font-medium">{formatPercentage(attivita.percentualeAvanzamento)}</div>
                            <Progress value={attivita.percentualeAvanzamento} className="w-12 h-1 mt-1" />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(attivita.id)}
                          >
                            Dettagli Attività
                          </Button>
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
