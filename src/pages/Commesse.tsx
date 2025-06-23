import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Commessa } from '@/types';
import { getCommesse } from '@/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Commesse: React.FC = () => {
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommesse = async () => {
      try {
        setIsLoading(true);
        const data = await getCommesse();
        setCommesse(data);
      } catch (error) {
        console.error("Errore nel caricamento delle commesse:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCommesse();
  }, []);

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return 'N/D';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
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
  const commessePrincipali = commesse.filter(c => !c.parentId);
  const commesseFiglie = commesse.filter(c => c.parentId);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Elenco Commesse</h1>
          <p className="text-slate-600 mt-1">Visualizza i comuni e le relative attività.</p>
        </div>
      </div>

      {/* Vista Gerarchica con Accordion */}
      <Accordion type="multiple" className="w-full space-y-2">
        {commessePrincipali.map(comune => {
          const attivitaAssociate = commesseFiglie.filter(c => c.parentId === comune.id);
          return (
            <AccordionItem key={comune.id} value={comune.id} className="bg-white rounded-lg border border-slate-200 px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                        <Building2 className="h-6 w-6 text-slate-600" />
                        <div>
                            <div className="font-bold text-lg text-slate-900">{comune.nome}</div>
                            <div className="text-sm text-slate-500">{comune.descrizione}</div>
                        </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita di aprire/chiudere l'accordion
                        handleViewDetails(comune.id)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Dettagli Comune
                    </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                {attivitaAssociate.length > 0 ? (
                  <div className="space-y-2 pl-10">
                    {attivitaAssociate.map(attivita => (
                      <div key={attivita.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50">
                        <div>
                            <div className="font-medium text-slate-800">{attivita.nome}</div>
                            <div className="text-sm text-slate-500">{attivita.descrizione}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(attivita.id)}
                        >
                          Dettagli Attività
                        </Button>
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
